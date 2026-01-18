import type { EnrichedProfile } from './enrichment';

// IMPORTANT: keep this file free of runtime imports from inference.ts to avoid
// circular deps (inference -> decisioning -> inference). TypeScript is structural,
// so the real `Dependent` type can be passed in as long as it matches shape.
export interface DependentSignal {
  type: 'spouse' | 'child' | 'parent' | 'business-dependent';
  label: string;
  riskWeight: 'critical' | 'high' | 'medium' | 'low';
  context: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type LifeEventType =
  | 'new_job_promotion'
  | 'high_responsibility_role'
  | 'family_formation_stage'
  | 'income_acceleration'
  | 'career_risk_exposure';

export interface LifeEvent {
  type: LifeEventType;
  confidence: ConfidenceLevel;
  reason: string;
}

export interface CoverageDecisioning {
  lifeEvents: LifeEvent[];
  coverageConfidenceScore: number; // 0–100, higher = more adequately positioned
  drivers: string[];
  messaging: {
    scoreLabel: 'low' | 'medium' | 'high';
    scoreExplanation: string;
    whatChanged: string;
    whyNow: string;
    nextStep: 'education' | 'conversation';
    nextStepText: string;
  };
}

export function buildCoverageDecisioning(input: {
  profile: EnrichedProfile;
  ageRange?: string;
  maritalStatus?: string;
  dependents: DependentSignal[];
  annualIncomeEstimate: number;
  recommendedCoverageRange: string;
}): CoverageDecisioning {
  const lifeEvents = detectLifeEvents({
    profile: input.profile,
    ageRange: input.ageRange,
    maritalStatus: input.maritalStatus,
    dependents: input.dependents,
    annualIncomeEstimate: input.annualIncomeEstimate,
  });

  const { score, drivers } = scoreCoverageConfidence({
    profile: input.profile,
    annualIncomeEstimate: input.annualIncomeEstimate,
    dependents: input.dependents,
    lifeEvents,
    recommendedCoverageRange: input.recommendedCoverageRange,
  });

  const messaging = buildMessaging({
    profile: input.profile,
    lifeEvents,
    score,
    drivers,
  });

  return {
    lifeEvents,
    coverageConfidenceScore: score,
    drivers,
    messaging,
  };
}

function detectLifeEvents(args: {
  profile: EnrichedProfile;
  ageRange?: string;
  maritalStatus?: string;
  dependents: DependentSignal[];
  annualIncomeEstimate: number;
}): LifeEvent[] {
  const { profile, ageRange, maritalStatus, dependents, annualIncomeEstimate } = args;

  const role = String(profile.role || '').toLowerCase();
  const industry = String(profile.industry || '').toLowerCase();

  const events: LifeEvent[] = [];

  const tenureMonths = estimateTenureMonths(profile.positionStart);
  const isExecutive = /\b(ceo|cfo|cto|coo|chief|vp|vice president|president|founder|co-founder|director|head)\b/.test(
    role
  );
  const isManagerial = /\b(manager|lead|principal|owner|director|head)\b/.test(role);

  // New job / promotion: strongest signal is a recent role start date.
  if (tenureMonths !== null && tenureMonths <= 18) {
    events.push({
      type: 'new_job_promotion',
      confidence: tenureMonths <= 9 ? 'high' : 'medium',
      reason: `Role started about ${tenureMonths} month${tenureMonths === 1 ? '' : 's'} ago`,
    });
  } else if (/\b(senior|lead|principal|manager|director|vp|head)\b/.test(role)) {
    events.push({
      type: 'new_job_promotion',
      confidence: 'low',
      reason: 'Senior-level title often correlates with a recent promotion or job change',
    });
  }

  // High-responsibility role
  if (isExecutive || isManagerial) {
    const sizePhrase = profile.companySize ? `${profile.companySize} company` : 'company';
    events.push({
      type: 'high_responsibility_role',
      confidence: isExecutive ? 'high' : 'medium',
      reason: `${profile.role} at a ${sizePhrase}`,
    });
  }

  // Family formation stage
  const inferredHasSpouse = dependents.some((d) => d.type === 'spouse');
  const inferredHasChildren = dependents.some((d) => d.type === 'child');

  if (maritalStatus === 'married' || inferredHasChildren) {
    events.push({
      type: 'family_formation_stage',
      confidence: maritalStatus === 'married' || inferredHasChildren ? 'high' : 'medium',
      reason:
        maritalStatus === 'married'
          ? 'Marital status indicates shared financial dependency'
          : 'Dependent indicators suggest a growing household responsibility',
    });
  } else if (ageRange === '30-39' || ageRange === '40-49' || inferredHasSpouse) {
    events.push({
      type: 'family_formation_stage',
      confidence: 'medium',
      reason: 'Age and career stage often coincide with dependents or shared obligations',
    });
  }

  // Income acceleration
  if (annualIncomeEstimate >= 180000) {
    events.push({
      type: 'income_acceleration',
      confidence: 'high',
      reason: 'Estimated income suggests rapid earning growth and higher income replacement needs',
    });
  } else if (annualIncomeEstimate >= 120000) {
    events.push({
      type: 'income_acceleration',
      confidence: 'medium',
      reason: 'Above-average income band typically increases the cost of being uninsured',
    });
  } else if (industry.includes('software') || industry.includes('finance') || industry.includes('consulting')) {
    events.push({
      type: 'income_acceleration',
      confidence: 'low',
      reason: 'Industry tends to have faster income growth over time',
    });
  }

  // Career risk exposure (startup/founder/contractor)
  const isStartup = profile.companySize === 'startup';
  const isContractor = /\b(contractor|consultant|freelance|self-employed)\b/.test(role);
  const isFounder = /\b(founder|co-founder)\b/.test(role);

  if (isStartup || isContractor || isFounder) {
    events.push({
      type: 'career_risk_exposure',
      confidence: isFounder || isStartup ? 'high' : 'medium',
      reason: isFounder
        ? 'Founder roles often carry income volatility and business continuity risk'
        : isStartup
          ? 'Startup environments can increase job and income uncertainty'
          : 'Contract work can mean variable income and fewer employer benefits',
    });
  }

  return uniqByType(sortByConfidence(events)).slice(0, 5);
}

function scoreCoverageConfidence(args: {
  profile: EnrichedProfile;
  annualIncomeEstimate: number;
  dependents: DependentSignal[];
  lifeEvents: LifeEvent[];
  recommendedCoverageRange: string;
}): { score: number; drivers: string[] } {
  const { profile, annualIncomeEstimate, dependents, lifeEvents, recommendedCoverageRange } = args;

  // Higher score = more "covered/positioned".
  // We assume many people only have partial employer coverage unless signals indicate otherwise.
  let score = 78;

  const inferredHasChildren = dependents.some((d) => d.type === 'child');
  const inferredHasSpouse = dependents.some((d) => d.type === 'spouse');

  if (inferredHasChildren) score -= 18;
  if (inferredHasSpouse) score -= 10;

  if (annualIncomeEstimate >= 200000) score -= 10;
  else if (annualIncomeEstimate >= 140000) score -= 6;

  const momentum = lifeEvents.reduce((sum, ev) => {
    if (ev.confidence === 'high') return sum + 2;
    if (ev.confidence === 'medium') return sum + 1;
    return sum + 0.5;
  }, 0);

  score -= Math.min(14, Math.round(momentum * 2));

  const recommendedMid = parseCoverageRangeMidpoint(recommendedCoverageRange);
  const assumedExisting = estimateAssumedExistingCoverage(profile.companySize, annualIncomeEstimate);

  if (recommendedMid > 0) {
    const gapRatio = Math.max(0, recommendedMid - assumedExisting) / recommendedMid;
    score -= Math.round(gapRatio * 35);
  }

  score = clamp(Math.round(score), 0, 100);

  const drivers: string[] = [];

  if (inferredHasChildren || inferredHasSpouse) {
    drivers.push('Dependents inferred without confirmed coverage');
  }

  if (recommendedMid > 0 && recommendedMid > assumedExisting * 1.25) {
    drivers.push('Income replacement gap versus typical employer coverage');
  }

  const highMomentum = lifeEvents.some((e) => e.confidence === 'high');
  if (highMomentum) {
    drivers.push('High life-event momentum increases timing risk');
  }

  if (drivers.length === 0) {
    drivers.push('Profile signals suggest fewer immediate coverage gaps');
  }

  return { score, drivers: drivers.slice(0, 3) };
}

function buildMessaging(args: {
  profile: EnrichedProfile;
  lifeEvents: LifeEvent[];
  score: number;
  drivers: string[];
}): CoverageDecisioning['messaging'] {
  const { lifeEvents, score, drivers } = args;

  const scoreLabel: 'low' | 'medium' | 'high' = score >= 70 ? 'high' : score >= 45 ? 'medium' : 'low';

  const topEvent = lifeEvents[0];
  const whatChanged = topEvent
    ? `Key signal: ${formatLifeEventType(topEvent.type)} (${topEvent.confidence}) — ${topEvent.reason}.`
    : 'Key signal: profile indicates stable career and household patterns.';

  const scoreExplanation =
    scoreLabel === 'high'
      ? 'Your profile suggests fewer immediate gaps relative to typical coverage needs.'
      : scoreLabel === 'medium'
        ? 'Some signals suggest potential coverage gaps worth reviewing soon.'
        : 'Multiple signals suggest you may be under-covered for current responsibilities.';

  const whyNow =
    drivers.length > 0
      ? `Why now: ${drivers.join(' • ')}.`
      : 'Why now: timing matters most when responsibilities or income change.';

  const nextStep: 'education' | 'conversation' =
    scoreLabel === 'low' || lifeEvents.some((e) => e.confidence === 'high') ? 'conversation' : 'education';

  const nextStepText =
    nextStep === 'conversation'
      ? 'Next step: a quick conversation to confirm dependents, current coverage, and lock in a baseline policy.'
      : 'Next step: education—learn typical coverage ranges and check what your employer policy provides.';

  return {
    scoreLabel,
    scoreExplanation,
    whatChanged,
    whyNow,
    nextStep,
    nextStepText,
  };
}

function estimateTenureMonths(positionStart?: { month?: number; year?: number }): number | null {
  const year = positionStart?.year;
  if (!year) return null;

  const month = typeof positionStart?.month === 'number' ? positionStart!.month : 1;

  const now = new Date();
  const start = new Date(year, Math.max(0, Math.min(11, month - 1)), 1);

  const diffMs = now.getTime() - start.getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return null;

  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.4375)));
}

function parseCoverageRangeMidpoint(range: string): number {
  // Examples: "$650K – $900K", "$1.2M – $2.0M", "$200K – $400K+"
  const parts = String(range)
    .replace(/\s+/g, ' ')
    .split('–')
    .map((s) => s.trim());

  if (parts.length < 2) return 0;

  const low = parseCurrency(parts[0]);
  const high = parseCurrency(parts[1]);

  if (!low || !high) return 0;
  return Math.round((low + high) / 2);
}

function parseCurrency(s: string): number {
  const raw = String(s).replace(/,/g, '').trim();
  const match = raw.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)\s*([KMB])?/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();

  const mult = unit === 'B' ? 1_000_000_000 : unit === 'M' ? 1_000_000 : unit === 'K' ? 1_000 : 1;
  return Math.round(value * mult);
}

function estimateAssumedExistingCoverage(
  companySize: EnrichedProfile['companySize'],
  annualIncomeEstimate: number
): number {
  // Rough heuristic: group life is often ~1x salary at mid/large employers.
  if (companySize === 'enterprise' || companySize === 'large') return Math.round(annualIncomeEstimate * 1.0);
  if (companySize === 'medium') return Math.round(annualIncomeEstimate * 0.75);
  if (companySize === 'small') return Math.round(annualIncomeEstimate * 0.5);
  return Math.round(annualIncomeEstimate * 0.35);
}

function sortByConfidence(events: LifeEvent[]): LifeEvent[] {
  const rank: Record<ConfidenceLevel, number> = { high: 3, medium: 2, low: 1 };
  return [...events].sort((a, b) => rank[b.confidence] - rank[a.confidence]);
}

function uniqByType(events: LifeEvent[]): LifeEvent[] {
  const seen = new Set<LifeEventType>();
  const out: LifeEvent[] = [];
  for (const ev of events) {
    if (seen.has(ev.type)) continue;
    seen.add(ev.type);
    out.push(ev);
  }
  return out;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function formatLifeEventType(t: LifeEventType): string {
  return t
    .split('_')
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ');
}

/**
 * Life Impact inference engine
 * Heuristic-based estimation of income, dependents, and coverage needs
 */

import { EnrichedProfile } from './enrichment';
import { buildCoverageDecisioning, type CoverageDecisioning } from './decisioning';

export interface Dependent {
  type: 'spouse' | 'child' | 'parent' | 'business-dependent';
  label: string;
  riskWeight: 'critical' | 'high' | 'medium' | 'low';
  context: string; // Brief explanation
}

export interface ImpactMap {
  person: {
    name: string;
    role: string;
    company: string;
    location: string;
  };
  enrichedProfile: EnrichedProfile;
  incomeBand: string;
  annualIncomeEstimate: number;
  dependents: Dependent[];
  estimatedAnnualExposure: string;
  recommendedCoverageRange: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  explanation: string;
  decisioning: CoverageDecisioning;
}

export async function inferImpactMap(
  profile: EnrichedProfile,
  ageRange?: string,
  maritalStatus?: string
): Promise<ImpactMap> {
  // Estimate income band from role + company size
  const incomeBand = estimateIncomeBand(
    profile.role,
    profile.companySize,
    profile.industry,
    profile.location
  );
  const annualIncomeEstimate = incomeBandToNumber(incomeBand);

  // Infer likely dependents
  const dependents = inferDependents(
    profile.role,
    profile.companySize,
    ageRange,
    maritalStatus
  );

  // Calculate exposure and coverage
  const estimatedAnnualExposure = calculateExposure(
    annualIncomeEstimate,
    dependents
  );
  const recommendedCoverageRange = calculateRecommendedCoverage(
    annualIncomeEstimate,
    dependents
  );

  // Determine confidence
  const hasManualInput = !!ageRange || !!maritalStatus;
  const hasRichPublicProfile = Boolean(
    profile.linkedinUrl &&
      (profile.companyHeadcountRange || profile.companyWebsite || profile.headline || profile.summary)
  );

  const hasThinProfile =
    profile.role === 'Professional' ||
    profile.company === 'Unknown Company' ||
    profile.location === 'Unknown';

  const confidenceLevel: ImpactMap['confidenceLevel'] = hasManualInput
    ? 'high'
    : hasRichPublicProfile
      ? 'high'
      : hasThinProfile
        ? 'low'
        : 'medium';

  const map: ImpactMap = {
    person: {
      name: profile.name,
      role: profile.role,
      company: profile.company,
      location: profile.location,
    },
    enrichedProfile: profile,
    incomeBand,
    annualIncomeEstimate,
    dependents,
    estimatedAnnualExposure,
    recommendedCoverageRange,
    confidenceLevel,
    explanation: buildExplanation(
      profile,
      incomeBand,
      dependents,
      hasManualInput
    ),
    decisioning: buildCoverageDecisioning({
      profile,
      ageRange,
      maritalStatus,
      dependents,
      annualIncomeEstimate,
      recommendedCoverageRange,
    }),
  };

  console.log('[INFERENCE] Impact map generated:', map);
  return map;
}

/**
 * Estimate income band based on role and company size
 */
function estimateIncomeBand(
  role: string,
  companySize: string,
  industry?: string,
  location?: string
): string {
  const base = estimateIncomeBandBase(role, companySize);
  return adjustIncomeBand(base, industry, location);
}

function estimateIncomeBandBase(role: string, companySize: string): string {
  const lowerRole = role.toLowerCase();
  const isExecutive =
    lowerRole.includes('ceo') ||
    lowerRole.includes('cfo') ||
    lowerRole.includes('vp') ||
    lowerRole.includes('vice president') ||
    lowerRole.includes('president') ||
    lowerRole.includes('founder') ||
    lowerRole.includes('director');

  const isSenior =
    lowerRole.includes('senior') ||
    lowerRole.includes('lead') ||
    lowerRole.includes('principal') ||
    lowerRole.includes('architect') ||
    lowerRole.includes('manager');

  const isLargeEnterprise =
    companySize === 'large' || companySize === 'enterprise';
  const isMidMarket = companySize === 'medium';
  const isSmall = companySize === 'small' || companySize === 'startup';

  // Executive at large company = highest income
  if (isExecutive && isLargeEnterprise) return '$200K–$400K+';
  if (isExecutive && isMidMarket) return '$150K–$250K';
  if (isExecutive && isSmall) return '$100K–$180K';

  // Senior at large company
  if (isSenior && isLargeEnterprise) return '$120K–$200K';
  if (isSenior && isMidMarket) return '$90K–$140K';
  if (isSenior && isSmall) return '$70K–$120K';

  // Regular professional
  if (isLargeEnterprise) return '$80K–$130K';
  if (isMidMarket) return '$65K–$100K';
  return '$50K–$80K';
}

function adjustIncomeBand(baseBand: string, industry?: string, location?: string): string {
  const BANDS = ['$50K–$80K', '$65K–$100K', '$80K–$130K', '$90K–$140K', '$120K–$200K', '$150K–$250K', '$200K–$400K+'] as const;
  let idx = Math.max(0, BANDS.indexOf(baseBand as any));

  const ind = String(industry || '').toLowerCase();
  const loc = String(location || '').toLowerCase();

  const highPayIndustry =
    ind.includes('software') ||
    ind.includes('technology') ||
    ind.includes('internet') ||
    ind.includes('saas') ||
    ind.includes('finance') ||
    ind.includes('investment') ||
    ind.includes('private equity') ||
    ind.includes('venture') ||
    ind.includes('consulting');

  const lowerPayIndustry =
    ind.includes('nonprofit') ||
    ind.includes('education') ||
    ind.includes('government') ||
    ind.includes('hospitality') ||
    ind.includes('retail');

  const hcol =
    loc.includes('san francisco') ||
    loc.includes('bay area') ||
    loc.includes('new york') ||
    loc.includes('nyc') ||
    loc.includes('seattle') ||
    loc.includes('boston') ||
    loc.includes('los angeles') ||
    loc.includes('washington') ||
    loc.includes('dc');

  if (highPayIndustry) idx += 1;
  if (lowerPayIndustry) idx -= 1;
  if (hcol) idx += 1;

  idx = Math.max(0, Math.min(BANDS.length - 1, idx));
  return BANDS[idx];
}

/**
 * Convert income band string to numeric estimate (midpoint)
 */
function incomeBandToNumber(band: string): number {
  const nums = band.match(/\d+/g);
  if (!nums || nums.length < 1) return 100000;

  const low = parseInt(nums[0]) * 1000;
  const high = nums[1] ? parseInt(nums[1]) * 1000 : low * 2;
  return Math.round((low + high) / 2);
}

/**
 * Infer likely dependents based on role and demographics
 */
function inferDependents(
  role: string,
  companySize: string,
  ageRange?: string,
  maritalStatus?: string
): Dependent[] {
  const dependents: Dependent[] = [];

  // Spouse inference
  const isLikelyMarried =
    maritalStatus === 'married' ||
    (!maritalStatus &&
      (role.toLowerCase().includes('manager') ||
        role.toLowerCase().includes('senior') ||
        role.toLowerCase().includes('director')));

  if (maritalStatus === 'married' || (isLikelyMarried && !maritalStatus)) {
    dependents.push({
      type: 'spouse',
      label: 'Spouse',
      riskWeight: 'critical',
      context: 'Primary income earner for household',
    });
  }

  // Children inference
  const ageIsParentingYears =
    !ageRange ||
    ageRange === '30-39' ||
    ageRange === '40-49' ||
    ageRange === '50-59';
  const rolesLikelyWithKids =
    role.toLowerCase().includes('manager') ||
    role.toLowerCase().includes('director') ||
    role.toLowerCase().includes('senior');

  if (ageIsParentingYears && rolesLikelyWithKids && maritalStatus !== 'single') {
    dependents.push({
      type: 'child',
      label: 'Children',
      riskWeight: 'high',
      context: 'Education costs, ongoing living expenses',
    });
  }

  // Parent dependency inference (less common but possible)
  if (ageRange === '45-54' || ageRange === '55-64') {
    dependents.push({
      type: 'parent',
      label: 'Aging Parents',
      riskWeight: 'medium',
      context: 'Potential healthcare and caregiving costs',
    });
  }

  // Business dependency for executives
  const isExecutive =
    role.toLowerCase().includes('ceo') ||
    role.toLowerCase().includes('founder') ||
    role.toLowerCase().includes('owner');

  if (isExecutive && companySize !== 'startup') {
    dependents.push({
      type: 'business-dependent',
      label: 'Business Obligations',
      riskWeight: 'high',
      context: 'Employees, partners, stakeholders depend on continuity',
    });
  }

  // If no dependents inferred, add default
  if (dependents.length === 0) {
    dependents.push({
      type: 'spouse',
      label: 'Household / Dependents',
      riskWeight: 'high',
      context: 'Family financial security',
    });
  }

  return dependents;
}

/**
 * Calculate annual financial exposure (sum of dependent risk weights)
 */
function calculateExposure(income: number, dependents: Dependent[]): string {
  const weights: Record<string, number> = {
    critical: 0.8,
    high: 0.6,
    medium: 0.4,
    low: 0.2,
  };

  const totalWeight = dependents.reduce(
    (sum, d) => sum + weights[d.riskWeight],
    0
  );
  const exposure = Math.round(income * totalWeight);

  if (exposure >= 1000000) {
    return `$${(exposure / 1000000).toFixed(1)}M+ annually`;
  }
  return `$${(exposure / 1000).toFixed(0)}K annually`;
}

/**
 * Calculate recommended coverage range (10–15x estimated annual exposure)
 */
function calculateRecommendedCoverage(
  income: number,
  dependents: Dependent[]
): string {
  // Base multiplier: 10x income
  let multiplier = 10;

  // Increase multiplier based on dependents and income
  const criticalCount = dependents.filter(
    (d) => d.riskWeight === 'critical'
  ).length;
  const highCount = dependents.filter((d) => d.riskWeight === 'high').length;

  multiplier += criticalCount * 2; // +2 per critical
  multiplier += highCount; // +1 per high

  const low = income * Math.min(multiplier, 12);
  const high = income * Math.min(multiplier + 3, 15);

  const format = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  return `${format(low)} – ${format(high)}`;
}

/**
 * Build human-readable explanation of the impact map
 */
function buildExplanation(
  profile: EnrichedProfile,
  incomeBand: string,
  dependents: Dependent[],
  hasManualInput: boolean
): string {
  const dependentsList = dependents
    .map((d) => d.label.toLowerCase())
    .join(', ');

  const confidence = hasManualInput
    ? 'Your provided information helps us estimate'
    : profile.linkedinUrl
      ? 'Based on your public professional profile, we estimate'
      : 'Based on limited public data, we estimate';

  return (
    `${confidence} that ${profile.name} as a ${profile.role} at ` +
    `${profile.company} likely earns in the ${incomeBand} range. ` +
    `The primary beneficiaries if something happened today would be ${dependentsList}. ` +
    `This estimate is based on role, company size, and inferred demographics. ` +
    `Actual coverage needs may vary significantly based on personal circumstances.`
  );
}

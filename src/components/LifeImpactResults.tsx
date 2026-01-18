import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Users, TrendingUp, Shield, Info, Sparkles } from 'lucide-react';
import { ImpactMap } from '../lib/inference';
import { formatLifeEventType } from '../lib/decisioning';
import { normalizeLifeEventForGtm, pushGtmEvent } from '../lib/gtm';
import { Logo } from './Logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface LifeImpactResultsProps {
  impactMap: ImpactMap;
  onBack: () => void;
}

function getRiskColor(riskWeight: string): string {
  const colors: Record<string, string> = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-green-500 bg-green-50',
  };
  return colors[riskWeight] || 'border-gray-300 bg-gray-50';
}

function getRiskBadgeColor(riskWeight: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };
  return colors[riskWeight] || 'bg-gray-100 text-gray-800';
}

function getLevelBadge(level: 'high' | 'medium' | 'low'): string {
  const colors: Record<string, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
}

function scoreColor(score: number) {
  if (score >= 70) return { ring: 'text-green-600', bg: 'bg-green-50', chip: 'bg-green-100 text-green-800' };
  if (score >= 45) return { ring: 'text-yellow-600', bg: 'bg-yellow-50', chip: 'bg-yellow-100 text-yellow-800' };
  return { ring: 'text-red-600', bg: 'bg-red-50', chip: 'bg-red-100 text-red-800' };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ScoreRing({ value }: { value: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp(value, 0, 100) / 100;
  const dash = circumference * pct;
  const gap = circumference - dash;
  const colors = scoreColor(value);

  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-gray-200"
          strokeWidth="8"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          className={colors.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-sm font-bold text-gray-900">{Math.round(value)}</div>
      </div>
    </div>
  );
}

function renderListOrDash(items?: string[]) {
  if (!items || items.length === 0) return <span className="text-gray-500">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((v, idx) => (
        <span key={`${v}-${idx}`} className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
          {v}
        </span>
      ))}
    </div>
  );
}

export function LifeImpactResults({ impactMap, onBack }: LifeImpactResultsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const score = impactMap.decisioning.coverageConfidenceScore;
  const scoreTone = useMemo(() => scoreColor(score), [score]);
  const [animatedScore, setAnimatedScore] = useState(0);
  const gtmFiredRef = useRef(false);

  useEffect(() => {
    if (gtmFiredRef.current) return;
    gtmFiredRef.current = true;

    const topLifeEventType = impactMap.decisioning.lifeEvents?.[0]?.type;
    const lifeEvent = normalizeLifeEventForGtm(topLifeEventType);

    const hasCoverageGap = impactMap.decisioning.drivers.some((d) =>
      d.toLowerCase().includes('gap')
    );

    const hasHighMomentum =
      impactMap.decisioning.lifeEvents.some((e) => e.confidence === 'high') ||
      impactMap.decisioning.drivers.some((d) => d.toLowerCase().includes('life-event momentum'));

    const base = {
      confidenceScore: score,
      lifeEvent,
      incomeBand: impactMap.incomeBand,
      coverageRange: impactMap.recommendedCoverageRange,
      coverageGap: hasCoverageGap,
      source: 'life_impact_map',
    } as const;

    pushGtmEvent({ event: 'life_impact_map_viewed', ...base });

    if (hasCoverageGap) {
      pushGtmEvent({ event: 'coverage_gap_revealed', ...base });
    }

    if (score < 50) {
      pushGtmEvent({ event: 'low_coverage_confidence_detected', ...base });
    }

    if (hasHighMomentum) {
      pushGtmEvent({ event: 'high_life_event_momentum', ...base });
    }
  }, [impactMap, score]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const durationMs = 700;
    const from = 0;
    const to = score;

    const tick = (t: number) => {
      const p = clamp((t - start) / durationMs, 0, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Header + Snapshot */}
      <motion.div variants={itemVariants} className="space-y-5">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="sm" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {impactMap.person.name}'s Life Impact Map™
          </h1>
          <p className="text-lg text-gray-600">Decisioning snapshot + explainable next steps</p>
        </div>

        <Card className="border-gray-200 shadow-md overflow-hidden gap-0">
          <div aria-hidden className="h-1 bg-gradient-to-r from-red-600/70 via-red-500 to-red-600/70" />
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`rounded-xl border border-gray-200 p-4 ${scoreTone.bg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-700">Coverage confidence</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{Math.round(animatedScore)}/100</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${scoreTone.chip}`}>
                        {impactMap.decisioning.messaging.scoreLabel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <ScoreRing value={animatedScore} />
                </div>
                <p className="mt-2 text-sm text-gray-700">{impactMap.decisioning.messaging.scoreExplanation}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white">
                <div className="text-xs font-semibold text-gray-700">Recommended coverage</div>
                <div className="mt-1 text-2xl font-bold text-green-700">{impactMap.recommendedCoverageRange}</div>
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Exposure:</span> {impactMap.estimatedAnnualExposure}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-700">Why now</div>
                  <Sparkles className="h-4 w-4 text-red-600" />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {impactMap.decisioning.drivers.map((d, idx) => (
                    <Badge key={`${d}-${idx}`} variant="secondary" className="bg-gray-100 text-gray-800">
                      {d}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-700">{impactMap.decisioning.messaging.nextStepText}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3"
      >
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-semibold mb-1">Disclaimer</p>
          <p>
            All insights shown are estimates based on public and inferred data. This is not financial advice. 
            Actual coverage needs may vary significantly based on personal circumstances, debts, and aspirations.
          </p>
        </div>
      </motion.div>

      {/* Guided navigation (Accordion) */}
      <motion.div variants={itemVariants}>
        <Accordion
          type="multiple"
          defaultValue={["overview", "dependents", "coverage", "decision", "enrichment"]}
          className="w-full rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden"
        >
          <AccordionItem value="overview" className="px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Profile + income estimate</div>
                  <div className="text-xs text-gray-600">Who you are + income band confidence</div>
                </div>
                <span className="text-xs text-gray-500">Click to toggle</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2 items-start pb-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Identity</div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {impactMap.person.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{impactMap.person.name}</h2>
                      <p className="text-gray-700">{impactMap.person.role}</p>
                      <p className="text-sm text-gray-500">{impactMap.person.company}</p>
                      <p className="text-xs text-gray-400 mt-1">{impactMap.person.location}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Estimated income band</div>
                  <div className="flex items-start gap-4">
                    <TrendingUp className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-red-600 mb-1">{impactMap.incomeBand}</p>
                      <p className="text-sm text-gray-600">Based on {impactMap.person.role} in {impactMap.person.company}</p>
                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-700 border border-gray-200">
                        <p className="font-semibold mb-1">Confidence: <span className="text-red-600">{impactMap.confidenceLevel}</span></p>
                        {impactMap.confidenceLevel === 'high' && (
                          <p>You provided age/marital info, increasing estimate accuracy</p>
                        )}
                        {impactMap.confidenceLevel === 'medium' && (
                          <p>Optional details would improve this estimate</p>
                        )}
                        {impactMap.confidenceLevel === 'low' && (
                          <p>We found limited public data for this estimate</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dependents" className="px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Impact map</div>
                  <div className="text-xs text-gray-600">Who depends on you and why it matters</div>
                </div>
                <span className="text-xs text-gray-500">Click to toggle</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-semibold text-gray-900">Who depends on you?</h3>
              </div>
              <div className="space-y-4">
                {impactMap.dependents.map((dependent, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className={`border-l-4 rounded-lg p-4 ${getRiskColor(dependent.riskWeight)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{dependent.label}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskBadgeColor(dependent.riskWeight)}`}>
                        {dependent.riskWeight.charAt(0).toUpperCase() + dependent.riskWeight.slice(1)} Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{dependent.context}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">What this means:</span> {impactMap.explanation}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="coverage" className="px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Coverage recommendation</div>
                  <div className="text-xs text-gray-600">Exposure + suggested coverage range</div>
                </div>
                <span className="text-xs text-gray-500">Click to toggle</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-5">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Recommended Coverage Range</h3>
                    <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                      <p className="text-3xl font-bold text-green-700">{impactMap.recommendedCoverageRange}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Based on {impactMap.dependents.length} key dependent{impactMap.dependents.length !== 1 ? 's' : ''} and estimated income
                      </p>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Annual Financial Exposure:</span> {impactMap.estimatedAnnualExposure}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        This is a simplified estimate. Actual needs depend on debts, goals, and personal circumstances.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="decision" className="px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Decision engine details</div>
                  <div className="text-xs text-gray-600">Life events + explainable drivers</div>
                </div>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200">NEW</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Decision Engine</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelBadge(impactMap.decisioning.messaging.scoreLabel)}`}>
                      Coverage Confidence: {impactMap.decisioning.coverageConfidenceScore}/100
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{impactMap.decisioning.messaging.scoreExplanation}</p>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Detected life events</p>
                    <div className="flex flex-wrap gap-2">
                      {impactMap.decisioning.lifeEvents.length > 0 ? (
                        impactMap.decisioning.lifeEvents.map((ev, idx) => (
                          <Badge
                            key={`${ev.type}-${idx}`}
                            variant="secondary"
                            className={getLevelBadge(ev.confidence)}
                            title={ev.reason}
                          >
                            {formatLifeEventType(ev.type)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No strong life-event signals detected</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Score drivers</p>
                    <div className="flex flex-wrap gap-2">
                      {impactMap.decisioning.drivers.map((d, idx) => (
                        <Badge key={`${d}-${idx}`} variant="secondary" className="bg-gray-100 text-gray-800">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 space-y-1">
                    <p><span className="font-semibold">What changed:</span> {impactMap.decisioning.messaging.whatChanged}</p>
                    <p><span className="font-semibold">Why now:</span> {impactMap.decisioning.messaging.whyNow}</p>
                    <p><span className="font-semibold">Recommended next step:</span> {impactMap.decisioning.messaging.nextStepText}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="enrichment" className="px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">FullEnrich data</div>
                  <div className="text-xs text-gray-600">Phones, emails, and raw JSON</div>
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">DETAILS</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Enriched Profile Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Work emails: {impactMap.enrichedProfile.workEmails?.length || 0} • Personal emails: {impactMap.enrichedProfile.personalEmails?.length || 0} • Phones: {impactMap.enrichedProfile.phones?.length || 0}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Work emails</p>
                      {renderListOrDash(impactMap.enrichedProfile.workEmails)}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Personal emails</p>
                      {renderListOrDash(impactMap.enrichedProfile.personalEmails)}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Phones</p>
                      {renderListOrDash(impactMap.enrichedProfile.phones)}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">LinkedIn</p>
                      {impactMap.enrichedProfile.linkedinUrl ? (
                        <a
                          className="text-sm text-red-700 underline"
                          href={impactMap.enrichedProfile.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {impactMap.enrichedProfile.linkedinUrl}
                        </a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                      View raw FullEnrich JSON
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 max-h-72 overflow-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(impactMap.enrichedProfile, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      {/* Next Steps */}
      <motion.div variants={itemVariants} className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Share this with a financial advisor to discuss coverage options</li>
              <li>✓ Review your current life insurance policies against this estimate</li>
              <li>✓ Consider updating beneficiaries to match your life situation</li>
              <li>✓ Revisit annually as your role, income, and family change</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition"
        >
          ← Start Over
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
        >
          📋 Print Results
        </button>
      </motion.div>
    </motion.div>
  );
}

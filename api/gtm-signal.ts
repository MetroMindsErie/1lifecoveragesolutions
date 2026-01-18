/**
 * Vercel Serverless Function: GTM Signal Endpoint (Demo)
 * POST /api/gtm-signal
 *
 * Accepts GTM-style events and returns a simple readiness classification.
 * No persistence/CRM integration: intended for hackathon demo + preview mode.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

type Readiness = 'call_now' | 'follow_up' | 'nurture' | 'low_intent';

type IncomingSignal = {
  event?: string;
  confidenceScore?: number;
  incomeBand?: string;
  lifeEvent?: string;
  coverageRange?: string;
  coverageGap?: boolean;
  source?: string;
};

function classify(signal: IncomingSignal): Readiness {
  const event = String(signal.event || '');
  const score = typeof signal.confidenceScore === 'number' ? signal.confidenceScore : undefined;
  const hasGap = Boolean(signal.coverageGap);

  // Rules-first: optimize for judge clarity.
  if (event === 'low_coverage_confidence_detected') return 'call_now';
  if (hasGap && typeof score === 'number' && score < 60) return 'call_now';
  if (event === 'high_life_event_momentum' && typeof score === 'number' && score < 70) return 'follow_up';
  if (event === 'coverage_gap_revealed') return 'follow_up';
  if (event === 'life_impact_map_viewed') return 'nurture';

  return 'low_intent';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signal = (req.body || {}) as IncomingSignal;
    const readiness = classify(signal);

    // Visible server-side logging for demos.
    console.log('[GTM SIGNAL]', {
      event: signal.event,
      confidenceScore: signal.confidenceScore,
      incomeBand: signal.incomeBand,
      lifeEvent: signal.lifeEvent,
      coverageGap: signal.coverageGap,
      readiness,
      source: signal.source,
    });

    return res.status(200).json({ readiness });
  } catch (error) {
    console.error('[GTM SIGNAL] Error:', error);
    return res.status(500).json({ error: 'Failed to process signal' });
  }
}

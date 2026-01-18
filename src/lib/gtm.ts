export type GtmEventName =
  | 'life_impact_map_viewed'
  | 'coverage_gap_revealed'
  | 'low_coverage_confidence_detected'
  | 'high_life_event_momentum'
  | 'risk_simulation_viewed';

export type GtmReadiness = 'call_now' | 'follow_up' | 'nurture' | 'low_intent';

export type GtmEventPayload = {
  event: GtmEventName;
  confidenceScore?: number;
  incomeBand?: string;
  lifeEvent?: string;
  coverageRange?: string;
  coverageGap?: boolean;
  source?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function isDemoMode(): boolean {
  // Vite: `import.meta.env.DEV` exists in dev builds.
  // Optional: set `VITE_GTM_DEMO=true` to force logging in production.
  const forced = String((import.meta as any).env?.VITE_GTM_DEMO || '').toLowerCase();
  return Boolean((import.meta as any).env?.DEV) || forced === 'true' || forced === '1';
}

export function pushGtmEvent(payload: GtmEventPayload): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload as unknown as Record<string, unknown>);

  if (isDemoMode()) {
    // Keep it obvious for judges without requiring GTM setup.
    // eslint-disable-next-line no-console
    console.log('[GTM] dataLayer.push', payload);

    // Optional: best-effort backend classification for the demo.
    void sendGtmSignal(payload);
  }
}

async function sendGtmSignal(payload: GtmEventPayload): Promise<void> {
  try {
    const res = await fetch('/api/gtm-signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return;
    const data = (await res.json()) as { readiness?: GtmReadiness };

    if (isDemoMode() && data?.readiness) {
      // eslint-disable-next-line no-console
      console.log('[GTM] readiness', data.readiness);
    }
  } catch {
    // Ignore — endpoint may not be deployed in some environments.
  }
}

export function normalizeLifeEventForGtm(type?: string): string | undefined {
  if (!type) return undefined;

  switch (type) {
    case 'income_acceleration':
      return 'career_acceleration';
    case 'new_job_promotion':
      return 'new_job_or_promotion';
    case 'high_responsibility_role':
      return 'leadership_role';
    case 'family_formation_stage':
      return 'family_formation';
    case 'career_risk_exposure':
      return 'career_risk_exposure';
    default:
      return type;
  }
}

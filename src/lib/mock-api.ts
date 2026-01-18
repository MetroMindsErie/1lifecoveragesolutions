/**
 * Mock API implementation for local development
 * In production (Vercel), actual serverless functions will be used
 */

import { enrichEmail } from '../lib/enrichment';
import { inferImpactMap } from '../lib/inference';

// Global API mock registry
const API_MOCKS: Record<string, (body: any) => Promise<any>> = {
  '/api/enrich': async (body) => {
    const profile = await enrichEmail(body.email);
    return { success: true, data: profile };
  },
  '/api/impact-map': async (body) => {
    const profile = await enrichEmail(body.email);
    const impactMap = await inferImpactMap(
      profile,
      body.ageRange,
      body.maritalStatus
    );
    return { success: true, data: impactMap };
  },
};

/**
 * Mock fetch for development
 * Intercepts API calls and routes them to local mock handlers
 */
export function setupMockAPI() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  const mockFetch: typeof fetch = async (url, init) => {
    let urlString: string;
    if (typeof url === 'string') {
      urlString = url;
    } else if (url instanceof URL) {
      urlString = url.toString();
    } else {
      urlString = url.url;
    }
    const method = (init?.method || 'GET').toUpperCase();

    // Check if this is an API endpoint we mock
    if (urlString.startsWith('/api/') && method === 'POST') {
      try {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const handler = API_MOCKS[urlString];

        if (handler) {
          console.log(`[MOCK API] ${method} ${urlString}`, body);
          const result = await handler(body);
          console.log(`[MOCK API] Response:`, result);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (error) {
        console.error(`[MOCK API] Error:`, error);
        return new Response(
          JSON.stringify({ success: false, error: String(error) }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fall back to real fetch for non-mocked endpoints
    return originalFetch(url, init);
  };

  (window as any).fetch = mockFetch;

  console.log('[MOCK API] API mock layer installed for development');
}

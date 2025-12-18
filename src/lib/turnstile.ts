const TURNSTILE_SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY;

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-api';
let turnstileLoadPromise: Promise<void> | null = null;

function waitForTurnstileReady(maxWaitMs = 8000): Promise<void> {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      if (typeof window.turnstile !== 'undefined' && typeof window.turnstile.ready === 'function') {
        try {
          window.turnstile.ready(() => resolve());
          return;
        } catch (e) {
          // Cloudflare Turnstile throws if api.js is loaded with async/defer.
          // We explicitly avoid that, but if something else injected it first, fall back.
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.toLowerCase().includes('remove async/defer')) {
            if (typeof window.turnstile.render === 'function') {
              resolve();
              return;
            }
          } else {
            reject(e instanceof Error ? e : new Error(msg));
            return;
          }
        }
      }

      if (Date.now() - start > maxWaitMs) {
        reject(new Error('Turnstile not ready (timeout)'));
        return;
      }

      setTimeout(tick, 50);
    };

    tick();
  });
}

/**
 * Load Cloudflare Turnstile script
 */
export function loadTurnstile(): Promise<void> {
  if (turnstileLoadPromise) return turnstileLoadPromise;

  turnstileLoadPromise = new Promise<void>((resolve, reject) => {
    if (!TURNSTILE_SITE_KEY) {
      console.warn('VITE_TURNSTILE_SITE_KEY not configured');
      resolve();
      return;
    }

    if (typeof window.turnstile !== 'undefined') {
      waitForTurnstileReady().then(resolve).catch(reject);
      return;
    }

    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      // If an older version was injected with async/defer, remove them.
      try {
        existing.async = false;
        existing.defer = false;
        existing.removeAttribute('async');
        existing.removeAttribute('defer');
      } catch {}
      // Script is already being loaded; wait until the API is usable.
      waitForTurnstileReady().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    // IMPORTANT: dynamic scripts default to async=true. Turnstile requires no async/defer
    // when using turnstile.ready().
    script.async = false;
    script.defer = false;
    script.onload = () => {
      waitForTurnstileReady().then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(script);
  }).finally(() => {
    // If we failed, allow a later attempt to retry loading.
    // If we succeeded, keep the resolved promise cached.
  });

  turnstileLoadPromise.catch(() => {
    turnstileLoadPromise = null;
  });

  return turnstileLoadPromise;
}

/**
 * Execute Turnstile and get token (invisible mode)
 */
export async function executeTurnstileInvisible(): Promise<string | null> {
  if (!TURNSTILE_SITE_KEY) {
    console.warn('Turnstile not configured, skipping verification');
    return null;
  }

  try {
    await loadTurnstile();

    if (typeof window.turnstile === 'undefined' || typeof window.turnstile.ready !== 'function') {
      return null;
    }

    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(() => {
        try {
          if (container.isConnected) document.body.removeChild(container);
        } catch {}
        resolve(null);
      }, 12000);

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.zIndex = '-1';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      window.turnstile.ready(() => {
        try {
          window.turnstile.render(container, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'light',
            size: 'invisible',
            callback: (token: string) => {
              window.clearTimeout(timeoutId);
              try { document.body.removeChild(container); } catch {}
              resolve(token);
            },
            'error-callback': (error: any) => {
              console.error('Turnstile error:', error);
              window.clearTimeout(timeoutId);
              try { document.body.removeChild(container); } catch {}
              resolve(null);
            },
            'expired-callback': () => {
              console.warn('Turnstile token expired');
              window.clearTimeout(timeoutId);
              try { document.body.removeChild(container); } catch {}
              resolve(null);
            },
            'timeout-callback': () => {
              console.warn('Turnstile timeout');
              window.clearTimeout(timeoutId);
              try { document.body.removeChild(container); } catch {}
              resolve(null);
            },
          });
        } catch (e) {
          console.error('Turnstile render error:', e);
          window.clearTimeout(timeoutId);
          try { document.body.removeChild(container); } catch {}
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Turnstile execution error:', error);
    return null;
  }
}

/**
 * Reset Turnstile widget
 */
export function resetTurnstile(widgetId?: string): void {
  if (typeof window.turnstile !== 'undefined') {
    window.turnstile.reset(widgetId);
  }
}

// Type definitions
declare global {
  interface Window {
    turnstile: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'invisible';
          callback?: (token: string) => void;
          'error-callback'?: (error?: any) => void;
          'expired-callback'?: () => void;
          'timeout-callback'?: () => void;
          'before-interactive-callback'?: () => void;
          'after-interactive-callback'?: () => void;
          'unsupported-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

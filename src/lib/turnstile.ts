const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

/**
 * Load Cloudflare Turnstile script
 */
export function loadTurnstile(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.turnstile !== 'undefined') {
      resolve();
      return;
    }

    if (!TURNSTILE_SITE_KEY) {
      console.warn('VITE_TURNSTILE_SITE_KEY not configured');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(script);
  });
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
    
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.zIndex = '-1';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        size: 'invisible',
        callback: (token: string) => {
          document.body.removeChild(container);
          resolve(token);
        },
        'error-callback': (error: any) => {
          console.error('Turnstile error:', error);
          document.body.removeChild(container);
          resolve(null);
        },
        'expired-callback': () => {
          console.warn('Turnstile token expired');
          document.body.removeChild(container);
          resolve(null);
        },
        'timeout-callback': () => {
          console.warn('Turnstile timeout');
          document.body.removeChild(container);
          resolve(null);
        },
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

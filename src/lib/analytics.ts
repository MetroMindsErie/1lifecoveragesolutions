declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackPageView(path: string) {
  const GA_ID = (import.meta as any).env?.VITE_GA_ID;
  if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const pageLocation = window.location.href;
  const pageTitle = document.title;

  window.gtag("event", "page_view", {
    page_title: pageTitle,
    page_location: pageLocation,
    page_path: path,
    send_to: GA_ID,
  });
}
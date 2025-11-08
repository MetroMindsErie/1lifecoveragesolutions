import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { Link } from "react-router-dom"; // NEW

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // GA4: inject + track SPA navigation, clicks, scroll depth, engagement time
  useEffect(() => {
    // Use env var if set, otherwise your GA4 ID (from snippet)
    const GA_ID = (import.meta as any).env?.VITE_GA_ID || "G-RPP8SC71BH"; // CHANGED
    if (!GA_ID) return;

    // Inject gtag.js once
    if (!document.querySelector(`script[data-ga="${GA_ID}"]`)) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      s.setAttribute("data-ga", GA_ID);
      document.head.appendChild(s);

      // init
      // @ts-ignore
      window.dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        // @ts-ignore
        (window as any).dataLayer.push(args);
      }
      // @ts-ignore
      (window as any).gtag = gtag;

      gtag("js", new Date());
      // Disable automatic page_view; we handle SPA views manually
      gtag("config", GA_ID, { send_page_view: false });
    }

    const gtag = (...args: any[]) => {
      // @ts-ignore
      if (typeof (window as any).gtag === "function") (window as any).gtag(...args);
    };

    // First-touch attribution (referrer + UTM) stored once per session
    const SESSION_KEY = "ga_first_touch";
    if (!sessionStorage.getItem(SESSION_KEY)) {
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get("utm_source") || "";
      const utm_medium = params.get("utm_medium") || "";
      const utm_campaign = params.get("utm_campaign") || "";
      const utm_term = params.get("utm_term") || "";
      const utm_content = params.get("utm_content") || "";
      const referrer = document.referrer || "";
      const firstTouch = { referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(firstTouch));
      gtag("set", "user_properties", firstTouch);
    } else {
      try {
        const firstTouch = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
        gtag("set", "user_properties", firstTouch);
      } catch {}
    }

    // Track page views on SPA route changes
    const trackPageView = () => {
      gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    };

    // Patch history to emit locationchange
    const _ps = history.pushState;
    const _rs = history.replaceState;
    const emit = () => window.dispatchEvent(new Event("locationchange"));
    history.pushState = function (this: History, ...args: any[]) {
      _ps.apply(this, args as any);
      emit();
    } as any;
    history.replaceState = function (this: History, ...args: any[]) {
      _rs.apply(this, args as any);
      emit();
    } as any;

    window.addEventListener("popstate", emit);
    window.addEventListener("locationchange", trackPageView);
    // initial page_view
    trackPageView();

    // Click tracking (links, buttons)
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = (target.closest("a") as HTMLAnchorElement | null);
      const btn = (target.closest("button") as HTMLButtonElement | null);

      const getText = (el?: Element | null) =>
        (el?.getAttribute("aria-label") ||
          (el?.textContent || "").trim()).slice(0, 80);

      if (link) {
        const href = link.getAttribute("href") || "";
        const url = (() => {
          try {
            return new URL(href, window.location.origin);
          } catch {
            return null;
          }
        })();
        if (url && url.origin !== window.location.origin) {
          // Outbound
          gtag("event", "click_outbound", {
            link_url: url.href,
            link_text: getText(link),
          });
        } else if (href.startsWith("tel:")) {
          gtag("event", "click_tel", { link_url: href, link_text: getText(link) });
        } else if (href.startsWith("mailto:")) {
          gtag("event", "click_email", { link_url: href, link_text: getText(link) });
        } else {
          gtag("event", "click_link", {
            link_url: href,
            link_text: getText(link),
          });
        }
      } else if (btn) {
        gtag("event", "click_button", {
          button_text: getText(btn),
          id: btn.id || undefined,
        });
      }
    };

    // Form submit tracking
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const name = form.getAttribute("name") || form.getAttribute("aria-label") || form.id || "form";
      gtag("event", "form_submit", { form_name: name });
    };

    document.addEventListener("click", onClick, { passive: true, capture: true });
    document.addEventListener("submit", onSubmit, true);

    // Scroll depth tracking
    const fired = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((doc.scrollTop / max) * 100);
      [25, 50, 75, 100].forEach((th) => {
        if (pct >= th && !fired.has(th)) {
          fired.add(th);
          gtag("event", "scroll_depth", { percent_scrolled: th });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Engagement timers
    const timers = [10000, 30000, 60000].map((ms) =>
      setTimeout(() => gtag("event", "engagement_time", { ms }), ms)
    );

    return () => {
      window.removeEventListener("popstate", emit);
      window.removeEventListener("locationchange", trackPageView);
      document.removeEventListener("click", onClick, true as any);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("scroll", onScroll);
      timers.forEach(clearTimeout);
      // restore history methods
      history.pushState = _ps;
      history.replaceState = _rs;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          {/* CHANGED: use Link instead of <a href="/"> */}
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#1a1a1a]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          <a href="/#coverage" className="text-sm text-[#1a1a1a] hover:text-[#1B5A8E] transition-colors">
            Coverage
          </a>
          <a href="/about" className="text-sm text-[#1a1a1a] hover:text-[#1B5A8E] transition-colors">
            About
          </a>
          <a href="/blog" className="text-sm text-[#1a1a1a] hover:text-[#1B5A8E] transition-colors">
            Resources
          </a>
          <a href="/quote" className="text-sm text-[#1a1a1a] hover:text-[#1B5A8E] transition-colors">
            Get a Quote
          </a>
          <a href="/contact" className="text-sm text-[#1a1a1a] hover:text-[#1B5A8E] transition-colors">
            Contact
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          {/* Disabled Login button (feature not ready) */}
          <Button 
            className="bg-[#1B5A8E] hover:bg-[#144669] transition-colors"
            asChild
          >
            <a href="/quote">Get Started</a>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-2 px-4 pb-4 pt-2">
            <a
              href="/#coverage"
              className="block rounded-lg px-3 py-2 text-base text-[#1a1a1a] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Coverage
            </a>
            <a
              href="/about"
              className="block rounded-lg px-3 py-2 text-base text-[#1a1a1a] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/blog"
              className="block rounded-lg px-3 py-2 text-base text-[#1a1a1a] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resources
            </a>
            <a
              href="/quote"
              className="block rounded-lg px-3 py-2 text-base text-[#1a1a1a] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get a Quote
            </a>
            <a
              href="/contact"
              className="block rounded-lg px-3 py-2 text-base text-[#1a1a1a] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <div className="flex flex-col gap-2 pt-2">
              {/* Disabled Login button (mobile) */}
              <Button variant="ghost" className="w-full opacity-60 cursor-not-allowed" disabled aria-disabled="true" title="Login coming soon">
                Login
              </Button>
              <Button 
                className="w-full bg-[#1B5A8E] hover:bg-[#144669] transition-colors"
                asChild
              >
                <a href="/quote">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
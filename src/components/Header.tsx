import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom"; // NEW
import logo from "../assets/c1916fca24a402e9827626e05b952c97898461d8.png"; // NEW

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // GA4: inject + track SPA navigation, clicks, scroll depth, engagement time
  useEffect(() => {
    // Keep theme CSS variables only — GA handled in index.html (Vite module)
    const BRAND_CORAL = "#FF6B61";
    try {
      document.documentElement.style.setProperty("--brand-coral", BRAND_CORAL);
      document.documentElement.style.setProperty("--brand-coral-10", "rgba(255,107,97,0.08)");
      document.documentElement.style.setProperty("--brand-coral-16", "rgba(255,107,97,0.16)");
      document.documentElement.style.setProperty("--brand-coral-40", "rgba(255,107,97,0.40)");
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1 items-center">
          {/* Small logo visible only on small screens */}
          <Link to="/" className="mr-2 block lg:hidden">
            <img
              src={logo}
              alt="1Life Coverage"
              className="h-8 w-8 rounded-md shadow-lg object-cover bg-white"
              width={32}
              height={32}
            />
          </Link>

          {/* Logo text (keeps visible as before) */}
          <Link to="/" className="text-lg font-semibold" style={{ color: "var(--brand-coral, #FF6B61)" }}>
            1Life Coverage
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
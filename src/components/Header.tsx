import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/">
            <Logo size="sm" />
          </a>
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
          <Button variant="ghost" asChild>
            <a href="/login">Login</a>
          </Button>
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
              <Button variant="ghost" asChild className="w-full">
                <a href="/login">Login</a>
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
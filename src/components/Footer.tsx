import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t bg-[#1a1a1a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <a href="/" className="inline-block">
              <Logo variant="light" size="md" />
            </a>
            <p className="text-sm text-[#94a3b8]">
              One Life. Total Coverage. Protecting what matters most with comprehensive insurance solutions.
            </p>
          </div>

          {/* Coverage */}
          <div>
            <h3 className="mb-4 text-sm uppercase tracking-wider text-white">Coverage</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/coverage/auto" className="text-[#94a3b8] hover:text-white transition-colors">
                  Auto Insurance
                </a>
              </li>
              <li>
                <a href="/coverage/business" className="text-[#94a3b8] hover:text-white transition-colors">
                  Business Insurance
                </a>
              </li>
              <li>
                <a href="/coverage/life" className="text-[#94a3b8] hover:text-white transition-colors">
                  Life Insurance
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-[#94a3b8] hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="text-[#94a3b8] hover:text-white transition-colors">
                  Blog & Resources
                </a>
              </li>
              <li>
                <a href="/contact" className="text-[#94a3b8] hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/careers" className="text-[#94a3b8] hover:text-white transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="mb-4 text-sm uppercase tracking-wider text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="text-[#94a3b8] hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-[#94a3b8] hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/compliance" className="text-[#94a3b8] hover:text-white transition-colors">
                  Compliance
                </a>
              </li>
            </ul>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#94a3b8] hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-[#94a3b8]">
          <p>© {new Date().getFullYear()} 1Life Coverage Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
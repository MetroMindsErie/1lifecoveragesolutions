import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, ShieldCheck, X } from "lucide-react";
import { Button } from "./ui/button";

function Logo({ className }: { className?: string }) {
    return (
      <div className={className}>
        <div className="text-center">
          <div className="text-5xl sm:text-6xl font-black" style={{ color: '#10b981', letterSpacing: '-0.02em' }}>1Life</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-700">Coverage</div>
        </div>
      </div>
    );
}

type IntroQuoteModalProps = {
  open: boolean;
  onStart: () => void;
};

export function IntroQuoteModal({ open, onStart }: IntroQuoteModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <>
      <style>{`
        body { overflow: hidden !important; }
        #root, #root > div { display: none !important; }
      `}</style>
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] rounded-3xl"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        padding: '1rem',
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="relative w-full rounded-md max-w-md rounded-3xl bg-white shadow-2xl mx-4 overflow-hidden"
          style={{ maxHeight: '85vh', overflowY: 'auto' }}
        >
          {/* Close button */}
          <button
            onClick={onStart}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Logo />
            </div>

            <div className="text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-base sm:text-lg font-black" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                <ShieldCheck className="h-6 w-6" />
                Fast, secure quote
              </div>
              <h2
                id={titleId}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1E3A5F] leading-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                Get Your Free Auto Insurance Quote
              </h2>
              <p id={descId} className="mt-4 text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed font-bold">
                1LifeCoverage helps you compare coverage options from trusted providers fast and secure.
              </p>
            </div>

            <ul className="mt-10 space-y-5 text-xl sm:text-2xl text-[#1E3A5F] font-bold">
              <li className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 rounded-full p-1" style={{ backgroundColor: '#10b981' }}>
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={4} />
                </div>
                <span>Takes just 2–3 minutes</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 rounded-full p-1" style={{ backgroundColor: '#10b981' }}>
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={4} />
                </div>
                <span>No obligation, no spam</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 rounded-full p-1" style={{ backgroundColor: '#10b981' }}>
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={4} />
                </div>
                <span>Your information stays private</span>
              </li>
            </ul>

            <div className="mt-4 flex flex-col gap-4">
              <button
                type="button"
                onClick={onStart}
                className="w-full bg-white border-3 font-black py-4 text-xl sm:text-2xl rounded-full shadow-lg transition-all"
                style={{ borderColor: '#10b981', color: '#10b981', borderWidth: '3px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#10b981';
                }}
              >
                Start My Free Quote →
              </button>
              <div className="flex items-center justify-center gap-2 text-base sm:text-lg text-gray-600 font-bold">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#10b981' }} />
                SSL encrypted • Secure Data Submission
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
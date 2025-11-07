import { ReactNode, useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { LucideIcon, Shield, Lock, Clock, Phone } from "lucide-react";
import { motion } from "motion/react";
import { PartnerTicker } from "../../components/PartnerTicker";

interface QuoteLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  backgroundImage?: string;
  benefits?: string[];
  faqs?: { question: string; answer: string }[];
  children: ReactNode;
  accentColor?: string; // NEW
}

const defaultBenefits = [
  "A+ rated carriers",
  "Bundle & save options",
  "Dedicated local advisor",
  "Fast, friendly claims help",
];

const defaultFaqs = [
  {
    question: "How long does a quote take?",
    answer: "Most quotes are prepared within 24 hours of submitting your information.",
  },
  {
    question: "Is my information secure?",
    answer: "Yes. We use secure, encrypted forms and never sell your data.",
  },
  {
    question: "Can I bundle multiple policies?",
    answer: "Yes. Bundles often lower your overall premium. Ask us for a personalized review.",
  },
];

export function QuoteLayout({
  title,
  subtitle,
  description,
  icon: Icon,
  backgroundImage,
  benefits = defaultBenefits,
  faqs = defaultFaqs,
  children,
  accentColor = "#1B5A8E",
}: QuoteLayoutProps) {
  // NEW: scroll progress
  const [scrollPct, setScrollPct] = useState(0);
  // NEW: steps + active index
  const [steps, setSteps] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const collectSteps = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
      setSteps(els.map(el => el.dataset.step || "").filter(Boolean));
    };
    collectSteps();
    // NEW: observe DOM changes (sections added/removed)
    const mo = new MutationObserver(() => collectSteps());
    mo.observe(document.body, { subtree: true, childList: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setScrollPct(scrolled);

      // determine active step
      const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
      let current = 0;
      const offset = 110; // header + margin
      for (let i = 0; i < sectionEls.length; i++) {
        if (sectionEls[i].getBoundingClientRect().top - offset <= 0) current = i;
        else break;
      }
      setActiveStep(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF]">
      {/* Animated subtle pattern (NEW) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(27,90,142,0.08),transparent_60%)]" />

      {/* NEW: top scroll progress bar */}
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent pointer-events-none">
        <div
          className="h-full transition-[width] duration-200"
          style={{
            width: `${scrollPct}%`,
            background: `linear-gradient(to right, ${accentColor}, #06b6d4, #0ea5e9)`
          }}
        />
      </div>

      {/* Decorative ambient background (NEW) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-[#4f46e5]/20 to-[#06b6d4]/30 blur-3xl" />
        <div className="absolute bottom-0 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-[#0ea5e9]/20 to-[#4f46e5]/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 fill=%22none%22 stroke=%22%23ffffff22%22><path d=%22M0 40h40V0%22/></svg>')]" />
      </div>

      {/* Header (unchanged except accent usage) */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#1B5A8E]">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-black/30" />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-white lg:px-8">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
            >
              {Icon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              )}
              <span className="text-sm">Secure • Fast • Personalized</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-3xl font-semibold sm:text-4xl lg:text-5xl"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-1 text-white/90"
              >
                {subtitle}
              </motion.p>
            )}
            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/80"
              >
                {description}
              </motion.p>
            )}
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Shield className="h-4 w-4 text-white" />
                <span className="text-sm">A+ Rated Carriers</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Lock className="h-4 w-4 text-white" />
                <span className="text-sm">Encrypted Forms</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Clock className="h-4 w-4 text-white" />
                <span className="text-sm">24h Response</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* NEW: Compact partner ticker */}
      <PartnerTicker variant="compact" />

      {/* Main grid + subtle glass effect wrapper (NEW style tweaks) */}
      <section className="py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2 space-y-8">
            {/* NEW: inline stepper */}
            {steps.length > 0 && (
              <div className="sticky top-12 z-10 rounded-xl border border-white/60 bg-white/70 backdrop-blur-md px-4 py-3 shadow-sm flex flex-wrap gap-2">
                {steps.map((s, i) => (
                  <div
                    key={s + i}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const target = document.querySelectorAll<HTMLElement>("[data-step]")[i];
                      target?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        const target = document.querySelectorAll<HTMLElement>("[data-step]")[i];
                        target?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#4f46e5] transition
                      ${i === activeStep
                        ? "bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] text-white shadow"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#1B5A8E]"
                      }`}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                      style={{
                        background: i === activeStep ? "rgba(255,255,255,0.25)" : accentColor,
                        color: "#fff"
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate max-w-[160px]">{s}</span>
                  </div>
                ))}
              </div>
            )}
            {/* NEW: form glass panel wrapper */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ring-1 ring-gray-200/60">
              {children}
            </div>
            {/* NEW: micro-disclaimer */}
            <p className="text-xs text-center text-gray-500">
              By submitting, you consent to be contacted about insurance options. No spam, no resale of data.
            </p>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-200 rounded-xl shadow-sm">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg text-[#1a1a1a]">Why 1Life Coverage?</h3>
                <ul className="space-y-3 text-sm">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="mt-1 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="text-[#6c757d]">{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6c757d]">Need help?</p>
                    <p className="text-[#1a1a1a]">Talk to an Agent</p>
                  </div>
                </div>
                <p className="mb-4 text-sm text-[#6c757d]">
                  Guidance on limits, discounts, and bundling strategies.
                </p>
                <div className="flex flex-col gap-2">
                  {/* Make Call match the outline design */}
                  <Button variant="outline" asChild>
                    <a href="tel:1-800-555-0123">Call (800) 555-0123</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/contact">Contact an Agent</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs (unchanged except subtle styling) */}
      <section className="border-t bg-white/90 backdrop-blur-sm py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <h3 className="mb-6 text-2xl text-[#1a1a1a]">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-200 bg-white shadow-sm p-4 transition"
              >
                <summary className="cursor-pointer list-none text-[#1a1a1a] font-medium">
                  {f.question}
                </summary>
                <p className="mt-2 text-sm text-[#6c757d]">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (unchanged) */}
      <section className="bg-[#1B5A8E] py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center text-white lg:flex-row lg:justify-between lg:px-8">
          <div>
            <h4 className="text-xl">Ready to finish your quote?</h4>
            <p className="text-white/80">Our team will follow up within 24 hours.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-white text-[#1B5A8E] hover:bg-white/90">
              <a href="/contact">Contact an Agent</a>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="tel:1-800-555-0123">Call (800) 555-0123</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

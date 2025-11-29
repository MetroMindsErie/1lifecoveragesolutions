import { HeroSection } from "../components/HeroSection";
import { CoverageCard } from "../components/CoverageCard";
import { Testimonials } from "../components/Testimonials";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "motion/react";
import logo from "../assets/c1916fca24a402e9827626e05b952c97898461d8.png"; // NEW
import {
  Car,
  Building2,
  Heart,
  Shield,
  Phone,
  Clock,
  Award,
  CheckCircle2,
  Users,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Home,
  Umbrella,
  Briefcase
} from "lucide-react";
// import { PartnerTicker } from "../components/PartnerTicker";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { PetQuoteCard } from "../components/quotes/PetQuoteCard";
import { RentersQuoteCard } from "../components/quotes/RentersQuoteCard";

// SEO helpers
function absUrl(path: string) {
  const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
function upsertMeta(selector: { name?: string; property?: string }, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    selector.name ? `meta[name="${selector.name}"]` : `meta[property="${selector.property}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    if (selector.name) el.setAttribute("name", selector.name);
    if (selector.property) el.setAttribute("property", selector.property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
function setHead(opts: {
  title: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogImage?: string;
  jsonLd?: any;
}) {
  const SITE = "1Life Coverage Solutions";
  const url = absUrl(opts.canonicalPath || window.location.pathname);
  document.title = `${opts.title} | ${SITE}`;
  if (opts.description) upsertMeta({ name: "description" }, opts.description);
  upsertLink("canonical", url);
  upsertMeta({ name: "robots" }, opts.noindex ? "noindex,nofollow" : "index,follow");
  upsertMeta({ property: "og:site_name" }, SITE);
  upsertMeta({ property: "og:type" }, "website");
  upsertMeta({ property: "og:title" }, `${opts.title} | ${SITE}`);
  if (opts.description) upsertMeta({ property: "og:description" }, opts.description);
  upsertMeta({ property: "og:url" }, url);
  if (opts.ogImage) upsertMeta({ property: "og:image" }, absUrl(opts.ogImage));
  upsertMeta({ name: "twitter:card" }, "summary_large_image");

  // JSON-LD (replace any previous injected by this page)
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
  if (opts.jsonLd) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-seo-jsonld", "1");
    s.textContent = JSON.stringify(opts.jsonLd);
    document.head.appendChild(s);
  }
}

const coverageTypes = [
  {
    title: "Auto Insurance",
    description:
      "Comprehensive coverage for your vehicle with competitive rates and 24/7 roadside assistance.",
    icon: Car,
    href: "/quote/auto",
    image:
      "https://images.unsplash.com/photo-1628188765472-50896231dafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Homeowners Insurance",
    description:
      "Protect your home and personal property with flexible coverage options.",
    icon: Home,
    href: "/quote/homeowners",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Personal Umbrella",
    description:
      "Extra liability protection beyond your home and auto policies.",
    icon: Umbrella,
    href: "/quote/umbrella",
    image:
      "https://images.unsplash.com/photo-1736037502897-97c76f66d682?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
  },
  {
    title: "Life Insurance",
    description:
      "Secure your family's future with term or whole life options.",
    icon: Heart,
    href: "/quote/life",
    image:
      "https://images.unsplash.com/photo-1596510914841-40223e421e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Commercial Building",
    description:
      "Coverage for owned or leased commercial properties across industries.",
    icon: Building2,
    href: "/quote/commercial-building",
    image:
      "https://images.unsplash.com/photo-1614969263964-f381e32b337d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1331",
  },
  {
    title: "Business Owners Policy (BOP)",
    description:
      "Bundled property and liability protection for small businesses.",
    icon: Briefcase,
    href: "/quote/bop",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const features = [
  {
    icon: Shield,
    title: "Comprehensive Coverage",
    description: "All your insurance needs in one place, from auto to travel.",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Our team is always here to help, day or night.",
  },
  {
    icon: Clock,
    title: "Quick Claims",
    description: "File and track claims easily with our streamlined process.",
  },
  {
    icon: Award,
    title: "Award-Winning Service",
    description: "Recognized for excellence in customer satisfaction.",
  },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Homeowner",
    company: "Seattle, WA",
    content: "Switching to 1Life Coverage was the best decision I made. Their customer service is exceptional, and I saved 30% on my auto insurance without compromising coverage.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Business Owner",
    company: "Tech Startup",
    content: "As a startup founder, I needed comprehensive business insurance that wouldn't break the bank. 1Life delivered exactly that with personalized guidance every step of the way.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Family & Auto",
    company: "Austin, TX",
    content: "Managing insurance for my family and three cars used to be a nightmare. Now everything is in one place, easy to understand, and genuinely affordable. Highly recommend!",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Pet Owner",
    company: "Denver, CO",
    content: "Their pet insurance saved me thousands when my dog needed emergency surgery. The claim was processed quickly and the team was incredibly supportive.",
    rating: 5,
  },
  {
    name: "Emily Thompson",
    role: "Motorcycle Enthusiast",
    company: "Phoenix, AZ",
    content: "Finally found motorcycle insurance that understands riders. Great coverage, fair pricing, and they actually care about their customers.",
    rating: 5,
  },
  {
    name: "Robert Park",
    role: "Life Insurance Client",
    company: "Boston, MA",
    content: "Setting up life insurance for my family was stress-free thanks to 1Life. They explained everything clearly and helped me choose the perfect plan.",
    rating: 5,
  },
];

const stats = [
  { icon: Users, value: "500K+", label: "Happy Customers" },
  { icon: Shield, value: "98%", label: "Claims Approved" },
  { icon: TrendingUp, value: "$2B+", label: "Coverage Provided" },
  { icon: DollarSign, value: "35%", label: "Average Savings" },
];

const whyChooseUs = [
  {
    icon: CheckCircle2,
    title: "Simple & Transparent",
    description: "No hidden fees, no confusing jargon. Just straightforward coverage that makes sense.",
  },
  {
    icon: DollarSign,
    title: "Competitive Rates",
    description: "Save an average of 35% with our multi-policy discounts and flexible payment options.",
  },
  {
    icon: Clock,
    title: "Fast Claims Processing",
    description: "Most claims processed within 48 hours. We're here when you need us most.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Your personal insurance advisor is just a call away, 24/7/365.",
  },
];

const industries = [
  { name: "Healthcare", count: "50K+ policies" },
  { name: "Technology", count: "35K+ policies" },
  { name: "Manufacturing", count: "42K+ policies" },
  { name: "Retail", count: "38K+ policies" },
  { name: "Construction", count: "45K+ policies" },
  { name: "Hospitality", count: "28K+ policies" },
];

const heroFeatures = [
  { icon: Zap, text: "Instant Quotes" },
  { icon: Shield, text: "Trusted Protection" },
  { icon: Target, text: "Custom Coverage" },
];

// NEW: additional theme color (coral)
const BRAND_CORAL = "#FF6B61";

export function HomePage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "InsuranceAgency",
      name: "1Life Coverage Solutions",
      url: absUrl("/"),
      logo: {logo},
      sameAs: [
        "https://www.facebook.com/",
        "https://www.linkedin.com/",
        "https://x.com/"
      ]
    };
    setHead({
      title: "One Life. Total Coverage.",
      description:
        "Compare auto, home, life, and business insurance with 1Life Coverage Solutions. Fast quotes and trusted protection.",
      canonicalPath: "/",
      ogImage: "/og/default.jpg",
      jsonLd,
    });
    // ensure coral is available even if Header useEffect not run yet
    try { document.documentElement.style.setProperty("--brand-coral", BRAND_CORAL); } catch {}
    // Attempt DB override
    (async () => {
      const { data } = await supabase
        .from("pages_seo")
        .select("title,description,canonical_url,og_image,json_ld")
        .eq("path", "/")
        .maybeSingle();
      if (data) {
        setHead({
          title: data.title || "One Life. Total Coverage.",
          description: data.description || undefined,
          canonicalPath: data.canonical_url || "/",
          ogImage: data.og_image || "/og/default.jpg",
          jsonLd: data.json_ld || jsonLd,
        });
      }
    })();
  }, []);

  return (
    <div>
      {/* Enhanced Hero Section with animated elements */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#1B5A8E]">
        {/* NEW: subtle coral decorative circle behind the logo (upper-left) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-8 -z-10 h-64 w-64 rounded-full blur-3xl"
          style={{ background: `${BRAND_CORAL}40` }}
        />
        {/* Hero logo (visible on lg+ only) — slightly larger on desktop */}
        <div
          className="hidden lg:flex absolute left-8 top-8 z-40 pointer-events-none rounded-2xl p-4 shadow-2xl bg-white/10 backdrop-blur-md h-32 w-32 lg:h-56 lg:w-56 xl:h-64 xl:w-64 items-center justify-center border border-white/20"
        >
          <img
            src={logo}
            alt="1Life Coverage Solutions"
            className="max-h-full max-w-full object-contain drop-shadow-md"
          />
        </div>
        

        {/* Floating animated shapes */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute right-10 top-20 h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-10 bottom-32 h-32 w-32 rounded-full bg-white/5 backdrop-blur-sm"
        />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full px-6 py-2 backdrop-blur-md border border-white/20 shadow-lg"
              style={{ background: `rgba(255, 255, 255, 0.1)` }}
            >
              <Sparkles className="h-5 w-5 text-[#FF6B61]" />
              <span className="text-sm font-medium text-white">Trusted by 500,000+ customers nationwide</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl drop-shadow-sm"
            >
              One Life. <br/>
              <span className="text-[#FF6B61]">Total Coverage.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 text-lg text-white/90 sm:text-xl leading-relaxed"
            >
              Comprehensive insurance solutions for individuals, families, and businesses. Protect what matters most with trusted coverage and exceptional service.
            </motion.p>

            {/* Hero Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-10 flex flex-wrap items-center justify-center gap-6"
            >
              {heroFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="w-full bg-[#FF6B61] text-white hover:bg-[#E55A50] border-none sm:w-auto transition-all hover:scale-105 shadow-xl text-lg px-8 py-6 h-auto"
                asChild
              >
                <a href="/quote">
                  Get Your Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-white/10 text-white border-white/30 hover:bg-white hover:text-[#1B5A8E] sm:w-auto transition-all text-lg px-8 py-6 h-auto backdrop-blur-sm"
                asChild
              >
                <a href="#coverage">Explore Coverage</a>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* NEW: Partner / Carrier Ticker */}
      {/* <PartnerTicker /> */}

      {/* Stats Section - subtle coral tint background */}
      <section className="border-b py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B5A8E]/5 group-hover:bg-[#1B5A8E]/10 transition-colors">
                    <stat.icon className="h-8 w-8 text-[#1B5A8E]" />
                  </div>
                </div>
                <div className="mb-1 text-4xl font-bold text-[#1B5A8E]">
                  {stat.value}
                </div>
                <p className="text-sm font-medium text-[#6c757d] uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition (coral-tinted background) */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FF6B61]/10 px-4 py-2">
                <Sparkles className="h-4 w-4 text-[#FF6B61]" />
                <span className="text-sm font-medium text-[#FF6B61]">Trusted by 500,000+ customers</span>
              </div>
              <h2 className="mb-6 text-4xl font-bold text-[#1B5A8E] sm:text-5xl">
                Insurance Made Simple
              </h2>
              <p className="mb-6 text-lg text-[#6c757d] leading-relaxed">
                At 1Life Coverage Solutions, we believe insurance should be straightforward, accessible, and tailored to your unique needs. Whether you're protecting your car, business, or loved ones, we're here to provide comprehensive coverage with exceptional service.
              </p>
              <p className="mb-8 text-lg text-[#6c757d] leading-relaxed">
                Our team of experienced advisors works with you to find the perfect balance of coverage and affordability, ensuring you're never overpaying or underinsured.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button 
                  className="bg-[#1B5A8E] hover:bg-[#144669] transition-colors text-white px-8 py-6 h-auto text-lg"
                  asChild
                >
                  <a href="/about">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  variant="outline"
                  className="border-[#1B5A8E] text-[#1B5A8E] hover:bg-[#1B5A8E] hover:text-white px-8 py-6 h-auto text-lg"
                  asChild
                >
                  <a href="/contact">Contact an Agent</a>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B61] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="flex items-start gap-6 p-8">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1B5A8E]/10 group-hover:bg-[#1B5A8E] transition-colors">
                        <feature.icon className="h-7 w-7 text-[#1B5A8E] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-semibold text-[#1a1a1a]">{feature.title}</h3>
                        <p className="text-base text-[#6c757d] leading-relaxed">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coverage Section - coral tint to reduce large white blocks */}
      <section id="coverage" className="py-24 relative">
        <div className="absolute inset-0 bg-[#1B5A8E]/5 skew-y-3 transform origin-top-left -z-10" />
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#1B5A8E] sm:text-5xl">
              Comprehensive Coverage Solutions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
              Whether you're protecting your car, business, or loved ones, we've got you covered with flexible plans and competitive rates.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coverageTypes.map((coverage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <CoverageCard
                  title={coverage.title}
                  description={coverage.description}
                  icon={coverage.icon}
                  href={coverage.href}
                  image={coverage.image}
                />
              </motion.div>
            ))}
            {/* Pet Insurance Quote Card */}
            <PetQuoteCard />
            {/* Renters Insurance Quote Card */}
            <RentersQuoteCard />
          </div>
        </div>
      </section>

      {/* Industries We Serve (subtle coral background) */}
      <section className="border-y py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#1B5A8E] sm:text-5xl">
              Industries We Serve
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
              Specialized insurance solutions for businesses across diverse sectors
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="border-gray-100 shadow-sm transition-all duration-300 hover:border-[#FF6B61] hover:shadow-lg hover:-translate-y-1 group cursor-default">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B5A8E]/5 group-hover:bg-[#FF6B61]/10 transition-colors">
                      <Building2 className="h-6 w-6 text-[#1B5A8E] group-hover:text-[#FF6B61] transition-colors" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-[#1a1a1a]">{industry.name}</h3>
                    <p className="text-xs text-[#6c757d]">{industry.count}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section (coral tint) */}
      <section className="py-24 bg-[#1B5A8E] text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#2C7DB8] rounded-full opacity-50 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-[#FF6B61] rounded-full opacity-20 blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Why Choose 1Life Coverage?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              We're not just another insurance company. We're your partner in protection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-white">
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF6B61] shadow-lg">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials
        testimonials={testimonials}
        title="What Our Customers Say"
        description="Join thousands of satisfied customers who trust 1Life Coverage Solutions"
      />

      {/* CTA Section (use coral→blue gradient so footer shows coral) */}
            <section className="relative overflow-hidden py-24">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B61] to-[#1B5A8E]" />
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="mx-auto max-w-7xl px-4 text-center lg:px-8 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mx-auto max-w-3xl"
                >
                  <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl">
                    Ready to protect what matters?
                  </h2>
                  <p className="mb-10 text-xl text-white/90">
                    Get an instant quote or speak with an agent today to find coverage that fits your needs and budget.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-[#FF6B61] border-white hover:bg-white/10 text-lg px-8 py-6 h-auto" asChild>
                      <a href="/quote">
                      Get a Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-[#FF6B61] border-white hover:bg-white/10 text-lg px-8 py-6 h-auto" asChild>
                      <a href="/contact">Contact an Agent</a>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </section>
          </div>
        );
      }

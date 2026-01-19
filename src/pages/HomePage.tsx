import { HeroSection } from "../components/HeroSection";
import { CoverageCard } from "../components/CoverageCard";
import { Testimonials } from "../components/Testimonials";
import { ValueProposition } from "../components/ValueProposition";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "motion/react";
import { QuoteStarter } from "../components/QuoteStarter";
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
  Briefcase,
  Waves,
  Caravan,
  Snowflake,
  Key,
  HomeIcon,
  FileText,
  PartyPopper
} from "lucide-react";
// import { PartnerTicker } from "../components/PartnerTicker";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { absUrl, setHead } from "../lib/seo";
import { PetQuoteCard } from "../components/quotes/PetQuoteCard";
import { RentersQuoteCard } from "../components/quotes/RentersQuoteCard";
import { SpecialtyTicker } from "../components/SpecialtyTicker";

const logo = new URL(
  "../assets/c1916fca24a402e9827626e05b952c97898461d8.png",
  import.meta.url
).href;
const airbnb = "/images/airbnb.png";
const vrbo = "/images/vrbo.png";

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

const specialtyCoverages = [
  { name: "Classic Vehicles", icon: Car },
  { name: "SR-22", icon: FileText },
  { name: "Dispensaries", icon: Building2 },
  { name: "Special Event", icon: PartyPopper },
  { name: "Flood", icon: Waves },
  { name: "RV", icon: Caravan },
  { name: "Snowmobile", icon: Snowflake },
  { name: "Landlord", icon: Key },
  { name: "Vacant Homes", icon: HomeIcon },
  { name: "Airbnb", icon: airbnb, isImage: true },
  { name: "VRBO", icon: vrbo, isImage: true },

];

// NEW: additional theme color (coral)
const BRAND_CORAL = "#FF6B61";
const PAGE_TITLE = "One Life. Total Coverage.";

export function HomePage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "InsuranceAgency",
      name: "1Life Coverage Solutions",
      url: absUrl("/"),
      logo: { logo },
      sameAs: [
        "https://www.facebook.com/",
        "https://www.linkedin.com/",
        "https://x.com/"
      ]
    };
    setHead({
      title: PAGE_TITLE,
      description:
        "Compare auto, home, life, and business insurance with 1Life Coverage Solutions. Fast quotes and trusted protection.",
      canonicalPath: "/",
      ogImage: "/images/insurance-3.jpg",
      jsonLd,
    });
    // ensure coral is available even if Header useEffect not run yet
    try { document.documentElement.style.setProperty("--brand-coral", BRAND_CORAL); } catch { }
    // Attempt DB override
    (async () => {
      try {
        const { data } = await supabase
          .from("pages_seo")
          .select("title,description,canonical_url,og_image,json_ld")
          .eq("path", "/")
          .maybeSingle();
        if (data) {
          setHead({
            title: data.title || PAGE_TITLE,
            description: data.description || undefined,
            canonicalPath: data.canonical_url || "/",
            ogImage: data.og_image || "/images/insurance-3.jpg",
            jsonLd: data.json_ld || jsonLd,
          });
        }
      } catch (error) {
        console.warn('Failed to fetch SEO data from Supabase:', error);
        // Continue with default SEO settings
      }
    })();
  }, []);

  return (
    <div className="pb-24 lg:pb-32 bg-gradient-to-br from-[#F3F7FF] via-white to-[#FFF2F0]">
      {/* Enhanced Hero Section with Quote Starter */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#1B5A8E]">
        {/* Background collage image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-100"
          style={{
            backgroundImage: 'url(/images/insurance-3.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll',
            filter: 'brightness(0.55) saturate(0.95) contrast(1.1)',
          }}
        />

        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A]/65 via-[#1B5A8E]/45 to-[#0B1F3A]/70" />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-24 lg:px-8 lg:py-32 z-20">
          <div className="mx-auto mb-8 max-w-4xl text-center">
            <div className="inline-block rounded-2xl border border-white/25 bg-[#0B1F3A]/70 px-4 py-5 backdrop-blur-2xl shadow-[0_26px_70px_rgba(0,0,0,0.75)] sm:px-8 sm:py-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-balance text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_16px_40px_rgba(0,0,0,1)] sm:text-5xl"
              >
                Compare insurance quotes and get covered fast
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mx-auto mt-4 max-w-2xl text-pretty text-base font-semibold text-white drop-shadow-[0_14px_34px_rgba(0,0,0,1)] sm:text-lg"
              >
                Auto, home, life, renters, and business coverage — start a quote in minutes with 1Life Coverage Solutions.
              </motion.p>
            </div>
          </div>

          {/* Mobile: Quote Starter at top, Logo below */}
          {/* Desktop: Logo left, Quote Starter right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
            {/* Logo - shows second on mobile, first on desktop */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-start order-2 lg:order-1 h-full"
            >
              <div className="relative w-full lg:min-h-[28rem]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B61]/20 via-transparent to-[#1B5A8E]/20 blur-3xl" />
                <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-white/60 p-4 sm:p-6 shadow-2xl h-full min-h-[18rem] lg:min-h-[28rem] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1B5A8E]/5 via-transparent to-[#FF6B61]/5 pointer-events-none" />
                  <img
                    src={logo}
                    alt="1Life Coverage Solutions"
                    className="relative z-10 max-h-[14rem] sm:max-h-[16rem] lg:max-h-[18rem] w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                  />
                </div>
              </div>
            </motion.div>

            {/* Quote Starter - shows first on mobile, second on desktop */}
            <div className="order-1 lg:order-2 w-full h-full lg:min-h-[28rem]">
              <QuoteStarter coverages={specialtyCoverages} />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1F3A] to-transparent" />
      </section>

      {/* NEW: Partner / Carrier Ticker */}
      {/* <PartnerTicker /> */}

      {/* Value Proposition */}
      <ValueProposition
        features={features}
        backgroundVariant="light"
      />

      {/* Why Choose Us Section (coral tint) */}
      <section className="relative py-16 sm:py-20 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C7DB8]/10 via-transparent to-[#FF6B61]/10" />

        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/85 p-6 sm:p-8 md:p-12 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B61] to-transparent"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-12 sm:mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-[#0B1F3A] md:text-5xl">
                Why Choose 1Life Coverage?
              </h2>
              <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-700 font-semibold px-4">
                We're not just another insurance company. We're your partner in protection.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#2C7DB8]/5 via-transparent to-[#FF6B61]/10" />

                    <div className="mb-6 flex justify-center relative z-10">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-xl shadow-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #2C7DB8 0%, #1B5A8E 100%)'
                        }}
                      >
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mb-4 text-2xl font-extrabold text-[#0B1F3A] relative z-10">{item.title}</h3>
                    <p className="text-base text-slate-700 leading-relaxed font-semibold relative z-10">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <div className="mb-0">
        <Testimonials
          testimonials={testimonials}
          title="What Our Customers Say"
          description="Join thousands of satisfied customers who trust 1Life Coverage Solutions"
          overlayVariant="light"
        />
      </div>

      {/* Sticky ticker at bottom, always visible */}
      <div className="bottom-0 inset-x-0 bg-[#0B1F3A] pointer-events-none mt-6 z-0">
        <SpecialtyTicker coverages={specialtyCoverages} />
      </div>
    </div>
  );
}

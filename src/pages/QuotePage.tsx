// Updated to act as a hub that links to each specific quote form
import { Shield, Lock, Clock, Car, Home, Umbrella, Heart, Building2, Briefcase } from "lucide-react";
import { CoverageCard } from "../components/CoverageCard";
import { PetQuoteCard } from "../components/quotes/PetQuoteCard";
import { RentersQuoteCard } from "../components/quotes/RentersQuoteCard";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function absUrl(path: string) {
  const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
function setHeadBasic({ title, description, canonicalPath, jsonLd }: { title: string; description?: string; canonicalPath?: string; jsonLd?: any; }) {
  const SITE = "1Life Coverage Solutions";
  const url = absUrl(canonicalPath || window.location.pathname);
  document.title = `${title} | ${SITE}`;
  if (description) {
    let d = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!d) { d = document.createElement("meta"); d.setAttribute("name","description"); document.head.appendChild(d); }
    d.setAttribute("content", description);
  }
  let c = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!c) { c = document.createElement("link"); c.setAttribute("rel","canonical"); document.head.appendChild(c); }
  c.setAttribute("href", url);
  const up = (sel: any, val: string) => {
    let el = document.head.querySelector(sel) as HTMLMetaElement | null;
    if (!el) { el = document.createElement("meta"); document.head.appendChild(el); }
    if (sel.includes('property')) el.setAttribute("property", sel.split('"')[1]);
    if (sel.includes('name')) el.setAttribute("name", sel.split('"')[1]);
    el.setAttribute("content", val);
  };
  up('meta[property="og:site_name"]', SITE);
  up('meta[property="og:type"]', "website");
  up('meta[property="og:title"]', `${title} | ${SITE}`);
  if (description) up('meta[property="og:description"]', description);
  up('meta[property="og:url"]', url);
  up('meta[name="twitter:card"]', "summary_large_image");
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
  if (jsonLd) {
    const s = document.createElement("script");
    s.type = "application/ld+json"; s.setAttribute("data-seo-jsonld","1");
    s.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(s);
  }
}

export function QuotePage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Insurance Quotes",
      url: absUrl("/quote"),
      description: "Start your auto, homeowners, umbrella, life, and business insurance quotes."
    };
    setHeadBasic({
      title: "Start Your Insurance Quote",
      description: "Choose auto, homeowners, umbrella, life, or business to get a fast quote.",
      canonicalPath: "/quote",
      jsonLd
    });
    (async () => {
      const { data } = await supabase
        .from("pages_seo").select("title,description,canonical_url,og_image,json_ld")
        .eq("path", "/quote").maybeSingle();
      if (data) {
        setHeadBasic({
          title: data.title || "Start Your Insurance Quote",
          description: data.description || undefined,
          canonicalPath: data.canonical_url || "/quote",
          jsonLd: data.json_ld || jsonLd
        });
      }
    })();
  }, []);

  const quoteTypes = [
    {
      title: "Auto Insurance",
      description: "Personal auto coverage quotes for your vehicles and drivers.",
      icon: Car,
      href: "/quote/auto",
      image:
        "https://images.unsplash.com/photo-1628188765472-50896231dafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      title: "Homeowners Insurance",
      description: "Property and liability coverage for your home.",
      icon: Home,
      href: "/quote/homeowners",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      title: "Personal Umbrella",
      description: "Extra liability protection over your home/auto policies.",
      icon: Umbrella,
      href: "/quote/umbrella",
      image:
        "https://images.unsplash.com/photo-1736037502897-97c76f66d682?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687", // updated
    },
    {
      title: "Life Insurance",
      description: "Term or whole life coverage tailored to your needs.",
      icon: Heart,
      href: "/quote/life",
      image:
        "https://images.unsplash.com/photo-1596510914841-40223e421e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      title: "Commercial Building",
      description: "Coverage for owned or leased commercial properties.",
      icon: Building2,
      href: "/quote/commercial-building",
      image:
        "https://images.unsplash.com/photo-1614969263964-f381e32b337d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1331", // updated
    },
    {
      title: "Business Owners Policy (BOP)",
      description: "Property, liability, and more for small businesses.",
      icon: Briefcase,
      href: "/quote/bop",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="mb-4 text-4xl text-[#1a1a1a]">Start Your Quote</h1>
          <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
            Choose a coverage type to fill out a quick, comprehensive form.
          </p>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[#1a1a1a]">Trusted Coverage</p>
                <p className="text-sm text-[#6c757d]">A+ Rated Insurance</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[#1a1a1a]">Secure & Private</p>
                <p className="text-sm text-[#6c757d]">Your data is protected</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[#1a1a1a]">Quick Response</p>
                <p className="text-sm text-[#6c757d]">Reply within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote type cards */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {quoteTypes.map((q, i) => (
              <CoverageCard
                key={i}
                title={q.title}
                description={q.description}
                icon={q.icon}
                href={q.href}
                image={q.image}
              />
            ))}
            {/* Add Pet Insurance Card */}
            <PetQuoteCard />
            
            {/* Add Renters Insurance Card */}
            <RentersQuoteCard />
          </div>
        </div>
      </section>
    </div>
  );
}

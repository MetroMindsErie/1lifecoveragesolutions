// Updated to showcase a deluxe quote starter experience
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { absUrl, setHead } from "../lib/seo";
import { QuoteStarter } from "../components/QuoteStarter";

export function QuotePage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Insurance Quotes",
      url: absUrl("/quote"),
      description: "Start your auto, homeowners, umbrella, life, and business insurance quotes."
    };
    setHead({
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
        setHead({
          title: data.title || "Start Your Insurance Quote",
          description: data.description || undefined,
          canonicalPath: data.canonical_url || "/quote",
          ogImage: data.og_image || undefined,
          jsonLd: data.json_ld || jsonLd
        });
      }
    })();
  }, []);

  const steps = [
    {
      title: "Pick coverage",
      description: "Select a policy type.",
    },
    {
      title: "Answer basics",
      description: "Share key details.",
    },
    {
      title: "Compare options",
      description: "Get matched fast.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat"
      style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=80)",
        backgroundPosition: "center 40%",
      }}
    >


      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-8">
        <div className="w-full">
          <div
            className="mb-4 rounded-2xl bg-white/95 backdrop-blur-xl border-4 border-[#1B5A8E] px-4 py-3 shadow-[0_18px_45px_rgba(27,90,142,0.35)] relative overflow-hidden"
            style={{ marginTop: "6rem" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B5A8E]/10 via-transparent to-[#FF6B61]/10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#FF6B61]/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-tl from-[#1B5A8E]/15 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1B5A8E]">Simple process</p>
                <p className="mt-1 text-base font-bold text-[#0B1F3A]">3 quick steps</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {steps.map((step, index) => (
                  <span
                    key={index}
                    className="rounded-full border-[3px] border-[#FF6B61] bg-[#FF6B61]/10 px-3 py-1 text-xs font-semibold text-[#0B1F3A]"
                  >
                    {step.title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl rounded-full bg-gradient-to-r from-[#1B5A8E] via-[#2C7DB8] to-[#FF6B61] p-[2px] shadow-[0_22px_60px_rgba(27,90,142,0.4)]">
            <div className="rounded-[1.35rem] rounded-full bg-white/95">
              <QuoteStarter />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

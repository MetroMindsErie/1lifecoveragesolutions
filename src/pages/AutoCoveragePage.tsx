import { CoveragePage } from "./CoveragePage";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function absUrl(path: string) {
  const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
function setHead({ title, description, canonicalPath, jsonLd }: { title: string; description?: string; canonicalPath?: string; jsonLd?: any; }) {
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
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
  if (jsonLd) { const s = document.createElement("script"); s.type = "application/ld+json"; s.setAttribute("data-seo-jsonld","1"); s.textContent = JSON.stringify(jsonLd); document.head.appendChild(s); }
}

export function AutoCoveragePage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Auto Insurance",
      provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
      areaServed: "US",
      url: absUrl("/coverage/auto"),
      description: "Comprehensive auto insurance with competitive rates and roadside assistance."
    };
    setHead({
      title: "Auto Insurance Coverage",
      description: "Comprehensive auto insurance coverage with competitive rates and roadside assistance.",
      canonicalPath: "/coverage/auto",
      jsonLd
    });
    (async () => {
      const { data } = await supabase
        .from("pages_seo").select("title,description,canonical_url,json_ld")
        .eq("path", "/coverage/auto").maybeSingle();
      if (data) {
        setHead({
          title: data.title || "Auto Insurance Coverage",
          description: data.description || undefined,
          canonicalPath: data.canonical_url || "/coverage/auto",
          jsonLd: data.json_ld || jsonLd
        });
      }
    })();
  }, []);

  return (
    <CoveragePage
      title="Auto Insurance"
      subtitle="Vehicle Protection"
      description="Comprehensive auto insurance coverage with competitive rates, 24/7 roadside assistance, and flexible payment options. Drive with confidence knowing you're protected."
      backgroundImage="https://images.unsplash.com/photo-1628188765472-50896231dafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjYXIlMjBkcml2aW5nfGVufDF8fHx8MTc2MjM5OTg2Nnww&ixlib=rb-4.1.0&q=80&w=1080"
      features={[
        "Liability Coverage",
        "Collision Coverage",
        "Comprehensive Coverage",
        "Uninsured Motorist Protection",
        "Medical Payments Coverage",
        "Personal Injury Protection",
        "Rental Car Reimbursement",
        "24/7 Roadside Assistance",
        "Glass Repair Coverage",
        "Gap Insurance Available",
        "Multi-Vehicle Discounts",
        "Safe Driver Rewards",
      ]}
      plans={[
        {
          name: "Basic",
          price: "$89",
          description: "Essential coverage for budget-conscious drivers",
          features: [
            "State Minimum Liability",
            "Basic Roadside Assistance",
            "Online Claims Filing",
            "Monthly Payment Plans",
          ],
        },
        {
          name: "Standard",
          price: "$149",
          description: "Comprehensive protection for most drivers",
          features: [
            "Full Liability Coverage",
            "Collision & Comprehensive",
            "24/7 Roadside Assistance",
            "Rental Car Reimbursement",
            "Accident Forgiveness",
            "Glass Repair Coverage",
          ],
          recommended: true,
        },
        {
          name: "Premium",
          price: "$219",
          description: "Maximum coverage and peace of mind",
          features: [
            "Maximum Liability Limits",
            "Full Collision & Comprehensive",
            "Premium Roadside Assistance",
            "Extended Rental Coverage",
            "Accident Forgiveness",
            "Gap Insurance Included",
            "New Car Replacement",
            "Priority Claims Service",
          ],
        },
      ]}
    />
  );
}

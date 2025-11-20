import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CheckCircle2, Home } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";

function absUrl(path: string) {
  const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
function setHead({ title, description, canonicalPath, jsonLd }: { title: string; description?: string; canonicalPath?: string; jsonLd?: any; }) {
  const SITE = "1Life Coverage Solutions";
  const url = absUrl(canonicalPath || window.location.pathname);
  document.title = `${title} | ${SITE}`;
  if (description) { let d=document.head.querySelector('meta[name="description"]') as HTMLMetaElement|null; if(!d){d=document.createElement("meta"); d.setAttribute("name","description"); document.head.appendChild(d);} d.setAttribute("content",description); }
  let c=document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement|null; if(!c){c=document.createElement("link"); c.setAttribute("rel","canonical"); document.head.appendChild(c);} c.setAttribute("href",url);
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
  if (jsonLd) { const s=document.createElement("script"); s.type="application/ld+json"; s.setAttribute("data-seo-jsonld","1"); s.textContent=JSON.stringify(jsonLd); document.head.appendChild(s); }
}

export function HomeownersQuotePage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Homeowners Insurance Quote",
      provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
      url: absUrl("/quote/homeowners"),
      areaServed: "US",
      description: "Get a homeowners insurance quote with tailored coverage recommendations."
    };
    setHead({
      title: "Homeowners Insurance Quote",
      description: "Share property details to get accurate homeowners coverage recommendations.",
      canonicalPath: "/quote/homeowners",
      jsonLd
    });
    (async () => {
      const { data } = await supabase
        .from("pages_seo").select("title,description,canonical_url,json_ld")
        .eq("path", "/quote/homeowners").maybeSingle();
      if (data) {
        setHead({
          title: data.title || "Homeowners Insurance Quote",
          description: data.description || undefined,
          canonicalPath: data.canonical_url || "/quote/homeowners",
          jsonLd: data.json_ld || jsonLd
        });
      }
    })();
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false); // NEW
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitQuote("homeowners", e.currentTarget);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      alert(err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF] py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="mb-4 text-3xl text-[#1a1a1a]">Homeowners Quote Submitted</h2>
            <p className="text-[#6c757d]">We’ll contact you within 24 hours.</p>
            <div className="mt-8">
              <Button className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9]" asChild>
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <QuoteLayout
      title="Homeowners Insurance Quote"
      description="Share property details to get accurate coverage recommendations."
      icon={Home}
      accentColor="#1B5A8E"
      benefits={[
        "Replacement cost options",
        "Bundle with auto for savings",
        "Storm & theft protection",
        "Fast, fair claim support",
      ]}
      faqs={[
        {
          question: "What affects my homeowners premium?",
          answer:
            "Home age, roof type, location, updates, claims history, security features, and coverage limits.",
        },
        {
          question: "Do you insure condos and townhomes?",
          answer: "Yes. We tailor coverage to HO-6 or HOA-required limits.",
        },
        {
          question: "Can I get flood or earthquake coverage?",
          answer: "Optional policies or endorsements are available in many areas.",
        },
      ]}
    >
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Homeowners Insurance Quote</CardTitle>
          <CardDescription>Provide property and coverage details for your quote.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Honeypot fields (hidden) */}
            <input type="text" name="hp_company" tabIndex={-1} aria-hidden="true" className="hidden" />
            <input type="url" name="hp_url" tabIndex={-1} aria-hidden="true" className="hidden" />
            {/* Client Information */}
            <div
              data-step="Client Information"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Client Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <Input required name="name" />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" required name="email" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input type="tel" required name="phone" />
                </div>
                <div>
                  <Label>Preferred Contact Method</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="preferred_contact_method" options={["Phone","Email","Text"]} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address of Property to be Insured</Label>
                  <Input required name="property_address" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Mailing Address (if different)</Label>
                  <Input name="mailing_address" />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" name="dob" />
                </div>
                <div>
                  <Label>Driver’s License Number</Label>
                  <Input name="drivers_license_number" />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div
              data-step="Property Details"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Property Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Type of Home</Label>
                  {/* CHANGED */}
                  <SelectWithOther
                    name="home_type"
                    options={["Single Family","Condo","Townhome","Manufactured/Mobile"]}
                  />
                </div>
                <div>
                  <Label>Year Built</Label>
                  <Input name="year_built" />
                </div>
                <div>
                  <Label>Square Footage</Label>
                  <Input name="square_footage" />
                </div>
                <div>
                  <Label>Number of Stories</Label>
                  <Input name="stories" />
                </div>
                <div>
                  <Label>Roof Type / Year Last Replaced</Label>
                  <Input name="roof_type_year" />
                </div>
                <div>
                  <Label>Foundation Type</Label>
                  {/* CHANGED */}
                  <SelectWithOther
                    name="foundation_type"
                    options={["Slab","Crawl Space","Basement"]}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>If basement, is it finished?</Label>
                  {/* CHANGED */}
                  <SelectWithOther
                    name="basement_finished"
                    options={["Yes","No","Partially Finished"]}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Exterior Construction</Label>
                  <Input name="exterior_construction" placeholder="Brick / Siding / Wood / Stucco / Other" />
                </div>
                <div>
                  <Label>Heating Type</Label>
                  <Input name="heating_type" />
                </div>
                <div>
                  <Label>Age of Heating System (years)</Label>
                  <Input name="heating_age_years" />
                </div>
                <div>
                  <Label>Fireplace or Wood Stove?</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="fireplace_or_woodstove" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>Garage</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="garage" options={["Attached","Detached","None"]} />
                </div>
                <div>
                  <Label>Garage Capacity</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="garage_capacity" options={["1-Car","2-Car","3+ Car"]} />
                </div>
              </div>
            </div>

            {/* Safety Features */}
            <div
              data-step="Safety Features"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Safety Features</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Central Fire Alarm</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="central_fire_alarm" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>Central Burglar Alarm</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="central_burglar_alarm" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>Fire Extinguisher</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="fire_extinguisher" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>Deadbolts on Exterior Doors</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="deadbolts" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>Swimming Pool on Property?</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="pool" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>If pool, is it fenced?</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="pool_fenced" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>Pool Type</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="pool_type" options={["Above Ground","Inground"]} />
                </div>
                <div>
                  <Label>Trampoline on Property?</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="trampoline" options={["Yes","No"]} />
                </div>
              </div>
            </div>

            {/* Pets */}
            <div
              data-step="Pets"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Pets</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Do you have pets?</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="pets_have" options={["Yes","No"]} />
                </div>
                <div>
                  <Label>Type of Pets</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="pets_type" options={["Dog","Cat","Other"]} />
                </div>
                <div>
                  <Label>Number of Pets</Label>
                  <Input name="pets_count" />
                </div>
                <div>
                  <Label>Dog Breeds (if applicable)</Label>
                  <Input name="dog_breeds" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Any pets with a history of bites/claims?</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="pets_bite_history" options={["Yes","No"]} />
                </div>
              </div>
            </div>

            {/* Coverage Information */}
            <div
              data-step="Coverage Information"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Coverage Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Current Insurance Carrier</Label>
                  <Input name="current_carrier" />
                </div>
                <div>
                  <Label>Policy Expiration Date</Label>
                  <Input type="date" name="policy_expiration" />
                </div>
                <div>
                  <Label>Current Dwelling Coverage Amount ($)</Label>
                  <Input name="current_dwelling_coverage" />
                </div>
                <div>
                  <Label>Desired Deductible ($)</Label>
                  {/* CHANGED */}
                  <SelectWithOther
                    name="desired_deductible"
                    options={["500","1000","2500"]}
                    otherLabel="Custom"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Any claims in the last 5 years?</Label>
                  {/* CHANGED */}
                  <SelectWithOther name="claims_last_5_years" options={["Yes","No"]} />
                </div>
                <div className="sm:col-span-2">
                  <Label>If yes, please describe</Label>
                  <Textarea name="claims_description" />
                </div>
              </div>
            </div>

            {/* Additional Coverages */}
            <div
              data-step="Additional Coverages"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Additional Coverages</h3>
              <Input name="additional_coverages" placeholder="Interested in: Personal Umbrella / Auto / Life / Business (optional)" />
            </div>

            {/* Referral */}
            <div
              data-step="Referral"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <Label>How did you hear about us?</Label>
              {/* CHANGED */}
              <SelectWithOther name="referral_source" options={["Google","Referral","Social Media","Advertising"]} />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
              >
                {submitting ? "Submitting..." : "Submit Homeowners Quote"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Moved: Coverage Overview (now shown after client form) */}
      <Card
        data-step="Coverage Overview"
        className="mx-auto mb-8 max-w-4xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
      >
        <CardHeader>
          <CardTitle>Homeowners Coverage Overview</CardTitle>
          <CardDescription>Key protections & optional enhancements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-[#6c757d]">
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Primary Sections</h4>
            <ul className="grid gap-2 sm:grid-cols-3">
              <li>Dwelling (Coverage A)</li>
              <li>Other Structures (B)</li>
              <li>Personal Property (C)</li>
              <li>Loss of Use (D)</li>
              <li>Personal Liability (E)</li>
              <li>Medical Payments (F)</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Popular Endorsements</h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li>Replacement Cost on Contents</li>
              <li>Water Backup / Sump Overflow</li>
              <li>Scheduled Jewelry & Valuables</li>
              <li>Equipment Breakdown</li>
              <li>Cyber / ID Theft</li>
              <li>Inflation Guard</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Risk & Rating Factors</h4>
            <p className="text-xs leading-relaxed">
              Age of roof, wiring, plumbing & HVAC updates, location fire protection class, prior claims, protective devices, credit-based insurance score (where allowed).
            </p>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Claim Examples</h4>
            <ul className="space-y-1">
              <li><span className="font-medium text-[#1a1a1a]">Kitchen Fire:</span> Dwelling + contents + loss of use.</li>
              <li><span className="font-medium text-[#1a1a1a]">Wind Roof Damage:</span> Dwelling repairs / mitigation.</li>
              <li><span className="font-medium text-[#1a1a1a]">Slip & Fall Guest:</span> Liability / medical payments.</li>
            </ul>
          </div>
          <p className="text-[11px]">Flood & earthquake typically excluded—ask about separate policies.</p>
        </CardContent>
      </Card>
    </QuoteLayout>
  );
}

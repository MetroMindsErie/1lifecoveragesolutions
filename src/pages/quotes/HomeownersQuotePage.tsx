import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CheckCircle2, Home, ArrowRight, ArrowLeft } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";

const YEAR_BUILT_OPTIONS = (() => {
  const current = new Date().getFullYear();
  return Array.from({ length: current - 1899 }, (_, i) => String(current - i));
})();

export function HomeownersQuotePage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Homeowners Insurance Quote",
      provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
      url: window.location.origin + "/quote/homeowners",
      areaServed: "US",
      description: "Get a homeowners insurance quote with tailored coverage recommendations."
    };
  }, []);

  const steps = [
    {
      id: "client-info",
      title: "Your Information",
      subtitle: "We'll use this to contact you",
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: true },
        { name: "preferred_contact_method", label: "Contact Method", type: "select", options: ["Phone", "Email", "Text"] }
      ]
    },
    {
      id: "property-address",
      title: "Property Address",
      subtitle: "Where is the home located?",
      fields: [
        { name: "property_address", label: "Property Address", type: "text", required: true },
        { name: "mailing_address", label: "Mailing Address (if different)", type: "text" },
        { name: "dob", label: "Date of Birth", type: "date" },
        { name: "drivers_license_number", label: "Driver's License Number", type: "text" }
      ]
    },
    {
      id: "property-details",
      title: "Home Details",
      subtitle: "Basic characteristics",
      fields: [
        { name: "home_type", label: "Type of Home", type: "select", options: ["Single Family","Condo","Townhome","Manufactured/Mobile"] },
        { name: "year_built", label: "Year Built", type: "select", options: YEAR_BUILT_OPTIONS },
        { name: "square_footage", label: "Square Footage", type: "select", options: ["<1,000","1,000-1,999","2,000-2,999","3,000-3,999","4,000+"] },
        { name: "stories", label: "Number of Stories", type: "select", options: ["1","1.5","2","2.5","3+"] },
        { name: "roof_type_year", label: "Roof Type / Year Last Replaced", type: "text" },
      ]
    },
    {
      id: "construction-details",
      title: "Construction & Systems",
      subtitle: "Materials & major systems",
      fields: [
        { name: "foundation_type", label: "Foundation Type", type: "select", options: ["Slab","Crawl Space","Basement"] },
        { name: "basement_finished", label: "If basement, is it finished?", type: "select", options: ["Yes","No","Partially Finished"] },
        { name: "exterior_construction", label: "Exterior Construction", type: "select", options: ["Brick","Wood","Vinyl","Stucco","Mixed","Other"] },
        { name: "heating_type", label: "Heating Type", type: "select", options: ["Gas","Electric","Heat Pump","Oil","Other"] },
        { name: "heating_age_years", label: "Age of Heating System (years)", type: "select", options: ["<5","5-9","10-14","15-19","20+"] },
      ]
    },
    {
      id: "safety-features",
      title: "Safety Features",
      subtitle: "Protective devices present",
      fields: [
        { name: "central_fire_alarm", label: "Central Fire Alarm", type: "select", options: ["Yes", "No"] },
        { name: "central_burglar_alarm", label: "Central Burglar Alarm", type: "select", options: ["Yes", "No"] },
        { name: "fire_extinguisher", label: "Fire Extinguisher", type: "select", options: ["Yes", "No"] },
        { name: "deadbolts", label: "Deadbolts on Exterior Doors", type: "select", options: ["Yes", "No"] },
        { name: "pool", label: "Swimming Pool?", type: "select", options: ["Yes", "No"] },
        { name: "pool_fenced", label: "If pool, is it fenced?", type: "select", options: ["Yes", "No"] },
        { name: "pool_type", label: "Pool Type", type: "select", options: ["Above Ground", "Inground"] },
        { name: "trampoline", label: "Trampoline?", type: "select", options: ["Yes", "No"] }
      ]
    },
    {
      id: "pets",
      title: "Pets",
      subtitle: "Pet info for liability considerations",
      fields: [
        { name: "pets_have", label: "Do you have pets?", type: "select", options: ["Yes", "No"] },
        { name: "pets_type", label: "Type of Pets", type: "select", options: ["Dog", "Cat", "Other"] },
        { name: "pets_count", label: "Number of Pets", type: "text" },
        { name: "dog_breeds", label: "Dog Breeds (if applicable)", type: "text" },
        { name: "pets_bite_history", label: "Any bite/claim history?", type: "select", options: ["Yes", "No"] }
      ]
    },
    {
      id: "coverage-info",
      title: "Coverage Info",
      subtitle: "Current & desired coverage",
      fields: [
        { name: "current_carrier", label: "Current Insurance Carrier", type: "text" },
        { name: "policy_expiration", label: "Policy Expiration Date", type: "date" },
        { name: "current_dwelling_coverage", label: "Current Dwelling Coverage Amount ($)", type: "select", options: ["100K","150K","200K","250K","300K","400K","500K","600K","700K","800K","900K","1M","Other"], otherLabel: "Custom" },
        { name: "desired_deductible", label: "Desired Deductible ($)", type: "select", options: ["500","1000","2500"], otherLabel: "Custom" },
        { name: "claims_last_5_years", label: "Any claims in the last 5 years?", type: "select", options: ["Yes","No"] },
        { name: "claims_description", label: "If yes, please describe", type: "textarea" },
      ]
    },
    {
      id: "additional-coverages",
      title: "Additional Coverages",
      subtitle: "Optional interests",
      fields: [
        { name: "additional_coverages", label: "Additional Coverages Interested In", type: "text" }
      ]
    },
    {
      id: "referral",
      title: "Referral Source",
      subtitle: "How did you hear about us?",
      fields: [
        { name: "referral_source", label: "Referral Source", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] }
      ]
    },
    {
      id: "final",
      title: "Review & Submit",
      subtitle: "Submit your quote request",
      fields: []
    }
  ];

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const canContinue = () => {
    const required = steps[currentStep].fields.filter(f => f.required);
    return required.every(f => (formData[f.name] || "").trim());
  };

  const handleNext = () => {
    if (!canContinue()) return;
    setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = document.createElement("form");
      Object.entries(formData).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      // honeypots
      const hp1 = document.createElement("input");
      hp1.name = "hp_company"; hp1.value = "";
      const hp2 = document.createElement("input");
      hp2.name = "hp_url"; hp2.value = "";
      form.appendChild(hp1); form.appendChild(hp2);

      await submitQuote("homeowners", form);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      alert(err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const firstField = steps[currentStep].fields[0]?.name;
    if (firstField) {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${firstField}"]`);
      el?.focus();
    }
  }, [currentStep]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF] py-12 px-4">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">Homeowners Quote Submitted</h2>
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
        "Bundle for savings",
        "Storm & theft protection",
        "Fast claim support"
      ]}
      faqs={[
        { question: "What affects my premium?", answer: "Age/updates of roof & systems, location, claims, protective devices, coverage limits." },
        { question: "Do you insure condos?", answer: "Yes. We tailor coverage to HO-6 or HOA requirements." },
        { question: "Flood / earthquake?", answer: "Separate policies or endorsements where available." }
      ]}
    >
      <Card className="mx-auto max-w-4xl rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#1B5A8E]">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-sm sm:text-base">{steps[currentStep].subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {steps[currentStep].fields.map((field, idx) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60"
                  >
                    <Label className="text-sm font-medium text-[#1a1a1a]">
                      {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === "select" && field.options ? (
                      <SelectWithOther
                        name={field.name}
                        options={field.options}
                        value={formData[field.name] || ""}
                        onChange={(v) => handleFieldChange(field.name, v)}
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="min-h-[110px] px-3 py-3"
                      />
                    ) : (
                      <Input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        className="px-3 py-3"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 sticky bottom-4 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 shadow-md">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 0}
              onClick={handlePrevious}
              className="sm:w-auto w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {currentStep < totalSteps - 1 ? (
              <Button
                type="button"
                disabled={!canContinue()}
                onClick={handleNext}
                className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] sm:w-auto w-full"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !canContinue()}
                className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] sm:w-auto w-full"
              >
                {submitting ? "Submitting..." : "Submit Quote"} <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? "w-8 bg-gradient-to-r from-[#4f46e5] to-[#06b6d4]"
                    : i < currentStep
                    ? "w-2 bg-[#06b6d4]"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Overview */}
      <Card className="mx-auto mt-8 max-w-4xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle>Homeowners Coverage Overview</CardTitle>
          <CardDescription>Key protections & optional enhancements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-[#6c757d]">
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Primary Sections</h4>
            <ul className="grid gap-2 sm:grid-cols-3">
              <li>Dwelling (A)</li>
              <li>Other Structures (B)</li>
              <li>Personal Property (C)</li>
              <li>Loss of Use (D)</li>
              <li>Liability (E)</li>
              <li>Medical Payments (F)</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Popular Endorsements</h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li>Replacement Cost Contents</li>
              <li>Water Backup / Sump Overflow</li>
              <li>Scheduled Jewelry / Valuables</li>
              <li>Equipment Breakdown</li>
              <li>Cyber / ID Theft</li>
              <li>Inflation Guard</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Claim Examples</h4>
            <ul className="space-y-1">
              <li><span className="font-medium text-[#1a1a1a]">Kitchen Fire:</span> Dwelling + contents + loss of use.</li>
              <li><span className="font-medium text-[#1a1a1a]">Wind Roof Damage:</span> Dwelling repairs / mitigation.</li>
              <li><span className="font-medium text-[#1a1a1a]">Slip & Fall Guest:</span> Liability / medical payments.</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Risk & Rating Factors</h4>
            <p className="text-xs leading-relaxed">
              Roof age, electrical/plumbing/HVAC updates, location fire class, prior claims, protective devices, credit-based insurance score (where allowed).
            </p>
          </div>
          <p className="text-[11px]">Flood & earthquake typically excluded—ask about separate policies.</p>
        </CardContent>
      </Card>
    </QuoteLayout>
  );
}

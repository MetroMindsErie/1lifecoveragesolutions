import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CheckCircle2, Home, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { absUrl, setHead } from "../../lib/seo";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";
import LoadingOverlay from "../../components/LoadingOverlay";

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
      url: absUrl("/quote/homeowners"),
      areaServed: "US",
      description: "Get a homeowners insurance quote with tailored coverage recommendations."
    };

    setHead({
      title: "Homeowners Insurance Quote",
      description: "Get a fast homeowners insurance quote from 1Life Coverage Solutions.",
      canonicalPath: "/quote/homeowners",
      jsonLd,
    });

    (async () => {
      try {
        const { data } = await supabase
          .from("pages_seo")
          .select("title,description,canonical_url,og_image,json_ld")
          .eq("path", "/quote/homeowners")
          .maybeSingle();
        if (data) {
          setHead({
            title: data.title || "Homeowners Insurance Quote",
            description: data.description || undefined,
            canonicalPath: data.canonical_url || "/quote/homeowners",
            ogImage: data.og_image || undefined,
            jsonLd: data.json_ld || jsonLd,
          });
        }
      } catch {
        // ignore SEO override failures
      }
    })();
  }, []);

  const steps = [
    {
      id: "client-info",
      title: "Let's start with your information",
      subtitle: "We'll use this to contact you with your quote",
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel", required: true },
        { name: "preferred_contact_method", label: "Preferred Contact Method", type: "select", options: ["Phone", "Email"] }
      ]
    },
    {
      id: "property-address",
      title: "Property information",
      subtitle: "Tell us about your home location",
      fields: [
        { name: "property_address", label: "Property Address", type: "text", required: true },
        { name: "mailing_address", label: "Mailing Address (if different)", type: "text" },
        { name: "dob", label: "Date of Birth", type: "date" }
      ]
    },
    {
      id: "property-details",
      title: "Home details",
      subtitle: "Basic characteristics of your property",
      fields: [
        { name: "home_type", label: "Type of Home", type: "select", options: ["Single Family", "Condo", "Townhome", "Manufactured/Mobile"] },
        { name: "year_built", label: "Year Built", type: "select", options: YEAR_BUILT_OPTIONS },
        { name: "square_footage", label: "Square Footage", type: "select", options: ["<1,000", "1,000-1,999", "2,000-2,999", "3,000-3,999", "4,000+"] },
        { name: "stories", label: "Number of Stories", type: "select", options: ["1", "1.5", "2", "2.5", "3+"] },
        { name: "roof_type_year", label: "Roof Type / Year Last Replaced", type: "text" },
      ]
    },
    {
      id: "construction-details",
      title: "Construction & systems",
      subtitle: "Materials and major systems information",
      fields: [
        { name: "foundation_type", label: "Foundation Type", type: "select", options: ["Slab", "Crawl Space", "Basement"] },
        { name: "basement_finished", label: "If basement, is it finished?", type: "select", options: ["Yes", "No", "Partially Finished"] },
        { name: "exterior_construction", label: "Exterior Construction", type: "select", options: ["Brick", "Wood", "Vinyl", "Stucco", "Mixed", "Other"] },
        { name: "heating_type", label: "Heating Type", type: "select", options: ["Gas", "Electric", "Heat Pump", "Oil", "Other"] },
        { name: "heating_age_years", label: "Age of Heating System (years)", type: "select", options: ["<5", "5-9", "10-14", "15-19", "20+"] },
      ]
    },
    {
      id: "safety-features",
      title: "Safety features",
      subtitle: "Protective devices and amenities",
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
      title: "Tell us about your dogs",
      subtitle: "Dog information for liability considerations",
      fields: [
        { name: "dogs_have", label: "Do you have any dogs in the household?", type: "select", options: ["Yes", "No"] },
        { name: "dog_breeds", label: "If yes, please list breed(s)", type: "text" },
        { name: "dogs_bite_history", label: "Any bite/claim history?", type: "select", options: ["Yes", "No"] }
      ]
    },
    {
      id: "coverage-info",
      title: "Coverage information",
      subtitle: "Current and desired coverage details",
      fields: [
        { name: "current_carrier", label: "Current Insurance Carrier", type: "text" },
        { name: "policy_expiration", label: "Policy Expiration Date", type: "date" },
        { name: "current_dwelling_coverage", label: "Current Dwelling Coverage ($)", type: "select", options: ["100K", "150K", "200K", "250K", "300K", "400K", "500K", "600K", "700K", "800K", "900K", "1M", "Other"], otherLabel: "Custom" },
        { name: "desired_deductible", label: "Desired Deductible ($)", type: "select", options: ["500", "1000", "2500"], otherLabel: "Custom" },
        { name: "claims_last_5_years", label: "Any claims in the last 5 years?", type: "select", options: ["Yes", "No"] },
        { name: "claims_description", label: "If yes, please describe", type: "textarea" },
      ]
    },
    {
      id: "final",
      title: "Almost done!",
      subtitle: "Just a couple more questions",
      fields: [
        { name: "additional_coverages", label: "Interested in other insurance?", type: "select", options: ["Auto", "Life", "Umbrella", "Pet", "None"] },
        { name: "referral_source", label: "How did you hear about us?", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] }
      ]
    }
  ];

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // NEW: per-field errors + whether user tried to advance from a step
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attemptedSteps, setAttemptedSteps] = useState<Record<number, boolean>>({});

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const validateField = (field: any, value: string): string | null => {
    const trimmed = (value || "").trim();

    if (!trimmed && field.required) return "This field is required";
    if (!trimmed) return null;

    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
    }

    if (field.type === "tel") {
      const digitsOnly = trimmed.replace(/\D/g, "");
      if (digitsOnly.length < 10) return "Please enter a valid phone number (at least 10 digits)";
    }

    return null;
  };

  const validateStep = (stepIndex: number): Record<string, string> => {
    const step = steps[stepIndex];
    const errors: Record<string, string> = {};

    for (const field of step.fields as any[]) {
      // Skip validation for fields currently disabled by conditional logic
      if (isFieldDisabled(field.name)) continue;

      const value = formData[field.name] || "";
      const err = validateField(field, value);
      if (err) errors[field.name] = err;
    }

    return errors;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // If this step has been attempted, re-validate this field live to clear errors
    if (attemptedSteps[currentStep]) {
      if (isFieldDisabled(name)) {
        setFieldErrors(prev => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
        return;
      }

      const field = steps[currentStep].fields.find(f => f.name === name) as any | undefined;
      if (!field) return;

      const nextErr = validateField(field, value);
      setFieldErrors(prev => {
        const copy = { ...prev };
        if (nextErr) copy[name] = nextErr;
        else delete copy[name];
        return copy;
      });
    }
  };

  const canContinue = () => {
    const required = steps[currentStep].fields.filter(f => "required" in f && !!f.required);
    return required.every(f => (formData[f.name] || "").trim());
  };

  const isFieldDisabled = (fieldName: string) => {
    // Disable pool-related fields if user doesn't have a pool
    if (fieldName === "pool_fenced" || fieldName === "pool_type") {
      return formData["pool"] !== "Yes";
    }
    // Disable dog-related fields if user doesn't have dogs
    if (fieldName === "dog_breeds" || fieldName === "dogs_bite_history") {
      return formData["dogs_have"] !== "Yes";
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep >= totalSteps - 1) return;

    setAttemptedSteps(prev => ({ ...prev, [currentStep]: true }));

    const stepFieldNames = new Set(steps[currentStep].fields.map(f => f.name));
    const stepErrors = validateStep(currentStep);

    // Replace errors for current step fields (don’t keep stale ones)
    setFieldErrors(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (stepFieldNames.has(k)) delete next[k];
      }
      return { ...next, ...stepErrors };
    });

    const firstInvalid = Object.keys(stepErrors)[0];
    if (firstInvalid) {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        `[name="${firstInvalid}"]`
      );
      el?.focus();
      return;
    }

    setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Validate current (final) step before submit
    setAttemptedSteps(prev => ({ ...prev, [currentStep]: true }));
    const finalStepErrors = validateStep(currentStep);
    if (Object.keys(finalStepErrors).length) {
      setFieldErrors(prev => ({ ...prev, ...finalStepErrors }));
      const firstInvalid = Object.keys(finalStepErrors)[0];
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        `[name="${firstInvalid}"]`
      );
      el?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const form = document.createElement("form");
      Object.entries(formData).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
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
            <p className="text-[#6c757d]">We'll contact you within 24 hours.</p>
            <div className="mt-8">
              <Button className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] w-full sm:w-auto" asChild>
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <LoadingOverlay open={submitting} message="This can take a few seconds on mobile." />
      {/* Header Section with Background Image */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
            backgroundPosition: 'center 35%',
          }}
        >
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B5A8E]/70 via-[#2C7DB8]/60 to-[#1B5A8E]/70" />
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl">
            {/* Frosted Glass Container */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 p-6 sm:p-8 shadow-2xl text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40">
                  <Home className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
                Homeowners Insurance Quote
              </h1>
              <p className="text-base sm:text-lg text-white/90 drop-shadow-md">
                Share property details to get accurate coverage recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <div className="mb-8">
                <h2 className="mb-2 text-2xl font-bold text-[#1B5A8E]">
                  Get Your Free Quote
                </h2>
                <p className="text-[#6c757d]">
                  Fill out the information below to receive a personalized homeowners insurance quote
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[#6c757d]">Step {currentStep + 1} of {totalSteps}</span>
                  <span className="text-[#1B5A8E] font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">{steps[currentStep].title}</h3>
                <p className="text-sm text-[#6c757d]">{steps[currentStep].subtitle}</p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    {steps[currentStep].fields.map((field, idx) => {
                      const disabled = isFieldDisabled(field.name);
                      const showError = !disabled && !!attemptedSteps[currentStep] && !!fieldErrors[field.name];
                      const errMsg = showError ? fieldErrors[field.name] : "";

                      return (
                        <motion.div
                          key={field.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`space-y-2 p-4 rounded-lg border border-gray-200 ${disabled ? "bg-gray-50 opacity-60" : "bg-white/60"
                            }`}
                        >
                          <Label className="text-sm sm:text-base font-medium text-[#1a1a1a]">
                            {field.label}{"required" in field && field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>

                          {field.type === "select" && "options" in field && field.options ? (
                            <>
                              <SelectWithOther
                                name={field.name}
                                options={field.options}
                                value={formData[field.name] || ""}
                                onChange={(v) => handleFieldChange(field.name, v)}
                                otherLabel={(field as any).otherLabel}
                                disabled={disabled}
                              />
                              {showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
                            </>
                          ) : field.type === "textarea" ? (
                            <>
                              <Textarea
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                aria-invalid={showError}
                                className={`min-h-[110px] text-sm sm:text-base px-3 py-3 ${
                                  showError ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                                disabled={disabled}
                              />
                              {showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
                            </>
                          ) : (
                            <>
                              <Input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                required={"required" in field ? field.required : undefined}
                                aria-invalid={showError}
                                className={`text-sm sm:text-base px-3 py-3 ${
                                  showError ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                                disabled={disabled}
                              />
                              {showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentStep === 0}
                  onClick={handlePrevious}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {currentStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    // IMPORTANT: allow clicking to trigger validation (don't disable-gate)
                    disabled={false}
                    onClick={handleNext}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] order-1 sm:order-2"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] order-1 sm:order-2"
                  >
                    {submitting ? "Submitting..." : "Get My Quote"} <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-6 flex justify-center gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${i === currentStep
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

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Replacement Cost Options
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Full replacement value for your home and belongings
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Bundle for Savings
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Save more when you combine home and auto policies
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Storm & Theft Protection
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Comprehensive coverage against natural disasters and theft
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Fast Claim Support
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Quick, responsive service when you need it most
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coverage Overview */}
          <Card className="mt-8 border-gray-200">
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
        </div>
      </section>
    </div>
  );
}

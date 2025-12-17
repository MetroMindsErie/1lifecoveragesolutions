import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { CheckCircle2, Home, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../lib/submit";
import { executeTurnstileInvisible } from "../lib/turnstile";
import { SelectWithOther } from "../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";

export function RentersQuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // NEW: per-field errors + whether user tried to advance from a step
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attemptedSteps, setAttemptedSteps] = useState<Record<number, boolean>>({});

  const steps = [
    {
      id: "client-info",
      title: "Let's start with your information",
      subtitle: "We'll use this to contact you with your quote",
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel", required: true },
        { name: "preferred_contact_method", label: "Preferred Contact Method", type: "select", options: ["Phone", "Email"] },
      ]
    },
    {
      id: "rental-details",
      title: "Tell us about your rental",
      subtitle: "Property information",
      fields: [
        { name: "address", label: "Street Address", type: "text", required: true },
        { name: "zip", label: "ZIP Code", type: "text", required: true },
        { name: "rental_type", label: "Type of Rental", type: "select", options: ["Apartment", "House", "Condo", "Townhouse"], otherLabel: "Other" },
        { name: "move_in_date", label: "Move-in Date", type: "date" },
        { name: "square_footage", label: "Approximate Square Footage", type: "text" },
      ]
    },
    {
      id: "coverage-needs",
      title: "Coverage you need",
      subtitle: "Help us understand your protection needs",
      fields: [
        { name: "personal_property_value", label: "Estimated Value of Personal Property ($)", type: "select", options: ["10000", "20000", "30000", "50000", "75000", "100000"], otherLabel: "Custom" },
        { name: "liability_coverage", label: "Desired Liability Coverage ($)", type: "select", options: ["100000", "300000", "500000"] },
        { name: "deductible", label: "Preferred Deductible ($)", type: "select", options: ["250", "500", "1000", "2500"] },
      ]
    },
    {
      id: "household",
      title: "Household information",
      subtitle: "Tell us about who lives with you",
      fields: [
        { name: "number_of_occupants", label: "Number of Occupants", type: "select", options: ["1", "2", "3", "4", "5+"], otherLabel: "Other" },
        { name: "pets", label: "Do you have pets?", type: "select", options: ["Yes", "No"] },
        { name: "pet_type", label: "Type of Pet(s)", type: "select", options: ["Dog", "Cat", "Bird", "Reptile", "Other"], dependsOn: "pets", dependsOnValue: "Yes" },
        { name: "dog_breed", label: "Dog Breed (if applicable)", type: "text", dependsOn: "pet_type", dependsOnValue: "Dog" },
      ]
    },
    {
      id: "property-features",
      title: "Property features",
      subtitle: "Safety and security details",
      fields: [
        { name: "security_system", label: "Security System?", type: "select", options: ["Yes", "No"] },
        { name: "fire_alarm", label: "Fire/Smoke Alarm?", type: "select", options: ["Yes", "No"] },
        { name: "sprinkler_system", label: "Sprinkler System?", type: "select", options: ["Yes", "No"] },
        { name: "gated_community", label: "Gated Community?", type: "select", options: ["Yes", "No"] },
      ]
    },
    {
      id: "final",
      title: "Almost done!",
      subtitle: "Just a couple more questions",
      fields: [
        { name: "current_insurance", label: "Do you currently have renters insurance?", type: "select", options: ["Yes", "No"] },
        { name: "prior_claims", label: "Any claims in the last 5 years?", type: "select", options: ["Yes", "No"] },
        { name: "additional_coverage_interest", label: "Interested in other insurance?", type: "select", options: ["Auto", "Life", "Umbrella", "Pet", "None"] },
        { name: "referral_source", label: "How did you hear about us?", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] },
      ]
    },
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const isFieldDisabled = (field: any) => {
    if (field?.dependsOn) {
      return formData[field.dependsOn] !== field.dependsOnValue;
    }
    return false;
  };

  const validateField = (field: any, value: string): string | null => {
    const trimmed = (value || "").trim();

    if (!trimmed && field.required) return "This field is required";
    if (!trimmed) return null;

    // email
    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
    }

    // phone
    if (field.type === "tel") {
      const digitsOnly = trimmed.replace(/\D/g, "");
      if (digitsOnly.length < 10) return "Please enter a valid phone number (at least 10 digits)";
    }

    // ZIP (renters form uses name="zip")
    if (field.name === "zip") {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(trimmed)) return "Please enter a valid ZIP code";
    }

    return null;
  };

  const validateStep = (stepIndex: number): Record<string, string> => {
    const step = steps[stepIndex];
    const errors: Record<string, string> = {};

    for (const field of step.fields as any[]) {
      if (isFieldDisabled(field)) continue; // skip dependent/disabled fields
      const value = formData[field.name] || "";
      const err = validateField(field, value);
      if (err) errors[field.name] = err;
    }

    return errors;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Clear dependent fields when parent field changes
      if (name === "pets" && value === "No") {
        delete newData.pet_type;
        delete newData.dog_breed;
      }
      if (name === "pet_type" && value !== "Dog") {
        delete newData.dog_breed;
      }

      return newData;
    });

    // Clear errors for dependent fields when they get cleared
    if (name === "pets" && value === "No") {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy.pet_type;
        delete copy.dog_breed;
        return copy;
      });
    }
    if (name === "pet_type" && value !== "Dog") {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy.dog_breed;
        return copy;
      });
    }

    // If this step has been attempted, re-validate this field live to clear errors
    if (attemptedSteps[currentStep]) {
      const field = steps[currentStep].fields.find(f => (f as any).name === name) as any | undefined;
      if (!field) return;

      if (isFieldDisabled(field)) {
        setFieldErrors(prev => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
        return;
      }

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
    const currentStepData = steps[currentStep];
    const requiredFields = currentStepData.fields.filter(f => (f as any).required);
    return requiredFields.every(field => formData[(field as any).name]?.trim());
  };

  const handleNext = () => {
    if (currentStep >= totalSteps - 1) return;

    setAttemptedSteps(prev => ({ ...prev, [currentStep]: true }));

    const stepFieldNames = new Set(steps[currentStep].fields.map(f => (f as any).name));
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
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstInvalid}"]`);
      el?.focus();
      return;
    }

    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Validate current (final) step before submit
    setAttemptedSteps(prev => ({ ...prev, [currentStep]: true }));
    const finalStepErrors = validateStep(currentStep);
    if (Object.keys(finalStepErrors).length) {
      setFieldErrors(prev => ({ ...prev, ...finalStepErrors }));
      const firstInvalid = Object.keys(finalStepErrors)[0];
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstInvalid}"]`);
      el?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // Execute Turnstile before submission
      const turnstileToken = await executeTurnstileInvisible();

      const form = document.createElement('form');
      
      // Transform data to match database schema
      const transformedData: Record<string, string> = {};
      
      Object.entries(formData).forEach(([key, value]) => {
        // Convert Yes/No to boolean for specific fields
        const booleanFields = ['pets', 'security_system', 'fire_alarm', 'sprinkler_system', 
                               'gated_community', 'current_insurance', 'prior_claims'];
        
        if (booleanFields.includes(key)) {
          transformedData[key] = value.toLowerCase() === 'yes' ? 'true' : 'false';
        } else {
          transformedData[key] = value;
        }
      });
      
      // Add transformed data to form
      Object.entries(transformedData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // Add Turnstile token
      if (turnstileToken) {
        const turnstileInput = document.createElement('input');
        turnstileInput.name = 'turnstile_token';
        turnstileInput.value = turnstileToken;
        form.appendChild(turnstileInput);
      }

      const hp1 = document.createElement('input');
      hp1.name = 'hp_company';
      hp1.value = '';
      form.appendChild(hp1);
      const hp2 = document.createElement('input');
      hp2.name = 'hp_url';
      hp2.value = '';
      form.appendChild(hp2);

      await submitQuote("renters", form);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      alert(err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const firstField = steps[currentStep].fields[0]?.name;
    if (firstField) {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstField}"]`);
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
            <h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">Renters Quote Submitted</h2>
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
      {/* Header Section with Background Image */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
          }}
        >
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B5A8E]/70 via-[#2C7DB8]/60 to-[#1B5A8E]/70" />
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl">
            {/* Frosted Glass Container */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 p-8 shadow-2xl text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2C7DB8] to-[#1B5A8E] border border-white/40">
                  <Home className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">
                Renters Insurance Quote
              </h1>
              <p className="text-lg text-white/90 drop-shadow-md">
                Protect your belongings and liability with comprehensive renters insurance coverage
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
                  Fill out the information below to receive a personalized renters insurance quote
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
                      const disabled = isFieldDisabled(field as any);
                      const showError = !disabled && !!attemptedSteps[currentStep] && !!fieldErrors[(field as any).name];
                      const errMsg = showError ? fieldErrors[(field as any).name] : "";

                      return (
                        <motion.div
                          key={(field as any).name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.075 }}
                          className="space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60"
                        >
                          <Label className={`text-sm sm:text-base font-medium ${disabled ? "text-gray-400" : "text-[#1a1a1a]"}`}>
                            {(field as any).label}{(field as any).required && <span className="text-red-500 ml-1">*</span>}
                          </Label>

                          {(field as any).type === "select" && (field as any).options ? (
                            <>
                              <SelectWithOther
                                name={(field as any).name}
                                options={(field as any).options}
                                value={formData[(field as any).name] || ""}
                                onChange={(v) => handleFieldChange((field as any).name, v)}
                                otherLabel={(field as any).otherLabel}
                                disabled={disabled}
                              />
                              {showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
                            </>
                          ) : (field as any).type === "textarea" ? (
                            <>
                              <Textarea
                                name={(field as any).name}
                                placeholder={(field as any).placeholder}
                                value={formData[(field as any).name] || ""}
                                onChange={(e) => handleFieldChange((field as any).name, e.target.value)}
                                aria-invalid={showError}
                                className={`min-h-[110px] text-sm sm:text-base px-3 py-3 ${showError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                disabled={disabled}
                              />
                              {showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
                            </>
                          ) : (
                            <>
                              <Input
                                type={(field as any).type}
                                name={(field as any).name}
                                placeholder={(field as any).placeholder}
                                value={formData[(field as any).name] || ""}
                                onChange={(e) => handleFieldChange((field as any).name, e.target.value)}
                                required={(field as any).required}
                                aria-invalid={showError}
                                className={`text-sm sm:text-base px-3 py-3 ${showError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {currentStep < totalSteps - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    // IMPORTANT: allow clicking to trigger validation (don't disable-gate)
                    disabled={false}
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
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? "w-8 bg-gradient-to-r from-[#4f46e5] to-[#06b6d4]"
                        : idx < currentStep
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
                  Property Protection
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Coverage for your personal belongings against theft, fire, and damage
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Liability Coverage
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Protection against lawsuits for accidents that occur in your rental
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Additional Living Expenses
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Coverage for temporary housing if your rental becomes uninhabitable
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Affordable Protection
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Cost-effective coverage that protects your assets and peace of mind
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coverage Overview */}
          <Card className="mt-8 border-gray-200">
            <CardHeader>
              <CardTitle>Renters Insurance Overview</CardTitle>
              <CardDescription>What's typically covered in a renters policy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-[#6c757d]">
              <div>
                <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
                  Personal Property Coverage
                </h4>
                <p className="text-xs leading-relaxed">
                  Protects your belongings including furniture, electronics, clothing, and more against covered perils like fire, theft, vandalism, and certain natural disasters.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
                  Liability Protection
                </h4>
                <p className="text-xs leading-relaxed">
                  Covers legal fees and damages if someone is injured in your rental or if you accidentally damage someone else's property.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
                  Additional Living Expenses (ALE)
                </h4>
                <p className="text-xs leading-relaxed">
                  Pays for temporary housing, meals, and other costs if your rental becomes uninhabitable due to a covered loss.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
                  Not Typically Covered
                </h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  <li>Flooding (requires separate policy)</li>
                  <li>Earthquakes</li>
                  <li>Roommate's belongings</li>
                  <li>Structural damage to building</li>
                </ul>
              </div>
              <p className="text-[11px]">
                Most landlords require renters insurance. Rates vary based on coverage limits, deductible, and location.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

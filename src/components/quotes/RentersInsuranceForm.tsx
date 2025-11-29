import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Home, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { SelectWithOther } from "./SelectWithOther";
import { motion, AnimatePresence } from "motion/react";

interface Insured {
  name: string;
  dateOfBirth: string;
}

export function RentersInsuranceForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [insureds, setInsureds] = useState<Insured[]>([{ name: "", dateOfBirth: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    {
      id: "contact-info",
      title: "Let's start with your contact information",
      subtitle: "We'll use this to send you your quote",
      fields: [
        { name: "name", label: "Your full name", type: "text", required: true },
        { name: "email", label: "Email address", type: "email", required: true },
        { name: "phone", label: "Phone number", type: "tel", required: true },
      ]
    },
    {
      id: "insureds",
      title: "Who will be insured?",
      subtitle: "Add all adults living at the property",
      fields: [] // Dynamic insured fields
    },
    {
      id: "property-info",
      title: "Tell us about the property",
      subtitle: "Where do you need coverage?",
      fields: [
        { name: "address", label: "Property address", type: "text", required: true, placeholder: "123 Main St, City, State ZIP" },
        { name: "zip", label: "ZIP code", type: "text", required: true },
      ]
    },
    {
      id: "coverage-details",
      title: "Customize your coverage",
      subtitle: "Choose the protection that fits your needs",
      fields: [
        { 
          name: "property_protection", 
          label: "Personal Property Protection Amount", 
          type: "select", 
          options: ["$10,000", "$20,000", "$30,000", "Other Amount"],
          required: true 
        },
        { 
          name: "deductible", 
          label: "Deductible", 
          type: "select", 
          options: ["$250", "$500", "$1,000"],
          required: true 
        },
        { 
          name: "liability_protection", 
          label: "Family Liability Protection", 
          type: "select", 
          options: ["$100,000", "$200,000", "$300,000", "$500,000"],
          required: true 
        },
      ]
    },
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateInsured = (index: number, field: keyof Insured, value: string) => {
    const updated = [...insureds];
    updated[index][field] = value;
    setInsureds(updated);
    // Also update formData
    setFormData(prev => ({ ...prev, [`insured_${index}_${field}`]: value }));
  };

  const addInsured = () => {
    setInsureds([...insureds, { name: "", dateOfBirth: "" }]);
  };

  const removeInsured = (index: number) => {
    if (insureds.length > 1) {
      setInsureds(insureds.filter((_, i) => i !== index));
    }
  };

  const canContinue = () => {
    const currentStepData = steps[currentStep];
    
    // Special handling for insureds step
    if (currentStepData.id === "insureds") {
      return insureds.every(ins => ins.name.trim() && ins.dateOfBirth.trim());
    }
    
    const requiredFields = currentStepData.fields.filter(f => f.required);
    return requiredFields.every(field => formData[field.name]?.trim());
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = document.createElement('form');
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // Add insureds as JSON string for database storage
      const insuredsInput = document.createElement('input');
      insuredsInput.name = 'insureds';
      insuredsInput.value = JSON.stringify(insureds);
      form.appendChild(insuredsInput);
      
      // Also add individual insured fields for backwards compatibility
      insureds.forEach((insured, idx) => {
        const nameInput = document.createElement('input');
        nameInput.name = `insured_${idx}_name`;
        nameInput.value = insured.name;
        form.appendChild(nameInput);
        
        const dobInput = document.createElement('input');
        dobInput.name = `insured_${idx}_dob`;
        dobInput.value = insured.dateOfBirth;
        form.appendChild(dobInput);
      });
      
      // Honeypot fields
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
    const currentStepData = steps[currentStep];
    if (currentStepData.id !== "insureds" && currentStepData.fields.length > 0) {
      const firstField = currentStepData.fields[0]?.name;
      if (firstField) {
        const el = document.querySelector<HTMLInputElement>(`[name="${firstField}"]`);
        el?.focus();
      }
    }
  }, [currentStep]);

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1B5A8E]">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-[#1B5A8E]">Quote Request Submitted!</h2>
          <p className="text-[#6c757d] mb-8">We'll contact you with your renters insurance quote within 24 hours.</p>
          <Button className="bg-[#1B5A8E] hover:bg-[#144669]" asChild>
            <a href="/">Return to Home</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
      <CardHeader className="p-6 sm:p-8 pb-4">
        <div className="mb-4">
          {/* Progress bar */}
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-[#6c757d]">Step {currentStep + 1} of {totalSteps}</span>
            <span className="text-[#1B5A8E] font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full bg-[#1B5A8E]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
        <CardDescription className="text-base">{steps[currentStep].subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {steps[currentStep].id === "insureds" ? (
              <div className="space-y-4">
                {insureds.map((insured, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 border border-gray-200 rounded-lg bg-white/60 space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-semibold text-[#1a1a1a]">
                        {index === 0 ? "Primary Insured" : `Additional Insured ${index}`}
                      </h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInsured(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`}>Full Name *</Label>
                        <Input
                          id={`name-${index}`}
                          value={insured.name}
                          onChange={(e) => updateInsured(index, "name", e.target.value)}
                          placeholder="John Doe"
                          className="text-base px-3 py-3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`dob-${index}`}>Date of Birth *</Label>
                        <Input
                          id={`dob-${index}`}
                          type="date"
                          value={insured.dateOfBirth}
                          onChange={(e) => updateInsured(index, "dateOfBirth", e.target.value)}
                          className="text-base px-3 py-3"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInsured}
                  className="w-full border-[#1B5A8E] text-[#1B5A8E] hover:bg-[#1B5A8E] hover:text-white"
                >
                  + Add Another Insured
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {steps[currentStep].fields.map((field, idx) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60 ${
                      field.name === "address" ? "sm:col-span-2" : ""
                    }`}
                  >
                    <Label className="text-base font-medium text-[#1a1a1a]">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === "select" && field.options ? (
                      <SelectWithOther
                        name={field.name}
                        options={field.options}
                        value={formData[field.name] || ""}
                        onChange={(value) => handleFieldChange(field.name, value)}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        className="text-base px-3 py-3"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 sticky bottom-4 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 shadow-md">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canContinue()}
              className="flex-1 sm:flex-none bg-[#1B5A8E] hover:bg-[#144669]"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !canContinue()}
              className="flex-1 sm:flex-none bg-[#1B5A8E] hover:bg-[#144669]"
            >
              {submitting ? "Submitting..." : "Get My Quote"}
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep
                  ? "w-8 bg-[#1B5A8E]"
                  : idx < currentStep
                  ? "w-2 bg-[#1B5A8E]"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

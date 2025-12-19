import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CheckCircle2, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";
import LoadingOverlay from "../../components/LoadingOverlay";
import { absUrl, setHead } from "../../lib/seo";

export function LifeQuotePage() {
	useEffect(() => {
		const jsonLd = {
			"@context": "https://schema.org",
			"@type": "Service",
			serviceType: "Life Insurance Quote",
			provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
			url: absUrl("/quote/life"),
			areaServed: "US",
			description: "Explore term and whole life insurance options.",
		};
		setHead({
			title: "Life Insurance Quote",
			description:
				"Explore term and whole life options tailored to your goals and budget.",
			canonicalPath: "/quote/life",
			jsonLd,
		});
		(async () => {
			const { data } = await supabase
				.from("pages_seo")
				.select("title,description,canonical_url,og_image,json_ld")
				.eq("path", "/quote/life")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Life Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/life",
					jsonLd: data.json_ld || jsonLd,
					ogImage: data.og_image || undefined,
				});
			}
		})();
	}, []);

	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<Record<string, string>>({});

	// NEW: per-field errors + whether user tried to advance from a step
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [attemptedSteps, setAttemptedSteps] = useState<Record<number, boolean>>({});

	const steps = [
		{
			id: "personal-info",
			title: "Let's start with your information",
			subtitle: "Basic details to get started",
			fields: [
				{ name: "name", label: "What's your full name?", type: "text", required: true },
				{ name: "dob", label: "Date of birth", type: "date", required: true },
				{ name: "gender", label: "Gender", type: "select", options: ["Male","Female"] },
				{ name: "occupation", label: "Current occupation", type: "select", options: ["Professional","Skilled Trade","Manager","Sales","Service","Student","Retired","Other"] },
			]
		},
		{
			id: "contact-info",
			title: "How can we reach you?",
			subtitle: "We'll use this to send your quote",
			fields: [
				{ name: "phone", label: "Phone number", type: "tel", required: true },
				{ name: "email", label: "Email address", type: "email", required: true },
				{ name: "address", label: "Your current address", type: "text" },
			]
		},
		{
			id: "coverage-needs",
			title: "What type of coverage do you need?",
			subtitle: "Help us understand your goals",
			fields: [
				{ name: "policy_type", label: "Type of life insurance", type: "select", options: ["Term", "Whole Life", "Universal Life", "Guaranteed UL", "Final Expense", "No-Exam"] },
				{ name: "coverage_amount", label: "Desired coverage amount ($)", type: "select", options: ["100000", "250000", "500000", "750000", "1000000", "2000000", "3000000"], otherLabel: "Custom" }
			]
		},
		{
			id: "beneficiaries",
			title: "Who are your beneficiaries?",
			subtitle: "Optional - you can update this later",
			fields: [
				{ name: "beneficiaries", label: "Beneficiaries (Name & Relationship)", type: "textarea", placeholder: "Jane Doe, Spouse\nJohn Doe Jr., Child" },
				{ name: "current_policies", label: "Do you have existing life insurance?", type: "select", options: ["Yes", "No"] },
				{ name: "current_policies_details", label: "If yes, provide carrier and coverage amount", type: "textarea" },
			]
		},
		{
			id: "health-basics",
			title: "Tell us about your health",
			subtitle: "This helps us find accurate rates",
			fields: [
				{ name: "height", label: "Height", type: "select", options: ["<5'0\"","5'0\"-5'5\"","5'6\"-5'9\"","5'10\"-6'1\"","6'2\"+"] },
				{ name: "weight", label: "Weight (lbs)", type: "select", options: ["<120","120-149","150-179","180-209","210-239","240+"] },
				{ name: "tobacco_use", label: "Tobacco use", type: "select", options: ["Never","Former","Current"] }
			]
		},
		{
			id: "medical-history",
			title: "Medical history",
			subtitle: "Help us understand any health conditions",
			fields: [
				{ name: "medical_conditions", label: "Current or past medical conditions", type: "textarea", placeholder: "Optional - list any diagnosed conditions" },
				{ name: "medications", label: "Current medications", type: "textarea", placeholder: "Optional" },
				{ name: "hospitalizations", label: "Hospitalizations or surgeries (last 5 years)", type: "textarea", placeholder: "Optional" },
				{ name: "family_history", label: "Family medical history", type: "textarea", placeholder: "Heart disease, cancer, diabetes, etc." },
			]
		},
		{
			id: "final",
			title: "Almost done!",
			subtitle: "Just a couple more questions",
			fields: [
				{ name: "high_risk_hobbies", label: "High-risk hobbies or activities", type: "textarea", placeholder: "Skydiving, scuba, racing, etc." },
				{ name: "travel", label: "Frequent travel outside the U.S.?", type: "textarea", placeholder: "Countries and frequency" },
				{ name: "referral_source", label: "How did you hear about us?", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] },
			]
		},
	];

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
			const value = formData[field.name] || "";
			const err = validateField(field, value);
			if (err) errors[field.name] = err;
		}

		// Conditional: term_years required when Term selected (step: coverage-needs)
		if (step.id === "coverage-needs" && formData.policy_type === "Term") {
			if (!(formData.term_years || "").trim()) errors.term_years = "Please select a term length";
		}

		// Conditional: require details if they have existing policies (step: beneficiaries)
		if (step.id === "beneficiaries" && formData.current_policies === "Yes") {
			if (!(formData.current_policies_details || "").trim()) {
				errors.current_policies_details = "Please provide carrier and coverage amount";
			}
		}

		return errors;
	};

	const handleFieldChange = (name: string, value: string) => {
		setFormData(prev => ({ ...prev, [name]: value }));

		// If this step has been attempted, re-validate this field live to clear errors
		if (attemptedSteps[currentStep]) {
			// Validate normal step fields
			const field = steps[currentStep].fields.find(f => f.name === name) as any | undefined;
			const nextErr = field ? validateField(field, value) : null;

			setFieldErrors(prev => {
				const copy = { ...prev };
				if (nextErr) copy[name] = nextErr;
				else delete copy[name];
				return copy;
			});

			// Re-run conditional validations (so term_years / current_policies_details clear appropriately)
			const stepErrors = validateStep(currentStep);
			setFieldErrors(prev => ({ ...prev, ...stepErrors }));
		}
	};

	const canContinue = () => {
		const currentStepData = steps[currentStep];
		const requiredFields = currentStepData.fields.filter(f => "required" in f && !!f.required);
		return requiredFields.every(field => formData[field.name]?.trim());
	};

	const handleNext = () => {
		if (currentStep >= totalSteps - 1) return;

		setAttemptedSteps(prev => ({ ...prev, [currentStep]: true }));

		// Include conditional-only fields for this step (so stale errors get cleared)
		const stepFieldNames = new Set(steps[currentStep].fields.map(f => f.name));
		if (steps[currentStep].id === "coverage-needs") stepFieldNames.add("term_years");
		if (steps[currentStep].id === "beneficiaries") stepFieldNames.add("current_policies_details");

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
			const form = document.createElement('form');
			Object.entries(formData).forEach(([key, value]) => {
				const input = document.createElement('input');
				input.name = key;
				input.value = value;
				form.appendChild(input);
			});
			const hp1 = document.createElement('input');
			hp1.name = 'hp_company';
			hp1.value = '';
			form.appendChild(hp1);
			const hp2 = document.createElement('input');
			hp2.name = 'hp_url';
			hp2.value = '';
			form.appendChild(hp2);

			await submitQuote("life", form);
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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">Life Quote Submitted</h2>
						<p className="text-[#6c757d]">We'll contact you with options within 24 hours.</p>
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
			<section className="relative py-24 overflow-hidden">
				{/* Background Image */}
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{
						backgroundImage:
							'url(https://images.unsplash.com/photo-1511895426328-dc8714191300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
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
									<Heart className="h-8 w-8 text-white" />
								</div>
							</div>
							<h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">
								Life Insurance Quote
							</h1>
							<p className="text-lg text-white/90 drop-shadow-md">
								Explore term and whole life options tailored to your goals and budget
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
									Fill out the information below to receive a personalized life insurance quote
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
											const showError = !!attemptedSteps[currentStep] && !!fieldErrors[field.name];
											const errMsg = showError ? fieldErrors[field.name] : "";

											return (
												<motion.div
													key={field.name}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: idx * 0.07 }}
													className="space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60"
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
															/>
															{showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
														</>
													) : field.type === "textarea" ? (
														<>
															<Textarea
																name={field.name}
																placeholder={"placeholder" in field ? field.placeholder : undefined}
																value={formData[field.name] || ""}
																onChange={(e) => handleFieldChange(field.name, e.target.value)}
																aria-invalid={showError}
																className={`min-h-[110px] text-sm sm:text-base px-3 py-3 ${showError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
															/>
															{showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
														</>
													) : (
														<>
															<Input
																type={field.type}
																name={field.name}
																placeholder={"placeholder" in field ? field.placeholder : undefined}
																value={formData[field.name] || ""}
																onChange={(e) => handleFieldChange(field.name, e.target.value)}
																required={"required" in field ? field.required : undefined}
																aria-invalid={showError}
																className={`text-sm sm:text-base px-3 py-3 ${showError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
															/>
															{showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
														</>
													)}
												</motion.div>
											);
										})}

										{/* Conditionally show term years only if Term is selected */}
										{currentStep === 2 && formData.policy_type === "Term" && (() => {
											const showError = !!attemptedSteps[currentStep] && !!fieldErrors.term_years;
											const errMsg = showError ? fieldErrors.term_years : "";
											return (
												<motion.div
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: 0.14 }}
													className="space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60"
												>
													<Label className="text-sm sm:text-base font-medium text-[#1a1a1a]">
														Desired policy term (years) <span className="text-red-500 ml-1">*</span>
													</Label>
													<SelectWithOther
														name="term_years"
														options={["10", "15", "20", "25", "30", "35", "40"]}
														value={formData.term_years || ""}
														onChange={(v) => handleFieldChange("term_years", v)}
														otherLabel="Custom"
													/>
													{showError && <p className="text-xs text-red-600" role="alert">{errMsg}</p>}
												</motion.div>
											);
										})()}
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
									Term & Whole Life Options
								</h3>
								<p className="text-sm text-[#6c757d]">
									Choose from various policy types to fit your needs
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Flexible Coverage Amounts
								</h3>
								<p className="text-sm text-[#6c757d]">
									Customize your coverage from $100K to $3M+
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									No-Pressure Guidance
								</h3>
								<p className="text-sm text-[#6c757d]">
									Expert advice without sales pressure
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Top-Rated Carriers
								</h3>
								<p className="text-sm text-[#6c757d]">
									Access to multiple A-rated insurance companies
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Coverage Overview */}
					<Card className="mt-8 border-gray-200">
						<CardHeader>
							<CardTitle>Life Insurance Overview</CardTitle>
							<CardDescription>Compare term & permanent options.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 text-sm text-[#6c757d]">
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Policy Types
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Term (10–40 yrs)</li>
									<li>Whole Life</li>
									<li>Universal Life</li>
									<li>Guaranteed UL</li>
									<li>Final Expense</li>
									<li>No-Exam / Simplified</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Use Cases
								</h4>
								<ul className="space-y-1">
									<li>Income replacement</li>
									<li>Mortgage protection</li>
									<li>Estate / legacy planning</li>
									<li>Business buy-sell funding</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Key Underwriting Factors
								</h4>
								<p className="text-xs leading-relaxed">
									Age, health history, build (height/weight), tobacco use, medications,
									labs (if required), driving record.
								</p>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Optional Riders
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Accelerated Death Benefit</li>
									<li>Child Term Rider</li>
									<li>Waiver of Premium</li>
									<li>Guaranteed Insurability</li>
									<li>Return of Premium (Term)</li>
									<li>Accidental Death Benefit</li>
								</ul>
							</div>
							<p className="text-[11px]">
								Carrier availability & rider costs vary by age and health class.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

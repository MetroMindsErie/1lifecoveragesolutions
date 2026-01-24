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
import { CheckCircle2, Car, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";
import { sanitizeInput, validateInput, isValidEmail, isValidPhone } from "../../lib/formSecurity";
import LoadingOverlay from "../../components/LoadingOverlay";
import { absUrl, setHead } from "../../lib/seo";
import { IntroQuoteModal } from "../../components/IntroQuoteModal";

export function AutoQuotePage() {
	// Trust-first intro: gate form interaction until user intentionally starts.
	const introStorageKey = "intro-quote-auto-dismissed";
	const [introOpen, setIntroOpen] = useState(false);
	const [introChecked, setIntroChecked] = useState(false);

	useEffect(() => {
		const jsonLd = {
			"@context": "https://schema.org",
			"@type": "Service",
			serviceType: "Auto Insurance Quote",
			provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
			url: absUrl("/quote/auto"),
			areaServed: "US",
			description: "Start your auto insurance quote and compare coverage options.",
		};
		setHead({
			title: "Auto Insurance Quote",
			description: "Start your auto insurance quote and compare coverage options.",
			canonicalPath: "/quote/auto",
			jsonLd,
		});
		(async () => {
			const { data } = await supabase
				.from("pages_seo")
				.select("title,description,canonical_url,og_image,json_ld")
				.eq("path", "/quote/auto")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Auto Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/auto",
					jsonLd: data.json_ld || jsonLd,
					ogImage: data.og_image || undefined,
				});
			}
		})();
	}, []);

	useEffect(() => {
		// Ensure the modal and hero are visible on initial load (mobile + desktop).
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	useEffect(() => {
		// Read from storage after mount to avoid SSR/prerender mismatches.
		if (typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		const forceIntro = params.get("intro") === "1";
		const resetIntro = params.get("intro") === "reset";
		if (resetIntro) {
			window.localStorage.removeItem(introStorageKey);
		}
		const dismissed = window.localStorage.getItem(introStorageKey) === "true";
		setIntroOpen(forceIntro ? true : !dismissed);
		setIntroChecked(true);
	}, []);

	useEffect(() => {
		// Keep view at top while the intro is open so users always see the modal.
		if (introOpen) {
			window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		}
	}, [introOpen]);

	useEffect(() => {
		if (typeof document === "undefined") return;
		document.body.classList.toggle("intro-open", introOpen);
		return () => {
			document.body.classList.remove("intro-open");
		};
	}, [introOpen]);

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
				{ name: "name", label: "What's your full name?", type: "text", required: true },
				{ name: "email", label: "Your email address", type: "email", required: true },
				{ name: "phone", label: "Phone number", type: "tel", required: true },
				{ name: "preferred_contact_method", label: "How should we reach you?", type: "select", options: ["Phone", "Email"] },
			]
		},
		{
			id: "driver-details",
			title: "Tell us about you as a driver",
			subtitle: "This helps us calculate accurate rates",
			fields: [
				{ name: "address_street", label: "Street address", type: "text", required: true, placeholder: "123 Main St" },
				{ name: "address_city", label: "City", type: "text", required: true, placeholder: "Cleveland" },
				{ name: "address_state", label: "State", type: "text", required: true, placeholder: "OH" },
				{ name: "address_zip", label: "ZIP code", type: "text", required: true, placeholder: "44114" },
				{ name: "dob", label: "Date of birth", type: "date", required: true },
				{ name: "drivers_license_number", label: "Driver's license number", type: "text" },
				{ name: "occupation", label: "Current occupation", type: "select", options: ["Professional", "Skilled Trade", "Student", "Retired", "Self-Employed", "Unemployed", "Other"] },
			]
		},
		{
			id: "vehicle-info",
			title: "What vehicles do you need to insure?",
			subtitle: "Provide details for up to 3 vehicles",
			fields: [
				{ name: "vehicle_1", label: "Vehicle 1 (Year / Make / Model / VIN)", type: "text", required: true, placeholder: "2020 Honda Accord EX / 1HGCV1F30LA123456" },
				{ name: "vehicle_2", label: "Vehicle 2 (optional)", type: "text", placeholder: "2018 Toyota Camry SE / 4T1BF1FK5JU123456" },
				{ name: "vehicle_3", label: "Vehicle 3 (optional)", type: "text", placeholder: "2019 Ford F-150 XLT / 1FTEW1EP5KFA12345" },
				{ name: "primary_vehicle_use", label: "Primary vehicle use", type: "select", options: ["Commute", "Pleasure", "Business", "Rideshare"] },
			]
		},
		{
			id: "driving-habits",
			title: "Your driving habits",
			subtitle: "This affects your premium calculation",
			fields: [
				{ name: "commute_one_way_miles", label: "Miles driven one-way for commute", type: "select", options: ["<5", "5-9", "10-14", "15-24", "25-34", "35+"] },
				{ name: "commute_days_per_week", label: "Days per week commuting", type: "select", options: ["1", "2", "3", "4", "5", "6", "7"] },
				{ name: "annual_miles", label: "Estimated annual miles", type: "select", options: ["<6K", "6K-9K", "10K-12K", "13K-15K", "16K-20K", "20K+"] },
				{ name: "rideshare_use", label: "Used for rideshare/delivery?", type: "select", options: ["Yes", "No"] },
			]
		},
		{
			id: "insurance-history",
			title: "Your insurance history",
			subtitle: "Help us find the best rates",
			fields: [
				{ name: "currently_insured", label: "Currently insured?", type: "select", options: ["Yes", "No"] },
				{ name: "current_policy_expiration", label: "Current policy expiration date", type: "date" },
				{ name: "additional_driver_1", label: "Additional Driver 1 (Name, DOB, Relationship)", type: "text", placeholder: "John Doe, 01/15/1995, Spouse" },
				{ name: "additional_driver_2", label: "Additional Driver 2 (optional)", type: "text", placeholder: "Jane Doe, 05/20/2005, Child" },
				{ name: "additional_driver_3", label: "Additional Driver 3 (optional)", type: "text", placeholder: "Bob Doe, 03/10/2000, Child" },
			]
		},
		{
			id: "final",
			title: "Almost done!",
			subtitle: "Just a couple more questions",
			fields: [
				{ name: "interested_in_other_coverages", label: "Interested in other insurance?", type: "select", options: ["Homeowners", "Renters", "Life", "Umbrella", "Business", "Pet", "None"] },
				{ name: "referral_source", label: "How did you hear about us?", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] },
			]
		},
	];

	const totalSteps = steps.length;
	const progress = ((currentStep + 1) / totalSteps) * 100;

	const handleFieldChange = (name: string, value: string) => {
		// Sanitize input on change
		const sanitized = sanitizeInput(value);
		setFormData(prev => ({ ...prev, [name]: sanitized }));

		// If this step has been attempted, re-validate this field live to clear errors
		if (attemptedSteps[currentStep]) {
			const nextErr = validateField(name, sanitized);
			setFieldErrors(prev => {
				const copy = { ...prev };
				if (nextErr) copy[name] = nextErr;
				else delete copy[name];
				return copy;
			});
		}
	};

	const validateField = (name: string, value: string): string | null => {
		const trimmed = value?.trim?.() ?? "";

		// format-specific validation
		if (name === "email" && trimmed && !isValidEmail(trimmed)) return "Please enter a valid email address";
		if (name === "phone" && trimmed && !isValidPhone(trimmed)) return "Please enter a valid phone number";

		// malicious content validation
		const v = validateInput(trimmed, name);
		if (!v.valid) return v.error || `Invalid input in ${name}`;

		return null;
	};

	const validateStep = (stepIndex: number): Record<string, string> => {
		const step = steps[stepIndex];
		const errors: Record<string, string> = {};

		for (const field of step.fields) {
			const value = (formData[field.name] || "").trim();

			const isRequired = "required" in field && !!field.required;
			if (isRequired && !value) {
				errors[field.name] = "This field is required";
				continue;
			}

			// If optional but filled, validate it too
			if (value) {
				const err = validateField(field.name, value);
				if (err) errors[field.name] = err;
			}
		}

		return errors;
	};

	const handleNext = () => {
		if (currentStep >= totalSteps - 1) return;

		window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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
			const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstInvalid}"]`);
			el?.focus();
			return;
		}

		setCurrentStep(prev => prev + 1);
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
			setCurrentStep(prev => prev - 1);
		}
	};

	// NOTE: canContinue no longer gates navigation; validation on click does.
	// Keep it if you still want it elsewhere, but the Continue button should not rely on it.
	const canContinue = () => {
		const currentFields = steps[currentStep].fields;
		const requiredFields = currentFields.filter(f => "required" in f && f.required);
		return requiredFields.every(f => formData[f.name]?.trim());
	};

	const validateForm = (): { valid: boolean; errors: string[] } => {
		const errors: string[] = [];
		
		// Validate email
		if (formData.email && !isValidEmail(formData.email)) {
			errors.push('Please enter a valid email address');
		}
		
		// Validate phone
		if (formData.phone && !isValidPhone(formData.phone)) {
			errors.push('Please enter a valid phone number');
		}
		
		// Validate all fields for malicious content
		for (const [key, value] of Object.entries(formData)) {
			const validation = validateInput(value, key);
			if (!validation.valid) {
				errors.push(validation.error || `Invalid input in ${key}`);
			}
		}
		
		return { valid: errors.length === 0, errors };
	};

	const buildAddressFromParts = (data: Record<string, string>) => {
		const street = (data.address_street || "").trim();
		const city = (data.address_city || "").trim();
		const state = (data.address_state || "").trim();
		const zip = (data.address_zip || "").trim();
		const cityState = [city, state].filter(Boolean).join(", ");
		const cityStateZip = [cityState, zip].filter(Boolean).join(" ");
		return [street, cityStateZip].filter(Boolean).join(", ");
	};

	const handleSubmit = async () => {
		if (submitting) return;

		// Validate current step first (covers the "final" step gating)
		setAttemptedSteps(prev => ({ ...prev, [currentStep]: true }));
		const finalStepErrors = validateStep(currentStep);
		if (Object.keys(finalStepErrors).length) {
			setFieldErrors(prev => ({ ...prev, ...finalStepErrors }));
			const firstInvalid = Object.keys(finalStepErrors)[0];
			const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstInvalid}"]`);
			el?.focus();
			return;
		}

		// Validate full form (existing behavior)
		const validation = validateForm();
		if (!validation.valid) {
			alert(validation.errors.join('\n'));
			return;
		}

		setSubmitting(true);
		try {
			const form = document.createElement('form');
			const submissionData: Record<string, string> = { ...formData };
			const address = buildAddressFromParts(formData);
			if (address) submissionData.address = address;
			delete submissionData.address_street;
			delete submissionData.address_city;
			delete submissionData.address_state;
			delete submissionData.address_zip;

			Object.entries(submissionData).forEach(([key, value]) => {
				const input = document.createElement('input');
				input.name = key;
				input.value = value;
				form.appendChild(input);
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

			await submitQuote("auto", form);
			setSubmitted(true);
			window.scrollTo(0, 0);
		} catch (err: any) {
			alert(err?.message || "Failed to submit. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const focusFirstField = () => {
		const firstField = steps[currentStep].fields[0]?.name;
		if (firstField) {
			const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstField}"]`);
			el?.focus();
		}
	};

	useEffect(() => {
		// Avoid auto-focusing until storage is checked and the intro modal is dismissed.
		if (!introChecked || introOpen) return;
		focusFirstField();
	}, [currentStep, introOpen, introChecked]);

	const handleIntroDismiss = (shouldFocus: boolean) => {
		setIntroOpen(false);
		if (typeof window !== "undefined") {
			window.localStorage.setItem(introStorageKey, "true");
		}
		if (shouldFocus) {
			// Defer focus until after the modal closes and the form is interactable.
			setTimeout(() => {
				focusFirstField();
			}, 100);
		}
	};

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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">Auto Quote Submitted</h2>
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

	// Show only the intro overlay when it's open (rendered via portal to body)
	if (introChecked && introOpen) {
		return (
			<IntroQuoteModal
				open={true}
				onStart={() => handleIntroDismiss(true)}
			/>
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
							'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
						backgroundPosition: 'center 45%',
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
									<Car className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
								</div>
							</div>
							<h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
								Auto Insurance Quote
							</h1>
							<p className="text-base sm:text-lg text-white/90 drop-shadow-md">
								Tailored auto protection with discount optimization
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
									Fill out the information below to receive a personalized auto insurance quote
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
													transition={{ delay: idx * 0.1 }}
													className="space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60"
												>
													<Label className="text-sm sm:text-base font-medium text-[#1a1a1a]">
														{field.label}{"required" in field && field.required && <span className="text-red-500 ml-1">*</span>}
													</Label>

													{field.type === "select" && field.options ? (
														<>
															<SelectWithOther
																name={field.name}
																options={field.options}
																value={formData[field.name] || ""}
																onChange={(v) => handleFieldChange(field.name, v)}
															/>
															{showError && (
																<p className="text-xs text-red-600" role="alert">{errMsg}</p>
															)}
														</>
													) : field.type === "textarea" ? (
														<>
															<Textarea
																name={field.name}
																placeholder={"placeholder" in field ? field.placeholder : undefined}
																value={formData[field.name] || ""}
																onChange={(e) => handleFieldChange(field.name, e.target.value)}
																aria-invalid={showError}
																className={`min-h-[100px] text-sm sm:text-base px-3 py-3 ${showError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
															/>
															{showError && (
																<p className="text-xs text-red-600" role="alert">{errMsg}</p>
															)}
														</>
													) : (
														<>
															<Input
																type={field.type}
																name={field.name}
																placeholder={"placeholder" in field ? field.placeholder : undefined}
																value={formData[field.name] || ""}
																onChange={(e) => handleFieldChange(field.name, e.target.value)}
																required={"required" in field ? field.required : false}
																aria-invalid={showError}
																className={`text-sm sm:text-base px-3 py-3 ${showError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
															/>
															{showError && (
																<p className="text-xs text-red-600" role="alert">{errMsg}</p>
															)}
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
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back
								</Button>

								{currentStep < totalSteps - 1 ? (
									<Button
										type="button"
										onClick={handleNext}
										// IMPORTANT: allow clicking to trigger validation (don't disable-gate)
										disabled={false}
										className="w-full sm:w-auto bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] order-1 sm:order-2"
									>
										Continue
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								) : (
									<Button
										type="button"
										onClick={handleSubmit}
										disabled={submitting}
										className="w-full sm:w-auto bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] order-1 sm:order-2"
									>
										{submitting ? "Submitting..." : "Get My Quote"}
										<CheckCircle2 className="ml-2 h-4 w-4" />
									</Button>
								)}
							</div>

							<div className="mt-6 flex justify-center gap-2">
								{steps.map((_, idx) => (
									<div
										key={idx}
										className={`h-2 rounded-full transition-all ${idx === currentStep
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
									Multi-Vehicle Discounts
								</h3>
								<p className="text-sm text-[#6c757d]">
									Save more when you insure multiple vehicles
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Roadside Assistance
								</h3>
								<p className="text-sm text-[#6c757d]">
									24/7 emergency help when you need it
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Fast Digital ID Cards
								</h3>
								<p className="text-sm text-[#6c757d]">
									Instant access to proof of insurance
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Local Claims Support
								</h3>
								<p className="text-sm text-[#6c757d]">
									Quick, friendly service when accidents happen
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Coverage Overview */}
					<Card className="mt-8 border-gray-200">
						<CardHeader>
							<CardTitle>Auto Coverage Overview</CardTitle>
							<CardDescription>
								Understand policy options before you submit your info.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 text-sm text-[#6c757d]">
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Core Coverages
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Liability (BI / PD)</li>
									<li>Uninsured / Underinsured Motorist</li>
									<li>Personal Injury Protection / MedPay</li>
									<li>Comprehensive (fire, theft, weather)</li>
									<li>Collision (vehicle damage)</li>
									<li>Roadside Assistance (optional)</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Common Endorsements
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Rental Reimbursement</li>
									<li>Gap Coverage</li>
									<li>Custom Equipment</li>
									<li>Rideshare / Delivery Use</li>
									<li>Accident Forgiveness</li>
									<li>Glass / Windshield Waiver</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Discount Insights
								</h4>
								<p className="text-xs leading-relaxed">
									Multi-vehicle, safe driver, telematics, good student, paid-in-full,
									defensive driving, and bundle (home / umbrella) discounts may apply.
								</p>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Sample Claim Scenarios
								</h4>
								<ul className="space-y-1">
									<li>
										<span className="text-[#1a1a1a] font-medium">
											Rear-End Collision:
										</span>{" "}
										Collision + liability protect both parties.
									</li>
									<li>
										<span className="text-[#1a1a1a] font-medium">
											Storm Damage:
										</span>{" "}
										Comprehensive handles hail / fallen tree.
									</li>
									<li>
										<span className="text-[#1a1a1a] font-medium">
											Hit-and-Run:
										</span>{" "}
										UM/UIM may respond if at-fault driver unknown.
									</li>
								</ul>
							</div>
							<p className="text-[11px]">
								Final eligibility & pricing depend on underwriting guidelines.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}



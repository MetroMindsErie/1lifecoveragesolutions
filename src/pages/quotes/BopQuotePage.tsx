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
import { CheckCircle2, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";
import LoadingOverlay from "../../components/LoadingOverlay";

function absUrl(path: string) {
	const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
	return path.startsWith("http")
		? path
		: `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
function setHead({
	title,
	description,
	canonicalPath,
	jsonLd,
}: {
	title: string;
	description?: string;
	canonicalPath?: string;
	jsonLd?: any;
}) {
	const SITE = "1Life Coverage Solutions";
	const url = absUrl(canonicalPath || window.location.pathname);
	document.title = `${title} | ${SITE}`;
	if (description) {
		let d = document.head.querySelector('meta[name="description"]') as
			| HTMLMetaElement
			| null;
		if (!d) {
			d = document.createElement("meta");
			d.setAttribute("name", "description");
			document.head.appendChild(d);
		}
		d.setAttribute("content", description);
	}
	let c = document.head.querySelector('link[rel="canonical"]') as
		| HTMLLinkElement
		| null;
	if (!c) {
		c = document.createElement("link");
		c.setAttribute("rel", "canonical");
		document.head.appendChild(c);
	}
	c.setAttribute("href", url);
	document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) =>
		n.remove()
	);
	if (jsonLd) {
		const s = document.createElement("script");
		s.type = "application/ld+json";
		s.setAttribute("data-seo-jsonld", "1");
		s.textContent = JSON.stringify(jsonLd);
		document.head.appendChild(s);
	}
}

const YEAR_BUILT_OPTIONS = (() => {
	const current = new Date().getFullYear();
	return Array.from({ length: current - 1899 }, (_, i) => String(current - i));
})();

export function BopQuotePage() {
	useEffect(() => {
		const jsonLd = {
			"@context": "https://schema.org",
			"@type": "Service",
			serviceType: "Business Owners Policy (BOP) Quote",
			provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
			url: absUrl("/quote/bop"),
			areaServed: "US",
			description: "Bundle property and liability protection tailored to your operations.",
		};
		setHead({
			title: "Business Owners Policy (BOP) Quote",
			description: "Bundle property and liability protection tailored to your operations.",
			canonicalPath: "/quote/bop",
			jsonLd,
		});
		(async () => {
			const { data } = await supabase
				.from("pages_seo")
				.select("title,description,canonical_url,json_ld")
				.eq("path", "/quote/bop")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Business Owners Policy (BOP) Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/bop",
					jsonLd: data.json_ld || jsonLd,
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
			id: "business-info",
			title: "Tell us about your business",
			subtitle: "Basic business information",
			fields: [
				{ name: "business_name", label: "Business Name", type: "text", required: true },
				{ name: "business_address", label: "Business Address", type: "text", required: true },
				{ name: "contact_phone", label: "Your Phone Number", type: "tel", required: true },
				{ name: "contact_email", label: "Your Email Address", type: "email", required: true },
			]
		},
		{
			id: "business-details",
			title: "Business details",
			subtitle: "Type of business and operations",
			fields: [
				{ name: "business_type", label: "Type of Business", type: "select", options: ["Retail","Restaurant","Professional Office","Contractor","Service","E-commerce","Manufacturing","Other"] },
				{ name: "fein", label: "FEIN / Tax ID Number", type: "text" },
				{ name: "years_in_business", label: "Years in Business", type: "select", options: ["<1","1-2","3-5","6-10","11-20","20+"] },
				{ name: "employees", label: "Number of Employees", type: "select", options: ["1-5","6-10","11-25","26-50","51-100","100+"] },
				{ name: "website", label: "Website (if applicable)", type: "text" },
			]
		},
		{
			id: "contact-person",
			title: "Primary Contact",
			subtitle: "Who should we speak with?",
			fields: [
				{ name: "contact_name", label: "Your Full Name", type: "text", required: true },
				{ name: "contact_title", label: "Your Title/Position", type: "text" },
			]
		},
		{
			id: "property-info",
			title: "Property Information",
			subtitle: "Details about your location",
			fields: [
				{ name: "property_address", label: "Property Address (if different)", type: "text" },
				{ name: "property_type", label: "Property Type", type: "select", options: ["Owned", "Leased", "Rented"] },
				{ name: "building_construction", label: "Building Construction", type: "select", options: ["Brick", "Wood", "Metal", "Concrete"] },
				{ name: "year_built", label: "Year Built", type: "select", options: YEAR_BUILT_OPTIONS },
			]
		},
		{
			id: "building-features",
			title: "Building features",
			subtitle: "Safety and construction details",
			fields: [
				{ name: "stories", label: "Number of Stories", type: "select", options: ["1","2","3","4","5+"] },
				{ name: "square_footage", label: "Square Footage", type: "select", options: ["<1,000","1,000-2,499","2,500-4,999","5,000-9,999","10,000-24,999","25,000+"] },
				{ name: "sprinklers", label: "Fire Protection/Sprinklers", type: "select", options: ["Yes", "No"] },
				{ name: "security_systems", label: "Security Systems", type: "select", options: ["Yes", "No"] },
				{ name: "hazardous_materials", label: "Any hazardous materials on site?", type: "select", options: ["Yes", "No"] },
			]
		},
		{
			id: "operations",
			title: "Business Operations",
			subtitle: "Revenue and operating details",
			fields: [
				{ name: "annual_revenue", label: "Annual Gross Revenue ($)", type: "select", options: ["<100K","100K-250K","250K-500K","500K-1M","1M-2.5M","2.5M+"] },
				{ name: "annual_payroll", label: "Annual Payroll ($)", type: "select", options: ["<100K","100K-250K","250K-500K","500K-1M","1M+"] },
				{ name: "locations", label: "Number of Locations", type: "select", options: ["1","2","3","4","5+"] },
				{ name: "business_hours", label: "Business Hours", type: "select", options: ["Standard (9-5)","Extended","24/7","Seasonal"] },
				{ name: "seasonal", label: "Any seasonal operations?", type: "select", options: ["Yes","No"] },
			]
		},
		{
			id: "claims-history",
			title: "Claims history",
			subtitle: "Previous losses or incidents",
			fields: [
				{ name: "prior_claims", label: "Any previous claims or losses in last 5 years?", type: "select", options: ["Yes", "No"] },
				{ name: "prior_claims_description", label: "If yes, please describe", type: "textarea" },
			]
		},
		{
			id: "coverage-needs",
			title: "Coverage needs",
			subtitle: "What protection do you need?",
			fields: [
				{ name: "desired_coverage_types", label: "Desired Coverage Types", type: "text", placeholder: "Property / Liability / etc." },
				{ name: "coverage_limits", label: "Desired Coverage Limits ($)", type: "select", options: ["250K","500K","1M","2M","5M","Other"], otherLabel: "Custom" },
				{ name: "deductible", label: "Deductible Preference ($)", type: "select", options: ["500","1000","2500","5000"], otherLabel: "Custom" },
			]
		},
		{
			id: "additional-info",
			title: "Additional information",
			subtitle: "Other business considerations",
			fields: [
				{ name: "vehicles_for_operations", label: "Vehicles used for operations?", type: "select", options: ["Yes", "No"] },
				{ name: "subcontractors", label: "Subcontractors?", type: "select", options: ["Yes", "No"] },
				{ name: "special_endorsements", label: "Special endorsements needed?", type: "textarea" },
			]
		},
		{
			id: "final",
			title: "Almost done!",
			subtitle: "Just one more question",
			fields: [
				{ name: "referral_source", label: "How did you hear about us?", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] },
			]
		},
	];

	const totalSteps = steps.length;
	const progress = ((currentStep + 1) / totalSteps) * 100;

	const handleFieldChange = (name: string, value: string) => {
		setFormData(prev => ({ ...prev, [name]: value }));

		// If this step has been attempted, re-validate this field live to clear errors
		if (attemptedSteps[currentStep]) {
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

	const validateField = (field: any, value: string): string | null => {
		if (!value && field.required) {
			return `${field.label} is required`;
		}

		if (value) {
			// Email validation
			if (field.type === "email") {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					return "Please enter a valid email address";
				}
			}

			// Phone validation
			if (field.type === "tel") {
				const digitsOnly = value.replace(/\D/g, "");
				if (digitsOnly.length < 10) {
					return "Please enter a valid phone number (at least 10 digits)";
				}
			}

			// ZIP code validation
			if (field.name === "zip") {
				const zipRegex = /^\d{5}(-\d{4})?$/;
				if (!zipRegex.test(value)) {
					return "Please enter a valid ZIP code";
				}
			}
		}

		return null;
	};

	const validateStep = (stepIndex: number): Record<string, string> => {
		const step = steps[stepIndex];
		const errors: Record<string, string> = {};

		for (const field of step.fields as any[]) {
			const value = (formData[field.name] || "").trim();
			const err = validateField(field, value);
			if (err) errors[field.name] = err;
		}

		return errors;
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
			const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
				`[name="${firstInvalid}"]`
			);
			el?.focus();
			return;
		}

		setCurrentStep(prev => prev + 1);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
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
			const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
				`[name="${firstInvalid}"]`
			);
			el?.focus();
			return;
		}

		setSubmitting(true);
		try {
			// Only send columns that exist in bop_quotes
			const allowedColumns = new Set([
				"business_name","business_address","phone","email","business_type","fein","years_in_business","employees","website",
				"contact_name","contact_title","contact_phone","contact_email",
				"property_address","property_type","building_construction","year_built","stories","square_footage","sprinklers","security_systems","hazardous_materials",
				"annual_revenue","annual_payroll","locations","business_hours","seasonal",
				"prior_claims","prior_claims_description",
				"desired_coverage_types","coverage_limits","deductible",
				"vehicles_for_operations","subcontractors","special_endorsements",
				"referral_source","referrer","utm","submitted_from_path","status","payload","quote_type",
			]);

			// Sanitize
			const sanitized: Record<string, any> = {};
			for (const [k, v] of Object.entries(formData)) {
				if (allowedColumns.has(k)) sanitized[k] = String(v ?? "").trim();
			}
			// Ensure required contact keys are present (email or phone)
			const primaryEmail = String(formData.email ?? formData.contact_email ?? "").trim();
			const primaryPhone = String(formData.phone ?? formData.contact_phone ?? "").trim();
			if (!primaryEmail && !primaryPhone) {
				alert("Please provide at least an email or phone.");
				setSubmitting(false);
				return;
			}
			// Map to schema fields
			sanitized.email = primaryEmail;
			sanitized.phone = primaryPhone;

			// Meta - let submitQuote handle user_agent automatically
			sanitized.quote_type = "bop";
			sanitized.submitted_from_path = window.location.pathname;
			// Keep full original form for diagnostics in JSONB column
			sanitized.payload = { ...formData };

			// Build form to reuse submitQuote
			const form = document.createElement("form");
			Object.entries(sanitized).forEach(([key, value]) => {
				const input = document.createElement("input");
				input.name = key;
				input.value = String(value ?? "");
				form.appendChild(input);
			});
			// Honeypots
			const hp1 = document.createElement("input");
			hp1.name = "hp_company";
			hp1.value = "";
			form.appendChild(hp1);
			const hp2 = document.createElement("input");
			hp2.name = "hp_url";
			hp2.value = "";
			form.appendChild(hp2);

			try {
				await submitQuote("bop", form);
			} catch (err: any) {
				// Fallback if backend attempts to insert a non-existent 'name' column
				const msg = String(err?.message || "");
				if (msg.includes("Could not find the 'name' column") && msg.includes("bop_quotes")) {
					const { error } = await supabase.from("bop_quotes").insert([sanitized]);
					if (error) throw error;
				} else {
					throw err;
				}
			}

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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">BOP Quote Submitted</h2>
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
      <section className="relative py-24 overflow-hidden">
				{/* Background Image */}
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{
						backgroundImage:
							'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
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
								<div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2C7DB8] to-[#1B5A8E] border border-white/40">
									<Briefcase className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
								</div>
							</div>
							<h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
								Business Owners Policy Quote
							</h1>
							<p className="text-base sm:text-lg text-white/90 drop-shadow-md">
								Bundle property and liability protection tailored to your operations
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
									Fill out the information below to receive a personalized business owners policy quote
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
											const showError =
												!!attemptedSteps[currentStep] && !!fieldErrors[field.name];
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

													{field.type === "select" && "options" in field && field.options ? (
														<>
															<SelectWithOther
																name={field.name}
																options={field.options}
																value={formData[field.name] || ""}
																onChange={(value) => handleFieldChange(field.name, value)}
																otherLabel={(field as any).otherLabel}
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
																className={`min-h-[100px] text-sm sm:text-base px-3 py-3 ${
																	showError ? "border-red-500 focus-visible:ring-red-500" : ""
																}`}
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
																required={"required" in field ? field.required : undefined}
																aria-invalid={showError}
																className={`text-sm sm:text-base px-3 py-3 ${
																	showError ? "border-red-500 focus-visible:ring-red-500" : ""
																}`}
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

							{/* ...existing code... */}
						</CardContent>
					</Card>

					{/* Info Cards */}
					<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Property + Liability in One
								</h3>
								<p className="text-sm text-[#6c757d]">
									Bundled coverage for comprehensive protection
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Business Income Protection
								</h3>
								<p className="text-sm text-[#6c757d]">
									Coverage for lost revenue during closures
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Equipment Breakdown Options
								</h3>
								<p className="text-sm text-[#6c757d]">
									Protection for mechanical and electrical systems
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Certificates Issued Quickly
								</h3>
								<p className="text-sm text-[#6c757d]">
									Fast COI processing for your business needs
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Coverage Overview */}
					<Card className="mt-8 border-gray-200">
						<CardHeader>
							<CardTitle>BOP Coverage Overview</CardTitle>
							<CardDescription>What's bundled & typical add-ons.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 text-sm text-[#6c757d]">
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Bundled Protections
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Property (building / contents)</li>
									<li>General Liability</li>
									<li>Business Income</li>
									<li>Premises & Operations</li>
									<li>Products / Completed Ops</li>
									<li>Basic Equipment Breakdown</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Popular Enhancements
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Cyber Liability</li>
									<li>Employment Practices Liability</li>
									<li>Professional Liability (select)</li>
									<li>Outdoor Signs / Property Off-Premises</li>
									<li>Scheduled Tools / Inland Marine</li>
									<li>Utility Services / Spoilage</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Eligibility Notes
								</h4>
								<p className="text-xs leading-relaxed">
									Revenue, class of business, loss history, manufacturing intensity, and
									product liability exposure affect qualification.
								</p>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Claim Examples
								</h4>
								<ul className="space-y-1">
									<li>Small kitchen fire closing operations</li>
									<li>Customer slip-and-fall in lobby</li>
									<li>Equipment surge damages POS systems</li>
								</ul>
							</div>
							<p className="text-[11px]">
								Workers’ Compensation & Commercial Auto are separate policies.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

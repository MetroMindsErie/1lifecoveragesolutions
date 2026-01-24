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
import { CheckCircle2, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";
import LoadingOverlay from "../../components/LoadingOverlay";
import { absUrl, setHead } from "../../lib/seo";

const YEAR_BUILT_OPTIONS = (() => {
	const current = new Date().getFullYear();
	return Array.from({ length: current - 1899 }, (_, i) => String(current - i));
})();

export function CommercialBuildingQuotePage() {
	useEffect(() => {
		const jsonLd = {
			"@context": "https://schema.org",
			"@type": "Service",
			serviceType: "Commercial Property Insurance Quote",
			provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
			url: absUrl("/quote/commercial-building"),
			areaServed: "US",
			description: "Protect your building, tenants, and operations with tailored coverage.",
		};
		setHead({
			title: "Commercial Building Insurance Quote",
			description: "Protect your building, tenants, and operations with tailored coverage.",
			canonicalPath: "/quote/commercial-building",
			jsonLd,
		});
		(async () => {
			const { data } = await supabase
				.from("pages_seo")
				.select("title,description,canonical_url,og_image,json_ld")
				.eq("path", "/quote/commercial-building")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Commercial Building Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/commercial-building",
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
			id: "contact-info",
			title: "Let's start with your information",
			subtitle: "We'll use this to contact you",
			fields: [
				{ name: "name", label: "Your Full Name", type: "text", required: true },
				{ name: "phone", label: "Phone Number", type: "tel", required: true },
				{ name: "email", label: "Email Address", type: "email", required: true },
			]
		},
		{
			id: "business-property",
			title: "Business & Property Information",
			subtitle: "Tell us about the property",
			fields: [
				{ name: "business_name_or_owner", label: "Business Name / Property Owner or Tenant", type: "text", required: true },
				{ name: "property_address_street", label: "Street address", type: "text", required: true, placeholder: "123 Main St" },
				{ name: "property_address_city", label: "City", type: "text", required: true, placeholder: "Cleveland" },
				{ name: "property_address_state", label: "State", type: "text", required: true, placeholder: "OH" },
				{ name: "property_address_zip", label: "ZIP code", type: "text", required: true, placeholder: "44114" },
				{ name: "own_or_rent", label: "Own or Rent/Lease?", type: "select", options: ["Own", "Rent/Lease"] },
				{ name: "property_type", label: "Type of Property", type: "select", options: ["Office", "Retail", "Warehouse", "Industrial", "Mixed Use"] },
			]
		},
		{
			id: "building-details",
			title: "Building characteristics",
			subtitle: "Physical details of the structure",
			fields: [
				{ name: "year_built", label: "Year Built", type: "select", options: YEAR_BUILT_OPTIONS },
				{ name: "stories", label: "Number of Stories", type: "select", options: ["1","2","3","4","5+"] },
				{ name: "square_footage", label: "Square Footage", type: "select", options: ["<2,500","2,500-4,999","5,000-9,999","10,000-24,999","25,000-49,999","50,000+"] },
				{ name: "construction_type", label: "Construction Type", type: "select", options: ["Frame","Joisted Masonry","Non-Combustible","Masonry","Fire Resistive","Mixed","Other"] },
				{ name: "roof_type_age", label: "Roof Type / Age", type: "text" },
			]
		},
		{
			id: "safety-systems",
			title: "Safety & protection systems",
			subtitle: "Fire and security features",
			fields: [
				{ name: "foundation_type", label: "Foundation Type", type: "select", options: ["Slab", "Crawl Space", "Basement"] },
				{ name: "sprinklers", label: "Fire Protection / Sprinklers", type: "select", options: ["Yes", "No"] },
				{ name: "security_systems", label: "Security Systems", type: "select", options: ["Yes", "No"] },
				{ name: "hazardous_materials", label: "Any hazardous materials stored on-site?", type: "select", options: ["Yes", "No"] },
			]
		},
		{
			id: "occupancy",
			title: "Occupancy & Use",
			subtitle: "How the building is used",
			fields: [
				{ name: "primary_use", label: "Primary Use of Building", type: "select", options: ["Office","Retail","Light Industrial","Warehouse","Restaurant","Medical","Mixed","Other"] },
				{ name: "units_tenants", label: "Number of Units / Tenants", type: "select", options: ["1","2-4","5-9","10-19","20+"] },
				{ name: "occupancy_type", label: "Occupancy Type", type: "select", options: ["Owner-Occupied","Tenant-Occupied","Mixed"] },
				{ name: "business_hours", label: "Business Hours / Operating Schedule", type: "select", options: ["Standard","Extended","24/7","Seasonal"] },
				{ name: "seasonal", label: "Any seasonal operations?", type: "select", options: ["Yes","No"] },
			]
		},
		{
			id: "coverage-info",
			title: "Coverage Information",
			subtitle: "Current and desired coverage",
			fields: [
				{ name: "current_carrier", label: "Current Insurance Carrier", type: "text" },
				{ name: "policy_expiration", label: "Policy Expiration Date", type: "date" },
				{ name: "building_coverage", label: "Desired Building Coverage Limits ($)", type: "select", options: ["250K","500K","750K","1M","2M","5M","10M","Other"], otherLabel: "Custom" },
				{ name: "tenant_improvements", label: "Tenant Property & Improvements ($)", type: "select", options: ["25K","50K","100K","250K","500K","Other"], otherLabel: "Custom" },
				{ name: "liability_coverage", label: "Liability Coverage Desired ($)", type: "select", options: ["300K","500K","1M","2M","5M","Other"], otherLabel: "Custom" },
			]
		},
		{
			id: "claims-additional",
			title: "Claims history & additional coverage",
			subtitle: "Help us understand your risk profile",
			fields: [
				{ name: "deductible", label: "Deductible Preference ($)", type: "select", options: ["500", "1000", "2500", "5000"], otherLabel: "Custom" },
				{ name: "additional_coverage", label: "Additional Coverage Requested", type: "text", placeholder: "Flood / Earthquake / Equipment Breakdown / Ordinance or Law / Business Interruption / Other" },
				{ name: "prior_claims", label: "Any previous claims or losses in last 5 years?", type: "select", options: ["Yes", "No"] },
				{ name: "prior_claims_description", label: "If yes, please describe", type: "textarea" },
				{ name: "electrical_update_year", label: "What year was the electrical system updated?", type: "text" },
				{ name: "plumbing_update_year", label: "What year was the plumbing updated?", type: "text" },
				{ name: "can_provide_loss_history", label: "Would you be able to provide a 5 year loss history?", type: "select", options: ["Yes", "No"] }
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

	const validateField = (field: any, value: string): string | null => {
		const trimmed = (value || "").trim();

		if (!trimmed && field.required) return "This field is required";
		if (!trimmed) return null;

		// Email validation
		if (field.type === "email") {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
		}

		// Phone validation
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

		return errors;
	};

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

	const canContinue = () => {
		const currentStepData = steps[currentStep];
		const requiredFields = currentStepData.fields.filter(f => "required" in f && !!f.required);
		return requiredFields.every(field => formData[field.name]?.trim());
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
			const buildAddressFromParts = (data: Record<string, string>) => {
				const street = (data.property_address_street || "").trim();
				const city = (data.property_address_city || "").trim();
				const state = (data.property_address_state || "").trim();
				const zip = (data.property_address_zip || "").trim();
				const cityState = [city, state].filter(Boolean).join(", ");
				const cityStateZip = [cityState, zip].filter(Boolean).join(" ");
				return [street, cityStateZip].filter(Boolean).join(", ");
			};

			const submissionData: Record<string, string> = { ...formData };
			const address = buildAddressFromParts(formData);
			if (address) submissionData.property_address = address;
			delete submissionData.property_address_street;
			delete submissionData.property_address_city;
			delete submissionData.property_address_state;
			delete submissionData.property_address_zip;

			const form = document.createElement('form');
			Object.entries(submissionData).forEach(([key, value]) => {
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

			await submitQuote("commercial-building", form);
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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">Commercial Building Quote Submitted</h2>
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
							'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
						backgroundPosition: 'center 40%',
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
									<Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
								</div>
							</div>
							<h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
								Commercial Building Insurance Quote
							</h1>
							<p className="text-base sm:text-lg text-white/90 drop-shadow-md">
								Protect your building, tenants, and operations with tailored coverage
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
									Fill out the information below to receive a personalized commercial building insurance quote
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

													{field.type === "select" && "options" in field && field.options ? (
														<>
															<SelectWithOther
																name={field.name}
																options={field.options}
																value={formData[field.name] || ""}
																onChange={(value) => handleFieldChange(field.name, value)}
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
																className={`min-h-[100px] text-sm sm:text-base px-3 py-3 ${
																	showError ? "border-red-500 focus-visible:ring-red-500" : ""
																}`}
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
																className={`text-sm sm:text-base px-3 py-3 ${
																	showError ? "border-red-500 focus-visible:ring-red-500" : ""
																}`}
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
									Property & Liability Packages
								</h3>
								<p className="text-sm text-[#6c757d]">
									Comprehensive coverage for buildings and operations
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Equipment Breakdown Options
								</h3>
								<p className="text-sm text-[#6c757d]">
									Protection for mechanical and electrical failures
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Loss of Income Coverage
								</h3>
								<p className="text-sm text-[#6c757d]">
									Protect your revenue during business interruptions
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Multi-Location Support
								</h3>
								<p className="text-sm text-[#6c757d]">
									Coverage solutions for multiple properties
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Coverage Overview */}
					<Card className="mt-8 border-gray-200">
						<CardHeader>
							<CardTitle>Commercial Property Overview</CardTitle>
							<CardDescription>
								Core components & enhancement options.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 text-sm text-[#6c757d]">
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Core Coverage Areas
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Building</li>
									<li>Business Personal Property</li>
									<li>Tenant Improvements</li>
									<li>Loss of Business Income</li>
									<li>General Liability</li>
									<li>Equipment Breakdown</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Common Endorsements
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Ordinance or Law</li>
									<li>Outdoor Signs</li>
									<li>Cyber Liability</li>
									<li>Flood / Earthquake (separate)</li>
									<li>Spoilage / Utility Services</li>
									<li>Hired &amp; Non-Owned Auto</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Underwriting Focus
								</h4>
								<p className="text-xs leading-relaxed">
									Construction class, protection (alarms/sprinklers), occupancy type,
									neighboring exposures, updates to roof / HVAC / wiring / plumbing.
								</p>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Claim Examples
								</h4>
								<ul className="space-y-1">
									<li>Fire loss &amp; business interruption</li>
									<li>Wind or hail exterior damage</li>
									<li>Slip-and-fall liability claim</li>
								</ul>
							</div>
							<p className="text-[11px]">
								Vacancy, specialty manufacturing, or hazardous storage may require
								specialty markets.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

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
import { CheckCircle2, Dog, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";
import LoadingOverlay from "../../components/LoadingOverlay";

function absUrl(path: string) {
	const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
	return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
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
	document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) => n.remove());
	if (jsonLd) {
		const s = document.createElement("script");
		s.type = "application/ld+json";
		s.setAttribute("data-seo-jsonld", "1");
		s.textContent = JSON.stringify(jsonLd);
		document.head.appendChild(s);
	}
}

export function PetQuotePage() {
	useEffect(() => {
		const jsonLd = {
			"@context": "https://schema.org",
			"@type": "Service",
			serviceType: "Pet Insurance Quote",
			provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
			url: absUrl("/quote/pet"),
			areaServed: "US",
			description: "Request pet insurance quotes for dogs, cats, and other companion animals.",
		};
		setHead({
			title: "Pet Insurance Quote",
			description: "Protect your pet with customizable coverage for medical and liability needs.",
			canonicalPath: "/quote/pet",
			jsonLd,
		});
		(async () => {
			const { data } = await supabase
				.from("pages_seo")
				.select("title,description,canonical_url,json_ld")
				.eq("path", "/quote/pet")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Pet Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/pet",
					jsonLd: data.json_ld || jsonLd,
				});
			}
		})();
	}, []);

	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const steps = [
		{
			id: "owner-info",
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
			id: "pet-basics",
			title: "Tell us about your pet",
			subtitle: "The basics help us find the right coverage",
			fields: [
				{ name: "pet_name", label: "What's your pet's name?", type: "text" },
				{ name: "pet_type", label: "What type of pet?", type: "select", options: ["Dog", "Cat"] },
				{ name: "pet_breed", label: "Breed", type: "text" },
				{ name: "pet_sex", label: "Male or Female?", type: "select", options: ["Male", "Female"] },
			]
		},
		{
			id: "pet-details",
			title: "A few more details about your pet",
			subtitle: "This helps us calculate accurate coverage",
			fields: [
				{ name: "pet_age", label: "How old is your pet?", type: "select", options: ["<1 year", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11+"] },
				{ name: "zip", label: "Your ZIP code", type: "text" },
				{ name: "pet_medical_history", label: "Any existing conditions or medications?", type: "textarea", placeholder: "Optional - tell us about any health issues..." },
			]
		},
		{
			id: "coverage",
			title: "What kind of coverage do you need?",
			subtitle: "Customize your policy to fit your budget",
			fields: [
				{ name: "desired_annual_limit", label: "Annual coverage limit", type: "select", options: ["$1,000","$2,500","$5,000","$10,000","$15,000","$20,000","Custom"], otherLabel: "Other" },
				{ name: "desired_deductible", label: "Deductible amount", type: "select", options: ["$0","$100","$250","$500","$750","$1000","Custom"], otherLabel: "Other" },
				{ name: "wellness_interest", label: "Interested in wellness coverage?", type: "select", options: ["Yes","No"] },
			]
		},
		{
			id: "final",
			title: "Almost done!",
			subtitle: "Just a couple more questions",
			fields: [
				{ name: "additional_quotes_interest", label: "Interested in other insurance?", type: "select", options: ["Auto", "Homeowners", "Renters", "Life", "Business", "Umbrella", "None"] },
				{ name: "referral_source", label: "How did you hear about us?", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] },
			]
		},
	];

	const totalSteps = steps.length;
	const progress = ((currentStep + 1) / totalSteps) * 100;

	const handleFieldChange = (name: string, value: string) => {
		setFormData(prev => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const validateCurrentStep = () => {
		const currentStepData = steps[currentStep];
		const newErrors: Record<string, string> = {};
		
		currentStepData.fields.forEach(field => {
			if ("required" in field && field.required) {
				const value = formData[field.name]?.trim();
				if (!value) {
					newErrors[field.name] = 'This field is required';
				} else if (field.type === 'email' && value) {
					// Basic email validation
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(value)) {
						newErrors[field.name] = 'Please enter a valid email address';
					}
				} else if (field.type === 'tel' && value) {
					// Basic phone validation (at least 10 digits)
					const phoneRegex = /\d{10,}/;
					if (!phoneRegex.test(value.replace(/\D/g, ''))) {
						newErrors[field.name] = 'Please enter a valid phone number';
					}
				}
			}
		});
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const canContinue = () => {
		const currentStepData = steps[currentStep];
		const requiredFields = currentStepData.fields.filter(f => "required" in f && !!f.required);
		return requiredFields.every(field => formData[field.name]?.trim());
	};

	const handleNext = () => {
		if (!validateCurrentStep()) {
			return;
		}
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

	const QUOTE_TYPE = "pet" as const;

	const handleSubmit = async () => {
		if (submitting) return;
		setSubmitting(true);
		try {
			// Create form element and populate with data
			const form = document.createElement('form');
			Object.entries(formData).forEach(([key, value]) => {
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

			await submitQuote(QUOTE_TYPE, form);
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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">Pet Quote Submitted</h2>
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
							'url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
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
									<Dog className="h-8 w-8 text-white" />
								</div>
							</div>
							<h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">
								Pet Insurance Quote
							</h1>
							<p className="text-lg text-white/90 drop-shadow-md">
								Coverage for veterinary care, accidents, and specified illnesses
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
									Fill out the information below to receive a personalized pet insurance quote
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
										{steps[currentStep].fields.map((field, idx) => (
											<motion.div
												key={field.name}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: idx * 0.1 }}
												className="space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60"
											>
												<Label className="text-sm sm:text-base font-medium text-[#1a1a1a]">
													{field.label}
													{"required" in field && field.required && <span className="text-red-500 ml-1">*</span>}
												</Label>
												{field.type === "select" && "options" in field && field.options ? (
													<SelectWithOther
														name={field.name}
														options={field.options}
														value={formData[field.name] || ""}
														onChange={(value) => handleFieldChange(field.name, value)}
													/>
												) : field.type === "textarea" ? (
													<Textarea
														name={field.name}
														placeholder={"placeholder" in field ? field.placeholder : undefined}
														value={formData[field.name] || ""}
														onChange={(e) => handleFieldChange(field.name, e.target.value)}
														className={`min-h-[100px] text-sm sm:text-base px-3 py-3 ${errors[field.name] ? 'border-red-500' : ''}`}
													/>
												) : (
													<Input
														type={field.type}
														name={field.name}
														placeholder={"placeholder" in field ? field.placeholder : undefined}
														value={formData[field.name] || ""}
														onChange={(e) => handleFieldChange(field.name, e.target.value)}
														required={"required" in field ? field.required : undefined}
														className={`text-sm sm:text-base px-3 py-3 ${errors[field.name] ? 'border-red-500' : ''}`}
													/>
												)}
												{errors[field.name] && (
													<p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
												)}
											</motion.div>
										))}
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
										disabled={!canContinue()}
										className="w-full sm:w-auto bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] order-1 sm:order-2"
									>
										Continue
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								) : (
									<Button
										type="button"
										onClick={handleSubmit}
										disabled={submitting || !canContinue()}
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
									Accident & Illness Coverage
								</h3>
								<p className="text-sm text-[#6c757d]">
									Comprehensive protection for unexpected vet bills
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Customizable Deductibles
								</h3>
								<p className="text-sm text-[#6c757d]">
									Choose the deductible that fits your budget
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Multi-Pet Discounts
								</h3>
								<p className="text-sm text-[#6c757d]">
									Save when insuring multiple pets
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Wellness Add-ons
								</h3>
								<p className="text-sm text-[#6c757d]">
									Optional preventive care coverage available
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Coverage Overview */}
					<Card className="mt-8 border-gray-200">
						<CardHeader>
							<CardTitle>Pet Insurance Overview</CardTitle>
							<CardDescription>Coverage highlights and typical exclusions.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 text-sm text-[#6c757d]">
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Core Coverage Areas
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Accident coverage</li>
									<li>Illness coverage</li>
									<li>Emergency care</li>
									<li>Hospitalization</li>
									<li>Surgery & diagnostics</li>
									<li>Prescription medications</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Optional Add-ons
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Wellness / preventive care</li>
									<li>Dental cleaning</li>
									<li>Behavioral therapy</li>
									<li>Alternative therapies</li>
									<li>Exam fee coverage</li>
									<li>Hereditary condition riders</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Typical Exclusions
								</h4>
								<p className="text-xs leading-relaxed">
									Pre-existing conditions, breeding/pregnancy costs, elective procedures, experimental treatments. Breed-specific exclusions may apply.
								</p>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Claim Examples
								</h4>
								<ul className="space-y-1">
									<li>
										<span className="font-medium text-[#1a1a1a]">Emergency Surgery:</span>{" "}
										Foreign object ingestion requiring surgical removal.
									</li>
									<li>
										<span className="font-medium text-[#1a1a1a]">Chronic Illness:</span>{" "}
										Diabetes management (insulin + ongoing vet checks).
									</li>
									<li>
										<span className="font-medium text-[#1a1a1a]">Accident Injury:</span>{" "}
										Broken bone from fall needing X‑rays and stabilization.
									</li>
								</ul>
							</div>
							<p className="text-[11px]">
								Waiting periods typically apply. Multi-pet discounts available for households with multiple animals.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

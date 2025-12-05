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
import { CheckCircle2, Umbrella, ArrowRight, ArrowLeft } from "lucide-react";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";
import { motion, AnimatePresence } from "motion/react";

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

export function UmbrellaQuotePage() {
	useEffect(() => {
		const jsonLd = {
			"@context": "https://schema.org",
			"@type": "Service",
			serviceType: "Personal Umbrella Insurance Quote",
			provider: { "@type": "InsuranceAgency", name: "1Life Coverage Solutions" },
			url: absUrl("/quote/umbrella"),
			areaServed: "US",
			description: "Request a personal umbrella quote for extra liability protection.",
		};
		setHead({
			title: "Personal Umbrella Insurance Quote",
			description: "Extra liability protection over your home and auto policies.",
			canonicalPath: "/quote/umbrella",
			jsonLd,
		});
		(async () => {
			const { data } = await supabase
				.from("pages_seo")
				.select("title,description,canonical_url,json_ld")
				.eq("path", "/quote/umbrella")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Personal Umbrella Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/umbrella",
					jsonLd: data.json_ld || jsonLd,
				});
			}
		})();
	}, []);

	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<Record<string, string>>({});

	const steps = [
		{
			id: "client-info",
			title: "Let's start with your information",
			subtitle: "We'll use this to contact you with your quote",
			fields: [
				{ name: "name", label: "Full Name", type: "text", required: true },
				{ name: "email", label: "Email Address", type: "email", required: true },
				{ name: "phone", label: "Phone Number", type: "tel", required: true },
				{ name: "preferred_contact_method", label: "Preferred Contact Method", type: "select", options: ["Phone", "Email", "Text"] },
			]
		},
		{
			id: "personal-details",
			title: "Personal details",
			subtitle: "Help us understand your coverage needs",
			fields: [
				{ name: "address", label: "Address", type: "text" },
				{ name: "dob", label: "Date of Birth", type: "date" },
				{ name: "drivers_license_number", label: "Driver's License Number", type: "text" },
			]
		},
		{
			id: "current-coverage",
			title: "Current insurance coverage",
			subtitle: "Tell us about your existing policies",
			fields: [
				{ name: "current_coverages", label: "Do you have Homeowners / Renters / Auto / Watercraft / Other?", type: "text", placeholder: "List your current policies" },
				{ name: "current_coverage_limits", label: "Current Coverage Limits", type: "text" },
				{ name: "policy_expiration", label: "Policy Expiration Date", type: "date" },
			]
		},
		{
			id: "household",
			title: "Household information",
			subtitle: "Assets and property details",
			fields: [
				{ name: "household_drivers", label: "Number of Drivers in Household", type: "select", options: ["1","2","3","4","5","6+"], otherLabel: "Other" },
				{ name: "household_vehicles", label: "Number of Vehicles", type: "select", options: ["1","2","3","4","5","6+"], otherLabel: "Other" },
				{ name: "valuables_description", label: "High-value items? Describe if yes", type: "textarea", placeholder: "Jewelry, art, collectibles, etc." },
				{ name: "rental_properties", label: "Rental Properties?", type: "select", options: ["Yes","No"] },
				{ name: "watercraft", label: "Watercraft/Boats?", type: "select", options: ["Yes","No"] },
			]
		},
		{
			id: "pets",
			title: "Tell us about your pets",
			subtitle: "Pet ownership affects liability coverage",
			fields: [
				{ name: "pets_have", label: "Do you have pets?", type: "select", options: ["Yes", "No"] },
				{ name: "pets_type", label: "Type of Pet(s)", type: "select", options: ["Dog", "Cat", "Bird", "Reptile"] },
				{ name: "pets_count", label: "Number of Pets", type: "text" },
				{ name: "dog_breeds", label: "Dog Breed(s)", type: "text" },
				{ name: "pets_bite_history", label: "Any pets with a history of bites/claims?", type: "select", options: ["Yes", "No"] },
			]
		},
		{
			id: "coverage-request",
			title: "Coverage you need",
			subtitle: "Customize your umbrella policy",
			fields: [
				{ name: "desired_limit", label: "Desired Umbrella Policy Limit ($)", type: "select", options: ["1000000","2000000","3000000","5000000","10000000"], otherLabel: "Custom" },
				{ name: "desired_deductible", label: "Desired Deductible ($)", type: "select", options: ["0","250","500","1000","2500","5000"], otherLabel: "Custom" },
				{ name: "prior_claims", label: "Any prior claims or liability incidents?", type: "select", options: ["Yes","No"] },
				{ name: "prior_claims_description", label: "If yes, please describe", type: "textarea" },
			]
		},
		{
			id: "final",
			title: "Almost done!",
			subtitle: "Just a couple more questions",
			fields: [
				{ name: "additional_quotes_interest", label: "Interested in other insurance?", type: "select", options: ["Auto", "Homeowners", "Renters", "Life", "Business", "Pet", "None"] },
				{ name: "referral_source", label: "How did you hear about us?", type: "select", options: ["Google", "Referral", "Social Media", "Advertising"] },
			]
		},
	];

	const totalSteps = steps.length;
	const progress = ((currentStep + 1) / totalSteps) * 100;

	const handleFieldChange = (name: string, value: string) => {
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const canContinue = () => {
		const currentStepData = steps[currentStep];
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

			await submitQuote("umbrella", form);
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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a]">Umbrella Quote Submitted</h2>
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
							'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
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
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40">
									<Umbrella className="h-8 w-8 text-white" />
								</div>
							</div>
							<h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">
								Personal Umbrella Insurance Quote
							</h1>
							<p className="text-lg text-white/90 drop-shadow-md">
								Extra liability protection over your home and auto policies
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
									Fill out the information below to receive a personalized umbrella insurance quote
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
												transition={{ delay: idx * 0.075 }}
												className="space-y-2 p-4 rounded-lg border border-gray-200 bg-white/60"
											>
												<Label className="text-sm sm:text-base font-medium text-[#1a1a1a]">
													{field.label}{(field as any).required && <span className="text-red-500 ml-1">*</span>}
												</Label>
												{field.type === "select" && field.options ? (
													<SelectWithOther
														name={field.name}
														options={field.options}
														value={formData[field.name] || ""}
														onChange={(v) => handleFieldChange(field.name, v)}
														otherLabel={(field as any).otherLabel}
													/>
												) : field.type === "textarea" ? (
													<Textarea
														name={field.name}
														placeholder={(field as any).placeholder}
														value={formData[field.name] || ""}
														onChange={(e) => handleFieldChange(field.name, e.target.value)}
														className="min-h-[110px] text-sm sm:text-base px-3 py-3"
													/>
												) : (
													<Input
														type={field.type}
														name={field.name}
														placeholder={(field as any).placeholder}
														value={formData[field.name] || ""}
														onChange={(e) => handleFieldChange(field.name, e.target.value)}
														required={(field as any).required}
														className="text-sm sm:text-base px-3 py-3"
													/>
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
									<ArrowLeft className="mr-2 h-4 w-4" /> Back
								</Button>
								{currentStep < totalSteps - 1 ? (
									<Button
										type="button"
										onClick={handleNext}
										disabled={!canContinue()}
										className="w-full sm:w-auto bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] order-1 sm:order-2"
									>
										Continue <ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								) : (
									<Button
										type="button"
										onClick={handleSubmit}
										disabled={submitting || !canContinue()}
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
									Higher Liability Limits
								</h3>
								<p className="text-sm text-[#6c757d]">
									Extended protection beyond your home and auto policies
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Broader Coverage
								</h3>
								<p className="text-sm text-[#6c757d]">
									Personal liability protection for various situations
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Affordable Peace of Mind
								</h3>
								<p className="text-sm text-[#6c757d]">
									Cost-effective way to increase your liability protection
								</p>
							</CardContent>
						</Card>

						<Card className="border-gray-200">
							<CardContent className="p-6 text-center">
								<h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
									Multi-Policy Discounts
								</h3>
								<p className="text-sm text-[#6c757d]">
									Save when bundled with other insurance policies
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Coverage Overview */}
					<Card className="mt-8 border-gray-200">
						<CardHeader>
							<CardTitle>Personal Umbrella Overview</CardTitle>
							<CardDescription>Extended liability protection explained.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 text-sm text-[#6c757d]">
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Purpose
								</h4>
								<p className="text-xs leading-relaxed">
									Adds excess liability limits above home, auto, rental, and certain
									recreational policies when underlying limits are exhausted.
								</p>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Typical Underlying Requirements
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Auto: 250/500 BI, 100 PD</li>
									<li>Home: $300K Liability</li>
									<li>Rental Property: $300K Liability</li>
									<li>Watercraft limits vary</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Common Triggers
								</h4>
								<ul className="space-y-1">
									<li>Serious auto bodily injury claim</li>
									<li>Premises liability lawsuit</li>
									<li>Defamation / personal injury (varies)</li>
								</ul>
							</div>
							<div>
								<h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">
									Not Typically Covered
								</h4>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li>Business pursuits</li>
									<li>Intentional acts</li>
									<li>Professional liability</li>
									<li>Workers comp exposures</li>
								</ul>
							</div>
							<p className="text-[11px]">
								Eligibility depends on driving history, property count, and prior
								losses.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}

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
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
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
				.select("title,description,canonical_url,json_ld")
				.eq("path", "/quote/commercial-building")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Commercial Building Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/commercial-building",
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
				{ name: "property_address", label: "Property Address", type: "text", required: true },
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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a">Commercial Building Quote Submitted</h2>
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
		<QuoteLayout
			title="Commercial Building Insurance Quote"
			description="Protect your building, tenants, and operations with tailored coverage."
			icon={Building2}
			accentColor="#1B5A8E"
			benefits={[
				"Property & liability packages",
				"Equipment breakdown options",
				"Loss of income coverage",
				"Multi-location support",
			]}
			faqs={[
				{
					question: "What property details are most important?",
					answer: "COPE data (construction, occupancy, protection, exposure), year built, updates, and square footage.",
				},
				{
					question: "Owner-occupied or tenant-occupied?",
					answer: "We write both. Coverage can be tailored for owners, tenants, or mixed-use occupancy.",
				},
				{
					question: "Are inspections required?",
					answer: "Some carriers may inspect to confirm building conditions and protection features.",
				},
			]}
		>
			<Card className="mx-auto max-w-3xl rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
				<CardHeader className="p-6 sm:p-8 pb-4">
					<div className="mb-4">
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
					<CardTitle className="text-xl sm:text-2xl">{steps[currentStep].title}</CardTitle>
					<CardDescription className="text-sm sm:text-base">{steps[currentStep].subtitle}</CardDescription>
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
											{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
										</Label>
										{field.type === "select" && field.options ? (
											<SelectWithOther
												name={field.name}
												options={field.options}
												value={formData[field.name] || ""}
												onChange={(value) => handleFieldChange(field.name, value)}
												otherLabel={(field as any).otherLabel}
											/>
										) : field.type === "textarea" ? (
											<Textarea
												name={field.name}
												placeholder={field.placeholder}
												value={formData[field.name] || ""}
												onChange={(e) => handleFieldChange(field.name, e.target.value)}
												className="min-h-[100px] text-sm sm:text-base px-3 py-3"
											/>
										) : (
											<Input
												type={field.type}
												name={field.name}
												placeholder={field.placeholder}
												value={formData[field.name] || ""}
												onChange={(e) => handleFieldChange(field.name, e.target.value)}
												required={field.required}
												className="text-sm sm:text-base px-3 py-3"
											/>
										)}
									</motion.div>
								))}
							</div>
						</motion.div>
					</AnimatePresence>
					<div className="mt-8 sticky bottom-4 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 shadow-md">
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
					<div className="mt-8 flex justify-center gap-3">
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

			{/* Coverage Overview */}
			<Card className="mx-auto mt-6 sm:mt-8 max-w-3xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm">
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
		</QuoteLayout>
	);
}

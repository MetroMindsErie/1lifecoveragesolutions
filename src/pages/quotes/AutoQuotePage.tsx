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
		let d = document.head.querySelector(
			'meta[name="description"]'
		) as HTMLMetaElement | null;
		if (!d) {
			d = document.createElement("meta");
			d.setAttribute("name", "description");
			document.head.appendChild(d);
		}
		d.setAttribute("content", description);
	}
	let c = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
	if (!c) {
		c = document.createElement("link");
		c.setAttribute("rel", "canonical");
		document.head.appendChild(c);
	}
	c.setAttribute("href", url);
	const up = (n: string, v: string, p = false) => {
		const sel = p ? `meta[property="${n}"]` : `meta[name="${n}"]`;
		let el = document.head.querySelector(sel) as HTMLMetaElement | null;
		if (!el) {
			el = document.createElement("meta");
			if (p) el.setAttribute("property", n);
			else el.setAttribute("name", n);
			document.head.appendChild(el);
		}
		el.setAttribute("content", v);
	};
	up("og:site_name", "1Life Coverage Solutions", true);
	up("og:type", "website", true);
	up("og:title", `${title} | 1Life Coverage Solutions`, true);
	if (description) up("og:description", description, true);
	up("og:url", url, true);
	up("twitter:card", "summary_large_image");
	document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) => n.remove());
	if (jsonLd) {
		const s = document.createElement("script");
		s.type = "application/ld+json";
		s.setAttribute("data-seo-jsonld", "1");
		s.textContent = JSON.stringify(jsonLd);
		document.head.appendChild(s);
	}
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div
			data-step={title}
			className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
		>
			<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
				{title}
			</h3>
			<div className="space-y-4">{children}</div>
		</div>
	);
}

export function AutoQuotePage() {
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
				.select("title,description,canonical_url,json_ld")
				.eq("path", "/quote/auto")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Auto Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/auto",
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
				{ name: "name", label: "What's your full name?", type: "text", required: true },
				{ name: "email", label: "Your email address", type: "email", required: true },
				{ name: "phone", label: "Phone number", type: "tel", required: true },
				{ name: "preferred_contact_method", label: "How should we reach you?", type: "select", options: ["Phone", "Email", "Text"] },
			]
		},
		{
			id: "driver-details",
			title: "Tell us about you as a driver",
			subtitle: "This helps us calculate accurate rates",
			fields: [
				{ name: "address", label: "Your current address", type: "text", required: true },
				{ name: "dob", label: "Date of birth", type: "date", required: true },
				{ name: "drivers_license_number", label: "Driver's license number", type: "text" },
				{ name: "occupation", label: "Current occupation", type: "select", options: ["Professional","Skilled Trade","Student","Retired","Self-Employed","Unemployed","Other"] },
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
				{ name: "commute_one_way_miles", label: "Miles driven one-way for commute", type: "select", options: ["<5","5-9","10-14","15-24","25-34","35+"] },
				{ name: "commute_days_per_week", label: "Days per week commuting", type: "select", options: ["1","2","3","4","5","6","7"] },
				{ name: "annual_miles", label: "Estimated annual miles", type: "select", options: ["<6K","6K-9K","10K-12K","13K-15K","16K-20K","20K+"] },
				{ name: "rideshare_use", label: "Used for rideshare/delivery?", type: "select", options: ["Yes","No"] },
			]
		},
		{
			id: "insurance-history",
			title: "Your insurance history",
			subtitle: "Help us find the best rates",
			fields: [
				{ name: "currently_insured", label: "Currently insured?", type: "select", options: ["Yes", "No"] },
				{ name: "current_policy_expiration", label: "Current policy expiration date", type: "date" },
				{ name: "additional_drivers", label: "Additional drivers (Name, DOB, Relationship)", type: "textarea", placeholder: "John Doe, 01/15/1995, Spouse\nJane Doe, 05/20/2005, Child" },
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

			await submitQuote("auto", form);
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
						<h2 className="mb-4 text-2xl sm:text-3xl text-[#1a1a1a">Auto Quote Submitted</h2>
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
		<QuoteLayout
			title="Auto Insurance Quote"
			description="Tailored auto protection with discount optimization."
			icon={Car}
			accentColor="#1B5A8E"
			benefits={[
				"Multi-vehicle & safe driver discounts",
				"Roadside assistance available",
				"Fast digital ID cards",
				"Local claims support",
			]}
			faqs={[
				{ question: "What information should I have ready?", answer: "Driver details, vehicle info (VIN if available), current coverage, and estimated annual mileage." },
				{ question: "Do you run a credit check?", answer: "Some carriers may use credit-based insurance scores where allowed by law." },
				{ question: "Can I add rideshare coverage?", answer: "Yes. Tell us if you drive for Uber, Lyft, or delivery apps." },
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
												onChange={(v) => handleFieldChange(field.name, v)}
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

					<div className="mt-6 sm:mt-8 flex justify-center gap-2">
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

			{/* Coverage Overview - responsive spacing */}
			<Card className="mx-auto mt-6 sm:mt-8 max-w-3xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm">
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
		</QuoteLayout>
	);
}

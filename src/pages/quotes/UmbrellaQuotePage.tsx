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
import { CheckCircle2, Umbrella } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";

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
	const [submitting, setSubmitting] = useState(false); // NEW
	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		try {
			await submitQuote("umbrella", e.currentTarget);
			setSubmitted(true);
			window.scrollTo(0, 0);
		} catch (err: any) {
			alert(err?.message || "Failed to submit. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF] py-12">
				<Card className="mx-auto max-w-2xl">
					<CardContent className="p-12 text-center">
						<div className="mb-6 flex justify-center">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
								<CheckCircle2 className="h-10 w-10 text-white" />
							</div>
						</div>
						<h2 className="mb-4 text-3xl text-[#1a1a1a]">
							Umbrella Quote Submitted
						</h2>
						<p className="text-[#6c757d]">We’ll contact you within 24 hours.</p>
						<div className="mt-8">
							<Button
								className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9]"
								asChild
							>
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
			title="Personal Umbrella Insurance Quote"
			description="Extra liability protection over your home and auto policies."
			icon={Umbrella}
			accentColor="#1B5A8E"
			benefits={[
				"Higher liability limits",
				"Broader personal liability",
				"Affordable peace of mind",
				"Multi-policy discounts",
			]}
			faqs={[
				{
					question: "Do I need certain underlying limits?",
					answer:
						"Yes. Most carriers require minimum underlying limits on home and auto before umbrella applies.",
				},
				{
					question: "What policy limits are available?",
					answer: "Common limits range from $1M to $5M, with higher options available.",
				},
				{
					question: "Does umbrella cover business activities?",
					answer: "Personal umbrellas typically exclude business liability. Ask about separate coverage.",
				},
			]}
		>
			{/* Main Quote Card (form) - unchanged */}
			<Card className="mx-auto max-w-4xl">
				<CardHeader>
					<CardTitle>Personal Umbrella Insurance Quote</CardTitle>
					<CardDescription>
						Provide basic details and current coverage to get started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-8">
						{/* Honeypot fields (hidden) */}
						<input
							type="text"
							name="hp_company"
							tabIndex={-1}
							aria-hidden="true"
							className="hidden"
						/>
						<input
							type="url"
							name="hp_url"
							tabIndex={-1}
							aria-hidden="true"
							className="hidden"
						/>
						{/* Client Information */}
						<div
							data-step="Client Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Client Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Full Name</Label>
									<Input required name="name" />
								</div>
								<div>
									<Label>Email Address</Label>
									<Input type="email" required name="email" />
								</div>
								<div>
									<Label>Phone Number</Label>
									<Input type="tel" required name="phone" />
								</div>
								<div>
									<Label>Preferred Contact Method</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="preferred_contact_method"
										options={["Phone", "Email", "Text"]}
									/>
								</div>
								<div className="sm:col-span-2">
									<Label>Address</Label>
									<Input name="address" />
								</div>
								<div>
									<Label>Date of Birth</Label>
									<Input type="date" name="dob" />
								</div>
								<div>
									<Label>Driver’s License Number</Label>
									<Input name="drivers_license_number" />
								</div>
							</div>
						</div>

						{/* Current Insurance Coverage */}
						<div
							data-step="Current Insurance Coverage"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Current Insurance Coverage
							</h3>
							<div className="grid gap-4">
								<Input
									name="current_coverages"
									placeholder="Do you have Homeowners / Renters / Auto / Watercraft / Other?"
								/>
								<Input
									name="current_coverage_limits"
									placeholder="Current Coverage Limits"
								/>
								<div>
									<Label>Policy Expiration Date</Label>
									<Input type="date" name="policy_expiration" />
								</div>
							</div>
						</div>

						{/* Household Information */}
						<div
							data-step="Household Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Household Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Number of Drivers in Household</Label>
									<SelectWithOther
										name="household_drivers"
										options={["1","2","3","4","5","6+"]}
										otherLabel="Other"
									/>
								</div>
								<div>
									<Label>Number of Vehicles</Label>
									<SelectWithOther
										name="household_vehicles"
										options={["1","2","3","4","5","6+"]}
										otherLabel="Other"
									/>
								</div>
								<div className="sm:col-span-2">
									<Label>High-value items? Describe if yes</Label>
									<Textarea
										name="valuables_description"
										placeholder="Jewelry, art, collectibles, etc."
									/>
								</div>
								<div>
									<Label>Rental Properties?</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="rental_properties"
										options={["Yes", "No"]}
									/>
								</div>
								<div>
									<Label>Watercraft/Boats?</Label>
									{/* CHANGED */}
									<SelectWithOther name="watercraft" options={["Yes", "No"]} />
								</div>
							</div>
						</div>

						{/* Pets */}
						<div
							data-step="Pets"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Pets
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Do you have pets?</Label>
									{/* CHANGED */}
									<SelectWithOther name="pets_have" options={["Yes", "No"]} />
								</div>
								<div>
									<Label>Type of Pet(s)</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="pets_type"
										options={["Dog", "Cat", "Bird", "Reptile"]}
									/>
								</div>
								<div>
									<Label>Number of Pets</Label>
									<Input name="pets_count" />
								</div>
								<div>
									<Label>Dog Breed(s)</Label>
									<Input name="dog_breeds" />
								</div>
								<div className="sm:col-span-2">
									<Label>Any pets with a history of bites/claims?</Label>
									<SelectWithOther
										name="pets_bite_history"
										options={["Yes","No"]}
									/>
								</div>
							</div>
						</div>

						{/* Coverage Request */}
						<div
							data-step="Coverage Request"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Coverage Request
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Desired Umbrella Policy Limit ($)</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="desired_limit"
										options={["1000000", "2000000", "3000000", "5000000"]}
										otherLabel="Custom"
									/>
								</div>
								<div>
									<Label>Desired Deductible ($)</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="desired_deductible"
										options={["0", "250", "500", "1000", "2500"]}
										otherLabel="Custom"
									/>
								</div>
								<div className="sm:col-span-2">
									<Label>Any prior claims or liability incidents?</Label>
									<SelectWithOther name="prior_claims" options={["Yes","No"]} />
								</div>
								<div className="sm:col-span-2">
									<Label>If yes, please describe</Label>
									<Textarea name="prior_claims_description" />
								</div>
							</div>
						</div>

						{/* Additional Coverage Needs */}
						<div
							data-step="Additional Coverage Needs"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Additional Coverage Needs
							</h3>
							<Label>
								Interested in additional quotes? (Auto / Homeowners / Renters /
								Life / Business)
							</Label>
							{/* CHANGED */}
							<SelectWithOther
								name="additional_quotes_interest"
								options={["Auto", "Homeowners", "Renters", "Life", "Business", "Umbrella"]}
							/>
						</div>

						{/* Referral */}
						<div
							data-step="Referral"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Referral
							</h3>
							<Label>How did you hear about us?</Label>
							{/* CHANGED */}
							<SelectWithOther
								name="referral_source"
								options={["Google", "Referral", "Social Media", "Advertising"]}
							/>
						</div>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={submitting}
								className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
							>
								{submitting ? "Submitting..." : "Submit Umbrella Quote"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Moved: Coverage Overview (now shown after client form) */}
			<Card
				data-step="Coverage Overview"
				className="mx-auto mb-8 max-w-4xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
			>
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
		</QuoteLayout>
	);
}

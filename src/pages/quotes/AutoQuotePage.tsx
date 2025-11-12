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
import { CheckCircle2, Car } from "lucide-react";
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
	const [submitting, setSubmitting] = useState(false); // NEW
	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		try {
			await submitQuote("auto", e.currentTarget);
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
							Auto Quote Request Sent
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
			title="Personal Auto Insurance Quote"
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
				{
					question: "What information should I have ready?",
					answer:
						"Driver details, vehicle info (VIN if available), current coverage, and estimated annual mileage.",
				},
				{
					question: "Do you run a credit check?",
					answer:
						"Some carriers may use credit-based insurance scores where allowed by law.",
				},
				{
					question: "Can I add rideshare coverage?",
					answer: "Yes. Tell us if you drive for Uber, Lyft, or delivery apps.",
				},
			]}
		>
			{/* NEW: Coverage Overview */}
			<Card
				data-step="Coverage Overview"
				className="mx-auto mb-8 max-w-3xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
			>
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
			<form onSubmit={onSubmit} className="space-y-8 p-8">
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
				<div className="mx-auto max-w-3xl space-y-8">
					<Section title="Client Information">
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
							<div className="sm:col-span-2">
								<Label>Primary Residence</Label>
								<Input name="primary_residence" />
							</div>
						</div>
					</Section>
					<Section title="Occupation & Education">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>Current Occupation</Label>
								<Input name="occupation" />
							</div>
							<div>
								<Label>Highest Level of Education</Label>
								<Input name="education_level" />
							</div>
						</div>
					</Section>
					<Section title="Vehicle Information">
						<p className="text-sm text-[#6c757d]">
							List up to three vehicles (Year / Make / Model / VIN)
						</p>
						<div className="grid gap-4">
							{[1, 2, 3].map((i) => (
								<Input
									key={i}
									placeholder={`${i}. Year / Make / Model / VIN`}
									name={`vehicle_${i}`}
								/>
							))}
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>Primary Vehicle Use</Label>
								{/* CHANGED */}
								<SelectWithOther
									name="primary_vehicle_use"
									options={["Commute", "Pleasure", "Business", "Rideshare"]}
								/>
							</div>
							<div>
								<Label>Length of Primary Vehicle Ownership</Label>
								{/* CHANGED */}
								<SelectWithOther
									name="vehicle_ownership_length"
									options={["<1 year", "1-3 years", "3-5 years", "5+ years"]}
								/>
							</div>
							<div>
								<Label>Miles Driven One Way for Commute</Label>
								<Input name="commute_one_way_miles" />
							</div>
							<div>
								<Label>Number of Days per Week Commuting</Label>
								<Input name="commute_days_per_week" />
							</div>
							<div>
								<Label>Annual Miles per Year</Label>
								<Input name="annual_miles" />
							</div>
							<div>
								<Label>Used for Rideshare?</Label>
								{/* CHANGED */}
								<SelectWithOther name="rideshare_use" options={["Yes", "No"]} />
							</div>
						</div>
					</Section>
					<Section title="Additional Drivers">
						<p className="text-sm text-[#6c757d]">
							List full name, date of birth, and relationship to primary driver
						</p>
						<div className="grid gap-4">
							{[1, 2, 3].map((i) => (
								<Textarea key={i} name={`additional_driver_${i}`} />
							))}
						</div>
					</Section>
					<Section title="Insurance History">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>Currently Insured?</Label>
								{/* CHANGED */}
								<SelectWithOther name="currently_insured" options={["Yes", "No"]} />
							</div>
							<div>
								<Label>Current Policy Expiration Date</Label>
								<Input type="date" name="current_policy_expiration" />
							</div>
						</div>
					</Section>
					<Section title="Additional Coverage">
						<Input name="interested_in_other_coverages" />
					</Section>
					<Section title="Referral">
						<Label>How did you hear about us?</Label>
						<Input name="referral_source" />
					</Section>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={submitting}
							className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
						>
							{submitting ? "Submitting..." : "Submit Auto Quote"}
						</Button>
					</div>
				</div>
			</form>
		</QuoteLayout>
	);
}

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
import { CheckCircle2, Heart } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
import { submitQuote } from "../../lib/submit";
import { supabase } from "../../lib/supabaseClient";
import { SelectWithOther } from "../../components/quotes/SelectWithOther";

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
	document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(
		(n) => n.remove()
	);
	if (jsonLd) {
		const s = document.createElement("script");
		s.type = "application/ld+json";
		s.setAttribute("data-seo-jsonld", "1");
		s.textContent = JSON.stringify(jsonLd);
		document.head.appendChild(s);
	}
}

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
				.select("title,description,canonical_url,json_ld")
				.eq("path", "/quote/life")
				.maybeSingle();
			if (data) {
				setHead({
					title: data.title || "Life Insurance Quote",
					description: data.description || undefined,
					canonicalPath: data.canonical_url || "/quote/life",
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
			await submitQuote("life", e.currentTarget);
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
							Life Insurance Quote Submitted
						</h2>
						<p className="text-[#6c757d]">
							We’ll contact you within 24 hours.
						</p>
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
			title="Life Insurance Quote"
			description="Explore term and whole life options tailored to your goals and budget."
			icon={Heart}
			accentColor="#1B5A8E"
			benefits={[
				"Term & whole life options",
				"Flexible coverage amounts",
				"No-pressure guidance",
				"Multiple top-rated carriers",
			]}
			faqs={[
				{
					question: "Do I need a medical exam?",
					answer:
						"Many carriers offer accelerated underwriting with no exam for eligible applicants.",
				},
				{
					question: "Term vs. whole life—what’s the difference?",
					answer:
						"Term provides coverage for a set period; whole life includes lifelong coverage with cash value.",
				},
				{
					question: "How fast can I get coverage?",
					answer:
						"Some policies can be approved in days, depending on underwriting.",
				},
			]}
		>
			{/* Main Quote Card (form) - unchanged */}
			<Card className="mx-auto max-w-4xl">
				<CardHeader>
					<CardTitle>Life Insurance Quote</CardTitle>
					<CardDescription>
						Tell us about yourself and desired coverage.
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
						{/* Personal Information */}
						<div
							data-step="Personal Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Personal Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Full Name</Label>
									<Input required name="name" />
								</div>
								<div>
									<Label>Date of Birth</Label>
									<Input type="date" required name="dob" />
								</div>
								<div>
									<Label>Gender</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="gender"
										options={["Male", "Female", "Non-Binary", "Prefer Not to Say"]}
									/>
								</div>
								<div>
									<Label>Phone Number</Label>
									<Input type="tel" name="phone" />
								</div>
								<div>
									<Label>Email Address</Label>
									<Input type="email" name="email" />
								</div>
								<div className="sm:col-span-2">
									<Label>Address</Label>
									<Input name="address" />
								</div>
								<div className="sm:col-span-2">
									<Label>Occupation</Label>
									<Input name="occupation" />
								</div>
							</div>
						</div>

						{/* Coverage Information */}
						<div
							data-step="Coverage Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Coverage Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Type of Life Insurance</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="policy_type"
										options={["Term", "Whole Life", "Universal Life", "Guaranteed UL", "Final Expense", "No-Exam"]}
									/>
								</div>
								<div>
									<Label>Desired Coverage Amount ($)</Label>
									<SelectWithOther
										name="coverage_amount"
										options={[
											"100000","250000","500000","750000","1000000","2000000","3000000"
										]}
										otherLabel="Custom"
									/>
								</div>
								<div>
									<Label>Desired Policy Term (years)</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="term_years"
										options={["10", "15", "20", "25", "30", "35", "40"]}
										otherLabel="Custom"
									/>
								</div>
								<div className="sm:col-span-2">
									<Label>Beneficiaries (Name & Relationship)</Label>
									<Textarea name="beneficiaries" />
								</div>
								<div>
									<Label>Current Life Insurance Policies?</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="current_policies"
										options={["Yes", "No"]}
									/>
								</div>
								<div className="sm:col-span-2">
									<Label>
										If yes, provide carrier, coverage amount, and policy type
									</Label>
									<Textarea name="current_policies_details" />
								</div>
								<div>
									<Label>Any life insurance applications pending?</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="applications_pending"
										options={["Yes", "No"]}
									/>
								</div>
							</div>
						</div>

						{/* Health Information */}
						<div
							data-step="Health Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Health Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Height</Label>
									<Input name="height" />
								</div>
								<div>
									<Label>Weight</Label>
									<Input name="weight" />
								</div>
								<div>
									<Label>Tobacco Use</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="tobacco_use"
										options={["Never", "Former", "Current"]}
									/>
								</div>
								<div>
									<Label>Alcohol Use</Label>
									{/* CHANGED */}
									<SelectWithOther
										name="alcohol_use"
										options={["None", "Social", "Moderate", "High"]}
									/>
								</div>
								<div className="sm:col-span-2">
									<Label>Medical Conditions (current or past)</Label>
									<Textarea name="medical_conditions" />
								</div>
								<div className="sm:col-span-2">
									<Label>Medications</Label>
									<Textarea name="medications" />
								</div>
								<div className="sm:col-span-2">
									<Label>
										Hospitalizations or Surgeries in the last 5 years
									</Label>
									<Textarea name="hospitalizations" />
								</div>
								<div className="sm:col-span-2">
									<Label>Family Medical History</Label>
									<Textarea
										name="family_history"
										placeholder="heart disease, cancer, diabetes, etc."
									/>
								</div>
							</div>
						</div>

						{/* Lifestyle & Activities */}
						<div
							data-step="Lifestyle & Activities"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Lifestyle & Activities
							</h3>
							<div className="grid gap-4">
								<div>
									<Label>High-risk hobbies or activities</Label>
									<Textarea
										name="high_risk_hobbies"
										placeholder="skydiving, scuba, racing, etc."
									/>
								</div>
								<div>
									<Label>Travel Outside the U.S.</Label>
									<Textarea
										name="travel"
										placeholder="frequency & countries"
									/>
								</div>
							</div>
						</div>

						{/* Referral */}
						<div
							data-step="Referral"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Referral
							</h3>
							<div className="space-y-4">
								<Label>How did you hear about us?</Label>
								{/* CHANGED */}
								<SelectWithOther
									name="referral_source"
									options={["Google", "Referral", "Social Media", "Advertising"]}
								/>
							</div>
						</div>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={submitting}
								className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
							>
								{submitting ? "Submitting..." : "Submit Life Quote"}
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
		</QuoteLayout>
	);
}

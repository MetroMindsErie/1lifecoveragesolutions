import { useState } from "react";
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

export function LifeQuotePage() {
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
			{/* NEW: Coverage Overview */}
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
									<Input required />
								</div>
								<div>
									<Label>Date of Birth</Label>
									<Input type="date" required />
								</div>
								<div>
									<Label>Gender</Label>
									<Input placeholder="Male / Female" />
								</div>
								<div>
									<Label>Phone Number</Label>
									<Input type="tel" />
								</div>
								<div>
									<Label>Email Address</Label>
									<Input type="email" />
								</div>
								<div className="sm:col-span-2">
									<Label>Address</Label>
									<Input />
								</div>
								<div className="sm:col-span-2">
									<Label>Occupation</Label>
									<Input />
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
									<Input placeholder="Term / Whole Life" />
								</div>
								<div>
									<Label>Desired Coverage Amount ($)</Label>
									<Input />
								</div>
								<div>
									<Label>Desired Policy Term (years)</Label>
									<Input />
								</div>
								<div className="sm:col-span-2">
									<Label>Beneficiaries (Name & Relationship)</Label>
									<Textarea />
								</div>
								<div>
									<Label>Current Life Insurance Policies?</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>
										If yes, provide carrier, coverage amount, and policy type
									</Label>
									<Textarea />
								</div>
								<div>
									<Label>Any life insurance applications pending?</Label>
									<Input placeholder="Yes / No" />
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
									<Input placeholder="e.g., 5'10&quot;" />
								</div>
								<div>
									<Label>Weight</Label>
									<Input />
								</div>
								<div>
									<Label>Tobacco Use</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div>
									<Label>Alcohol Use</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>Medical Conditions (current or past)</Label>
									<Textarea />
								</div>
								<div className="sm:col-span-2">
									<Label>Medications</Label>
									<Textarea />
								</div>
								<div className="sm:col-span-2">
									<Label>
										Hospitalizations or Surgeries in the last 5 years
									</Label>
									<Textarea />
								</div>
								<div className="sm:col-span-2">
									<Label>Family Medical History</Label>
									<Textarea
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
									<Textarea placeholder="skydiving, scuba, racing, etc." />
								</div>
								<div>
									<Label>Travel Outside the U.S.</Label>
									<Textarea placeholder="frequency & countries" />
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
								<Input />
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
		</QuoteLayout>
	);
}

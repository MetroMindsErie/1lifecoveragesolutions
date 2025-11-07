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
import { CheckCircle2, Briefcase } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
import { submitQuote } from "../../lib/submit";

export function BopQuotePage() {
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false); // NEW
	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		try {
			await submitQuote("bop", e.currentTarget);
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
							BOP Quote Submitted
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
			title="Business Owners Policy (BOP) Quote"
			description="Bundle property and liability protection tailored to your operations."
			icon={Briefcase}
			accentColor="#1B5A8E"
			benefits={[
				"Property + liability in one",
				"Business income protection",
				"Options for equipment breakdown",
				"Certificates issued quickly",
			]}
			faqs={[
				{
					question: "What businesses qualify for a BOP?",
					answer:
						"Most small to mid-sized businesses in retail, services, professional offices, and light manufacturing may qualify.",
				},
				{
					question: "Do I need Workers’ Compensation too?",
					answer: "Workers’ Compensation is separate. We can quote that alongside your BOP.",
				},
				{
					question: "How fast can I get a COI?",
					answer:
						"Certificates of Insurance are typically issued same-day once coverage is bound.",
				},
			]}
		>
			{/* NEW: Coverage Overview */}
			<Card
				data-step="Coverage Overview"
				className="mx-auto mb-8 max-w-4xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
			>
				<CardHeader>
					<CardTitle>BOP Coverage Overview</CardTitle>
					<CardDescription>What’s bundled & typical add-ons.</CardDescription>
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
			<Card className="mx-auto max-w-4xl">
				<CardHeader>
					<CardTitle>Business Owners Policy (BOP) Quote</CardTitle>
					<CardDescription>Share your business and coverage details.</CardDescription>
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
						{/* Business Information */}
						<div
							data-step="Business Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Business Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<Label>Business Name</Label>
									<Input required />
								</div>
								<div className="sm:col-span-2">
									<Label>Business Address</Label>
									<Input required />
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
									<Label>Type of Business</Label>
									<Input />
								</div>
								<div>
									<Label>FEIN / Tax ID Number</Label>
									<Input />
								</div>
								<div>
									<Label>Years in Business</Label>
									<Input />
								</div>
								<div>
									<Label>Number of Employees</Label>
									<Input />
								</div>
								<div className="sm:col-span-2">
									<Label>Website (if applicable)</Label>
									<Input />
								</div>
							</div>
						</div>

						{/* Contact Information */}
						<div
							data-step="Primary Contact"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Primary Contact
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Primary Contact Name</Label>
									<Input />
								</div>
								<div>
									<Label>Title/Position</Label>
									<Input />
								</div>
								<div>
									<Label>Phone Number</Label>
									<Input type="tel" />
								</div>
								<div>
									<Label>Email Address</Label>
									<Input type="email" />
								</div>
							</div>
						</div>

						{/* Property Information */}
						<div
							data-step="Property Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Property Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<Label>Property Address (if different)</Label>
									<Input />
								</div>
								<div>
									<Label>Property Type</Label>
									<Input placeholder="Owned / Leased / Rented" />
								</div>
								<div>
									<Label>Building Construction</Label>
									<Input placeholder="Brick / Wood / Metal / Other" />
								</div>
								<div>
									<Label>Year Built</Label>
									<Input />
								</div>
								<div>
									<Label>Number of Stories</Label>
									<Input />
								</div>
								<div>
									<Label>Square Footage</Label>
									<Input />
								</div>
								<div>
									<Label>Fire Protection/Sprinklers</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div>
									<Label>Security Systems</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>Any hazardous materials on site?</Label>
									<Input placeholder="Yes / No" />
								</div>
							</div>
						</div>

						{/* Business Operations */}
						<div
							data-step="Business Operations"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Business Operations
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Annual Gross Revenue ($)</Label>
									<Input />
								</div>
								<div>
									<Label>Annual Payroll ($)</Label>
									<Input />
								</div>
								<div>
									<Label>Number of Locations</Label>
									<Input />
								</div>
								<div>
									<Label>Business Hours</Label>
									<Input />
								</div>
								<div>
									<Label>Any seasonal operations?</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>
										Any previous claims or losses in last 5 years?
									</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>If yes, please describe</Label>
									<Textarea />
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
								<div className="sm:col-span-2">
									<Label>Desired Coverage Types</Label>
									<Input placeholder="Property / Liability / Business Interruption / Equipment Breakdown / Other" />
								</div>
								<div>
									<Label>Desired Coverage Limits ($)</Label>
									<Input />
								</div>
								<div>
									<Label>Deductible Preference ($)</Label>
									<Input />
								</div>
							</div>
						</div>

						{/* Additional Information */}
						<div
							data-step="Additional Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Additional Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>Vehicles used for operations?</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div>
									<Label>Subcontractors?</Label>
									<Input placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>Special endorsements needed?</Label>
									<Textarea />
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
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label>How did you hear about us?</Label>
									<Input />
								</div>
							</div>
						</div>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={submitting}
								className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
							>
								{submitting ? "Submitting..." : "Submit BOP Quote"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</QuoteLayout>
	);
}

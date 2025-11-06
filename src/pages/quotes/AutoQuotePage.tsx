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
import { CheckCircle2, Car } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";

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
	const [submitted, setSubmitted] = useState(false);
	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
		window.scrollTo(0, 0);
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
				<div className="mx-auto max-w-3xl space-y-8">
					<Section title="Client Information">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>Full Name</Label>
								<Input required />
							</div>
							<div>
								<Label>Email Address</Label>
								<Input type="email" required />
							</div>
							<div>
								<Label>Phone Number</Label>
								<Input type="tel" required />
							</div>
							<div>
								<Label>Preferred Contact Method</Label>
								<Input placeholder="Phone / Email" />
							</div>
							<div className="sm:col-span-2">
								<Label>Address</Label>
								<Input />
							</div>
							<div>
								<Label>Date of Birth</Label>
								<Input type="date" />
							</div>
							<div>
								<Label>Driver’s License Number</Label>
								<Input />
							</div>
							<div className="sm:col-span-2">
								<Label>Primary Residence</Label>
								<Input placeholder="Own Home / Rent / Own Condo / Mobile Home / Other" />
							</div>
						</div>
					</Section>
					<Section title="Occupation & Education">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>Current Occupation</Label>
								<Input />
							</div>
							<div>
								<Label>Highest Level of Education</Label>
								<Input />
							</div>
						</div>
					</Section>
					<Section title="Vehicle Information">
						<p className="text-sm text-[#6c757d]">
							List up to three vehicles (Year / Make / Model / VIN)
						</p>
						<div className="grid gap-4">
							{[1, 2, 3].map((i) => (
								<Input key={i} placeholder={`${i}. Year / Make / Model / VIN`} />
							))}
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>Primary Vehicle Use</Label>
								<Input placeholder="Commute / Pleasure / Business" />
							</div>
							<div>
								<Label>Length of Primary Vehicle Ownership</Label>
								<Input placeholder="e.g., 3 years" />
							</div>
							<div>
								<Label>Miles Driven One Way for Commute</Label>
								<Input />
							</div>
							<div>
								<Label>Number of Days per Week Commuting</Label>
								<Input />
							</div>
							<div>
								<Label>Annual Miles per Year</Label>
								<Input />
							</div>
							<div>
								<Label>Used for Rideshare?</Label>
								<Input placeholder="Yes / No (Uber, DoorDash, etc.)" />
							</div>
						</div>
					</Section>
					<Section title="Additional Drivers">
						<p className="text-sm text-[#6c757d]">
							List full name, date of birth, and relationship to primary driver
						</p>
						<div className="grid gap-4">
							{[1, 2, 3].map((i) => (
								<Textarea
									key={i}
									placeholder={`${i}. Name / DOB / Relationship`}
								/>
							))}
						</div>
					</Section>
					<Section title="Insurance History">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label>Currently Insured?</Label>
								<Input placeholder="Yes / No" />
							</div>
							<div>
								<Label>Current Policy Expiration Date</Label>
								<Input type="date" />
							</div>
						</div>
					</Section>
					<Section title="Additional Coverage">
						<Input placeholder="Interested in Homeowners, Renters, Business, Umbrella, or Life? (Yes / No)" />
					</Section>
					<Section title="Referral">
						<Label>How did you hear about us?</Label>
						<Input />
					</Section>
					<div className="flex justify-end">
						<Button
							type="submit"
							className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
						>
							Submit Auto Quote
						</Button>
					</div>
				</div>
			</form>
		</QuoteLayout>
	);
}

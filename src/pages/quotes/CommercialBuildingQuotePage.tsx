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
import { CheckCircle2, Building2 } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
import { submitQuote } from "../../lib/submit";

export function CommercialBuildingQuotePage() {
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false); // NEW
	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		try {
			await submitQuote("commercial-building", e.currentTarget);
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
							Commercial Building Quote Submitted
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
					answer:
						"COPE data (construction, occupancy, protection, exposure), year built, updates, and square footage.",
				},
				{
					question: "Owner-occupied or tenant-occupied?",
					answer:
						"We write both. Coverage can be tailored for owners, tenants, or mixed-use occupancy.",
				},
				{
					question: "Are inspections required?",
					answer:
						"Some carriers may inspect to confirm building conditions and protection features.",
				},
			]}
		>
			{/* NEW: Coverage Overview */}
			<Card
				data-step="Coverage Overview"
				className="mx-auto mb-8 max-w-4xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
			>
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
			<Card className="mx-auto max-w-4xl">
				<CardHeader>
					<CardTitle>Commercial Building Insurance Quote</CardTitle>
					<CardDescription>
						Tell us about the property and coverage needs.
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
						{/* Business / Property Information */}
						<div
							data-step="Business / Property Information"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Business / Property Information
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								{/* NEW: Full Name (person submitting) */}
								<div className="sm:col-span-2">
									<Label>Full Name</Label>
									<Input name="name" placeholder="Your full name" />
								</div>
								<div className="sm:col-span-2">
									<Label>
										Business Name / Property Owner or Tenant
									</Label>
									<Input required name="business_name_or_owner" />
								</div>
								<div className="sm:col-span-2">
									<Label>Property Address</Label>
									<Input required name="property_address" />
								</div>
								<div>
									<Label>Phone Number</Label>
									<Input type="tel" name="phone" />
								</div>
								<div>
									<Label>Email Address</Label>
									<Input type="email" name="email" />
								</div>
								<div>
									<Label>Own or Rent/Lease?</Label>
									<Input name="own_or_rent" placeholder="Own / Rent/Lease" />
								</div>
								<div>
									<Label>Type of Property</Label>
									<Input name="property_type" placeholder="Office / Retail / Warehouse / Industrial / Mixed Use / Other" />
								</div>
								<div>
									<Label>Year Built</Label>
									<Input name="year_built" />
								</div>
								<div>
									<Label>Number of Stories</Label>
									<Input name="stories" />
								</div>
								<div>
									<Label>Square Footage</Label>
									<Input name="square_footage" />
								</div>
								<div>
									<Label>Construction Type</Label>
									<Input name="construction_type" placeholder="Brick / Wood / Metal / Concrete / Other" />
								</div>
								<div>
									<Label>Roof Type / Age</Label>
									<Input name="roof_type_age" />
								</div>
								<div>
									<Label>Foundation Type</Label>
									<Input name="foundation_type" placeholder="Slab / Crawl Space / Basement" />
								</div>
								<div>
									<Label>Fire Protection / Sprinklers</Label>
									<Input name="sprinklers" placeholder="Yes / No" />
								</div>
								<div>
									<Label>Security Systems</Label>
									<Input name="security_systems" placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>
										Any hazardous materials stored on-site?
									</Label>
									<Input name="hazardous_materials" placeholder="Yes / No" />
								</div>
							</div>
						</div>

						{/* Occupancy & Use */}
						<div
							data-step="Occupancy & Use"
							className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
						>
							<h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">
								Occupancy & Use
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<Label>Primary Use of Building</Label>
									<Input name="primary_use" />
								</div>
								<div>
									<Label>Number of Units / Tenants</Label>
									<Input name="units_tenants" />
								</div>
								<div>
									<Label>Occupancy Type</Label>
									<Input name="occupancy_type" placeholder="Owner-Occupied / Tenant-Occupied / Mixed" />
								</div>
								<div>
									<Label>Business Hours / Operating Schedule</Label>
									<Input name="business_hours" />
								</div>
								<div>
									<Label>Any seasonal operations?</Label>
									<Input name="seasonal" placeholder="Yes / No" />
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
									<Label>Current Insurance Carrier</Label>
									<Input name="current_carrier" />
								</div>
								<div>
									<Label>Policy Expiration Date</Label>
									<Input type="date" name="policy_expiration" />
								</div>
								<div>
									<Label>
										Desired Building Coverage Limits ($) - if Owner
									</Label>
									<Input name="building_coverage" />
								</div>
								<div>
									<Label>
										Desired Tenant Property & Improvements ($) - if Tenant
									</Label>
									<Input name="tenant_improvements" />
								</div>
								<div>
									<Label>Liability Coverage Desired ($)</Label>
									<Input name="liability_coverage" />
								</div>
								<div>
									<Label>Deductible Preference ($)</Label>
									<Input name="deductible" />
								</div>
								<div className="sm:col-span-2">
									<Label>Additional Coverage Requested</Label>
									<Input
										name="additional_coverage"
										placeholder="Flood / Earthquake / Equipment Breakdown / Ordinance or Law / Business Interruption / Other"
									/>
								</div>
								<div className="sm:col-span-2">
									<Label>
										Any previous claims or losses in last 5 years?
									</Label>
									<Input name="prior_claims" placeholder="Yes / No" />
								</div>
								<div className="sm:col-span-2">
									<Label>If yes, please describe</Label>
									<Textarea name="prior_claims_description" />
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
								<Input name="referral_source" />
							</div>
						</div>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={submitting}
								className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
							>
								{submitting ? "Submitting..." : "Submit Commercial Building Quote"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</QuoteLayout>
	);
}

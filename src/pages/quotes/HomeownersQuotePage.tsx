import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CheckCircle2, Home } from "lucide-react";
import { QuoteLayout } from "../../components/quotes/QuoteLayout";
import { submitQuote } from "../../lib/submit";

export function HomeownersQuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false); // NEW
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitQuote("homeowners", e.currentTarget);
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
            <h2 className="mb-4 text-3xl text-[#1a1a1a]">Homeowners Quote Submitted</h2>
            <p className="text-[#6c757d]">We’ll contact you within 24 hours.</p>
            <div className="mt-8">
              <Button className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9]" asChild>
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
      title="Homeowners Insurance Quote"
      description="Share property details to get accurate coverage recommendations."
      icon={Home}
      accentColor="#1B5A8E"
      benefits={[
        "Replacement cost options",
        "Bundle with auto for savings",
        "Storm & theft protection",
        "Fast, fair claim support",
      ]}
      faqs={[
        {
          question: "What affects my homeowners premium?",
          answer:
            "Home age, roof type, location, updates, claims history, security features, and coverage limits.",
        },
        {
          question: "Do you insure condos and townhomes?",
          answer: "Yes. We tailor coverage to HO-6 or HOA-required limits.",
        },
        {
          question: "Can I get flood or earthquake coverage?",
          answer: "Optional policies or endorsements are available in many areas.",
        },
      ]}
    >
      {/* NEW: Coverage Overview */}
      <Card
        data-step="Coverage Overview"
        className="mx-auto mb-8 max-w-4xl rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm"
      >
        <CardHeader>
          <CardTitle>Homeowners Coverage Overview</CardTitle>
          <CardDescription>Key protections & optional enhancements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-[#6c757d]">
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Primary Sections</h4>
            <ul className="grid gap-2 sm:grid-cols-3">
              <li>Dwelling (Coverage A)</li>
              <li>Other Structures (B)</li>
              <li>Personal Property (C)</li>
              <li>Loss of Use (D)</li>
              <li>Personal Liability (E)</li>
              <li>Medical Payments (F)</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Popular Endorsements</h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li>Replacement Cost on Contents</li>
              <li>Water Backup / Sump Overflow</li>
              <li>Scheduled Jewelry & Valuables</li>
              <li>Equipment Breakdown</li>
              <li>Cyber / ID Theft</li>
              <li>Inflation Guard</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Risk & Rating Factors</h4>
            <p className="text-xs leading-relaxed">
              Age of roof, wiring, plumbing & HVAC updates, location fire protection class, prior claims, protective devices, credit-based insurance score (where allowed).
            </p>
          </div>
          <div>
            <h4 className="mb-2 text-[#1a1a1a] text-sm font-semibold uppercase tracking-wide">Claim Examples</h4>
            <ul className="space-y-1">
              <li><span className="font-medium text-[#1a1a1a]">Kitchen Fire:</span> Dwelling + contents + loss of use.</li>
              <li><span className="font-medium text-[#1a1a1a]">Wind Roof Damage:</span> Dwelling repairs / mitigation.</li>
              <li><span className="font-medium text-[#1a1a1a]">Slip & Fall Guest:</span> Liability / medical payments.</li>
            </ul>
          </div>
          <p className="text-[11px]">Flood & earthquake typically excluded—ask about separate policies.</p>
        </CardContent>
      </Card>
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Homeowners Insurance Quote</CardTitle>
          <CardDescription>Provide property and coverage details for your quote.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Honeypot fields (hidden) */}
            <input type="text" name="hp_company" tabIndex={-1} aria-hidden="true" className="hidden" />
            <input type="url" name="hp_url" tabIndex={-1} aria-hidden="true" className="hidden" />
            {/* Client Information */}
            <div
              data-step="Client Information"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Client Information</h3>
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
                  <Input placeholder="Phone / Email / Text" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address of Property to be Insured</Label>
                  <Input required />
                </div>
                <div className="sm:col-span-2">
                  <Label>Mailing Address (if different)</Label>
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
              </div>
            </div>

            {/* Property Details */}
            <div
              data-step="Property Details"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Property Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Type of Home</Label>
                  <Input placeholder="Single Family / Condo / Townhome / Manufactured/Mobile / Other" />
                </div>
                <div>
                  <Label>Year Built</Label>
                  <Input />
                </div>
                <div>
                  <Label>Square Footage</Label>
                  <Input />
                </div>
                <div>
                  <Label>Number of Stories</Label>
                  <Input />
                </div>
                <div>
                  <Label>Roof Type / Year Last Replaced</Label>
                  <Input />
                </div>
                <div>
                  <Label>Foundation Type</Label>
                  <Input placeholder="Slab / Crawl Space / Basement" />
                </div>
                <div className="sm:col-span-2">
                  <Label>If basement, is it finished?</Label>
                  <Input placeholder="Yes / No / Partially Finished" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Exterior Construction</Label>
                  <Input placeholder="Brick / Siding / Wood / Stucco / Other" />
                </div>
                <div>
                  <Label>Heating Type</Label>
                  <Input />
                </div>
                <div>
                  <Label>Age of Heating System (years)</Label>
                  <Input />
                </div>
                <div>
                  <Label>Fireplace or Wood Stove?</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>Garage</Label>
                  <Input placeholder="Attached / Detached / None" />
                </div>
                <div>
                  <Label>Garage Capacity</Label>
                  <Input placeholder="1-Car / 2-Car / 3+ Car" />
                </div>
              </div>
            </div>

            {/* Safety Features */}
            <div
              data-step="Safety Features"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Safety Features</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Central Fire Alarm</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>Central Burglar Alarm</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>Fire Extinguisher</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>Deadbolts on Exterior Doors</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>Swimming Pool on Property?</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>If pool, is it fenced?</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>Pool Type</Label>
                  <Input placeholder="Above Ground / Inground" />
                </div>
                <div>
                  <Label>Trampoline on Property?</Label>
                  <Input placeholder="Yes / No" />
                </div>
              </div>
            </div>

            {/* Pets */}
            <div
              data-step="Pets"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Pets</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Do you have pets?</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div>
                  <Label>Type of Pets</Label>
                  <Input placeholder="Dog / Cat / Other" />
                </div>
                <div>
                  <Label>Number of Pets</Label>
                  <Input />
                </div>
                <div>
                  <Label>Dog Breeds (if applicable)</Label>
                  <Input />
                </div>
                <div className="sm:col-span-2">
                  <Label>Any pets with a history of bites/claims?</Label>
                  <Input placeholder="Yes / No" />
                </div>
              </div>
            </div>

            {/* Coverage Information */}
            <div
              data-step="Coverage Information"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Coverage Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Current Insurance Carrier</Label>
                  <Input />
                </div>
                <div>
                  <Label>Policy Expiration Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Current Dwelling Coverage Amount ($)</Label>
                  <Input />
                </div>
                <div>
                  <Label>Desired Deductible ($)</Label>
                  <Input />
                </div>
                <div className="sm:col-span-2">
                  <Label>Any claims in the last 5 years?</Label>
                  <Input placeholder="Yes / No" />
                </div>
                <div className="sm:col-span-2">
                  <Label>If yes, please describe</Label>
                  <Textarea />
                </div>
              </div>
            </div>

            {/* Additional Coverages */}
            <div
              data-step="Additional Coverages"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[#1B5A8E] uppercase">Additional Coverages</h3>
              <Input placeholder="Interested in: Personal Umbrella / Auto / Life / Business (optional)" />
            </div>

            {/* Referral */}
            <div
              data-step="Referral"
              className="space-y-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-6 shadow-sm"
            >
              <Label>How did you hear about us?</Label>
              <Input />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
              >
                {submitting ? "Submitting..." : "Submit Homeowners Quote"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </QuoteLayout>
  );
}

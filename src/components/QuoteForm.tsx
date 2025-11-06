import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export function QuoteForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    coverageType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zipCode: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const canProceedToStep2 = formData.coverageType !== "";
  const canSubmit = formData.firstName && formData.lastName && formData.email && formData.phone;

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl text-[#1a1a1a]">Request Received!</h2>
          <p className="mb-2 text-lg text-[#6c757d]">
            Thank you for your interest in 1Life Coverage Solutions.
          </p>
          <p className="mb-8 text-[#6c757d]">
            We'll get back to you within 24 hours with a personalized quote.
          </p>
          <Button
            className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
            asChild
          >
            <a href="/">Return to Home</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Get Your Free Quote</CardTitle>
        <CardDescription>
          Step {step} of 2 - Fill out the form below and we'll provide you with a personalized quote
        </CardDescription>
        
        {/* Progress indicator */}
        <div className="mt-4 flex gap-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-[#4f46e5] to-[#06b6d4]' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-[#4f46e5] to-[#06b6d4]' : 'bg-gray-200'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="coverageType">What type of coverage are you looking for?</Label>
                <Select
                  value={formData.coverageType}
                  onValueChange={(value: string) => handleInputChange("coverageType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Insurance</SelectItem>
                    <SelectItem value="business">Business Insurance</SelectItem>
                    <SelectItem value="life">Life Insurance</SelectItem>
                    <SelectItem value="pet">Pet Insurance</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle Insurance</SelectItem>
                    <SelectItem value="boat">Boat Insurance</SelectItem>
                    <SelectItem value="travel">Travel Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="Enter your ZIP code"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={!canProceedToStep2}
                  className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90 disabled:opacity-50"
                  onClick={() => setStep(2)}
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Additional Information (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your insurance needs..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90 disabled:opacity-50"
                >
                  Submit Quote Request
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
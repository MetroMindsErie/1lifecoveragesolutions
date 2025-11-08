import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { submit } from "../lib/submit";
import { useState } from "react";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await submit(e.currentTarget);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      alert(err?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-[#1B5A8E]">Message Sent</h1>
        <p className="text-sm text-gray-600 mb-6">We will get back to you within 24 hours.</p>
        <a href="/" className="inline-flex rounded bg-[#1B5A8E] px-4 py-2 text-white text-sm">Return Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="border-b bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="mb-4 text-4xl text-[#1a1a1a]">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
            Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-8 lg:col-span-1">
              <div>
                <h2 className="mb-6 text-2xl text-[#1a1a1a]">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[#1a1a1a]">Phone</h3>
                      <p className="text-[#6c757d]">(800) 555-0123</p>
                      <p className="text-sm text-[#6c757d]">Mon-Fri 8am-8pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[#1a1a1a]">Email</h3>
                      <p className="text-[#6c757d]">support@1lifecoverage.com</p>
                      <p className="text-sm text-[#6c757d]">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[#1a1a1a]">Office</h3>
                      <p className="text-[#6c757d]">
                        123 Insurance Plaza
                        <br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[#1a1a1a]">Business Hours</h3>
                      <p className="text-[#6c757d]">
                        Monday - Friday: 8am - 8pm EST
                        <br />
                        Saturday: 9am - 5pm EST
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200">
                <CardContent className="p-8">
                  <h2 className="mb-6 text-2xl text-[#1a1a1a]">Send us a Message</h2>
                  <form onSubmit={onSubmit} className="space-y-4">
                    {/* Honeypots */}
                    <input type="text" name="hp_company" className="hidden" aria-hidden="true" />
                    <input type="url" name="hp_url" className="hidden" aria-hidden="true" />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="first_name" type="text" placeholder="John" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="last_name" type="text" placeholder="Doe" required />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" type="text" placeholder="How can we help?" required />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" placeholder="Tell us what you need help with..." rows={6} required />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded bg-[#1B5A8E] px-4 py-2 text-white text-sm disabled:opacity-50"
                    >
                      {submitting ? "Sending…" : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Placeholder */}
      <section className="border-t bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="aspect-[21/9] bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto mb-2 h-12 w-12 text-[#6c757d]" />
                <p className="text-[#6c757d]">Map placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


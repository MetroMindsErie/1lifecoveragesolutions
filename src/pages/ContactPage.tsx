import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { submitQuote } from "../lib/submit";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import LoadingOverlay from "../components/LoadingOverlay";

function absUrl(path: string) {
  const base = (import.meta as any).env?.VITE_SITE_URL || window.location.origin;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
function setHead({ title, description, canonicalPath, jsonLd }: { title: string; description?: string; canonicalPath?: string; jsonLd?: any; }) {
  const SITE = "1Life Coverage Solutions";
  const url = absUrl(canonicalPath || window.location.pathname);
  document.title = `${title} | ${SITE}`;
  if (description) {
    let d = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!d) { d = document.createElement("meta"); d.setAttribute("name","description"); document.head.appendChild(d); }
    d.setAttribute("content", description);
  }
  let c = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!c) { c = document.createElement("link"); c.setAttribute("rel","canonical"); document.head.appendChild(c); }
  c.setAttribute("href", url);
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
  if (jsonLd) {
    const s = document.createElement("script");
    s.type = "application/ld+json"; s.setAttribute("data-seo-jsonld","1");
    s.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(s);
  }
}

export function ContactPage() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact 1Life Coverage",
      url: absUrl("/contact"),
      description: "Contact 1Life Coverage Solutions for quotes and support."
    };
    setHead({
      title: "Contact Us",
      description: "Have questions? Contact 1Life Coverage Solutions — we’ll reply within 24 hours.",
      canonicalPath: "/contact",
      jsonLd
    });
    (async () => {
      const { data } = await supabase
        .from("pages_seo").select("title,description,canonical_url,json_ld")
        .eq("path", "/contact").maybeSingle();
      if (data) {
        setHead({
          title: data.title || "Contact Us",
          description: data.description || undefined,
          canonicalPath: data.canonical_url || "/contact",
          jsonLd: data.json_ld || jsonLd
        });
      }
    })();
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitQuote("contact", e.currentTarget);
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
    <div className="min-h-screen" style={{ background: "var(--brand-coral-10)" }}>
      <LoadingOverlay open={submitting} message="This can take a few seconds on mobile." />
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
                      <p className="text-[#6c757d]">
                        <a href="tel:18888268370" className="hover:underline">1-888-826-8370</a>
                        <br />
                        <a href="tel:2164557283" className="hover:underline">216-455-RATE (7283)</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-[#1a1a1a]">Email</h3>
                      <p className="text-[#6c757d]">
                        <a href="mailto:Support@1lifecoverage.com" className="hover:underline">Support@1lifecoverage.com</a>
                        <br />
                        <a href="mailto:M.moore@1lifecoverage.com" className="hover:underline">M.moore@1lifecoverage.com</a>
                        <br />
                        <a href="mailto:A.glorioso@1lifecoverage.com" className="hover:underline">A.glorioso@1lifecoverage.com</a>
                      </p>
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
                        4853 Galaxy Parkway Suite K
                        <br />
                        Cleveland, OH 44128
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
                        Monday - Friday: 8am - 4:30pm EST
                        <br />
                        Saturday: By Appointment Only
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
                  <h2 className="mb-6 text-3xl text-[#1a1a1a]">Send us a Message</h2>
                  <form onSubmit={onSubmit} className="space-y-5">
                    {/* Honeypots */}
                    <input type="text" name="hp_company" className="hidden" aria-hidden="true" />
                    <input type="url" name="hp_url" className="hidden" aria-hidden="true" />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName" className="text-lg">First Name</Label>
                        <Input id="firstName" name="first_name" type="text" placeholder="John" required className="text-lg px-4 py-4 min-h-[3.5rem]" />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-lg">Last Name</Label>
                        <Input id="lastName" name="last_name" type="text" placeholder="Doe" required className="text-lg px-4 py-4 min-h-[3.5rem]" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-lg">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required className="text-lg px-4 py-4 min-h-[3.5rem]" />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-lg">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" className="text-lg px-4 py-4 min-h-[3.5rem]" />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-lg">Subject</Label>
                      <Input id="subject" name="subject" type="text" placeholder="How can we help?" required className="text-lg px-4 py-4 min-h-[3.5rem]" />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-lg">Message</Label>
                      <Textarea id="message" name="message" placeholder="Tell us what you need help with..." rows={6} required className="text-lg px-4 py-4 min-h-[8rem]" />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded bg-[#1B5A8E] px-6 py-4 text-white text-lg min-h-[3.5rem] disabled:opacity-50"
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

      {/* Map Section */}
      <section className="border-t py-16" style={{ background: "var(--brand-coral-10)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2989.8!2d-81.5!3d41.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDI3JzAwLjAiTiA4McKwMzAnMDAuMCJX!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus&q=4853+Galaxy+Parkway+Suite+K,+Cleveland,+OH+44128"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="1Life Coverage Solutions Office Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}


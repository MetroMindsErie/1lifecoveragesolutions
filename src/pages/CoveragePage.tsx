import { HeroSection } from "../components/HeroSection";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Check, Phone } from "lucide-react";
import { useEffect } from "react";
import { setHead } from "../lib/seo";

interface CoveragePageProps {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: any;
  disableSeo?: boolean;
  features: string[];
  plans: {
    name: string;
    price: string;
    description: string;
    features: string[];
    recommended?: boolean;
  }[];
}

export function CoveragePage({
  title,
  subtitle,
  description,
  backgroundImage,
  canonicalPath,
  ogImage,
  noindex,
  jsonLd,
  disableSeo,
  features,
  plans,
}: CoveragePageProps) {
  useEffect(() => {
    if (disableSeo) return;
    setHead({
      title,
      description,
      canonicalPath: canonicalPath || window.location.pathname,
      ogImage,
      noindex,
      jsonLd,
    });
  }, [disableSeo, title, description, canonicalPath, ogImage, noindex, jsonLd]);

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title={title}
        subtitle={subtitle}
        description={description}
        backgroundImage={backgroundImage}
        primaryCTA={{ text: "Get a Quote", href: "/quote" }}
        secondaryCTA={{ text: "Contact Us", href: "/contact" }}
      />

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl text-[#1a1a1a]">What's Covered</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
              Comprehensive protection designed to give you peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <p className="text-[#1a1a1a]">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl text-[#1a1a1a]">Choose Your Plan</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
              Select the coverage level that best fits your needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.recommended
                    ? "border-[#4f46e5] shadow-xl ring-2 ring-[#4f46e5]"
                    : "border-gray-200"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-[#4f46e5] to-[#06b6d4] px-4 py-1 text-sm text-white">
                      Recommended
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="mb-2 text-2xl text-[#1a1a1a]">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl text-[#1a1a1a]">{plan.price}</span>
                    <span className="text-[#6c757d]">/month</span>
                  </div>
                  <p className="mb-6 text-[#6c757d]">{plan.description}</p>
                  
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 shrink-0 text-[#4f46e5]" />
                        <span className="text-sm text-[#1a1a1a]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.recommended
                        ? "bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90"
                        : ""
                    }`}
                    variant={plan.recommended ? "default" : "outline"}
                    asChild
                  >
                    <a href="/quote">Get This Plan</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
              <Phone className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl text-[#1a1a1a]">Need Help Choosing?</h2>
          <p className="mb-8 text-lg text-[#6c757d]">
            Our insurance experts are here to help you find the perfect coverage for your needs.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90 sm:w-auto"
              asChild
            >
              <a href="/contact">Contact an Agent</a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <a href="tel:1-800-555-0123">Call (800) 555-0123</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

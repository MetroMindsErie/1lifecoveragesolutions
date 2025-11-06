import { HeroSection } from "../components/HeroSection";
import { Card, CardContent } from "../components/ui/card";
import { Shield, Users, Award, Target, Heart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    icon: Shield,
    title: "Trust & Security",
    description: "We prioritize the security and privacy of our customers, ensuring their information is always protected.",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Our customers are at the heart of everything we do. We're committed to providing exceptional service.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every interaction, delivering award-winning insurance solutions.",
  },
  {
    icon: Target,
    title: "Innovation",
    description: "We embrace technology to make insurance simple, accessible, and tailored to modern life.",
  },
];

const stats = [
  { value: "500K+", label: "Happy Customers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Customer Support" },
  { value: "50+", label: "Years Combined Experience" },
];

export function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="About 1Life Coverage Solutions"
        subtitle="Our Story"
        description="We're redefining insurance for the modern world with comprehensive coverage, innovative technology, and customer-first service."
        backgroundImage="https://images.unsplash.com/photo-1589979034086-5885b60c8f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG9mZmljZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjIzMzI5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
      />

      {/* Stats Section */}
      <section className="border-b bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#06b6d4]">
                  {stat.value}
                </div>
                <p className="text-sm text-[#6c757d]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl text-[#1a1a1a]">Our Mission</h2>
            <p className="mb-4 text-lg text-[#6c757d]">
              At 1Life Coverage Solutions, we believe that insurance should be simple, accessible, and tailored to your unique needs. Our mission is to provide comprehensive protection for every aspect of your life—from your car and home to your business and loved ones.
            </p>
            <p className="text-lg text-[#6c757d]">
              We combine cutting-edge technology with personalized service to deliver insurance solutions that adapt to the modern world. Because you only have one life, and it deserves total coverage.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl text-[#1a1a1a]">Our Core Values</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
              These principles guide everything we do and every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="border-gray-200 text-center">
                <CardContent className="p-8">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl text-[#1a1a1a]">{value.title}</h3>
                  <p className="text-sm text-[#6c757d]">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Placeholder */}
      <section className="border-t bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl text-[#1a1a1a]">Meet Our Leadership</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">
              Experienced professionals dedicated to protecting what matters most
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { name: "Sarah Johnson", role: "Chief Executive Officer" },
              { name: "Michael Chen", role: "Chief Operations Officer" },
              { name: "Emily Rodriguez", role: "Chief Technology Officer" },
            ].map((member, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4]" />
                  </div>
                  <h3 className="mb-1 text-xl text-[#1a1a1a]">{member.name}</h3>
                  <p className="text-sm text-[#6c757d]">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] py-24">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="mb-4 text-3xl text-white">Join Our Growing Community</h2>
          <p className="mb-8 text-lg text-white/90">
            Experience the difference of customer-first insurance. Get your free quote today.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/quote"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-8 text-sm text-[#1a1a1a] hover:bg-white/90 sm:w-auto"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-white px-8 text-sm text-white hover:bg-white/10 sm:w-auto"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
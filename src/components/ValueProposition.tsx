import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowRight, Sparkles, LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ValuePropositionProps {
  features: Feature[];
  title?: string;
  subtitle?: string;
  description?: string;
  description2?: string;
  backgroundImage?: string;
}

export function ValueProposition({
  features,
  title = "Insurance Made Simple",
  subtitle = "Trusted by 500,000+ customers",
  description = "At 1Life Coverage Solutions, we believe insurance should be straightforward, accessible, and tailored to your unique needs. Whether you're protecting your car, business, or loved ones, we're here to provide comprehensive coverage with exceptional service.",
  description2 = "Our team of experienced advisors works with you to find the perfect balance of coverage and affordability, ensuring you're never overpaying or underinsured.",
  backgroundImage,
}: ValuePropositionProps) {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
            }}
          />
          {/* Gradient overlay with edge fade - increased opacity for better content visibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-[#F8F9FA]/95" />
          {/* Additional gradient fade on edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/30" />
        </>
      )}

      {/* Fallback background color if no image */}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-[#F8F9FA]" />
      )}

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white backdrop-blur-sm rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B61] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FF6B61]/10 px-4 py-2">
                <Sparkles className="h-4 w-4 text-[#FF6B61]" />
                <span className="text-sm font-medium text-[#FF6B61]">{subtitle}</span>
              </div>
              <h2 className="mb-6 text-6xl font-black text-[#1B5A8E] sm:text-6xl lg:text-7xl">
                {title}
              </h2>
              <p className="mb-6 text-xl font-black text-[#1B5A8E] leading-relaxed">
                {description}
              </p>
              <p className="mb-8 text-xl font-black text-[#1B5A8E] leading-relaxed">
                {description2}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  className="bg-[#1B5A8E] hover:bg-[#144669] transition-colors text-white px-8 py-6 h-auto text-lg font-bold"
                  asChild
                >
                  <a href="/about">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="border-[#1B5A8E] text-[#1B5A8E] hover:bg-[#1B5A8E] hover:text-white px-8 py-6 h-auto text-lg font-bold"
                  asChild
                >
                  <a href="/contact">Contact an Agent</a>
                </Button>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B61] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1B5A8E]/10 group-hover:bg-[#1B5A8E] transition-colors">
                      <feature.icon className="h-7 w-7 text-[#1B5A8E] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-2xl font-extrabold text-[#1B5A8E]">{feature.title}</h3>
                      <p className="text-lg font-bold text-[#1B5A8E] leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

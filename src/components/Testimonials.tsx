import { Card, CardContent } from "./ui/card";
import { Star, User } from "lucide-react";
import { motion } from "motion/react";

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  description?: string;
  backgroundImage?: string;
}

export function Testimonials({ 
  testimonials, 
  title = "What Our Customers Say",
  description,
  backgroundImage
}: TestimonialsProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24">
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F9FA]/95 via-[#F8F9FA]/90 to-[#F8F9FA]/95" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Frosted Glass Container */}
        <div 
          className="rounded-3xl border-2 border-white/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Decorative gradient border accent - coral */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2C7DB8] to-transparent"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#1B5A8E] sm:text-5xl drop-shadow-sm">
              {title}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-[#1a1a1a] font-bold">
              {description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Individual frosted container with alternating coral/blue borders */}
                <div
                  className="h-full rounded-2xl border-2 p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderColor:'rgba(44, 125, 184, 0.4)'
                  }}
                >
                  {/* Gradient accent on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 107, 97, 0.3) 0%, transparent 100%)'
                    }}
                  ></div>

                  <div className="relative z-10">
                    <div className="mb-4 flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-[#FF6B61] text-[#FF6B61]" />
                      ))}
                    </div>
                    <p className="mb-6 text-[#1a1a1a] leading-relaxed font-medium italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-full shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #2C7DB8 0%, #1B5A8E 100%)'
                        }}
                      >
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a1a1a]">{testimonial.name}</p>
                        <p className="text-sm text-[#1a1a1a]">
                          {testimonial.role} • {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
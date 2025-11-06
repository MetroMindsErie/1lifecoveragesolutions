import { Card, CardContent } from "./ui/card";
import { Star, Quote } from "lucide-react";

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
}

export function Testimonials({ testimonials, title, description }: TestimonialsProps) {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {title && (
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl text-[#1a1a1a] sm:text-4xl">{title}</h2>
            {description && (
              <p className="mx-auto max-w-2xl text-lg text-[#6c757d]">{description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group border-gray-200 transition-all duration-300 hover:border-[#1B5A8E] hover:shadow-lg"
            >
              <CardContent className="p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "fill-[#1B5A8E] text-[#1B5A8E]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-[#1B5A8E]/20" />
                </div>

                <p className="mb-6 text-[#1a1a1a]">{testimonial.content}</p>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1B5A8E] text-white">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[#1a1a1a]">{testimonial.name}</p>
                    <p className="text-sm text-[#6c757d]">
                      {testimonial.role}
                      {testimonial.company && ` • ${testimonial.company}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
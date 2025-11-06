import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface CoverageCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  image?: string;
}

export function CoverageCard({ title, description, icon: Icon, href, image }: CoverageCardProps) {
  const titleId = `coverage-card-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const [imgOk, setImgOk] = useState(true);

  return (
    <Card className="group relative overflow-hidden border-gray-200 transition-all duration-300 hover:border-[#1B5A8E] hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[#1B5A8E] cursor-pointer">
      {/* Make the entire card clickable */}
      <a
        href={href}
        aria-labelledby={titleId}
        className="absolute inset-0 z-10 block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5A8E]"
      />

      {image && imgOk ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      ) : (
        // NEW: gradient placeholder fallback
        <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#1B5A8E]">
          <div className="flex items-center gap-3 text-white/95">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15">
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">{title}</span>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1B5A8E]">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 id={titleId} className="mb-2 text-xl text-[#1a1a1a]">{title}</h3>
        <p className="mb-4 text-[#6c757d]">{description}</p>

        {/* Visual "Learn More" cue (non-interactive; whole card is the link) */}
        <div className="pointer-events-none -ml-4 inline-flex items-center text-[#1B5A8E] group-hover:text-[#144669]">
          <span className="pl-4">Learn More</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}
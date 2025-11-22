import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";

interface CoverageCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  image?: string;
  className?: string;
}

export function CoverageCard({
  title,
  description,
  icon: Icon,
  href,
  image,
  className = "",
}: CoverageCardProps) {
  return (
    <Card className={`group overflow-hidden border-2 border-gray-200 rounded-xl transition-all duration-300 hover:border-[#1B5A8E] hover:shadow-xl hover:-translate-y-1 ${className}`}>
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm shadow-md">
            <Icon className="h-6 w-6 text-[#1B5A8E]" />
          </div>
        </div>
      )}
      <CardHeader>
        {!image && (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1B5A8E]/10">
            <Icon className="h-6 w-6 text-[#1B5A8E]" />
          </div>
        )}
        <CardTitle className="text-xl text-[#1a1a1a] group-hover:text-[#1B5A8E] transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-[#6c757d]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          asChild
          className="w-full bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] hover:opacity-90 transition-opacity"
        >
          <a href={href}>Get a Quote</a>
        </Button>
      </CardContent>
    </Card>
  );
}
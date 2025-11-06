import { ReactNode } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  children?: ReactNode;
  overlay?: boolean;
  darkOverlay?: boolean;
}

export function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundVideo,
  primaryCTA,
  secondaryCTA,
  children,
  overlay = true,
  darkOverlay = false,
}: HeroSectionProps) {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Video or Image */}
      <div className="absolute inset-0 -z-10">
        {backgroundVideo ? (
          <>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
          </>
        ) : backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#1B5A8E]" />
        )}
        {overlay && (
          <>
            {/* Gradient Overlay - subtle blue tint */}
            {darkOverlay ? (
              <div className="absolute inset-0 bg-[#1a1a1a]/70" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B5A8E]/80 via-[#2C7DB8]/60 to-[#1B5A8E]/80" />
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 text-sm uppercase tracking-wider text-white/90"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-4xl tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 text-lg text-white/90 sm:text-xl"
            >
              {description}
            </motion.p>
          )}
          
          {(primaryCTA || secondaryCTA) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              {primaryCTA && (
                <Button
                  size="lg"
                  className="w-full bg-white text-[#1B5A8E] hover:bg-white/90 sm:w-auto transition-all hover:scale-105"
                  asChild
                >
                  <a href={primaryCTA.href}>
                    {primaryCTA.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10 sm:w-auto transition-all"
                  asChild
                >
                  <a href={secondaryCTA.href}>{secondaryCTA.text}</a>
                </Button>
              )}
            </motion.div>
          )}

          {children}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

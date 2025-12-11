// components/SpecialtyTicker.tsx
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

export type SpecialtyCoverage = {
  name: string;
  icon: LucideIcon | string;
  isImage?: boolean;
};

type SpecialtyTickerProps = {
  coverages: SpecialtyCoverage[];
};

export function SpecialtyTicker({ coverages }: SpecialtyTickerProps) {
  return (
    <div className="pointer-events-none select-none w-full sticky bottom-0 left-0 right-0 z-0">
      <div className="pointer-events-auto relative overflow-hidden bg-transparent shadow-none">
        <div className="relative">
          <div className="relative px-4 sm:px-8 py-6 sm:py-7">
            {/* Left Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#0B1F3A]/90 via-[#0B1F3A]/50 to-transparent pointer-events-none z-0" />

            {/* Right Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#0B1F3A]/90 via-[#0B1F3A]/50 to-transparent pointer-events-none z-0" />

            <div className="overflow-hidden py-2">
              <motion.div
                className="flex gap-6 sm:gap-8"
                animate={{ x: [0, -2200] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 40,
                    ease: "linear",
                  },
                }}
              >
                {[...coverages, ...coverages, ...coverages].map(
                  (coverage, index) => {
                    const IconComponent =
                      !coverage.isImage && typeof coverage.icon !== "string"
                        ? coverage.icon
                        : null;

                    return (
                      <div key={`${coverage.name}-${index}`} className="flex-shrink-0">
                        <div className="flex items-center gap-4 sm:gap-5 rounded-2xl bg-transparent px-6 sm:px-8 py-5 sm:py-6 min-w-[230px] sm:min-w-[280px] transition-all duration-300 hover:-translate-y-1">
                          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#0B3E63] shadow-xl ring-2 ring-white/40">
                            {coverage.isImage && typeof coverage.icon === "string" ? (
                              <img
                                src={coverage.icon}
                                alt={coverage.name}
                                className="h-6 w-6 sm:h-7 sm:w-7 object-contain drop-shadow-lg rounded-lg"
                              />
                            ) : IconComponent ? (
                              <IconComponent
                                className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-lg"
                                strokeWidth={2.4}
                              />
                            ) : null}
                          </div>
                          <span className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-lg whitespace-nowrap">
                            {coverage.name}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

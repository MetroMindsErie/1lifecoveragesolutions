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
  variant?: "sticky" | "embedded";
  size?: "normal" | "compact";
};

export function SpecialtyTicker({
  coverages,
  variant = "sticky",
  size = "normal",
}: SpecialtyTickerProps) {
  const isCompact = size === "compact";
  const isEmbedded = variant === "embedded";

  return (
    <div
      className={
        variant === "sticky"
          ? "pointer-events-none select-none w-full sticky bottom-0 left-0 right-0 z-0"
          : "pointer-events-none select-none w-full"
      }
    >
      <div className="pointer-events-auto relative overflow-hidden bg-transparent shadow-none">
        <div className="relative">
          <div
            className={
              isCompact
                ? "relative px-3 sm:px-4 py-2.5 sm:py-3"
                : "relative px-4 sm:px-8 py-6 sm:py-7"
            }
          >
            {/* Left Fade */}
            <div
              className={
                variant === "sticky"
                  ? "absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#0B1F3A]/90 via-[#0B1F3A]/50 to-transparent pointer-events-none z-0"
                  : "absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white/85 via-white/40 to-transparent pointer-events-none z-0"
              }
            />

            {/* Right Fade */}
            <div
              className={
                variant === "sticky"
                  ? "absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#0B1F3A]/90 via-[#0B1F3A]/50 to-transparent pointer-events-none z-0"
                  : "absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white/85 via-white/40 to-transparent pointer-events-none z-0"
              }
            />

            <div className={isCompact ? "overflow-hidden py-1" : "overflow-hidden py-2"}>
              <motion.div
                className={isCompact ? "flex gap-4 sm:gap-5" : "flex gap-6 sm:gap-8"}
                animate={{ x: [0, isCompact ? -1600 : -2200] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: isCompact ? 32 : 40,
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
                    const isImageItem =
                      !!coverage.isImage && typeof coverage.icon === "string";
                    const imageSrc = isImageItem ? (coverage.icon as string) : null;

                    return (
                      <div key={`${coverage.name}-${index}`} className="flex-shrink-0">
                        <div
                          className={
                            isCompact
                              ? isEmbedded
                                ? "flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-md px-4 py-2.5 min-w-[180px] sm:min-w-[210px] shadow-sm transition-all duration-300 hover:bg-white/90"
                                : "flex items-center gap-3 rounded-xl bg-transparent px-3.5 sm:px-4 py-2.5 sm:py-3 min-w-[170px] sm:min-w-[200px] transition-all duration-300"
                              : "flex items-center gap-4 sm:gap-5 rounded-2xl bg-transparent px-6 sm:px-8 py-5 sm:py-6 min-w-[230px] sm:min-w-[280px] transition-all duration-300 hover:-translate-y-1"
                          }
                        >
                          <div
                            className={
                              isCompact
                                ? isEmbedded
                                  ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#0B3E63] shadow-xl"
                                  : "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#0B3E63] shadow-lg ring-2 ring-white/40"
                                : "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#0B3E63] shadow-xl ring-2 ring-white/40"
                            }
                          >
                            {isImageItem ? (
                              <div className={isEmbedded ? "bg-white rounded-lg p-1 shadow-sm" : "bg-white rounded-lg border border-black/60 p-1 shadow-sm"}>
                                <img
                                  src={imageSrc || ""}
                                  alt={coverage.name}
                                  className={
                                    isCompact
                                      ? "h-6 w-6 object-contain"
                                      : "h-6 w-6 sm:h-7 sm:w-7 object-contain"
                                  }
                                />
                              </div>
                            ) : IconComponent ? (
                              <IconComponent
                                className={
                                  isCompact
                                    ? "h-6 w-6 text-white drop-shadow-lg"
                                    : "h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-lg"
                                }
                                strokeWidth={2.4}
                              />
                            ) : null}
                          </div>
                          <span
                            className={
                              isCompact
                                ? isEmbedded
                                  ? "text-sm sm:text-base font-black tracking-tight text-[#1B5A8E] whitespace-nowrap"
                                  : "text-sm sm:text-base font-black tracking-tight text-[#1B5A8E] drop-shadow-sm whitespace-nowrap"
                                : "text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-lg whitespace-nowrap"
                            }
                          >
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

import React from "react";

interface PartnerTickerProps {
  speedMs?: number;
  variant?: "full" | "compact";
}

const partners = [
  { name: "Alpha Mutual", symbol: "AM" },
  { name: "Beacon Risk", symbol: "BR" },
  { name: "Cypher Insurance", symbol: "CI" },
  { name: "Delta Assurance", symbol: "DA" },
  { name: "EverSafe", symbol: "ES" },
  { name: "Foundry Underwriters", symbol: "FU" },
  { name: "Guardian Shield", symbol: "GS" },
  { name: "Horizon Specialty", symbol: "HS" },
  { name: "Inertia Casualty", symbol: "IC" },
  { name: "Jupiter Lines", symbol: "JL" },
];

export function PartnerTicker({ speedMs = 18000, variant = "full" }: PartnerTickerProps) {
  const items = [...partners, ...partners]; // duplicate for seamless loop
  const heightClasses =
    variant === "full"
      ? "py-6"
      : "py-3";

  return (
    <div className={`relative overflow-hidden bg-white ${heightClasses}`}>
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-[200%]"
        style={{
          animation: `tickerScroll ${speedMs}ms linear infinite`,
        }}
        aria-label="Partner & carrier ticker"
      >
        {items.map((p, i) => (
          <div
            key={p.symbol + i}
            className="flex items-center gap-3 px-8 border-r border-gray-100"
            role="img"
            aria-label={p.name}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1B5A8E] to-[#2C7DB8] text-white text-xs font-semibold shadow-sm">
              {p.symbol}
            </div>
            <span className="text-sm text-[#1a1a1a] whitespace-nowrap">{p.name}</span>
          </div>
        ))}
      </div>
      {/* Gradient masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

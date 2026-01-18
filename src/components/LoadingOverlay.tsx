import React, { useEffect, useState } from "react";
import { Logo } from "./Logo";

type LoadingOverlayProps = {
  open: boolean;
  title?: string;
  message?: string;
  accent?: "default" | "brand";
};

export default function LoadingOverlay({
  open,
  title = "Securing your submission",
  message = "Please wait…",
  accent = "default",
}: LoadingOverlayProps) {
  const [turnstilePending, setTurnstilePending] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = (evt: Event) => {
      const e = evt as CustomEvent<{ status?: "start" | "end" } | undefined>;
      if (e?.detail?.status === "start") setTurnstilePending(true);
      if (e?.detail?.status === "end") setTurnstilePending(false);
    };

    window.addEventListener("turnstile:invisible", handler);
    return () => window.removeEventListener("turnstile:invisible", handler);
  }, []);

  const analysisSteps = [
    "Enriching professional profile",
    "Detecting life events",
    "Scoring coverage confidence",
    "Generating explainable insights",
  ];

  const progressPct = Math.max(0, Math.min(100, Math.round(progress)));

  useEffect(() => {
    if (!open || turnstilePending) return;
    // Reset when a new run starts
    setStepIdx(0);
    setProgress(0);

    const maxBeforeHold = 96;
    const holdAt = 92;
    const tickMs = 90;

    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= maxBeforeHold) return p;
        // Fast early movement, then slow down to avoid hitting 100% before the request returns.
        const delta = p < holdAt ? 1 + Math.random() * 3 : 0.2 + Math.random() * 0.6;
        const next = Math.min(maxBeforeHold, p + delta);
        const segment = 100 / analysisSteps.length;
        const idx = Math.min(analysisSteps.length - 1, Math.floor(next / segment));
        setStepIdx(idx);
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(id);
  }, [open, turnstilePending]);

  useEffect(() => {
    // When the overlay closes, reset state so the next open starts clean.
    if (open || turnstilePending) return;
    setStepIdx(0);
    setProgress(0);
  }, [open, turnstilePending]);

  const isOpen = open || turnstilePending;
  if (!isOpen) return null;

  const displayMessage = turnstilePending ? "Verifying security check…" : message;
  const displayTitle = turnstilePending ? "Securing your submission" : title;

  return (
    <div
      className={
        "fixed inset-0 z-50 flex items-center justify-center " +
        // Brand mode should feel like a dedicated processing screen.
        (accent === "brand" && !turnstilePending ? "bg-gradient-to-br from-red-50 via-white to-red-50" : "bg-black/60 backdrop-blur-sm")
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.55),transparent_60%)]" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      <div className="mx-6 w-full max-w-sm rounded-2xl border border-gray-200 bg-white/95 p-8 text-gray-900 shadow-lg backdrop-blur">
        <div className="flex flex-col items-center gap-5 text-center">
          {accent === "brand" ? <Logo size="sm" showText={false} /> : null}
          <GeometricLoader accent={accent} />
          <div className="space-y-1">
            <div className="text-base font-semibold">{displayTitle}</div>
            <div className="text-sm text-gray-600">{displayMessage}</div>
          </div>

          {accent === "brand" && !turnstilePending ? (
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-700">Live analysis</div>
                <div className="text-xs font-semibold text-gray-900">{progressPct}%</div>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white border border-gray-200">
                <div
                  className="h-full w-full origin-left rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 transition-transform duration-150"
                  style={{ transform: `scaleX(${Math.max(2, progressPct) / 100})` }}
                />
              </div>

              <div className="space-y-2">
                {analysisSteps.map((s, idx) => {
                  const active = idx === stepIdx;
                  const done = idx < stepIdx;
                  return (
                    <div key={s} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            "inline-block h-2 w-2 rounded-full " +
                            (done ? "bg-green-600" : active ? "bg-red-600 animate-pulse" : "bg-gray-300")
                          }
                        />
                        <span className={"text-xs " + (active ? "text-gray-900 font-semibold" : "text-gray-700")}>
                          {s}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GeometricLoader({ accent }: { accent: "default" | "brand" }) {
  const outer =
    accent === "brand" ? "border-red-600/35" : "border-gray-900/25";
  const mid =
    accent === "brand" ? "border-red-600/55" : "border-gray-900/40";
  const core = accent === "brand" ? "bg-red-600" : "bg-gray-900/60";

  return (
    <div className="relative h-14 w-14" aria-hidden="true">
      <div
        className={`absolute inset-0 rounded-xl border-4 ${outer}`}
        style={{ animation: "geom_outer 1.1s ease-in-out infinite" }}
      />
      <div
        className={`absolute inset-2 rounded-lg border-4 ${mid}`}
        style={{ animation: "geom_mid 1.1s ease-in-out infinite" }}
      />
      <div
        className={`absolute inset-4 rounded-md ${core}`}
        style={{ animation: "geom_core 1.1s ease-in-out infinite" }}
      />

      {/* Orbiting data points */}
      <div
        className="absolute -inset-2 rounded-full"
        style={{ animation: "geom_orbit 1.25s linear infinite" }}
      >
        <div className={"absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full " + (accent === "brand" ? "bg-red-600" : "bg-gray-900/60")} />
        <div className={"absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full " + (accent === "brand" ? "bg-red-600/70" : "bg-gray-900/40")} />
        <div className={"absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full " + (accent === "brand" ? "bg-red-600/40" : "bg-gray-900/30")} />
      </div>

      <style>{`
        @keyframes geom_orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

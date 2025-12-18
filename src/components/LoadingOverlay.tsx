import React from "react";

type LoadingOverlayProps = {
  open: boolean;
  message?: string;
};

export default function LoadingOverlay({ open, message = "Please wait…" }: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-6 w-full max-w-sm rounded-2xl border bg-card p-8 text-card-foreground shadow-md">
        <div className="flex flex-col items-center gap-5 text-center">
          <GeometricLoader />
          <div className="space-y-1">
            <div className="text-base font-semibold">Securing your submission</div>
            <div className="text-sm opacity-80">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeometricLoader() {
  return (
    <div className="relative h-14 w-14" aria-hidden="true">
      <div
        className="absolute inset-0 rounded-xl border-4 border-foreground/25 animate-[geom_outer_1.1s_ease-in-out_infinite]"
      />
      <div
        className="absolute inset-2 rounded-lg border-4 border-foreground/40 animate-[geom_mid_1.1s_ease-in-out_infinite]"
      />
      <div
        className="absolute inset-4 rounded-md bg-foreground/60 animate-[geom_core_1.1s_ease-in-out_infinite]"
      />
    </div>
  );
}

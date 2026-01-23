import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Dev-only console filter to reduce noise from SES lockdown.
if (import.meta.env.DEV) {
  const suppressed = "SES Removing unpermitted intrinsics";
  const wrap = (fn: typeof console.log) =>
    (...args: unknown[]) => {
      if (args.some(arg => typeof arg === "string" && arg.includes(suppressed))) return;
      fn(...args);
    };

  console.log = wrap(console.log);
  console.info = wrap(console.info);
  console.warn = wrap(console.warn);
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

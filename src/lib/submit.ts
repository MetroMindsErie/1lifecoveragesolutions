import { z } from "zod";
import { supabase } from "./supabaseClient";

const baseSchema = z.object({
  name: z.string().min(2, "Name too short").optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().min(7, "Phone too short").optional(),
});

const honeypotFields = ["hp_company", "hp_url"];

function sanitizeValue(v: any) {
  if (typeof v !== "string") return v;
  // basic sanitation against scripts
  return v.replace(/<\s*script/gi, "").slice(0, 2000);
}

function serializeForm(form: HTMLFormElement) {
  const obj: Record<string, any> = {};
  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"));
  let idx = 0;
  for (const el of fields) {
    const type = (el as HTMLInputElement).type;
    if (type === "password" || type === "file") continue;
    const name = el.getAttribute("name") || el.getAttribute("aria-label") || el.getAttribute("placeholder") || `${el.tagName.toLowerCase()}_${idx++}`;
    if ((el as HTMLInputElement).checked !== undefined && (type === "checkbox" || type === "radio")) {
      obj[name] = (el as HTMLInputElement).checked;
    } else {
      obj[name] = sanitizeValue((el as any).value ?? "");
    }
  }
  return obj;
}

function getAttribution() {
  const ft = (() => {
    try { return JSON.parse(sessionStorage.getItem("ga_first_touch") || "{}"); } catch { return {}; }
  })();
  return {
    referrer: document.referrer || "",
    utm: ft,
    user_agent: navigator.userAgent,
    submitted_from_path: window.location.pathname + window.location.search,
  };
}

export async function submitQuote(quoteType: string, form: HTMLFormElement) {
  // Honeypot
  for (const hp of honeypotFields) {
    const el = form.querySelector<HTMLInputElement>(`[name="${hp}"]`);
    if (el && el.value) throw new Error("Bot detected.");
  }
  const payload = serializeForm(form);

  // Minimal identity inference
  const name = payload.name || payload["Full Name"] || payload["full_name"] || undefined;
  const email = payload.email || payload["Email Address"] || payload["email_address"] || undefined;
  const phone = payload.phone || payload["Phone Number"] || payload["phone_number"] || undefined;

  const idCheck = baseSchema.refine((d) => !!(d.email || d.phone), {
    message: "Provide email or phone.",
    path: ["email"],
  });

  idCheck.parse({ name, email, phone }); // throws on invalid

  const { referrer, utm, user_agent, submitted_from_path } = getAttribution();
  const { error } = await supabase.from("quotes").insert([{
    quote_type: quoteType,
    name, email, phone,
    payload,
    referrer,
    utm,
    user_agent,
    submitted_from_path,
  }]);

  if (error) throw error;
  return true;
}

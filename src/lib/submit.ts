import { sanitizeFormData, validateInput, checkRateLimit, verifyHoneypot, isValidEmail, isValidPhone } from './formSecurity';
import { executeTurnstileInvisible } from './turnstile';

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

function tableForQuoteType(quoteType: string) {
  switch (quoteType) {
    case "auto": return "auto_quotes";
    case "homeowners": return "homeowners_quotes";
    case "umbrella": return "umbrella_quotes";
    case "life": return "life_quotes";
    case "commercial-building": return "commercial_building_quotes";
    case "bop": return "bop_quotes";
    case "renters": return "renters_quotes";
    case "pet": return "pet_quotes";
    default: return "quotes"; // legacy fallback
  }
}

export async function submitQuote(quoteType: string, form: HTMLFormElement) {
  const formData = new FormData(form);
  const data: Record<string, string> = {};

  formData.forEach((value, key) => {
    data[key] = value.toString();
  });

  // 1. Verify honeypot fields
  if (!verifyHoneypot(data.hp_company || '', data.hp_url || '')) {
    throw new Error('Suspicious activity detected');
  }

  // 2. Rate limiting check
  const identifier = data.email || `${Date.now()}-${Math.random()}`;
  if (!checkRateLimit(identifier)) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }

  // 3. Validate critical fields
  if (data.email && !isValidEmail(data.email)) {
    throw new Error('Please enter a valid email address');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    throw new Error('Please enter a valid phone number');
  }

  // 4. Validate all inputs for malicious content
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('hp_')) continue;

    const validation = validateInput(value, key);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid input detected');
    }
  }

  // 5. Sanitize all inputs
  const sanitizedData = sanitizeFormData(data) as Record<string, any>;

  // 5.5 Ensure Turnstile token exists (Edge Function requires it)
  if (!sanitizedData.turnstile_token) {
    const token = await executeTurnstileInvisible();
    if (!token) {
      throw new Error('Security check failed. Please try again.');
    }
    sanitizedData.turnstile_token = token;
  }

  // Ensure user-submitted quote_type cannot override routing
  delete (sanitizedData as any).quote_type;

  // 6. Add metadata (server routing depends on this)
  sanitizedData.quote_type = quoteType;
  sanitizedData.referrer = document.referrer || '';
  sanitizedData.submitted_from_path = window.location.pathname + window.location.search;
  sanitizedData.user_agent = navigator.userAgent;

  // 7. Get UTM parameters from sessionStorage
  try {
    const firstTouch = JSON.parse(sessionStorage.getItem('ga_first_touch') || '{}');
    sanitizedData.utm = firstTouch;
  } catch {
    sanitizedData.utm = {};
  }

  // 8. Submit to Edge Function
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;

  const response = await fetch(`${supabaseUrl}/functions/v1/submit-quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(import.meta as any).env?.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(sanitizedData),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error((responseData as any).message || (responseData as any).error || 'Submission failed');
  }

  return responseData;
}
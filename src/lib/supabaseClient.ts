import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function clearSupabaseLocalAuth() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith("sb-") || k.includes("supabase"))
      .forEach(k => localStorage.removeItem(k));
  } catch {}
  try {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith("sb-") || k.includes("supabase"))
      .forEach(k => sessionStorage.removeItem(k));
  } catch {}
}

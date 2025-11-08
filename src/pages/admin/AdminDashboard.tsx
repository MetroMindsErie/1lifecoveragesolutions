import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { X, Mail, Phone, Copy, ExternalLink } from "lucide-react"; // NEW
import { useNavigate, useLocation } from "react-router-dom"; // NEW

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // NEW: no legacy mode – only typed tables
  // NEW: local UI state for collapsing tech/payload
  const [showTech, setShowTech] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // NEW: tabs + GA state
  const [tab, setTab] = useState<"overview" | "quotes" | "contacts" | "settings">("overview");
  const GA_CLIENT_ID = (import.meta as any).env?.VITE_GA_CLIENT_ID;
  const GA_PROPERTY_ID = (import.meta as any).env?.VITE_GA_PROPERTY_ID;
  const [gaToken, setGaToken] = useState<string | null>(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [gaError, setGaError] = useState<string | null>(null);
  const [gaActiveUsers, setGaActiveUsers] = useState<number | null>(null);
  const [gaPageViews7d, setGaPageViews7d] = useState<number | null>(null);
  const [gaTopPages, setGaTopPages] = useState<{ path: string; views: number }[]>([]);

  // BRANDING
  const brand = {
    primary: "#1B5A8E",
    primaryDark: "#144669",
    accentA: "#06b6d4",
    accentB: "#4f46e5",
    bgSoft: "from-white via-[#E9F3FB] to-[#D9ECFF]"
  };

  // BODY SCROLL LOCK when drawer open
  // useEffect(() => {
  //   if (drawerOpen) {
  //     lockBodyScroll();
  //   } else {
  //     unlockBodyScroll();
  //   }
  // }, [drawerOpen]);

  // NEW: ESC to close drawer
  // useEffect(() => {
  //   if (!drawerOpen) return;
  //   const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
  //   window.addEventListener("keydown", onKey);
  //   return () => window.removeEventListener("keydown", onKey);
  // }, [drawerOpen]);

  // When drawer opens ensure internal scroll top & focus (do not touch page scroll)
  // useEffect(() => {
  //   if (!drawerOpen) return;
  //   try { drawerContentRef.current?.scrollTo({ top: 0 }); } catch {}
  //   drawerPanelRef.current?.focus();
  // }, [drawerOpen, selectedQuote, selectedContact]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, sess: any) => setSession(sess));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) { setIsAdmin(null); return; }
      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (error) { setIsAdmin(false); return; }
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [session]);

  const [authLoading, setAuthLoading] = useState(false); // NEW
  const [fetchError, setFetchError] = useState<string | null>(null); // NEW

  // NEW: helper to hard-clear local tokens (Supabase sometimes leaves stale session in prod)
  function hardClearSupabaseAuth() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith("sb-") || k.includes("supabase"))
        .forEach(k => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter(k => k.startsWith("sb-") || k.includes("supabase"))
        .forEach(k => sessionStorage.removeItem(k));
    } catch {}
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    if (data.session) setSession(data.session);
  }

  // NEW: full signOut
  async function signOut() {
    setAuthLoading(true);
    await supabase.auth.signOut();
    hardClearSupabaseAuth();
    const { data } = await supabase.auth.getSession();
    setSession(data.session); // should be null
    setIsAdmin(null);
    setQuotes([]);
    setContacts([]);
    setAuthLoading(false);
  }

  async function grantAdminAccess() {
    if (!session?.user?.id) return;
    setLoading(true);
    const { error } = await supabase.rpc("grant_self_admin");
    setLoading(false);
    if (error) {
      alert(`Unable to grant admin. Ask an admin to add you.\n\n${error.message}`);
    } else {
      setIsAdmin(true);
      fetchData();
    }
  }

  // REPLACE fetchData (remove legacy logic)
  async function fetchData() {
    if (!session || isAdmin !== true) return; // NEW guard
    setLoading(true);
    setFetchError(null);
    const tables: { tbl: string; type: string }[] = [
      { tbl: "auto_quotes", type: "auto" },
      { tbl: "homeowners_quotes", type: "homeowners" },
      { tbl: "umbrella_quotes", type: "umbrella" },
      { tbl: "life_quotes", type: "life" },
      { tbl: "commercial_building_quotes", type: "commercial-building" },
      { tbl: "bop_quotes", type: "bop" },
    ];

    const requests = tables.map(t =>
      supabase.from(t.tbl).select("*").order("created_at", { ascending: false }).limit(150)
    );
    const contactsQry = supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(200);

    const results = await Promise.all([...requests, contactsQry]);
    const contactRes = results.pop() as any;
    if (contactRes?.error) setFetchError(contactRes.error.message);
    setContacts(contactRes?.data || []);

    const combined: any[] = [];
    results.forEach((r, idx) => {
      const { error, data } = r as any;
      if (error && !fetchError) setFetchError(error.message);
      const meta = tables[idx];
      if (error) return;
      (data || []).forEach((row: any) => {
        combined.push({ ...row, quote_type: meta.type, srcTable: meta.tbl });
      });
    });

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setQuotes(combined);
    setLoading(false);
  }

  useEffect(() => { if (session && isAdmin === true) fetchData(); }, [session, isAdmin]);

  // Compute overview stats
  const overview = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const quotesToday = quotes.filter(q => q.created_at?.startsWith(today)).length;
    const contactsToday = contacts.filter(c => c.created_at?.startsWith(today)).length;
    
    const typeCount: Record<string, number> = {};
    quotes.forEach(q => {
      const t = q.quote_type || "unknown";
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    const topTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    const sourceCount: Record<string, number> = {};
    [...quotes, ...contacts].forEach(r => {
      const s = r.utm?.source || r.referrer || "direct";
      sourceCount[s] = (sourceCount[s] || 0) + 1;
    });
    const topSources = Object.entries(sourceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    return {
      quotesTotal: quotes.length,
      quotesToday,
      contactsTotal: contacts.length,
      contactsToday,
      topTypes,
      topSources,
    };
  }, [quotes, contacts]);

  // NEW: label helpers for quote detail sections
  function prettyLabel(raw: string) {
    return raw
      .replace(/_/g, " ")
      .replace(/\b\d\b/g, m => m) // keep simple numbers
      .replace(/\b([a-z])/gi, s => s.toUpperCase());
  }
  function sectionize(q: any) {
    if (!q) return [];
    const payload = q.payload || {};
    const already = new Set<string>();

    const pushItems = (keys: string[], title: string) => {
      const items = keys
        .filter(k => q[k] !== undefined && q[k] !== null && String(q[k]).trim() !== "")
        .map(k => {
          already.add(k);
          return { label: prettyLabel(k), value: q[k] };
        });
      if (items.length) sections.push({ title, items });
    };

    const sections: { title: string; items: { label: string; value: any }[] }[] = [];

    switch (q.srcTable) {
      case "auto_quotes":
        pushItems(
          ["name","email","phone","address","dob","drivers_license_number","primary_residence","occupation","education_level"],
          "Client Information"
        );
        pushItems(
          ["vehicle_1","vehicle_2","vehicle_3","primary_vehicle_use","ownership_length","commute_one_way_miles","commute_days_per_week","annual_miles","rideshare_use"],
          "Vehicle Information"
        );
        pushItems(
          ["additional_driver_1","additional_driver_2","additional_driver_3"],
          "Additional Drivers"
        );
        pushItems(
          ["currently_insured","current_policy_expiration","interested_in_other_coverages","referral_source"],
          "Other / Referral"
        );
        break;
      case "homeowners_quotes":
        pushItems(
          ["name","email","phone","property_address","mailing_address","dob","drivers_license_number"],
          "Client & Property"
        );
        pushItems(
          ["home_type","year_built","square_footage","stories","roof_type_year","foundation_type","basement_finished","exterior_construction","heating_type","heating_age_years","fireplace_or_woodstove","garage","garage_capacity"],
          "Physical Details"
        );
        pushItems(
          ["central_fire_alarm","central_burglar_alarm","fire_extinguisher","deadbolts","pool","pool_fenced","pool_type","trampoline"],
          "Safety Features"
        );
        pushItems(
          ["pets_have","pets_type","pets_count","dog_breeds","pets_bite_history"],
          "Pets"
        );
        pushItems(
          ["current_carrier","policy_expiration","current_dwelling_coverage","desired_deductible","claims_last_5_years","claims_description","additional_coverages","referral_source"],
          "Coverage & History"
        );
        break;
      case "umbrella_quotes":
        pushItems(
          ["name","email","phone","address","dob","drivers_license_number"],
          "Client Information"
        );
        pushItems(
          ["current_coverages","current_coverage_limits","policy_expiration","household_drivers","household_vehicles","valuables_description","rental_properties","watercraft"],
          "Household & Existing Coverage"
        );
        pushItems(
          ["pets_have","pets_type","pets_count","dog_breeds","pets_bite_history"],
          "Pets"
        );
        pushItems(
          ["desired_limit","desired_deductible","prior_claims","prior_claims_description","additional_quotes_interest","referral_source"],
          "Umbrella Request"
        );
        break;
      case "life_quotes":
        pushItems(
          ["name","dob","gender","phone","email","address","occupation"],
          "Personal Information"
        );
        pushItems(
          ["policy_type","coverage_amount","term_years","beneficiaries","current_policies","current_policies_details","applications_pending"],
          "Coverage Request"
        );
        pushItems(
          ["height","weight","tobacco_use","alcohol_use","medical_conditions","medications","hospitalizations","family_history"],
          "Health"
        );
        pushItems(
          ["high_risk_hobbies","travel","referral_source"],
          "Lifestyle & Referral"
        );
        break;
      case "commercial_building_quotes":
        pushItems(
          ["name","business_name_or_owner","property_address","phone","email","own_or_rent","property_type","year_built","stories","square_footage","construction_type","roof_type_age","foundation_type","sprinklers","security_systems","hazardous_materials"],
          "Property / Construction"
        );
        pushItems(
          ["primary_use","units_tenants","occupancy_type","business_hours","seasonal"],
          "Occupancy & Use"
        );
        pushItems(
          ["current_carrier","policy_expiration","building_coverage","tenant_improvements","liability_coverage","deductible","additional_coverage","prior_claims","prior_claims_description","referral_source"],
          "Coverage & History"
        );
        break;
      case "bop_quotes":
        pushItems(
          ["business_name","business_address","phone","email","business_type","fein","years_in_business","employees","website","contact_name","contact_title","contact_phone","contact_email"],
          "Business & Contact"
        );
        pushItems(
          ["property_address","property_type","building_construction","year_built","stories","square_footage","sprinklers","security_systems","hazardous_materials"],
          "Property"
        );
        pushItems(
          ["annual_revenue","annual_payroll","locations","business_hours","seasonal","prior_claims","prior_claims_description"],
          "Operations & History"
        );
        pushItems(
          ["desired_coverage_types","coverage_limits","deductible","vehicles_for_operations","subcontractors","special_endorsements","referral_source"],
          "Coverage Request"
        );
        break;
      default:
        // fallback – show mapped basics only
        pushItems(["name","email","phone","referral_source"], "Details");
    }

    // Add unmapped payload extras
    const extras = Object.entries(payload)
      .filter(([k, v]) => v && String(v).trim() !== "" && !already.has(k))
      .map(([k, v]) => ({ label: prettyLabel(k), value: v }));
    if (extras.length) sections.push({ title: "Additional Submitted Fields", items: extras });

    return sections;
  }

  // NEW: Google Analytics - OAuth & fetch
  function ensureGis(): Promise<void> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      if (window.google?.accounts?.oauth2) return resolve();
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(s);
    });
  }

  async function connectGoogleAnalytics() {
    if (!GA_CLIENT_ID || !GA_PROPERTY_ID) {
      setGaError("Missing VITE_GA_CLIENT_ID or VITE_GA_PROPERTY_ID.");
      return;
    }
    setGaError(null);
    await ensureGis();
    // @ts-ignore
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GA_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      callback: async (resp: any) => {
        if (resp.error) { setGaError(resp.error); return; }
        setGaToken(resp.access_token);
        await fetchGaMetrics(resp.access_token);
      },
    });
    // @ts-ignore
    tokenClient.requestAccessToken();
  }

  async function fetchGaMetrics(token?: string | null) {
    if (!GA_PROPERTY_ID) return;
    const accessToken = token || gaToken;
    if (!accessToken) return;
    setGaLoading(true);
    setGaError(null);
    try {
      // Realtime active users
      const rt = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runRealtimeReport`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
        }
      ).then(r => r.json());
      const active = Number(rt?.rows?.[0]?.metricValues?.[0]?.value || 0);
      setGaActiveUsers(Number.isFinite(active) ? active : 0);

      // 7d page views
      const pv = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            metrics: [{ name: "screenPageViews" }],
          }),
        }
      ).then(r => r.json());
      const views7d = Number(pv?.rows?.[0]?.metricValues?.[0]?.value || 0);
      setGaPageViews7d(Number.isFinite(views7d) ? views7d : 0);

      // Top pages (7d)
      const top = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [{ desc: true, metric: { metricName: "screenPageViews" } }],
            limit: 5,
          }),
        }
      ).then(r => r.json());
      const topRows = (top?.rows || []).map((r: any) => ({
        path: r.dimensionValues?.[0]?.value || "/",
        views: Number(r.metricValues?.[0]?.value || 0),
      }));
      setGaTopPages(topRows);
    } catch (e: any) {
      setGaError(e?.message || "Failed to load GA data");
    } finally {
      setGaLoading(false);
    }
  }

  // NEW: helpers
  const copyToClipboard = async (val?: string | null) => {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      alert("Copied to clipboard");
    } catch {
      /* noop */
    }
  };

  const navigate = useNavigate(); // NEW
  const location = useLocation(); // NEW

  // REPLACE openQuote/openContact to route
  const openQuote = (row: any) => {
    // navigate to quote detail page with srcTable + id
    navigate(`/admin/quotes/${row.srcTable}/${row.id}`);
  };
  const openContact = (row: any) => {
    // navigate to contact details page
    navigate(`/admin/contacts/${row.id}`);
  };

  // REMOVE updateQuoteStatus here if only used in drawer; it remains used in detail page
  // ...existing code...

  // NEW: read tab from URL query on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tab");
    if (t && ["overview", "quotes", "contacts", "settings"].includes(t)) {
      // @ts-ignore
      setTab(t);
    }
  }, []); // run once

  useEffect(() => {
    // NEW: write current tab into URL (preserve other params)
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    const next = `${location.pathname}?${params.toString()}`;
    if (next !== location.pathname + location.search) {
      window.history.replaceState({}, "", next);
    }
  }, [tab, location.pathname, location.search]);

  // AUTH GATES (NEW)
  const showLogin = !session;
  const showGrantAdmin = !!session && isAdmin === false;
  const showDashboard = !!session && isAdmin === true;

  // EARLY RETURN: login form
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF] p-6">
        <form
          onSubmit={signIn}
          className="w-full max-w-sm space-y-4 rounded-xl border border-white/60 bg-white/80 backdrop-blur p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-[#1B5A8E]">Admin Login</h1>
          {!GA_CLIENT_ID || !GA_PROPERTY_ID ? (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800">
              Missing GA env vars (VITE_GA_CLIENT_ID / VITE_GA_PROPERTY_ID). Set these in Vercel for Analytics.
            </div>
          ) : null}
          {!(import.meta as any).env?.VITE_SUPABASE_URL || !(import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700">
              Supabase env vars missing in production. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
            </div>
          ) : null}
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full rounded border border-gray-300 bg-white/90 px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full rounded border border-gray-300 bg-white/90 px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#1B5A8E] hover:bg-[#144669]"
          >
            {authLoading ? "Signing in…" : "Sign In"}
          </Button>
          <p className="text-[11px] text-gray-500">
            Authorized users only. Contact an existing admin to be added.
          </p>
        </form>
      </div>
    );
  }

  // GRANT ADMIN VIEW
  if (showGrantAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF] p-6">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 shadow">
          <h1 className="text-lg font-semibold text-[#1B5A8E]">Admin Access Required</h1>
            <p className="text-sm text-yellow-900">
              You are signed in but not recognized as an admin. (Dev only) click to grant yourself admin.
            </p>
          <div className="flex gap-2">
            <Button onClick={grantAdminAccess} disabled={loading} className="bg-[#1B5A8E] hover:bg-[#144669]">
              {loading ? "Granting…" : "Grant Admin"}
            </Button>
            <Button variant="outline" onClick={signOut} disabled={authLoading}>
              {authLoading ? "Signing out…" : "Sign Out"}
            </Button>
          </div>
          <p className="text-[11px] text-gray-600">
            Remove self-grant in production for security.
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD (wrap existing content)
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF]">
      {/* Ambient pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_30%,rgba(27,90,142,0.12),transparent_70%)]" />
      {/* Main container */}
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header / controls */}
        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-md shadow-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={fetchData} disabled={loading || !isAdmin} className="bg-[#1B5A8E] hover:bg-[#144669]">Refresh</Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()} className="hover:bg-white/50">Sign Out</Button>
          </div>
        </div>

        {/* Grant admin message */}
        {isAdmin === false && (
          <div className="rounded-lg border border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 text-sm text-yellow-900 shadow">
            <div className="flex items-center justify-between gap-4">
              <p>Grant yourself admin to view data.</p>
              <Button onClick={grantAdminAccess} disabled={loading} className="bg-[#1B5A8E] hover:bg-[#144669]">
                {loading ? "Granting…" : "Grant Admin Access"}
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {["overview","quotes","contacts","settings"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-4 py-2 text-sm rounded-full border transition
                ${tab===t
                  ? "border-[#1B5A8E] bg-[#1B5A8E] text-white shadow"
                  : "border-transparent bg-white/60 text-gray-600 hover:border-[#1B5A8E] hover:text-[#1B5A8E]"}`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Quotes (Total)", val: overview.quotesTotal, sub: `Today: ${overview.quotesToday}` },
                { label: "Contacts (Total)", val: overview.contactsTotal, sub: `Today: ${overview.contactsToday}` },
                { label: "GA Active Users", val: gaActiveUsers ?? "-", sub: (
                  <Button size="sm" variant="outline" onClick={() => gaToken ? fetchGaMetrics() : connectGoogleAnalytics()} disabled={gaLoading} className="mt-2 border-[#1B5A8E] text-[#1B5A8E]">
                    {gaToken ? (gaLoading ? "Refreshing…" : "Refresh") : "Connect GA"}
                  </Button>
                ) },
                { label: "GA Page Views (7d)", val: gaPageViews7d ?? "-", sub: gaError ? <span className="text-xs text-red-600">{gaError}</span> : null },
              ].map((m,i) => (
                <div key={i} className="rounded-xl border border-white/50 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md p-4 shadow-sm">
                  <div className="text-xs text-gray-500">{m.label}</div>
                  <div className="text-2xl font-semibold text-[#1B5A8E]">{m.val}</div>
                  {m.sub && <div className="text-xs text-gray-600">{m.sub}</div>}
                </div>
              ))}
            </div>

            {/* Top Types & Sources */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-4">
                <h3 className="mb-3 text-sm font-semibold text-[#1B5A8E]">Top Quote Types</h3>
                <ul className="space-y-2">
                  {overview.topTypes.map(([k,v], idx) => (
                    <li key={k} className="flex items-center gap-3">
                      <span className="w-32 text-xs font-medium capitalize text-gray-700">{k}</span>
                      <div className="h-2 flex-1 rounded bg-gray-100 overflow-hidden">
                        <div className="h-full rounded bg-gradient-to-r from-[#1B5A8E] to-[#4f46e5]" style={{ width: `${(Number(v)/Math.max(1, Number(overview.topTypes[0]?.[1]||1)))*100}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs text-gray-600">{v}</span>
                    </li>
                  ))}
                  {overview.topTypes.length === 0 && <div className="text-xs text-gray-500">No data yet.</div>}
                </ul>
              </div>
              <div className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-4">
                <h3 className="mb-3 text-sm font-semibold text-[#1B5A8E]">Top Sources</h3>
                <ul className="space-y-2">
                  {overview.topSources.map(([k,v]) => (
                    <li key={k} className="flex items-center gap-3">
                      <span className="w-32 text-xs font-medium lowercase text-gray-700">{k}</span>
                      <div className="h-2 flex-1 rounded bg-gray-100 overflow-hidden">
                        <div className="h-full rounded bg-gradient-to-r from-[#06b6d4] to-[#4f46e5]" style={{ width: `${(Number(v)/Math.max(1, Number(overview.topSources[0]?.[1]||1)))*100}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs text-gray-600">{v}</span>
                    </li>
                  ))}
                  {overview.topSources.length === 0 && <div className="text-xs text-gray-500">No data yet.</div>}
                </ul>
              </div>
            </div>

            {/* GA Top Pages */}
            <div className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1B5A8E]">GA Top Pages (7d)</h3>
                <Button size="sm" variant="outline" onClick={() => gaToken ? fetchGaMetrics() : connectGoogleAnalytics()} disabled={gaLoading} className="border-[#1B5A8E] text-[#1B5A8E]">
                  {gaToken ? (gaLoading ? "Refreshing…" : "Refresh") : "Connect GA"}
                </Button>
              </div>
              {gaTopPages.length === 0 ? (
                <div className="text-xs text-gray-500">No GA data loaded.</div>
              ) : (
                <div className="overflow-auto rounded-lg border border-gray-100">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-2 text-left">Path</th>
                        <th className="p-2 text-right w-24">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaTopPages.map(r => (
                        <tr key={r.path} className="border-t hover:bg-gray-50">
                          <td className="p-2">{r.path}</td>
                          <td className="p-2 text-right">{r.views}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {gaError && <div className="mt-2 text-xs text-red-600">{gaError}</div>}
            </div>
          </div>
        )}

        {/* QUOTES TABLE (desktop) */}
        {tab === "quotes" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-4">
              <h2 className="mb-3 text-lg font-semibold text-[#1B5A8E]">Recent Quotes</h2>
              {/* MOBILE CARD LIST */}
              <div className="sm:hidden space-y-3">
                {quotes.map(r => (
                  <div key={r.id} onClick={() => openQuote(r)} className="rounded-lg border border-gray-200 bg-white/90 p-3 shadow-sm active:scale-[.99] transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-[#1B5A8E]">{r.name || "Unnamed"}</div>
                        <div className="text-[11px] text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full
                        ${r.quote_type === "auto" ? "bg-[#1B5A8E]/10 text-[#1B5A8E]" :
                           r.quote_type === "homeowners" ? "bg-[#4f46e5]/10 text-[#4f46e5]" :
                           r.quote_type === "umbrella" ? "bg-[#06b6d4]/10 text-[#06b6d4]" :
                           r.quote_type === "life" ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" :
                           r.quote_type === "commercial-building" ? "bg-[#f59e0b]/10 text-[#b45309]" :
                           r.quote_type === "bop" ? "bg-[#10b981]/10 text-[#0d8c60]" :
                           "bg-gray-200 text-gray-600"}`}>
                        {r.quote_type}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      {r.email && <span>{r.email}</span>}
                      {r.phone && <span>{r.phone}</span>}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] 
                        ${r.status === "closed" ? "bg-green-100 text-green-700" :
                           r.status === "in_progress" ? "bg-yellow-100 text-yellow-700" :
                           "bg-gray-100 text-gray-700"}`}>
                        {r.status || "new"}
                      </span>
                    </div>
                  </div>
                ))}
                {quotes.length === 0 && <div className="text-xs text-gray-500">No quotes found.</div>}
              </div>
              {/* DESKTOP TABLE */}
              <div className="hidden sm:block overflow-auto rounded-lg border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-2 text-left">When</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Source</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map(r => (
                      <tr key={r.id} onClick={() => openQuote(r)} className="border-t hover:bg-gray-50 cursor-pointer">
                        <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="p-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium
                            ${r.quote_type === "auto" ? "bg-[#1B5A8E]/10 text-[#1B5A8E]" :
                               r.quote_type === "homeowners" ? "bg-[#4f46e5]/10 text-[#4f46e5]" :
                               r.quote_type === "umbrella" ? "bg-[#06b6d4]/10 text-[#06b6d4]" :
                               r.quote_type === "life" ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" :
                               r.quote_type === "commercial-building" ? "bg-[#f59e0b]/10 text-[#b45309]" :
                               r.quote_type === "bop" ? "bg-[#10b981]/10 text-[#0d8c60]" :
                               "bg-gray-200 text-gray-600"}`}>
                            {r.quote_type}
                          </span>
                        </td>
                        <td className="p-2">{r.name || "-"}</td>
                        <td className="p-2">{r.email || "-"}</td>
                        <td className="p-2">{r.phone || "-"}</td>
                        <td className="p-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px]
                            ${r.status === "closed" ? "bg-green-100 text-green-700" :
                               r.status === "in_progress" ? "bg-yellow-100 text-yellow-700" :
                               "bg-gray-100 text-gray-700"}`}>
                            {r.status || "new"}
                          </span>
                        </td>
                        <td className="p-2">{(r.utm?.source || r.referrer || "-")}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); openQuote(r); }}>View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {quotes.length === 0 && <div className="p-6 text-center text-xs text-gray-500">No quotes found.</div>}
              </div>
            </div>
          </div>
        )}

        {/* CONTACTS (similar mobile card treatment) */}
        {tab === "contacts" && (
          <div className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-4">
            <h2 className="mb-3 text-lg font-semibold text-[#1B5A8E]">Contact Requests</h2>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {contacts.map(r => {
                const displayName = ([r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.name || "Unnamed");
                const src = r?.utm?.source || r.referrer || "Direct";
                return (
                  <div key={r.id} onClick={() => openContact(r)} className="rounded-lg border border-gray-200 bg-white/90 p-3 shadow-sm cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[11px] text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                        <div className="text-sm font-medium text-[#1B5A8E]">{displayName}</div>
                      </div>
                      {r.subject && (
                        <span className="ml-2 inline-flex rounded-full bg-[#1B5A8E]/10 px-2 py-0.5 text-[10px] text-[#1B5A8E]">
                          {r.subject}
                        </span>
                      )}
                    </div>
                    {r.message && (
                      <div className="mt-2 text-xs text-gray-700">
                        {String(r.message).slice(0, 120)}
                        {String(r.message).length > 120 ? "…" : ""}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                      {r.email && <span>{r.email}</span>}
                      {r.phone && <span>• {r.phone}</span>}
                      <span className="ml-auto rounded bg-gray-100 px-2 py-0.5 text-gray-700">Source: {src === r.referrer ? "Referral" : src}</span>
                    </div>
                  </div>
                );
              })}
              {contacts.length === 0 && <div className="text-xs text-gray-500">No contacts found.</div>}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-2 text-left">When</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Subject</th>
                    <th className="p-2 text-left">Message</th> {/* NEW */}
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Source</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(r => {
                    const displayName = ([r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.name || "Unnamed");
                    const msg = (r.message || "") as string;
                    const src = r?.utm?.source || r.referrer || "Direct";
                    return (
                      <tr key={r.id} onClick={() => openContact(r)} className="border-t hover:bg-gray-50 cursor-pointer">
                        <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="p-2">{displayName}</td>
                        <td className="p-2">{r.subject || "-"}</td>
                        <td className="p-2 text-gray-700">{msg ? `${msg.slice(0, 60)}${msg.length > 60 ? "…" : ""}` : "-"}</td> {/* NEW */}
                        <td className="p-2">{r.email || "-"}</td>
                        <td className="p-2">{r.phone || "-"}</td>
                        <td className="p-2">{src === r.referrer ? "Referral" : src}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); openContact(r); }}>View</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {contacts.length === 0 && <div className="p-6 text-center text-xs text-gray-500">No contacts found.</div>}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="rounded-xl border border-white/50 bg-white/70 backdrop-blur p-4 space-y-4 text-sm">
            <div className="font-medium">Settings</div>
            <div className="rounded border p-3">
              <div className="mb-2 font-medium">Google Analytics Connection</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-gray-500">VITE_GA_CLIENT_ID</div>
                  <div className="font-mono text-xs break-all">{GA_CLIENT_ID || "(not set)"}</div>
                </div>
                <div>
                  <div className="text-gray-500">VITE_GA_PROPERTY_ID</div>
                  <div className="font-mono text-xs break-all">{GA_PROPERTY_ID || "(not set)"}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={connectGoogleAnalytics} disabled={gaLoading}>
                  {gaToken ? "Re-authorize" : "Authorize Google"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => fetchGaMetrics()} disabled={!gaToken || gaLoading}>
                  Fetch Metrics
                </Button>
              </div>
              {gaError && <div className="mt-2 text-xs text-red-600">{gaError}</div>}
            </div>
            <div className="rounded border p-3">
              <div className="mb-2 font-medium">Data</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={fetchData} disabled={loading || !isAdmin}>Refresh Tables</Button>
              </div>
            </div>
          </div>
        )}

        {/* Insert error banners */}
        <div className="mx-auto max-w-7xl px-6">
          {fetchError && (
            <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700">
              {fetchError}
              <div className="mt-1 text-[10px]">
                Ensure RLS SELECT policies exist for all typed quote tables & contacts and your user is in public.admins.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

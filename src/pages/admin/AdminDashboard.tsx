import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/button";
import {
  ChevronRight,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function setAdminHead() {
  const SITE = "1Life Coverage Solutions";
  const title = "Admin Dashboard";
  document.title = `${title} | ${SITE}`;
  let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!robots) { robots = document.createElement("meta"); robots.setAttribute("name", "robots"); document.head.appendChild(robots); }
  robots.setAttribute("content", "noindex,nofollow");
  // clear JSON-LD injected previously
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
}

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    } catch { }
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
      { tbl: "renters_quotes", type: "renters" },
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

  // Filtered Data
  const filteredQuotes = useMemo(() => {
    if (!searchQuery) return quotes;
    const lower = searchQuery.toLowerCase();
    return quotes.filter(q =>
      (q.name || "").toLowerCase().includes(lower) ||
      (q.email || "").toLowerCase().includes(lower) ||
      (q.phone || "").toLowerCase().includes(lower) ||
      (q.quote_type || "").toLowerCase().includes(lower)
    );
  }, [quotes, searchQuery]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const lower = searchQuery.toLowerCase();
    return contacts.filter(c =>
      (c.name || "").toLowerCase().includes(lower) ||
      (c.first_name || "").toLowerCase().includes(lower) ||
      (c.last_name || "").toLowerCase().includes(lower) ||
      (c.email || "").toLowerCase().includes(lower)
    );
  }, [contacts, searchQuery]);

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

  useEffect(() => {
    setAdminHead();
  }, []);

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

  // Login View
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to access the dashboard</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={signIn}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <input
                  type="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#1B5A8E] sm:text-sm sm:leading-6"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#1B5A8E] sm:text-sm sm:leading-6"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Button
                type="submit"
                disabled={authLoading}
                className="group relative flex w-full justify-center rounded-md bg-[#1B5A8E] px-3 py-3 text-sm font-semibold text-white hover:bg-[#144669] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5A8E]"
              >
                {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Grant Admin View
  if (showGrantAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-yellow-800">
            <Shield className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Admin Access Required</h1>
          </div>
          <p className="text-sm text-yellow-700">
            You are signed in but not recognized as an admin.
          </p>
          <div className="flex gap-3 pt-2">
            <Button onClick={grantAdminAccess} disabled={loading} className="bg-[#1B5A8E] hover:bg-[#144669]">
              {loading ? "Granting..." : "Grant Access (Dev)"}
            </Button>
            <Button variant="outline" onClick={signOut} disabled={authLoading}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD (modern layout)
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay (below top header) */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-50 w-64 border-r border-white/10 bg-[#1B5A8E] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="text-base font-semibold tracking-tight">1Life Admin</div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-white/80 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "quotes", label: "Quotes", icon: FileText },
              { id: "contacts", label: "Contacts", icon: Users },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  setTab(it.id as any);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === it.id
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="text-sm text-gray-500">Admin</div>
              <div className="truncate text-base font-semibold text-gray-900">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(tab === "quotes" || tab === "contacts") && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${tab}…`}
                  className="h-9 w-72 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-[#1B5A8E] focus:ring-1 focus:ring-[#1B5A8E]"
                />
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {(tab === "quotes" || tab === "contacts") && (
              <div className="sm:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${tab}…`}
                    className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#1B5A8E] focus:ring-1 focus:ring-[#1B5A8E]"
                  />
                </div>
              </div>
            )}

            {fetchError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <div className="font-semibold">Error loading data</div>
                    <div className="mt-1 text-red-700/80">{fetchError}</div>
                    <div className="mt-2 text-xs text-red-700/70">
                      Ensure RLS SELECT policies exist for all typed quote tables & contacts and your user is in public.admins.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Total Quotes", value: overview.quotesTotal, sub: `+${overview.quotesToday} today` },
                    { label: "Total Contacts", value: overview.contactsTotal, sub: `+${overview.contactsToday} today` },
                    { label: "Active Users (GA)", value: gaActiveUsers ?? "-", sub: "Real-time" },
                    { label: "Page Views (7d)", value: gaPageViews7d ?? "-", sub: "Last 7 days" },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-gray-200/60 bg-white p-6 shadow">
                      <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                      <div className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</div>
                      <div className="mt-1 text-xs text-gray-500">{stat.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-semibold text-gray-900">Analytics</div>
                      <div className="text-sm text-gray-500">Connect Google Analytics to view live metrics.</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => (gaToken ? fetchGaMetrics() : connectGoogleAnalytics())}
                        disabled={gaLoading}
                        className="bg-[#1B5A8E] hover:bg-[#144669]"
                      >
                        {gaToken ? (gaLoading ? "Refreshing…" : "Refresh GA") : "Connect GA"}
                      </Button>
                      {gaToken && (
                        <Button size="sm" variant="outline" onClick={() => setGaToken(null)} disabled={gaLoading}>
                          Disconnect
                        </Button>
                      )}
                    </div>
                  </div>
                  {gaError && <div className="mt-3 text-sm text-red-600">{gaError}</div>}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow">
                    <div className="text-base font-semibold text-gray-900">Top Quote Types</div>
                    <div className="mt-4 space-y-3">
                      {overview.topTypes.map(([type, count]) => (
                        <div key={type} className="flex items-center gap-4">
                          <div className="w-32 truncate text-sm font-medium text-gray-600 capitalize">{type}</div>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#1B5A8E]"
                              style={{ width: `${(Number(count) / Math.max(1, Number(overview.topTypes[0]?.[1] || 1))) * 100}%` }}
                            />
                          </div>
                          <div className="w-10 text-right text-sm text-gray-900">{count}</div>
                        </div>
                      ))}
                      {overview.topTypes.length === 0 && (
                        <div className="text-sm text-gray-500">No data yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow">
                    <div className="text-base font-semibold text-gray-900">Top Sources</div>
                    <div className="mt-4 space-y-3">
                      {overview.topSources.map(([source, count]) => (
                        <div key={source} className="rounded-lg border border-gray-200/60 bg-white px-4 py-3 shadow-sm">
                          <div className="truncate text-xs font-medium text-gray-600" title={source}>
                            {source}
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-[#1B5A8E]"
                                style={{ width: `${(Number(count) / Math.max(1, Number(overview.topSources[0]?.[1] || 1))) * 100}%` }}
                              />
                            </div>
                            <div className="w-10 text-right text-sm font-semibold text-gray-900">{count}</div>
                          </div>
                        </div>
                      ))}
                      {overview.topSources.length === 0 && (
                        <div className="text-sm text-gray-500">No data yet.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-gray-900">Top Pages (7d)</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => (gaToken ? fetchGaMetrics() : connectGoogleAnalytics())}
                      disabled={gaLoading}
                    >
                      {gaToken ? (gaLoading ? "Refreshing…" : "Refresh") : "Connect GA"}
                    </Button>
                  </div>
                  {gaTopPages.length === 0 ? (
                    <div className="mt-3 text-sm text-gray-500">No GA data loaded.</div>
                  ) : (
                    <div className="mt-4 overflow-auto rounded-lg border border-gray-200/60 bg-white shadow-sm">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left">Path</th>
                            <th className="px-4 py-2 text-right w-28">Views</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {gaTopPages.map((row) => (
                            <tr key={row.path} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{row.path}</td>
                              <td className="px-4 py-2 text-right">{row.views}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quotes */}
            {tab === "quotes" && (
              <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow">
                <div className="border-b px-6 py-4">
                  <div className="text-base font-semibold text-gray-900">Quotes</div>
                  <div className="text-sm text-gray-500">Click a row to view details.</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Phone</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-right"> </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredQuotes.map((q) => (
                        <tr
                          key={q.id}
                          onClick={() => openQuote(q)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                            {new Date(q.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-3">
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 capitalize">
                              {q.quote_type || "unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-medium text-gray-900">{q.name || "Unnamed"}</td>
                          <td className="px-6 py-3 text-gray-600">{q.email || "-"}</td>
                          <td className="px-6 py-3 text-gray-600">{q.phone || "-"}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${q.status === "closed"
                                ? "bg-green-50 text-green-700"
                                : q.status === "in_progress"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                              {q.status || "new"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <ChevronRight className="inline-block h-4 w-4 text-gray-400" />
                          </td>
                        </tr>
                      ))}
                      {filteredQuotes.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            No quotes found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts */}
            {tab === "contacts" && (
              <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow">
                <div className="border-b px-6 py-4">
                  <div className="text-base font-semibold text-gray-900">Contacts</div>
                  <div className="text-sm text-gray-500">Click a row to view details.</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Subject</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Phone</th>
                        <th className="px-6 py-3 text-right"> </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredContacts.map((c) => {
                        const displayName = ([c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.name || "Unnamed");
                        return (
                          <tr
                            key={c.id}
                            onClick={() => openContact(c)}
                            className="cursor-pointer hover:bg-gray-50"
                          >
                            <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                              {new Date(c.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 font-medium text-gray-900">{displayName}</td>
                            <td className="px-6 py-3 text-gray-600">{c.subject || "-"}</td>
                            <td className="px-6 py-3 text-gray-600">{c.email || "-"}</td>
                            <td className="px-6 py-3 text-gray-600">{c.phone || "-"}</td>
                            <td className="px-6 py-3 text-right">
                              <ChevronRight className="inline-block h-4 w-4 text-gray-400" />
                            </td>
                          </tr>
                        );
                      })}
                      {filteredContacts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No contacts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings */}
            {tab === "settings" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow">
                  <div className="text-base font-semibold text-gray-900">Google Analytics</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200/60 bg-gray-50 p-4">
                      <div className="text-xs text-gray-500">VITE_GA_CLIENT_ID</div>
                      <div className="mt-1 break-all font-mono text-xs text-gray-800">{GA_CLIENT_ID || "(not set)"}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200/60 bg-gray-50 p-4">
                      <div className="text-xs text-gray-500">VITE_GA_PROPERTY_ID</div>
                      <div className="mt-1 break-all font-mono text-xs text-gray-800">{GA_PROPERTY_ID || "(not set)"}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={connectGoogleAnalytics}
                      disabled={gaLoading}
                      className="bg-[#1B5A8E] hover:bg-[#144669]"
                    >
                      {gaToken ? "Re-authorize" : "Authorize Google"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchGaMetrics()}
                      disabled={!gaToken || gaLoading}
                    >
                      Fetch Metrics
                    </Button>
                  </div>
                  {gaError && <div className="mt-3 text-sm text-red-600">{gaError}</div>}
                </div>

                <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow">
                  <div className="text-base font-semibold text-gray-900">Data</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={fetchData} disabled={loading || !isAdmin} className="bg-[#1B5A8E] hover:bg-[#144669]">
                      Refresh Tables
                    </Button>
                    <Button size="sm" variant="outline" onClick={signOut} disabled={authLoading}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

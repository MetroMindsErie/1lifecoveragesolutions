import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { X, Mail, Phone, Copy, ExternalLink } from "lucide-react"; // NEW

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

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

  // NEW: detail drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"quote" | "contact" | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

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

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert(error.message);
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

  async function loadDemoData() {
    setLoading(true);
    const { error } = await supabase.rpc("seed_demo_data");
    setLoading(false);
    if (error) {
      alert(`Seeding failed.\n\n${error.message}`);
    } else {
      fetchData();
    }
  }

  async function fetchData() {
    setLoading(true);
    const like = q ? `%${q}%` : null;
    const quotesQry = supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(200);
    const contactsQry = supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(200);
    const q1 = like ? quotesQry.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like},quote_type.ilike.${like}`) : quotesQry;
    const q2 = like ? contactsQry.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like}`) : contactsQry;
    const [{ data: qd, error: qe }, { data: cd, error: ce }] = await Promise.all([q1, q2]);
    setLoading(false);
    if (qe) alert(qe.message);
    if (ce) alert(ce.message);
    setQuotes(qd || []);
    setContacts(cd || []);
  }

  useEffect(() => { if (session && isAdmin) fetchData(); }, [session, isAdmin]);

  // NEW: derived metrics for Overview
  const overview = useMemo(() => {
    const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
    const toDate = (v: any) => v ? new Date(v) : null;

    const quotesToday = quotes.filter(r => {
      const d = toDate(r.created_at); return d ? d >= startOfToday : false;
    }).length;
    const contactsToday = contacts.filter(r => {
      const d = toDate(r.created_at); return d ? d >= startOfToday : false;
    }).length;

    const byType: Record<string, number> = {};
    quotes.forEach(r => { byType[r.quote_type] = (byType[r.quote_type] || 0) + 1; });

    const bySource: Record<string, number> = {};
    [...quotes, ...contacts].forEach(r => {
      const src = (r.utm && (r.utm.source || r.utm.utm_source)) || r.referrer || "direct";
      bySource[String(src || "direct").toLowerCase()] = (bySource[String(src || "direct").toLowerCase()] || 0) + 1;
    });

    const topSources = Object.entries(bySource).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topTypes = Object.entries(byType).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return {
      quotesTotal: quotes.length,
      contactsTotal: contacts.length,
      quotesToday,
      contactsToday,
      topSources,
      topTypes,
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

  const openQuote = (row: any) => {
    setSelectedQuote(row);
    setSelectedContact(null);
    setDrawerType("quote");
    setDrawerOpen(true);
  };
  const openContact = (row: any) => {
    setSelectedContact(row);
    setSelectedQuote(null);
    setDrawerType("contact");
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedQuote(null);
    setSelectedContact(null);
    setDrawerType(null);
  };

  async function updateQuoteStatus(id: string, next: string) {
    if (!id || !isAdmin) return;
    setStatusSaving(true);
    const { error } = await supabase.from("quotes").update({ status: next }).eq("id", id);
    setStatusSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    // update local state
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status: next } : q)));
    setSelectedQuote((prev: any) => (prev ? { ...prev, status: next } : prev));
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 text-xl">Admin Sign In</h1>
        <form onSubmit={signIn} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" disabled={loading} className="bg-[#1B5A8E] hover:bg-[#144669]">{loading ? "Signing in..." : "Sign In"}</Button>
        </form>
        <p className="mt-3 text-xs text-gray-500">After signing in, grant yourself admin to view data.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      {/* Header / controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search name/email/phone/type" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={fetchData} disabled={loading || !isAdmin}>Refresh</Button>
          {isAdmin && (
            <Button onClick={loadDemoData} disabled={loading} variant="outline">
              {loading ? "Working..." : "Load Demo Data"}
            </Button>
          )}
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign Out</Button>
        </div>
      </div>

      {/* Grant admin message */}
      {isAdmin === false && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          <div className="flex items-center justify-between gap-4">
            <p>You don’t have admin access yet. Click “Grant Admin Access.”</p>
            <Button onClick={grantAdminAccess} disabled={loading} className="bg-[#1B5A8E] hover:bg-[#144669]">
              {loading ? "Granting..." : "Grant Admin Access"}
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {["overview","quotes","contacts","settings"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab===t ? "border-[#1B5A8E] text-[#1B5A8E]" : "border-transparent text-gray-500 hover:text-[#1B5A8E]"}`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500">Quotes (Total)</div>
              <div className="text-2xl">{overview.quotesTotal}</div>
              <div className="text-xs text-gray-500 mt-1">Today: {overview.quotesToday}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500">Contacts (Total)</div>
              <div className="text-2xl">{overview.contactsTotal}</div>
              <div className="text-xs text-gray-500 mt-1">Today: {overview.contactsToday}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500">GA Active Users (Realtime)</div>
              <div className="text-2xl">{gaActiveUsers ?? "-"}</div>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => gaToken ? fetchGaMetrics() : connectGoogleAnalytics()} disabled={gaLoading}>
                  {gaToken ? (gaLoading ? "Refreshing…" : "Refresh") : "Connect GA"}
                </Button>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500">GA Page Views (7 days)</div>
              <div className="text-2xl">{gaPageViews7d ?? "-"}</div>
              {gaError && <div className="mt-2 text-xs text-red-600">{gaError}</div>}
            </CardContent></Card>
          </div>

          {/* Top Types & Sources */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card><CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold">Top Quote Types</h3>
              <ul className="space-y-2">
                {overview.topTypes.map(([k,v]) => (
                  <li key={k} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-600">{k}</div>
                    <div className="h-2 flex-1 rounded bg-gray-100">
                      <div className="h-2 rounded bg-[#1B5A8E]" style={{ width: `${(Number(v)/Math.max(1, Number(overview.topTypes[0]?.[1]||1)))*100}%` }} />
                    </div>
                    <div className="w-8 text-right text-sm">{v}</div>
                  </li>
                ))}
                {overview.topTypes.length === 0 && <div className="text-xs text-gray-500">No data yet.</div>}
              </ul>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold">Top Sources (from UTM/referrer)</h3>
              <ul className="space-y-2">
                {overview.topSources.map(([k,v]) => (
                  <li key={k} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-600">{k}</div>
                    <div className="h-2 flex-1 rounded bg-gray-100">
                      <div className="h-2 rounded bg-[#06b6d4]" style={{ width: `${(Number(v)/Math.max(1, Number(overview.topSources[0]?.[1]||1)))*100}%` }} />
                    </div>
                    <div className="w-8 text-right text-sm">{v}</div>
                  </li>
                ))}
                {overview.topSources.length === 0 && <div className="text-xs text-gray-500">No data yet.</div>}
              </ul>
            </CardContent></Card>
          </div>

          {/* GA Top Pages */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">GA Top Pages (7 days)</h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => gaToken ? fetchGaMetrics() : connectGoogleAnalytics()} disabled={gaLoading}>
                    {gaToken ? (gaLoading ? "Refreshing…" : "Refresh") : "Connect GA"}
                  </Button>
                </div>
              </div>
              {gaTopPages.length === 0 ? (
                <div className="text-xs text-gray-500">No GA data loaded.</div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2">Path</th>
                        <th className="p-2 w-24 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaTopPages.map(r => (
                        <tr key={r.path} className="border-t">
                          <td className="p-2">{r.path}</td>
                          <td className="p-2 text-right">{r.views}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {gaError && <div className="mt-2 text-xs text-red-600">{gaError}</div>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* QUOTES TABLE */}
      {tab === "quotes" && (
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 text-lg">Recent Quotes</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">When</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Status</th> {/* NEW */}
                    <th className="p-2">Source</th>
                    <th className="p-2 w-24">Actions</th> {/* NEW */}
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => openQuote(r)} // NEW
                      className="border-t hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-2">{r.quote_type}</td>
                      <td className="p-2">{r.name || "-"}</td>
                      <td className="p-2">{r.email || "-"}</td>
                      <td className="p-2">{r.phone || "-"}</td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs
                            ${r.status === "closed" ? "bg-green-100 text-green-700" :
                               r.status === "in_progress" ? "bg-yellow-100 text-yellow-700" :
                               "bg-gray-100 text-gray-700"}`}
                        >
                          {r.status || "new"}
                        </span>
                      </td>
                      <td className="p-2">{(r.utm?.source || r.referrer || "-")}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); openQuote(r); }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {quotes.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">No quotes found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONTACTS TABLE */}
      {tab === "contacts" && (
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 text-lg">Contact Requests</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">When</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">Referrer</th>
                    <th className="p-2 w-24">Actions</th> {/* NEW */}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => openContact(r)} // NEW
                      className="border-t hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="p-2">{r.name || "-"}</td>
                      <td className="p-2">{r.email || "-"}</td>
                      <td className="p-2">{r.phone || "-"}</td>
                      <td className="p-2">{(r.utm?.source || r.referrer || "-")}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); openContact(r); }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">No contacts found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SETTINGS */}
      {tab === "settings" && (
        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
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
                <Button size="sm" variant="outline" onClick={loadDemoData} disabled={loading || !isAdmin}>Load Demo Data</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NEW: Right-side Detail Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div className="text-lg">
                {drawerType === "quote" ? "Quote Details" : "Contact Details"}
              </div>
              <button
                aria-label="Close"
                className="rounded p-1 hover:bg-gray-100"
                onClick={closeDrawer}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-full overflow-y-auto p-4 space-y-6">
              {/* Header summary */}
              {drawerType === "quote" && selectedQuote && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {new Date(selectedQuote.created_at).toLocaleString()}
                  </div>
                  <div className="text-xl font-medium">{selectedQuote.name || "Unnamed"}</div>
                  <div className="text-sm text-gray-600">Type: {selectedQuote.quote_type}</div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedQuote.email && (
                      <>
                        <a
                          href={`mailto:${selectedQuote.email}`}
                          className="inline-flex items-center gap-2 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                        >
                          <Mail className="h-4 w-4" /> {selectedQuote.email}
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedQuote.email)}
                        >
                          <Copy className="mr-1 h-4 w-4" /> Copy Email
                        </Button>
                      </>
                    )}
                    {selectedQuote.phone && (
                      <>
                        <a
                          href={`tel:${selectedQuote.phone}`}
                          className="inline-flex items-center gap-2 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                        >
                          <Phone className="h-4 w-4" /> {selectedQuote.phone}
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedQuote.phone)}
                        >
                          <Copy className="mr-1 h-4 w-4" /> Copy Phone
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Status control */}
                  <div className="pt-2">
                    <label className="mb-1 block text-xs text-gray-500">Status</label>
                    <div className="flex items-center gap-2">
                      <select
                        className="w-48 rounded border px-2 py-1 text-sm"
                        value={selectedQuote.status || "new"}
                        onChange={(e) => updateQuoteStatus(selectedQuote.id, e.target.value)}
                        disabled={statusSaving || !isAdmin}
                      >
                        <option value="new">new</option>
                        <option value="in_progress">in_progress</option>
                        <option value="closed">closed</option>
                      </select>
                      {statusSaving && <span className="text-xs text-gray-500">Saving…</span>}
                    </div>
                  </div>
                </div>
              )}

              {drawerType === "contact" && selectedContact && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {new Date(selectedContact.created_at).toLocaleString()}
                  </div>
                  <div className="text-xl font-medium">{selectedContact.name || "Unnamed"}</div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedContact.email && (
                      <>
                        <a
                          href={`mailto:${selectedContact.email}`}
                          className="inline-flex items-center gap-2 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                        >
                          <Mail className="h-4 w-4" /> {selectedContact.email}
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedContact.email)}
                        >
                          <Copy className="mr-1 h-4 w-4" /> Copy Email
                        </Button>
                      </>
                    )}
                    {selectedContact.phone && (
                      <>
                        <a
                          href={`tel:${selectedContact.phone}`}
                          className="inline-flex items-center gap-2 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                        >
                          <Phone className="h-4 w-4" /> {selectedContact.phone}
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedContact.phone)}
                        >
                          <Copy className="mr-1 h-4 w-4" /> Copy Phone
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Left */}
                <div className="space-y-3">
                  <div className="rounded border p-3">
                    <div className="mb-2 text-xs font-semibold text-gray-500">Referral / Source</div>
                    <div className="text-sm">{(drawerType === "quote" ? selectedQuote?.referrer : selectedContact?.referrer) || "-"}</div>
                    {drawerType === "quote" && selectedQuote?.submitted_from_path && (
                      <a
                        href={selectedQuote.submitted_from_path}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[#1B5A8E] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open submitted path
                      </a>
                    )}
                  </div>
                  <div className="rounded border p-3">
                    <div className="mb-2 text-xs font-semibold text-gray-500">UTM</div>
                    <pre className="max-h-48 overflow-auto rounded bg-gray-50 p-2 text-xs">
                      {JSON.stringify(
                        drawerType === "quote" ? (selectedQuote?.utm || {}) : (selectedContact?.utm || {}),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-3">
                  <div className="rounded border p-3">
                    <div className="mb-2 text-xs font-semibold text-gray-500">Technical</div>
                    <div className="text-xs text-gray-600">
                      <div>User Agent: {(drawerType === "quote" ? selectedQuote?.user_agent : selectedContact?.user_agent) || "-"}</div>
                      <div>IP: {(drawerType === "quote" ? selectedQuote?.ip : selectedContact?.ip) || "-"}</div>
                    </div>
                  </div>

                  {drawerType === "contact" && selectedContact?.message && (
                    <div className="rounded border p-3">
                      <div className="mb-2 text-xs font-semibold text-gray-500">Message</div>
                      <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Payload / Metadata */}
              {drawerType === "quote" && (
                <div className="rounded border p-3">
                  <div className="mb-2 text-xs font-semibold text-gray-500">Quote Form Submission (payload)</div>
                  <pre className="max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs">
                    {JSON.stringify(selectedQuote?.payload || {}, null, 2)}
                  </pre>
                </div>
              )}
              {drawerType === "contact" && (
                <div className="rounded border p-3">
                  <div className="mb-2 text-xs font-semibold text-gray-500">Metadata</div>
                  <pre className="max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs">
                    {JSON.stringify(selectedContact?.metadata || {}, null, 2)}
                  </pre>
                </div>
              )}

              {/* Quick follow-up (quote only) */}
              {drawerType === "quote" && selectedQuote && (
                <div className="flex flex-wrap gap-2">
                  {selectedQuote.email && (
                    <Button
                      asChild
                      className="bg-[#1B5A8E] hover:bg-[#144669]"
                      disabled={!isAdmin}
                    >
                      <a
                        href={`mailto:${selectedQuote.email}?subject=${encodeURIComponent(
                          `Your ${selectedQuote.quote_type} quote with 1Life`
                        )}&body=${encodeURIComponent(
                          `Hi ${selectedQuote.name || ""},%0D%0A%0D%0AThanks for your ${selectedQuote.quote_type} quote request. When is a good time for a quick call?%0D%0A%0D%0A— 1Life Coverage`
                        )}`}
                      >
                        Email follow-up
                      </a>
                    </Button>
                  )}
                  {selectedQuote.phone && (
                    <Button variant="outline" asChild disabled={!isAdmin}>
                      <a href={`tel:${selectedQuote.phone}`}>Call now</a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

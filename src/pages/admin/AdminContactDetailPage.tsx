import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Copy, Mail, Phone, ChevronRight } from "lucide-react";

interface Contact {
  id: string;
  created_at: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  referrer?: string | null;
  utm?: { source?: string; medium?: string; campaign?: string } | null;
}

function setAdminDetailHead() {
  const SITE = "1Life Coverage Solutions";
  const title = "Admin Contact Detail";
  document.title = `${title} | ${SITE}`;
  let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!robots) { robots = document.createElement("meta"); robots.setAttribute("name","robots"); document.head.appendChild(robots); }
  robots.setAttribute("content","noindex,nofollow");
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
}

export default function AdminContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [item, setItem] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setIsAdmin(!error && !!data);
    })();
  }, [session]);

  useEffect(() => {
    (async () => {
      if (!id) { setError("Invalid contact reference."); setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase.from("contacts").select("*").eq("id", id).maybeSingle();
      if (error) { setError(error.message); setItem(null); }
      else { setItem(data as Contact); }
      setLoading(false);
      window.scrollTo(0, 0);
    })();
  }, [id]);

  useEffect(() => { setAdminDetailHead(); }, []);

  const displayName = item
    ? ([item.first_name, item.last_name].filter(Boolean).join(" ").trim() || item.name || "Unnamed")
    : "";

  const channel = (src?: string | null, ref?: string | null) => {
    if (!src && !ref) return "Direct";
    return src || "Referral";
  };

  const copyToClipboard = async (val?: string | null) => {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <div className="min-w-0">
              <div className="text-xs text-gray-500">Admin</div>
              <div className="truncate text-base font-semibold text-gray-900">Contact Request</div>
            </div>
          </div>
          <Link
            to="/admin?tab=contacts"
            className="hidden items-center gap-1 text-sm text-gray-600 hover:text-gray-900 sm:inline-flex"
          >
            All contacts
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {loading && <div className="text-sm text-gray-600">Loading…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && item && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs text-gray-500">
                    Submitted: {new Date(item.created_at).toLocaleString()}
                  </div>
                  <h1 className="mt-1 text-2xl font-semibold text-gray-900">{displayName}</h1>
                  {item.subject && (
                    <div className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      Subject: {item.subject}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.email && (
                    <>
                      <Button
                        size="sm"
                        asChild
                        className="bg-[#1B5A8E] hover:bg-[#144669]"
                        disabled={!isAdmin}
                      >
                        <a href={`mailto:${item.email}`}>
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </span>
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(item.email)} disabled={!isAdmin}>
                        <span className="inline-flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy
                        </span>
                      </Button>
                    </>
                  )}
                  {item.phone && (
                    <>
                      <Button size="sm" variant="outline" asChild disabled={!isAdmin}>
                        <a href={`tel:${item.phone}`}>
                          <span className="inline-flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Call
                          </span>
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(item.phone)} disabled={!isAdmin}>
                        <span className="inline-flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy
                        </span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b px-5 py-3 text-sm font-semibold text-gray-900">Message</div>
                <div className="px-5 py-4 text-sm text-gray-800 whitespace-pre-wrap">{item.message || "-"}</div>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b px-5 py-3 text-sm font-semibold text-gray-900">Contact Info</div>
                  <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="mt-1 break-all text-sm text-gray-900">{item.email || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="mt-1 break-all text-sm text-gray-900">{item.phone || "-"}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b px-5 py-3 text-sm font-semibold text-gray-900">Lead Source</div>
                  <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-gray-500">Channel</div>
                      <div className="mt-1 text-sm text-gray-900">{channel(item.utm?.source, item.referrer)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Medium</div>
                      <div className="mt-1 text-sm text-gray-900">{item.utm?.medium || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Campaign</div>
                      <div className="mt-1 text-sm text-gray-900">{item.utm?.campaign || "-"}</div>
                    </div>
                    <div className="sm:col-span-3">
                      <div className="text-xs text-gray-500">Referrer</div>
                      <div className="mt-1 break-all text-sm text-gray-900">{item.referrer || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>
                ← Back
              </Button>
              <Button asChild className="bg-[#1B5A8E] hover:bg-[#144669]">
                <Link to="/admin?tab=contacts">All Contacts</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

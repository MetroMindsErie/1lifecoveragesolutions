import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";

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

  const displayName = item
    ? ([item.first_name, item.last_name].filter(Boolean).join(" ").trim() || item.name || "Unnamed")
    : "";

  const channel = (src?: string | null, ref?: string | null) => {
    if (!src && !ref) return "Direct";
    return src || "Referral";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B5A8E] to-[#4f46e5] text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-white/20 border-white text-white hover:bg-white/30"
            >
              ← Back
            </Button>
            <span className="text-lg font-semibold">Contact Request</span>
          </div>
          <Link to="/admin?tab=contacts" className="text-xs underline opacity-90 hover:opacity-100">
            All contacts
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
        {loading && <div className="text-sm text-gray-600">Loading…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && item && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] text-gray-600">
                    Submitted: {new Date(item.created_at).toLocaleString()}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-[#1B5A8E]">
                    {displayName}
                  </h2>
                  {item.subject && (
                    <div className="mt-2 inline-flex items-center rounded-full bg-[#1B5A8E]/10 px-2 py-1 text-[11px] text-[#1B5A8E]">
                      Subject: {item.subject}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {item.email && (
                    <Button size="sm" asChild className="bg-[#1B5A8E] hover:bg-[#144669]">
                      <a href={`mailto:${item.email}`}>Email</a>
                    </Button>
                  )}
                  {item.phone && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${item.phone}`}>Call</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur">
              <div className="border-b border-white/60 px-4 py-2 text-sm font-medium text-[#1B5A8E]">
                Message
              </div>
              <div className="px-4 py-3 text-sm whitespace-pre-wrap text-gray-800">
                {item.message || "-"}
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur">
              <div className="border-b border-white/60 px-4 py-2 text-sm font-medium text-[#1B5A8E]">
                Contact Information
              </div>
              <div className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-2">
                <div className="flex items-center justify-between sm:block">
                  <div className="text-[11px] text-gray-600">Email</div>
                  <div className="text-gray-800">{item.email || "-"}</div>
                </div>
                <div className="flex items-center justify-between sm:block">
                  <div className="text-[11px] text-gray-600">Phone</div>
                  <div className="text-gray-800">{item.phone || "-"}</div>
                </div>
              </div>
            </div>

            {/* Lead Source (simplified) */}
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur">
              <div className="border-b border-white/60 px-4 py-2 text-sm font-medium text-[#1B5A8E]">
                Lead Source
              </div>
              <div className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-[11px] text-gray-600">Channel</div>
                  <div className="text-gray-800">
                    {channel(item.utm?.source, item.referrer)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-600">Medium</div>
                  <div className="text-gray-800">{item.utm?.medium || "-"}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-600">Campaign</div>
                  <div className="text-gray-800">{item.utm?.campaign || "-"}</div>
                </div>
                <div className="sm:col-span-3">
                  <div className="text-[11px] text-gray-600">Referrer</div>
                  <div className="truncate text-gray-800">{item.referrer || "-"}</div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>← Back</Button>
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

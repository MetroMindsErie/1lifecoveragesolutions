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
  metadata?: any;
  referrer?: string | null;
  utm?: any;
  user_agent?: string | null;
  ip?: string | null;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF]">
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
            <span className="text-lg font-semibold">Contact Details</span>
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
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur p-4 shadow-sm">
              <div className="text-[11px] text-gray-600">
                Submitted: {new Date(item.created_at).toLocaleString()}
              </div>
              <h2 className="mt-1 text-xl font-semibold text-[#1B5A8E]">
                {displayName}
              </h2>
              {item.subject && <div className="mt-1 text-sm text-gray-700">Subject: {item.subject}</div>}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-700">
                {item.email && (
                  <a
                    href={`mailto:${item.email}`}
                    className="rounded bg-[#1B5A8E]/10 px-2 py-1 hover:bg-[#1B5A8E]/20"
                  >
                    {item.email}
                  </a>
                )}
                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="rounded bg-[#4f46e5]/10 px-2 py-1 hover:bg-[#4f46e5]/20"
                  >
                    {item.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur">
              <div className="border-b border-white/60 px-4 py-2 text-sm font-medium text-[#1B5A8E]">
                Message
              </div>
              <div className="px-4 py-3 text-sm whitespace-pre-wrap text-gray-800">
                {item.message || "-"}
              </div>
            </div>
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur">
              <div className="border-b border-white/60 px-4 py-2 text-sm font-medium text-[#1B5A8E]">
                Metadata
              </div>
              <pre className="max-h-64 overflow-auto bg-gray-50 p-3 text-[10px] leading-tight">
{JSON.stringify({
  referrer: item.referrer,
  utm: item.utm,
  user_agent: item.user_agent,
  ip: item.ip,
  metadata: item.metadata || {}
}, null, 2)}
              </pre>
            </div>
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

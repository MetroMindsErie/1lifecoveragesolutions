import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabaseClient";

type Detail = {
  id: string;
  created_at: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  referrer?: string | null;
  utm?: any;
  user_agent?: string | null;
  ip?: string | null;
  submitted_from_path?: string | null;
  payload?: Record<string, any>;
  [k: string]: any;
};

const allowedTables = new Set([
  "auto_quotes",
  "homeowners_quotes",
  "umbrella_quotes",
  "life_quotes",
  "commercial_building_quotes",
  "bop_quotes",
]);

function setAdminDetailHead() {
  const SITE = "1Life Coverage Solutions";
  const title = "Admin Quote Detail";
  document.title = `${title} | ${SITE}`;
  let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!robots) { robots = document.createElement("meta"); robots.setAttribute("name","robots"); document.head.appendChild(robots); }
  robots.setAttribute("content","noindex,nofollow");
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach(n => n.remove());
}

export default function AdminQuoteDetailPage() {
  const navigate = useNavigate();
  const { id, srcTable } = useParams<{ id: string; srcTable: string }>();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [item, setItem] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

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
      if (!id || !srcTable || !allowedTables.has(srcTable)) {
        setError("Invalid quote reference.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from(srcTable).select("*").eq("id", id).maybeSingle();
      if (error) {
        setError(error.message);
        setItem(null);
      } else {
        setItem(data as Detail);
      }
      setLoading(false);
      window.scrollTo(0, 0);
    })();
  }, [id, srcTable]);

  const sectionize = (q: any) => {
    if (!q) return [];
    const payload = q.payload || {};
    const already = new Set<string>();
    const sections: { title: string; items: { label: string; value: any }[] }[] = [];
    const pretty = (raw: string) => raw.replace(/_/g, " ").replace(/\b([a-z])/gi, s => s.toUpperCase());

    const push = (keys: string[], title: string) => {
      const items = keys
        .filter(k => q[k] !== undefined && q[k] !== null && String(q[k]).trim() !== "")
        .map(k => {
          already.add(k);
          return { label: pretty(k), value: q[k] };
        });
      if (items.length) sections.push({ title, items });
    };

    switch (srcTable) {
      case "auto_quotes":
        push(["name","email","phone","address","dob","drivers_license_number","primary_residence","occupation","education_level"], "Client Information");
        push(["vehicle_1","vehicle_2","vehicle_3","primary_vehicle_use","ownership_length","commute_one_way_miles","commute_days_per_week","annual_miles","rideshare_use"], "Vehicle Information");
        push(["additional_driver_1","additional_driver_2","additional_driver_3"], "Additional Drivers");
        push(["currently_insured","current_policy_expiration","interested_in_other_coverages","referral_source"], "Other / Referral");
        break;
      case "homeowners_quotes":
        push(["name","email","phone","property_address","mailing_address","dob","drivers_license_number"], "Client & Property");
        push(["home_type","year_built","square_footage","stories","roof_type_year","foundation_type","basement_finished","exterior_construction","heating_type","heating_age_years","fireplace_or_woodstove","garage","garage_capacity"], "Physical Details");
        push(["central_fire_alarm","central_burglar_alarm","fire_extinguisher","deadbolts","pool","pool_fenced","pool_type","trampoline"], "Safety Features");
        push(["pets_have","pets_type","pets_count","dog_breeds","pets_bite_history"], "Pets");
        push(["current_carrier","policy_expiration","current_dwelling_coverage","desired_deductible","claims_last_5_years","claims_description","additional_coverages","referral_source"], "Coverage & History");
        break;
      case "umbrella_quotes":
        push(["name","email","phone","address","dob","drivers_license_number"], "Client Information");
        push(["current_coverages","current_coverage_limits","policy_expiration","household_drivers","household_vehicles","valuables_description","rental_properties","watercraft"], "Household & Existing Coverage");
        push(["pets_have","pets_type","pets_count","dog_breeds","pets_bite_history"], "Pets");
        push(["desired_limit","desired_deductible","prior_claims","prior_claims_description","additional_quotes_interest","referral_source"], "Umbrella Request");
        break;
      case "life_quotes":
        push(["name","dob","gender","phone","email","address","occupation"], "Personal Information");
        push(["policy_type","coverage_amount","term_years","beneficiaries","current_policies","current_policies_details","applications_pending"], "Coverage Request");
        push(["height","weight","tobacco_use","alcohol_use","medical_conditions","medications","hospitalizations","family_history"], "Health");
        push(["high_risk_hobbies","travel","referral_source"], "Lifestyle & Referral");
        break;
      case "commercial_building_quotes":
        push(["business_name_or_owner","property_address","phone","email","own_or_rent","property_type","year_built","stories","square_footage","construction_type","roof_type_age","foundation_type","sprinklers","security_systems","hazardous_materials"], "Property / Construction");
        push(["primary_use","units_tenants","occupancy_type","business_hours","seasonal"], "Occupancy & Use");
        push(["current_carrier","policy_expiration","building_coverage","tenant_improvements","liability_coverage","deductible","additional_coverage","prior_claims","prior_claims_description","referral_source"], "Coverage & History");
        break;
      case "bop_quotes":
        push(["business_name","business_address","phone","email","business_type","fein","years_in_business","employees","website","contact_name","contact_title","contact_phone","contact_email"], "Business & Contact");
        push(["property_address","property_type","building_construction","year_built","stories","square_footage","sprinklers","security_systems","hazardous_materials"], "Property");
        push(["annual_revenue","annual_payroll","locations","business_hours","seasonal","prior_claims","prior_claims_description"], "Operations & History");
        push(["desired_coverage_types","coverage_limits","deductible","vehicles_for_operations","subcontractors","special_endorsements","referral_source"], "Coverage Request");
        break;
    }

    const extras = Object.entries(payload)
      .filter(([k, v]) => v && String(v).trim() !== "" && !already.has(k))
      .map(([k, v]) => ({ label: pretty(k), value: v }));
    if (extras.length) sections.push({ title: "Additional Submitted Fields", items: extras });

    return sections;
  };

  const onUpdateStatus = async (next: string) => {
    if (!item || !isAdmin || !srcTable) return;
    setStatusSaving(true);
    const { error } = await supabase.from(srcTable).update({ status: next }).eq("id", id);
    setStatusSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setItem(prev => (prev ? { ...prev, status: next } as Detail : prev));
  };

  const sections = useMemo(() => sectionize(item), [item]);

  useEffect(() => { setAdminDetailHead(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#E9F3FB] to-[#D9ECFF]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B5A8E] to-[#4f46e5] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-white/20 border-white text-white hover:bg-white/30"
            >
              ← Back
            </Button>
            <div className="text-lg font-semibold">Quote Review</div>
          </div>
          <Link to="/admin?tab=quotes" className="text-xs underline opacity-90 hover:opacity-100">
            All quotes
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
                    {item.name || "Unnamed"}
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Table:
                    <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] bg-[#1B5A8E]/10 text-[#1B5A8E]">
                      {srcTable}
                    </span>
                    <span className="ml-2">Status:</span>
                    <select
                      className="ml-1 rounded border bg-white/80 text-xs px-2 py-1"
                      value={item.status || "new"}
                      onChange={(e) => onUpdateStatus(e.target.value)}
                      disabled={!isAdmin || statusSaving}
                    >
                      <option value="new">new</option>
                      <option value="in_progress">in_progress</option>
                      <option value="closed">closed</option>
                    </select>
                    {statusSaving && <span className="ml-2 text-[10px] text-gray-500">Saving…</span>}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500 break-all">ID: {item.id}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {item.email && (
                    <Button
                      size="sm"
                      asChild
                      className="bg-[#1B5A8E] hover:bg-[#144669]"
                      disabled={!isAdmin}
                    >
                      <a
                        href={`mailto:${item.email}?subject=${encodeURIComponent(
                          `Your quote`
                        )}&body=${encodeURIComponent(
                          `Hi ${item.name || ""},\n\nThank you for your quote request. When is a good time for a quick call?\n\n— 1Life Coverage`
                        )}`}
                      >
                        Email Follow-up
                      </a>
                    </Button>
                  )}
                  {item.phone && (
                    <Button size="sm" variant="outline" asChild disabled={!isAdmin}>
                      <a href={`tel:${item.phone}`}>Call Now</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Mapped sections */}
            {sections.map((sec) => (
              <div key={sec.title} className="rounded-xl border border-white/60 bg-white/80 backdrop-blur shadow-sm">
                <div className="px-4 py-2 text-sm font-medium text-[#1B5A8E] border-b border-white/60 bg-[#F5FAFE]">
                  {sec.title}
                </div>
                <div className="divide-y">
                  {sec.items.map((it) => (
                    <div key={it.label} className="flex items-start gap-4 px-4 py-2">
                      <div className="w-48 text-[11px] font-semibold text-gray-600">{it.label}</div>
                      <div className="flex-1 text-sm text-gray-800 whitespace-pre-wrap">{String(it.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Technical Metadata */}
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur">
              <button
                type="button"
                onClick={() => setShowTech(s => !s)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-[#1B5A8E] hover:bg-[#F0F7FC]"
              >
                Technical Metadata
                <span className="text-[10px] text-gray-500">{showTech ? "Hide" : "Show"}</span>
              </button>
              {showTech && (
                <div className="divide-y text-xs">
                  {[
                    ["Referrer", item.referrer || "-"],
                    ["Submitted Path", item.submitted_from_path || "-"],
                    ["User Agent", item.user_agent || "-"],
                    ["IP", item.ip || "-"],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex items-start gap-3 px-4 py-2">
                      <div className="w-40 font-semibold text-gray-600">{l as string}</div>
                      <div className="flex-1 break-all text-gray-700">{v as string}</div>
                    </div>
                  ))}
                  <div className="px-4 py-2">
                    <div className="mb-1 font-semibold text-gray-600">UTM</div>
                    <pre className="max-h-40 overflow-auto rounded bg-gray-50 p-2 text-[10px] leading-tight">
                      {JSON.stringify(item.utm || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Raw Payload */}
            <div className="rounded-xl border border-white/60 bg-white/80 backdrop-blur">
              <button
                type="button"
                onClick={() => setShowRaw(s => !s)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-[#1B5A8E] hover:bg-[#F0F7FC]"
              >
                Raw Form Payload
                <span className="text-[10px] text-gray-500">{showRaw ? "Hide" : "Show"}</span>
              </button>
              {showRaw && (
                <pre className="max-h-64 overflow-auto rounded-b bg-gray-50 p-3 text-[10px] leading-tight">
                  {JSON.stringify(item.payload || {}, null, 2)}
                </pre>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                ← Back
              </Button>
              <Button asChild className="bg-[#1B5A8E] hover:bg-[#144669]">
                <Link to="/admin?tab=quotes">All Quotes</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

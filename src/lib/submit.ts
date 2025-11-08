import { z } from "zod";
import { supabase } from "./supabaseClient";

const baseSchema = z.object({
  name: z.string().min(2, "Name too short").optional(),
  email: z.string().optional(),
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

function tableForQuoteType(quoteType: string) {
  switch (quoteType) {
    case "auto": return "auto_quotes";
    case "homeowners": return "homeowners_quotes";
    case "umbrella": return "umbrella_quotes";
    case "life": return "life_quotes";
    case "commercial-building": return "commercial_building_quotes";
    case "bop": return "bop_quotes";
    default: return "quotes"; // legacy fallback
  }
}

export async function submitQuote(quoteType: string, form: HTMLFormElement) {
  // Honeypot
  for (const hp of honeypotFields) {
    const el = form.querySelector<HTMLInputElement>(`[name="${hp}"]`);
    if (el && el.value) throw new Error("Bot detected.");
  }
  const payload = serializeForm(form);

  const name = payload.name || payload["Full Name"] || payload["name"] || undefined;
  const email = payload.email || payload["Email Address"] || undefined;
  const phone = payload.phone || payload["Phone Number"] || undefined;

  const idCheck = baseSchema.refine((d) => !!(d.email || d.phone), {
    message: "Provide email or phone.",
    path: ["email"],
  });

  idCheck.parse({ name, email, phone }); // throws on invalid

  const { referrer, utm, user_agent, submitted_from_path } = getAttribution();

  const table = tableForQuoteType(quoteType);

  // Map core columns (only those present; others remain in payload)
  const baseRow: any = {
    name,
    email,
    phone,
    referrer,
    utm,
    user_agent,
    submitted_from_path,
    payload
  };

  // Typed overrides
  if (table === "auto_quotes") {
    Object.assign(baseRow, {
      address: payload.address,
      dob: payload.dob || null,
      drivers_license_number: payload.drivers_license_number,
      primary_residence: payload.primary_residence,
      occupation: payload.occupation,
      education_level: payload.education_level,
      vehicle_1: payload.vehicle_1,
      vehicle_2: payload.vehicle_2,
      vehicle_3: payload.vehicle_3,
      primary_vehicle_use: payload.primary_vehicle_use,
      ownership_length: payload.vehicle_ownership_length,
      commute_one_way_miles: payload.commute_one_way_miles,
      commute_days_per_week: payload.commute_days_per_week,
      annual_miles: payload.annual_miles,
      rideshare_use: payload.rideshare_use,
      additional_driver_1: payload.additional_driver_1,
      additional_driver_2: payload.additional_driver_2,
      additional_driver_3: payload.additional_driver_3,
      currently_insured: payload.currently_insured,
      current_policy_expiration: payload.current_policy_expiration || null,
      interested_in_other_coverages: payload.interested_in_other_coverages,
      referral_source: payload.referral_source
    });
  } else if (table === "homeowners_quotes") {
    Object.assign(baseRow, {
      property_address: payload.property_address,
      mailing_address: payload.mailing_address,
      dob: payload.dob || null,
      drivers_license_number: payload.drivers_license_number,
      home_type: payload.home_type,
      year_built: payload.year_built,
      square_footage: payload.square_footage,
      stories: payload.stories,
      roof_type_year: payload.roof_type_year,
      foundation_type: payload.foundation_type,
      basement_finished: payload.basement_finished,
      exterior_construction: payload.exterior_construction,
      heating_type: payload.heating_type,
      heating_age_years: payload.heating_age_years,
      fireplace_or_woodstove: payload.fireplace_or_woodstove,
      garage: payload.garage,
      garage_capacity: payload.garage_capacity,
      central_fire_alarm: payload.central_fire_alarm,
      central_burglar_alarm: payload.central_burglar_alarm,
      fire_extinguisher: payload.fire_extinguisher,
      deadbolts: payload.deadbolts,
      pool: payload.pool,
      pool_fenced: payload.pool_fenced,
      pool_type: payload.pool_type,
      trampoline: payload.trampoline,
      pets_have: payload.pets_have,
      pets_type: payload.pets_type,
      pets_count: payload.pets_count,
      dog_breeds: payload.dog_breeds,
      pets_bite_history: payload.pets_bite_history,
      current_carrier: payload.current_carrier,
      policy_expiration: payload.policy_expiration || null,
      current_dwelling_coverage: payload.current_dwelling_coverage,
      desired_deductible: payload.desired_deductible,
      claims_last_5_years: payload.claims_last_5_years,
      claims_description: payload.claims_description,
      additional_coverages: payload.additional_coverages,
      referral_source: payload.referral_source
    });
  } else if (table === "umbrella_quotes") {
    Object.assign(baseRow, {
      address: payload.address,
      dob: payload.dob || null,
      drivers_license_number: payload.drivers_license_number,
      current_coverages: payload.current_coverages,
      current_coverage_limits: payload.current_coverage_limits,
      policy_expiration: payload.policy_expiration || null,
      household_drivers: payload.household_drivers,
      household_vehicles: payload.household_vehicles,
      valuables_description: payload.valuables_description,
      rental_properties: payload.rental_properties,
      watercraft: payload.watercraft,
      pets_have: payload.pets_have,
      pets_type: payload.pets_type,
      pets_count: payload.pets_count,
      dog_breeds: payload.dog_breeds,
      pets_bite_history: payload.pets_bite_history,
      desired_limit: payload.desired_limit,
      desired_deductible: payload.desired_deductible,
      prior_claims: payload.prior_claims,
      prior_claims_description: payload.prior_claims_description,
      additional_quotes_interest: payload.additional_quotes_interest,
      referral_source: payload.referral_source
    });
  } else if (table === "life_quotes") {
    Object.assign(baseRow, {
      dob: payload.dob || null,
      gender: payload.gender,
      address: payload.address,
      occupation: payload.occupation,
      policy_type: payload.policy_type,
      coverage_amount: payload.coverage_amount,
      term_years: payload.term_years,
      beneficiaries: payload.beneficiaries,
      current_policies: payload.current_policies,
      current_policies_details: payload.current_policies_details,
      applications_pending: payload.applications_pending,
      height: payload.height,
      weight: payload.weight,
      tobacco_use: payload.tobacco_use,
      alcohol_use: payload.alcohol_use,
      medical_conditions: payload.medical_conditions,
      medications: payload.medications,
      hospitalizations: payload.hospitalizations,
      family_history: payload.family_history,
      high_risk_hobbies: payload.high_risk_hobbies,
      travel: payload.travel,
      referral_source: payload.referral_source
    });
  } else if (table === "commercial_building_quotes") {
    Object.assign(baseRow, {
      business_name_or_owner: payload.business_name_or_owner,
      property_address: payload.property_address,
      own_or_rent: payload.own_or_rent,
      property_type: payload.property_type,
      year_built: payload.year_built,
      stories: payload.stories,
      square_footage: payload.square_footage,
      construction_type: payload.construction_type,
      roof_type_age: payload.roof_type_age,
      foundation_type: payload.foundation_type,
      sprinklers: payload.sprinklers,
      security_systems: payload.security_systems,
      hazardous_materials: payload.hazardous_materials,
      primary_use: payload.primary_use,
      units_tenants: payload.units_tenants,
      occupancy_type: payload.occupancy_type,
      business_hours: payload.business_hours,
      seasonal: payload.seasonal,
      current_carrier: payload.current_carrier,
      policy_expiration: payload.policy_expiration || null,
      building_coverage: payload.building_coverage,
      tenant_improvements: payload.tenant_improvements,
      liability_coverage: payload.liability_coverage,
      deductible: payload.deductible,
      additional_coverage: payload.additional_coverage,
      prior_claims: payload.prior_claims,
      prior_claims_description: payload.prior_claims_description,
      referral_source: payload.referral_source
    });
  } else if (table === "bop_quotes") {
    Object.assign(baseRow, {
      business_name: payload.business_name,
      business_address: payload.business_address,
      business_type: payload.business_type,
      fein: payload.fein,
      years_in_business: payload.years_in_business,
      employees: payload.employees,
      website: payload.website,
      contact_name: payload.contact_name,
      contact_title: payload.contact_title,
      contact_phone: payload.contact_phone,
      contact_email: payload.contact_email,
      property_address: payload.property_address,
      property_type: payload.property_type,
      building_construction: payload.building_construction,
      year_built: payload.year_built,
      stories: payload.stories,
      square_footage: payload.square_footage,
      sprinklers: payload.sprinklers,
      security_systems: payload.security_systems,
      hazardous_materials: payload.hazardous_materials,
      annual_revenue: payload.annual_revenue,
      annual_payroll: payload.annual_payroll,
      locations: payload.locations,
      business_hours: payload.business_hours,
      seasonal: payload.seasonal,
      prior_claims: payload.prior_claims,
      prior_claims_description: payload.prior_claims_description,
      desired_coverage_types: payload.desired_coverage_types,
      coverage_limits: payload.coverage_limits,
      deductible: payload.deductible,
      vehicles_for_operations: payload.vehicles_for_operations,
      subcontractors: payload.subcontractors,
      special_endorsements: payload.special_endorsements,
      referral_source: payload.referral_source
    });
  } else {
    // legacy quotes table expects quote_type
    baseRow.quote_type = quoteType;
    }
  
    const { error } = await supabase.from(table).insert([baseRow]);
    if (error) throw error;
  }

export async function submit(form: HTMLFormElement) {
  for (const hp of honeypotFields) {
    const el = form.querySelector<HTMLInputElement>(`[name="${hp}"]`);
    if (el && el.value) throw new Error("Bot detected.");
  }
  const payload = serializeForm(form);

  // Normalize contact fields
  const firstName = payload.first_name || payload.firstName || "";
  const lastName = payload.last_name || payload.lastName || "";
  const email = payload.email || undefined;
  const phone = payload.phone || undefined;
  const subject = payload.subject || undefined;

  const idCheck = baseSchema.refine((d) => !!(d.email || d.phone), {
    message: "Provide email or phone.",
    path: ["email"],
  });
  // We don't require "name" to exist in DB; validate only identity
  idCheck.parse({
    name: [firstName, lastName].filter(Boolean).join(" ").trim() || undefined,
    email,
    phone
  });

  const { referrer, utm, user_agent } = getAttribution();

  // Start with the superset of columns we want to store.
  // If the backend reports a column doesn't exist in schema cache, we drop it and retry.
  const baseRow: Record<string, any> = {
    first_name: firstName || null,
    last_name: lastName || null,
    // name intentionally omitted to avoid failures on instances without this column
    email: email || null,
    phone: phone || null,
    subject: subject || null,
    message: payload.message || null,
    metadata: { raw: payload },
    referrer,
    utm,
    user_agent,
  };

  // Progressive insert with schema-cache-aware retries
  let row = { ...baseRow };
  let tries = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { error } = await supabase.from("contacts").insert([row]);
    if (!error) break;

    const msg = error.message || "";
    // Detect unknown column from PostgREST error variants
    const m =
      msg.match(/Could not find the '([^']+)' column/i) ||
      msg.match(/column\s+"?([a-z_]+)"?\s+does not exist/i);
    if (m) {
      const missing = m[1];
      if (missing in row) {
        delete (row as any)[missing];
        tries++;
        if (tries < 8) continue;
      }
    }
    // If we can't resolve by dropping columns, surface the error
    throw error;
  }
}
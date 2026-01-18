/**
 * Email enrichment using FullEnrich API
 * No mocked fallback: failures surface as errors.
 */

export interface EnrichedProfile {
  email: string;
  name: string;
  company: string;
  role: string;
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location: string;
  linkedinUrl?: string;
  headline?: string;
  summary?: string;
  positionDescription?: string;
  positionStart?: { month?: number; year?: number };
  companyDomain?: string;
  companyWebsite?: string;
  companyLinkedinUrl?: string;
  companyType?: string;
  companyYearFounded?: number;
  companyHeadcount?: number;
  companyHeadcountRange?: string;
  companyDescription?: string;
  companyHeadquarters?: {
    region?: string;
    city?: string;
    country?: string;
    countryCode?: string;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
  };
  workEmails?: string[];
  personalEmails?: string[];
  phones?: string[];
  enrichedAt: string;
  isMocked: boolean;
}

/**
 * Enrich an email address using FullEnrich API
 */
export async function enrichEmail(email: string): Promise<EnrichedProfile> {
  // NOTE: This module is imported by both browser code (Vite dev + mock API)
  // and server code (Vercel functions). In the browser, `process` is undefined.
  // FULLENRICH_API_KEY is intended to be read on the server (Vercel functions).
  // Guard access so accidental browser imports don't crash ("process is not defined").
  const apiKey =
    (typeof process !== 'undefined' && (process as any).env?.FULLENRICH_API_KEY) ||
    undefined;

  if (!apiKey) {
    throw new Error('FULLENRICH_API_KEY is not configured');
  }

  // FullEnrich API is async.
  // Step 1: reverse email lookup -> get person + company profile.
  const reverseId = await startReverseEmailLookup(apiKey, email);
  const reverseResult = await pollReverseEmailResult(apiKey, reverseId);
  const reverseMapped = mapFullEnrichReverseResult(email, reverseResult);
  console.log('[ENRICH] FullEnrich reverse-email success:', { email, reverseMapped });

  // Step 2 (docs-supported): use /contact/enrich/bulk with linkedin_url (when available)
  // to improve contact channels (emails/phones) and often return a richer profile.
  try {
    const contactEnrichId = await startContactEnrich(apiKey, email, reverseResult, reverseMapped);
    const contactEnrichResult = await pollContactEnrichResult(apiKey, contactEnrichId);
    const contactMapped = mapFullEnrichContactEnrichResult(email, contactEnrichResult);
    const merged = mergeProfiles(reverseMapped, contactMapped);
    console.log('[ENRICH] FullEnrich contact-enrich success:', {
      email,
      contactChannels: {
        workEmails: merged.workEmails?.length || 0,
        personalEmails: merged.personalEmails?.length || 0,
        phones: merged.phones?.length || 0,
      },
    });
    return merged;
  } catch (error) {
    // No mocks: return what we already have from the reverse lookup.
    console.warn('[ENRICH] FullEnrich contact-enrich failed (keeping reverse result):', error);
    return reverseMapped;
  }
}

async function startReverseEmailLookup(apiKey: string, email: string): Promise<string> {
  const res = await fetch('https://app.fullenrich.com/api/v1/contact/reverse/email/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: `Reverse Email: ${email}`,
      data: [{ email }],
    }),
  });

  const text = await res.text();
  const json = safeJsonParse(text);
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `FullEnrich reverse start failed (${res.status})`);
  }

  const id = json?.enrichment_id;
  if (!id) throw new Error('FullEnrich reverse start did not return enrichment_id');
  return id;
}

async function pollReverseEmailResult(apiKey: string, reverseEmailId: string): Promise<any> {
  const url = `https://app.fullenrich.com/api/v1/contact/reverse/email/bulk/${reverseEmailId}`;
  const maxAttempts = 14;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const text = await res.text();
    const json = safeJsonParse(text);
    if (!res.ok) {
      throw new Error(json?.message || json?.error || `FullEnrich reverse poll failed (${res.status})`);
    }

    const status = json?.status;
    if (status === 'FINISHED' || status === 'CANCELED' || status === 'CREDITS_INSUFFICIENT') {
      return json;
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  // last try
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await res.text();
  const json = safeJsonParse(text);
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `FullEnrich reverse poll failed (${res.status})`);
  }
  return json;
}

function mapFullEnrichReverseResult(email: string, data: any): EnrichedProfile {
  const first = Array.isArray(data?.datas) ? data.datas[0] : null;
  const contact = first?.contact;
  const profile = contact?.profile;
  const position = profile?.position;
  const company = position?.company;

  const headcountRange = company?.headcount_range || '';
  const companySize = mapHeadcountRangeToCompanySize(headcountRange);

  const location =
    profile?.location ||
    (company?.headquarters?.city && company?.headquarters?.country
      ? `${company.headquarters.city}, ${company.headquarters.country}`
      : company?.headquarters?.country || 'Unknown');

  return {
    email,
    name: [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || email.split('@')[0],
    company: company?.name || contact?.domain || email.split('@')[1] || 'Unknown Company',
    role: position?.title || 'Professional',
    industry: company?.industry || 'General',
    companySize,
    location,
    linkedinUrl: profile?.linkedin_url,
    headline: profile?.headline,
    summary: profile?.summary,
    positionDescription: position?.description,
    positionStart: position?.start_at ? { month: position.start_at.month, year: position.start_at.year } : undefined,
    companyDomain: company?.domain,
    companyWebsite: company?.website,
    companyLinkedinUrl: company?.linkedin_url,
    companyType: company?.type,
    companyYearFounded: typeof company?.year_founded === 'number' ? company.year_founded : undefined,
    companyHeadcount: typeof company?.headcount === 'number' ? company.headcount : undefined,
    companyHeadcountRange: company?.headcount_range,
    companyDescription: company?.description,
    companyHeadquarters: company?.headquarters
      ? {
          region: company.headquarters.region,
          city: company.headquarters.city,
          country: company.headquarters.country,
          countryCode: company.headquarters.country_code,
          postalCode: company.headquarters.postal_code,
          addressLine1: company.headquarters.address_line_1,
          addressLine2: company.headquarters.address_line_2,
        }
      : undefined,
    enrichedAt: new Date().toISOString(),
    isMocked: false,
  };
}

async function startContactEnrich(
  apiKey: string,
  email: string,
  reverseResult: any,
  reverseMapped: EnrichedProfile
): Promise<string> {
  const first = Array.isArray(reverseResult?.datas) ? reverseResult.datas[0] : null;
  const contact = first?.contact;
  const profile = contact?.profile;

  const derived = deriveFromEmail(email);

  const linkedinUrl = reverseMapped.linkedinUrl || profile?.linkedin_url;
  const firstname = profile?.firstname || contact?.firstname || derived.firstname;
  const lastname = profile?.lastname || contact?.lastname || derived.lastname;
  const domain = reverseMapped.companyDomain || contact?.domain || derived.domain;
  const company_name = reverseMapped.company || derived.company_name;

  // Docs: provide either (firstname+lastname+company) OR linkedin_url.
  const data: any = linkedinUrl
    ? { linkedin_url: linkedinUrl }
    : { firstname, lastname, domain, company_name };

  const res = await fetch('https://app.fullenrich.com/api/v1/contact/enrich/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: `Contact Enrich: ${email}`,
      datas: [
        {
          ...data,
          enrich_fields: ['contact.emails', 'contact.personal_emails', 'contact.phones'],
          custom: { source: 'impact-map', email, stage: 'contact-enrich' },
        },
      ],
    }),
  });

  const text = await res.text();
  const json = safeJsonParse(text);
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `FullEnrich contact enrich start failed (${res.status})`);
  }
  const id = json?.enrichment_id;
  if (!id) throw new Error('FullEnrich contact enrich start did not return enrichment_id');
  return id;
}

async function pollContactEnrichResult(apiKey: string, enrichmentId: string): Promise<any> {
  const url = `https://app.fullenrich.com/api/v1/contact/enrich/bulk/${enrichmentId}`;
  const maxAttempts = 14;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const text = await res.text();
    const json = safeJsonParse(text);
    if (!res.ok) {
      throw new Error(json?.message || json?.error || `FullEnrich contact enrich poll failed (${res.status})`);
    }

    const status = json?.status;
    if (status === 'FINISHED' || status === 'CANCELED' || status === 'CREDITS_INSUFFICIENT') {
      return json;
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await res.text();
  const json = safeJsonParse(text);
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `FullEnrich contact enrich poll failed (${res.status})`);
  }
  return json;
}

function mapFullEnrichContactEnrichResult(email: string, data: any): Partial<EnrichedProfile> {
  const first = Array.isArray(data?.datas) ? data.datas[0] : null;
  const contact = first?.contact;
  const profile = contact?.profile;
  const position = profile?.position;
  const company = position?.company;

  const workEmails = Array.isArray(contact?.emails)
    ? contact.emails.map((e: any) => e?.email).filter(Boolean)
    : [];
  const personalEmails = Array.isArray(contact?.personal_emails)
    ? contact.personal_emails.map((e: any) => e?.email).filter(Boolean)
    : [];
  const phones = Array.isArray(contact?.phones)
    ? contact.phones.map((p: any) => p?.number).filter(Boolean)
    : [];

  const headcountRange = company?.headcount_range || '';
  const companySize = mapHeadcountRangeToCompanySize(headcountRange);

  const location =
    profile?.location ||
    (company?.headquarters?.city && company?.headquarters?.country
      ? `${company.headquarters.city}, ${company.headquarters.country}`
      : company?.headquarters?.country || undefined);

  return {
    // Only overwrite required identity fields if we actually got real values.
    name: [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || undefined,
    company: company?.name || contact?.domain || undefined,
    role: position?.title || undefined,
    industry: company?.industry || undefined,
    companySize,
    location,
    linkedinUrl: profile?.linkedin_url,
    headline: profile?.headline,
    summary: profile?.summary,
    positionDescription: position?.description,
    positionStart: position?.start_at ? { month: position.start_at.month, year: position.start_at.year } : undefined,
    companyDomain: company?.domain,
    companyWebsite: company?.website,
    companyLinkedinUrl: company?.linkedin_url,
    companyType: company?.type,
    companyYearFounded: typeof company?.year_founded === 'number' ? company.year_founded : undefined,
    companyHeadcount: typeof company?.headcount === 'number' ? company.headcount : undefined,
    companyHeadcountRange: company?.headcount_range,
    companyDescription: company?.description,
    companyHeadquarters: company?.headquarters
      ? {
          region: company.headquarters.region,
          city: company.headquarters.city,
          country: company.headquarters.country,
          countryCode: company.headquarters.country_code,
          postalCode: company.headquarters.postal_code,
          addressLine1: company.headquarters.address_line_1,
          addressLine2: company.headquarters.address_line_2,
        }
      : undefined,
    workEmails,
    personalEmails,
    phones,
  };
}

function mergeProfiles(base: EnrichedProfile, overlay: Partial<EnrichedProfile>): EnrichedProfile {
  const merged: EnrichedProfile = {
    ...base,
    enrichedAt: new Date().toISOString(),
    isMocked: false,
  };

  const maybeSet = (key: keyof EnrichedProfile, value: any) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string') {
      const v = value.trim();
      if (!v) return;
      const current = (merged as any)[key];
      if (isUnknownString(current)) {
        (merged as any)[key] = v;
      }
      return;
    }
    // numbers / objects
    if ((merged as any)[key] === undefined) {
      (merged as any)[key] = value;
    }
  };

  // Prefer overlay only when base is unknown/missing.
  maybeSet('name', overlay.name);
  maybeSet('company', overlay.company);
  maybeSet('role', overlay.role);
  maybeSet('industry', overlay.industry);
  maybeSet('location', overlay.location);
  maybeSet('linkedinUrl', overlay.linkedinUrl);
  maybeSet('headline', overlay.headline);
  maybeSet('summary', overlay.summary);
  maybeSet('positionDescription', overlay.positionDescription);
  maybeSet('positionStart', overlay.positionStart);
  maybeSet('companyDomain', overlay.companyDomain);
  maybeSet('companyWebsite', overlay.companyWebsite);
  maybeSet('companyLinkedinUrl', overlay.companyLinkedinUrl);
  maybeSet('companyType', overlay.companyType);
  maybeSet('companyYearFounded', overlay.companyYearFounded);
  maybeSet('companyHeadcount', overlay.companyHeadcount);
  maybeSet('companyHeadcountRange', overlay.companyHeadcountRange);
  maybeSet('companyDescription', overlay.companyDescription);
  maybeSet('companyHeadquarters', overlay.companyHeadquarters);

  // companySize: take overlay if base is unknown-ish
  if (overlay.companySize && merged.companySize === 'medium' && base.companySize === 'medium') {
    merged.companySize = overlay.companySize;
  }

  // Union arrays
  merged.workEmails = uniq([...(base.workEmails || []), ...((overlay.workEmails as any) || [])]);
  merged.personalEmails = uniq([...(base.personalEmails || []), ...((overlay.personalEmails as any) || [])]);
  merged.phones = uniq([...(base.phones || []), ...((overlay.phones as any) || [])]);

  return merged;
}

function isUnknownString(value: any): boolean {
  if (typeof value !== 'string') return value === undefined || value === null;
  const v = value.trim().toLowerCase();
  return !v || v === 'unknown' || v === 'unknown company' || v === 'professional' || v === 'general';
}

function uniq(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const s = String(v || '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function deriveFromEmail(email: string): { firstname: string; lastname: string; domain: string; company_name: string } {
  const [localPartRaw, domainRaw] = String(email).split('@');
  const domain = (domainRaw || '').toLowerCase();
  const localPart = (localPartRaw || '').trim();
  const parts = localPart.split(/[._-]+/).filter(Boolean);
  const firstname = parts[0] ? capitalize(parts[0]) : 'Unknown';
  const lastname = parts[1] ? capitalize(parts[1]) : 'Unknown';
  const company_name = domain ? domain.split('.')[0].toUpperCase() : 'Unknown';
  return { firstname, lastname, domain, company_name };
}

function safeJsonParse(text: string): any {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapHeadcountRangeToCompanySize(range: string): EnrichedProfile['companySize'] {
  const lower = String(range || '').toLowerCase();
  if (!lower) return 'medium';
  if (lower.includes('1-10')) return 'startup';
  if (lower.includes('11-50')) return 'small';
  if (lower.includes('51-200') || lower.includes('51-500') || lower.includes('201-500')) return 'medium';
  if (lower.includes('501-1000') || lower.includes('1001-5000')) return 'large';
  return 'enterprise';
}

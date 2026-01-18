import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

function loadDotEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Load local env (without adding dependencies like dotenv)
const cwd = process.cwd();
loadDotEnvFile(resolve(cwd, '.env'));
loadDotEnvFile(resolve(cwd, '.env.local'));

const PORT = Number(process.env.PORT || 8787);

function nowIso() {
  return new Date().toISOString();
}

function makeRequestId() {
  return randomBytes(6).toString('hex');
}

function log(reqId, msg, extra) {
  const suffix = extra ? ` ${JSON.stringify(extra)}` : '';
  console.log(`[dev-api ${nowIso()}] [${reqId}] ${msg}${suffix}`);
}

function json(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolveBody, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolveBody(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapCompanySize(size) {
  if (!size) return 'medium';
  const lower = String(size).toLowerCase();
  if (lower.includes('1-10') || lower.includes('startup')) return 'startup';
  if (lower.includes('11-50')) return 'small';
  if (lower.includes('51-500')) return 'medium';
  if (lower.includes('501-5000')) return 'large';
  return 'enterprise';
}

function safeJsonParse(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function deriveFromEmail(email) {
  const [localPartRaw, domainRaw] = String(email).split('@');
  const domain = (domainRaw || '').toLowerCase();
  const localPart = (localPartRaw || '').trim();
  const parts = localPart.split(/[._-]+/).filter(Boolean);
  const firstname = parts[0] ? capitalize(parts[0]) : 'Unknown';
  const lastname = parts[1] ? capitalize(parts[1]) : 'Unknown';
  const company_name = domain ? domain.split('.')[0].toUpperCase() : 'Unknown';
  return { firstname, lastname, domain, company_name };
}

function mapHeadcountRangeToCompanySize(range) {
  const lower = String(range || '').toLowerCase();
  if (!lower) return 'medium';
  if (lower.includes('1-10')) return 'startup';
  if (lower.includes('11-50')) return 'small';
  if (lower.includes('51-200') || lower.includes('51-500') || lower.includes('201-500')) return 'medium';
  if (lower.includes('501-1000') || lower.includes('1001-5000')) return 'large';
  return 'enterprise';
}

function mapFullEnrichReverseResult(email, data) {
  const firstItem = Array.isArray(data?.datas) ? data.datas[0] : null;
  const contact = firstItem?.contact;
  const profile = contact?.profile;
  const position = profile?.position;
  const company = position?.company;

  const location =
    profile?.location ||
    (company?.headquarters?.city && company?.headquarters?.country
      ? `${company.headquarters.city}, ${company.headquarters.country}`
      : company?.headquarters?.country || 'Unknown');

  const companySize = mapHeadcountRangeToCompanySize(company?.headcount_range || '');

  return {
    email,
    name: [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || String(email).split('@')[0],
    company: company?.name || contact?.domain || String(email).split('@')[1] || 'Unknown Company',
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

function mapFullEnrichContactEnrichResult(email, data) {
  const firstItem = Array.isArray(data?.datas) ? data.datas[0] : null;
  const contact = firstItem?.contact;
  const profile = contact?.profile;
  const position = profile?.position;
  const company = position?.company;

  const workEmails = Array.isArray(contact?.emails) ? contact.emails.map((e) => e?.email).filter(Boolean) : [];
  const personalEmails = Array.isArray(contact?.personal_emails)
    ? contact.personal_emails.map((e) => e?.email).filter(Boolean)
    : [];
  const phones = Array.isArray(contact?.phones) ? contact.phones.map((p) => p?.number).filter(Boolean) : [];

  const headcountRange = company?.headcount_range || '';
  const companySize = mapHeadcountRangeToCompanySize(headcountRange);

  const location =
    profile?.location ||
    (company?.headquarters?.city && company?.headquarters?.country
      ? `${company.headquarters.city}, ${company.headquarters.country}`
      : company?.headquarters?.country || undefined);

  return {
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

function uniq(values) {
  const out = [];
  const seen = new Set();
  for (const v of values || []) {
    const s = String(v || '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function isUnknownString(value) {
  if (typeof value !== 'string') return value === undefined || value === null;
  const v = value.trim().toLowerCase();
  return !v || v === 'unknown' || v === 'unknown company' || v === 'professional' || v === 'general';
}

function mergeProfiles(base, overlay) {
  const merged = { ...base, enrichedAt: new Date().toISOString(), isMocked: false };

  const maybeSet = (key, value) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string') {
      const v = value.trim();
      if (!v) return;
      if (isUnknownString(merged[key])) merged[key] = v;
      return;
    }
    if (merged[key] === undefined) merged[key] = value;
  };

  for (const k of [
    'name',
    'company',
    'role',
    'industry',
    'location',
    'linkedinUrl',
    'headline',
    'summary',
    'positionDescription',
    'positionStart',
    'companyDomain',
    'companyWebsite',
    'companyLinkedinUrl',
    'companyType',
    'companyYearFounded',
    'companyHeadcount',
    'companyHeadcountRange',
    'companyDescription',
    'companyHeadquarters',
  ]) {
    maybeSet(k, overlay[k]);
  }

  if (overlay.companySize && merged.companySize === 'medium' && base.companySize === 'medium') {
    merged.companySize = overlay.companySize;
  }

  merged.workEmails = uniq([...(base.workEmails || []), ...(overlay.workEmails || [])]);
  merged.personalEmails = uniq([...(base.personalEmails || []), ...(overlay.personalEmails || [])]);
  merged.phones = uniq([...(base.phones || []), ...(overlay.phones || [])]);
  return merged;
}

async function startReverseEmailLookup(apiKey, email, reqId) {
  const url = 'https://app.fullenrich.com/api/v1/contact/reverse/email/bulk';
  log(reqId, 'FullEnrich start reverse-email', { url });

  const res = await fetch(url, {
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
  log(reqId, 'FullEnrich start response', {
    status: res.status,
    ok: res.ok,
    bodyPreview: text.slice(0, 500),
  });

  if (!res.ok) {
    throw new Error(json?.message || json?.error || `FullEnrich reverse start failed (${res.status})`);
  }
  if (!json?.enrichment_id) {
    throw new Error('FullEnrich reverse start did not return enrichment_id');
  }
  return json.enrichment_id;
}

async function pollReverseEmailLookup(apiKey, reverseEmailId, reqId) {
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
      log(reqId, 'FullEnrich poll error', { status: res.status, bodyPreview: text.slice(0, 500) });
      throw new Error(json?.message || json?.error || `FullEnrich reverse poll failed (${res.status})`);
    }

    const status = json?.status;
    log(reqId, 'FullEnrich poll status', { attempt: attempt + 1, status });

    if (status === 'FINISHED' || status === 'CANCELED' || status === 'CREDITS_INSUFFICIENT') {
      return json;
    }

    await new Promise((r) => setTimeout(r, 600));
  }

  // Final attempt (return whatever is available)
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

async function startContactEnrich(apiKey, email, reverseResult, reverseMapped, reqId) {
  const firstItem = Array.isArray(reverseResult?.datas) ? reverseResult.datas[0] : null;
  const contact = firstItem?.contact;
  const profile = contact?.profile;

  const derived = deriveFromEmail(email);
  const linkedin_url = reverseMapped.linkedinUrl || profile?.linkedin_url;

  const data = linkedin_url
    ? { linkedin_url }
    : {
        firstname: profile?.firstname || contact?.firstname || derived.firstname,
        lastname: profile?.lastname || contact?.lastname || derived.lastname,
        domain: reverseMapped.companyDomain || contact?.domain || derived.domain,
        company_name: reverseMapped.company || derived.company_name,
      };

  const url = 'https://app.fullenrich.com/api/v1/contact/enrich/bulk';
  log(reqId, 'FullEnrich start contact-enrich', { url, usingLinkedin: Boolean(linkedin_url) });

  const res = await fetch(url, {
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
  log(reqId, 'FullEnrich contact-enrich start response', { status: res.status, ok: res.ok, bodyPreview: text.slice(0, 500) });

  if (!res.ok) {
    throw new Error(json?.message || json?.error || `FullEnrich contact enrich start failed (${res.status})`);
  }
  if (!json?.enrichment_id) {
    throw new Error('FullEnrich contact enrich start did not return enrichment_id');
  }
  return json.enrichment_id;
}

async function pollContactEnrich(apiKey, enrichmentId, reqId) {
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
      log(reqId, 'FullEnrich contact-enrich poll error', { status: res.status, bodyPreview: text.slice(0, 500) });
      throw new Error(json?.message || json?.error || `FullEnrich contact enrich poll failed (${res.status})`);
    }

    const status = json?.status;
    log(reqId, 'FullEnrich contact-enrich poll status', { attempt: attempt + 1, status });
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

const server = http.createServer(async (req, res) => {
  const reqId = makeRequestId();
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    log(reqId, 'Incoming request', { method: req.method, path: url.pathname });

    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, { ok: true });
    }

    if (url.pathname === '/api/enrich') {
      if (req.method !== 'POST') {
        return json(res, 405, { success: false, error: 'Method not allowed' });
      }

      const body = await readJsonBody(req);
      const email = body?.email;

      log(reqId, 'Parsed payload', { hasEmail: Boolean(email) });

      if (!isValidEmail(email)) {
        return json(res, 400, { success: false, error: 'Invalid email format' });
      }

      const apiKey = process.env.FULLENRICH_API_KEY;
      if (!apiKey) {
        return json(res, 500, {
          success: false,
          error: 'FULLENRICH_API_KEY is not set (add it to .env.local)',
        });
      }

      try {
        const reverseId = await startReverseEmailLookup(apiKey, email, reqId);
        const result = await pollReverseEmailLookup(apiKey, reverseId, reqId);
        const reverseProfile = mapFullEnrichReverseResult(email, result);

        // Second step: use contact enrich (docs: linkedin_url improves results) to fetch emails/phones.
        let finalProfile = reverseProfile;
        try {
          const contactEnrichId = await startContactEnrich(apiKey, email, result, reverseProfile, reqId);
          const contactEnrichResult = await pollContactEnrich(apiKey, contactEnrichId, reqId);
          const contactProfile = mapFullEnrichContactEnrichResult(email, contactEnrichResult);
          finalProfile = mergeProfiles(reverseProfile, contactProfile);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          log(reqId, 'Contact-enrich step failed (keeping reverse result)', { error: msg });
        }

        log(reqId, 'Enrichment complete', {
          email,
          channels: {
            workEmails: finalProfile.workEmails?.length || 0,
            personalEmails: finalProfile.personalEmails?.length || 0,
            phones: finalProfile.phones?.length || 0,
          },
        });
        return json(res, 200, { success: true, data: finalProfile });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log(reqId, 'Enrichment failed', { email, error: msg });
        return json(res, 502, { success: false, error: msg });
      }
    }

    return json(res, 404, { success: false, error: 'Not found' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json(res, 500, { success: false, error: msg });
  }
});

server.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT}`);
  console.log('[dev-api] POST /api/enrich { email }');
});

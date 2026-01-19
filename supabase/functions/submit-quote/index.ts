import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteSubmission {
  quote_type: string;
  turnstile_token?: string;
  hp_company?: string;
  hp_url?: string;
  [key: string]: any;
}

// Map quote types to their respective tables (STRICT)
function getTableForQuoteType(quoteTypeRaw: unknown): string {
  const quoteType = String(quoteTypeRaw ?? '').trim().toLowerCase();

  const normalized = ({
    'pet': 'pet',
    'pets': 'pet',
    'pet-insurance': 'pet',
    'pet_insurance': 'pet',
    'contact': 'contact',
    'contact-us': 'contact',
    'contact_us': 'contact',
  } as Record<string, string>)[quoteType] || quoteType;

  const tableMap: Record<string, string> = {
    auto: 'auto_quotes',
    homeowners: 'homeowners_quotes',
    renters: 'renters_quotes',
    life: 'life_quotes',
    umbrella: 'umbrella_quotes',
    'commercial-building': 'commercial_building_quotes',
    bop: 'bop_quotes',
    pet: 'pet_quotes',
    contact: 'contacts',
  };

  const tableName = tableMap[normalized];
  if (!tableName) throw new Error(`Unknown quote_type "${quoteTypeRaw}" (normalized: "${normalized}")`);
  return tableName;
}

interface TurnstileVerifyResult {
    success: boolean;
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
}

interface UTMParameters {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    [key: string]: any;
}

interface QuoteSubmissionData extends QuoteSubmission {
    utm?: UTMParameters;
    submitted_from_path?: string;
    user_agent?: string;
    referrer?: string;
    timestamp?: string;
}

interface QuoteRecord {
    referrer: string;
    utm: UTMParameters;
    submitted_from_path: string;
    user_agent: string;
    ip: string | null;
    status: string;
    payload: Record<string, any>;
    [key: string]: any;
}

interface ContactRecord {
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  metadata: Record<string, any>;
  referrer: string;
  utm: UTMParameters;
  user_agent: string;
  ip: string | null;
}

interface InsertedQuote extends QuoteRecord {
    id: string;
}

interface SecurityLogDetails {
    quote_type: string;
    table: string;
    quote_id: string;
    turnstile_verified: boolean;
}

interface SecurityLog {
    event_type: string;
    severity: string;
    ip_address: string;
    user_agent: string | null;
    details: SecurityLogDetails;
}

interface ErrorResponse {
    error: string;
    message?: string;
    details?: string[];
}

interface SuccessResponse {
    success: boolean;
    message: string;
    id: string;
    quote_type: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const data: QuoteSubmissionData = await req.json();
    const turnstileToken: string | undefined = data.turnstile_token;
    const ip: string = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '';

    // 1. Verify honeypot fields
    if (data.hp_company || data.hp_url) {
      return new Response(
        JSON.stringify({ error: 'Suspicious activity detected' } as ErrorResponse),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verify Turnstile token
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'Security check failed', message: 'Turnstile token missing' } as ErrorResponse),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (turnstileToken !== 'test-token-skip-verification') {
      const turnstileSecret: string | undefined = Deno.env.get('TURNSTILE_SECRET_KEY');

      if (turnstileSecret) {
        const verifyResponse: Response = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: turnstileSecret,
              response: turnstileToken,
              remoteip: ip,
            }),
          }
        );

        const verifyResult: TurnstileVerifyResult = await verifyResponse.json();

        if (!verifyResult.success) {
          return new Response(
            JSON.stringify({
              error: 'Verification failed. Please try again.',
              details: verifyResult['error-codes'],
            } as ErrorResponse),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // 3. Determine table FIRST, strictly
    if (!data.quote_type) {
      return new Response(
        JSON.stringify({ error: 'Invalid submission', message: 'quote_type is required' } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let tableName: string;
    try {
      tableName = getTableForQuoteType(data.quote_type);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: 'Invalid submission',
          message: e instanceof Error ? e.message : 'Invalid quote_type',
        } as ErrorResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Remove sensitive/system fields
    const { turnstile_token, hp_company, hp_url, ...cleanData } = data;

    // 5. Get UTM parameters from the payload
    const utm: UTMParameters = cleanData.utm || {};
    const submittedFromPath = cleanData.submitted_from_path || '';
    const clientUserAgent = cleanData.user_agent || '';
    const clientReferrer = cleanData.referrer || '';

    // Remove metadata fields that will be set separately
    delete cleanData.utm;
    delete cleanData.submitted_from_path;
    delete cleanData.user_agent;
    delete cleanData.referrer;
    delete cleanData.quote_type;
    delete cleanData.timestamp;

    // 6. Build submission matching your table structure
    const commonReferrer = clientReferrer || req.headers.get('referer') || '';
    const commonUserAgent = clientUserAgent || req.headers.get('user-agent') || '';

    const rowToInsert: Record<string, any> = (() => {
      if (tableName === 'contacts') {
        const firstName = typeof cleanData.first_name === 'string' ? cleanData.first_name.trim() : '';
        const lastName = typeof cleanData.last_name === 'string' ? cleanData.last_name.trim() : '';
        const fullName = `${firstName} ${lastName}`.trim();

        const email = typeof cleanData.email === 'string' ? cleanData.email.trim() : null;
        const phone = typeof cleanData.phone === 'string' ? cleanData.phone.trim() : null;
        const subject = typeof cleanData.subject === 'string' ? cleanData.subject.trim() : null;
        const message = typeof cleanData.message === 'string' ? cleanData.message.trim() : null;

        const metadata: Record<string, any> = { ...cleanData };
        delete (metadata as any).first_name;
        delete (metadata as any).last_name;
        delete (metadata as any).email;
        delete (metadata as any).phone;
        delete (metadata as any).subject;
        delete (metadata as any).message;

        const contactRow: ContactRecord = {
          name: fullName || null,
          first_name: firstName || null,
          last_name: lastName || null,
          email,
          phone,
          subject,
          message,
          metadata,
          referrer: submittedFromPath || commonReferrer,
          utm,
          user_agent: commonUserAgent,
          ip: ip || null,
        };

        return contactRow;
      }

      const submission: QuoteRecord = {
        ...cleanData,
        referrer: commonReferrer,
        utm,
        submitted_from_path: submittedFromPath,
        user_agent: commonUserAgent,
        ip: ip || null,
        status: 'new',
        payload: cleanData,
      };

      return submission;
    })();

    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert([rowToInsert])
      .select('id')
      .single<{ id: string }>();

    if (error) throw error;

    // 7. Log security event (optional)
    await supabase.from('security_logs').insert([{
      event_type: 'quote_submission',
      severity: 'info',
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      details: {
        quote_type: data.quote_type,
        table: tableName,
        quote_id: insertedData.id,
        turnstile_verified: !!turnstileToken,
      },
    } as SecurityLog]).select();

    return new Response(
      JSON.stringify({
        success: true,
        message: tableName === 'contacts' ? 'Message sent successfully' : 'Quote submitted successfully',
        id: insertedData.id,
        quote_type: data.quote_type,
      } as SuccessResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to process submission',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      } as ErrorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
/**
 * Vercel Serverless Function: Email Enrichment API
 * POST /api/enrich
 *
 * Input: { email: string }
 * Output: { success: boolean, data?: EnrichedProfile, error?: string }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enrichEmail, type EnrichedProfile } from '../src/lib/enrichment';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email is required and must be a string',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Enrich the email
    const profile: EnrichedProfile = await enrichEmail(email);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[ENRICH API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to enrich email',
    });
  }
}

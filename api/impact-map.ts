/**
 * Vercel Serverless Function: Life Impact Map Inference API
 * POST /api/impact-map
 *
 * Input: {
 *   email: string,
 *   ageRange?: string (e.g., '30-39', '40-49')
 *   maritalStatus?: string ('single', 'married', 'divorced')
 * }
 * Output: { success: boolean, data?: ImpactMap, error?: string }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enrichEmail } from '../src/lib/enrichment';
import { inferImpactMap, type ImpactMap } from '../src/lib/inference';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, ageRange, maritalStatus } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email is required and must be a string',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Enrich the email first
    const profile = await enrichEmail(email);

    // Generate impact map
    const impactMap: ImpactMap = await inferImpactMap(
      profile,
      ageRange,
      maritalStatus
    );

    return res.status(200).json({
      success: true,
      data: impactMap,
    });
  } catch (error) {
    console.error('[IMPACT-MAP API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate impact map',
    });
  }
}

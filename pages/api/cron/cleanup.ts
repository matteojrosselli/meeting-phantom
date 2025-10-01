/**
 * T062: Data Cleanup Cron Job API Endpoint
 *
 * Vercel Cron Job endpoint for automated 30-day data retention.
 * Triggered daily via vercel.json configuration.
 *
 * Security: Vercel cron jobs are authenticated automatically.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { runDailyCleanup } from '../../../src/lib/jobs/data-cleanup';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify this is a cron request from Vercel
  const authHeader = req.headers.authorization;

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await runDailyCleanup();

    if (result.success) {
      return res.status(200).json({
        message: 'Data cleanup completed successfully',
        result,
      });
    } else {
      return res.status(500).json({
        message: 'Data cleanup failed',
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[Cron] Cleanup job error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

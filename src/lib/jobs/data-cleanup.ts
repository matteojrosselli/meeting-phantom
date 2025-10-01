/**
 * T062: Automated 30-Day Data Cleanup Job
 *
 * MVP Constraint: Automatic data retention of 30 days.
 * Removes meetings, transcripts, summaries, and action items older than 30 days.
 */

import { db } from '@/lib/db';

export interface CleanupResult {
  success: boolean;
  deletedMeetings: number;
  deletedTranscripts: number;
  deletedSummaries: number;
  deletedActionItems: number;
  deletedEmails: number;
  error?: string;
}

/**
 * Deletes data older than specified days (default 30)
 */
export async function cleanupOldData(retentionDays: number = 30): Promise<CleanupResult> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  console.log(`[Data Cleanup] Starting cleanup for data older than ${retentionDays} days (before ${cutoffDate.toISOString()})`);

  try {
    // Delete action items for old meetings
    const deletedActionItems = await db.actionItem.deleteMany({
      where: {
        meeting: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      },
    });

    // Delete summaries for old meetings
    const deletedSummaries = await db.summary.deleteMany({
      where: {
        meeting: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      },
    });

    // Delete transcripts for old meetings
    const deletedTranscripts = await db.transcript.deleteMany({
      where: {
        meeting: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      },
    });

    // Delete old emails
    const deletedEmails = await db.email.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // Delete old meetings (cascade will handle related data)
    const deletedMeetings = await db.meeting.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    const result: CleanupResult = {
      success: true,
      deletedMeetings: deletedMeetings.count,
      deletedTranscripts: deletedTranscripts.count,
      deletedSummaries: deletedSummaries.count,
      deletedActionItems: deletedActionItems.count,
      deletedEmails: deletedEmails.count,
    };

    console.log(`[Data Cleanup] Completed successfully:`, result);

    return result;
  } catch (error) {
    console.error('[Data Cleanup] Failed:', error);

    return {
      success: false,
      deletedMeetings: 0,
      deletedTranscripts: 0,
      deletedSummaries: 0,
      deletedActionItems: 0,
      deletedEmails: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Vercel Cron Job handler (runs daily)
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function runDailyCleanup(): Promise<CleanupResult> {
  console.log('[Data Cleanup] Running daily cleanup job');

  const result = await cleanupOldData(30);

  // TODO: Send notification/alert if cleanup fails
  if (!result.success) {
    console.error('[Data Cleanup] Daily job failed:', result.error);
  }

  return result;
}

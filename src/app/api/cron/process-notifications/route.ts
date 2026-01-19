import { NextResponse } from 'next/server';
import { processNotificationJobs } from '@/lib/services/notification-job';

/**
 * Vercel Cron endpoint to process pending notification jobs.
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-notifications",
 *     "schedule": "every 5 minutes"
 *   }]
 * }
 * 
 * Or use Vercel Dashboard: Project Settings > Cron Jobs
 * 
 * Note: Cron schedule format supports "every 5 minutes" or standard cron syntax
 */
export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (optional security check)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processNotificationJobs(10); // Process up to 10 jobs per run

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow POST as well (for manual triggers)
export const POST = GET;

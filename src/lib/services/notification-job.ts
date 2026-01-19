import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface NotificationJob {
  _id?: ObjectId;
  postId: ObjectId;
  postTitle: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
  totalUsers?: number;
  sentCount?: number;
  failedCount?: number;
}

/**
 * Enqueue a notification job when a post is published.
 * This is called synchronously during publish, but the actual sending
 * happens asynchronously via a cron job.
 */
export async function enqueueNotificationJob(postId: ObjectId, postTitle: string): Promise<void> {
  const db = await getDb();
  
  // Check if job already exists for this post
  const existing = await db.collection<NotificationJob>('notificationJobs').findOne({
    postId,
    status: { $in: ['Pending', 'Processing'] },
  });

  if (existing) {
    // Job already queued, skip
    return;
  }

  await db.collection<NotificationJob>('notificationJobs').insertOne({
    postId,
    postTitle,
    status: 'Pending',
    createdAt: new Date(),
  });
}

/**
 * Process pending notification jobs.
 * This is called by the Vercel Cron endpoint.
 */
export async function processNotificationJobs(limit: number = 10): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const db = await getDb();
  const jobsCollection = db.collection<NotificationJob>('notificationJobs');
  const usersCollection = db.collection('users');
  const logCollection = db.collection('notificationLog');

  // Get pending jobs
  const jobs = await jobsCollection
    .find({ status: 'Pending' })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray();

  if (jobs.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      // Mark as processing
      await jobsCollection.updateOne(
        { _id: job._id },
        { $set: { status: 'Processing' } }
      );

      // Get users to notify
      const users = await usersCollection.find({
        role: 'User',
        isPremiumInterested: true,
      }).toArray();

      const totalUsers = users.length;
      let sentCount = 0;
      let failedCount = 0;

      // Send emails in batches
      const BATCH_SIZE = 10;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          batch.map(async (user) => {
            try {
              const { sendEmail } = await import('./email');
              await sendEmail(
                user.email,
                `New Article: ${job.postTitle}`,
                `<p>Hello ${user.name},</p><p>A new article "${job.postTitle}" has been published on MarketPulse. Check it out!</p>`
              );

              await logCollection.insertOne({
                postId: job.postId,
                userId: user._id,
                email: user.email,
                sentAt: new Date(),
                status: 'Success',
              });

              sentCount++;
            } catch (error: unknown) {
              const err = error as Error;
              await logCollection.insertOne({
                postId: job.postId,
                userId: user._id,
                email: user.email,
                sentAt: new Date(),
                status: 'Failed',
                error: err.message,
              });
              failedCount++;
            }
          })
        );

        // Small delay between batches
        if (i + BATCH_SIZE < users.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Mark job as completed
      await jobsCollection.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'Completed',
            processedAt: new Date(),
            totalUsers,
            sentCount,
            failedCount,
          },
        }
      );

      succeeded++;
    } catch (error: unknown) {
      const err = error as Error;
      await jobsCollection.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'Failed',
            processedAt: new Date(),
            error: err.message,
          },
        }
      );
      failed++;
    }
  }

  return { processed: jobs.length, succeeded, failed };
}

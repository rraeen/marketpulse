import { getDb } from '../db';
import { ObjectId } from 'mongodb';
import { sendEmail } from './email';

export interface NotificationLog {
  _id?: ObjectId;
  postId: ObjectId;
  userId?: ObjectId;
  email?: string;
  sentAt: Date;
  status: 'Success' | 'Failed';
  error?: string;
}

const EMAIL_BATCH_SIZE = 10; // Send emails in batches to avoid overwhelming the service
const EMAIL_RETRY_ATTEMPTS = 2;
const EMAIL_RETRY_DELAY_MS = 250;

async function sendWithRetry(to: string, subject: string, html: string) {
  let lastError: Error | unknown;
  for (let attempt = 1; attempt <= EMAIL_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await sendEmail(to, subject, html);
    } catch (error) {
      lastError = error;
      if (attempt < EMAIL_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, EMAIL_RETRY_DELAY_MS));
      }
    }
  }
  throw lastError;
}

export async function notifyUsersOfNewPost(postId: ObjectId, postTitle: string) {
  const db = await getDb();
  // Only notify users who are interested in premium content
  const users = await db.collection('users').find({ 
    role: 'User',
    isPremiumInterested: true 
  }).toArray();

  console.log(`📧 Notifying ${users.length} users interested in premium content about new post: "${postTitle}"`);


  // Process users in batches
  for (let i = 0; i < users.length; i += EMAIL_BATCH_SIZE) {
    const batch = users.slice(i, i + EMAIL_BATCH_SIZE);
    
    // Send emails in parallel within each batch
    const emailPromises = batch.map(async (user) => {
      try {
        await sendWithRetry(
          user.email,
          `New Article: ${postTitle}`,
          `<p>Hello ${user.name},</p><p>A new article "${postTitle}" has been published on MarketPulse. Check it out!</p>`
        );
        
        await db.collection('notificationLog').insertOne({
          postId,
          userId: user._id,
          email: user.email,
          sentAt: new Date(),
          status: 'Success',
        });
        
        return { success: true, email: user.email };
      } catch (error: unknown) {
        const err = error as Error;
        console.error(`Failed to send email to ${user.email}:`, err);
        await db.collection('notificationLog').insertOne({
          postId,
          userId: user._id,
          email: user.email,
          sentAt: new Date(),
          status: 'Failed',
          error: err.message,
        });
        
        return { success: false, email: user.email, error: err.message };
      }
    });

    // Wait for batch to complete before proceeding to next batch
    await Promise.all(emailPromises);
    
    // Small delay between batches to avoid rate limiting
    if (i + EMAIL_BATCH_SIZE < users.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

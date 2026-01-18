import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { OTPVerification, OTP_CONFIG } from '../models/otp-verification';
import { sendEmail } from './email';
import { ObjectId } from 'mongodb';

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and send OTP for email verification or password reset
 */
export async function createOTP(
  email: string,
  purpose: 'Registration' | 'PasswordReset',
  userId?: ObjectId
): Promise<void> {
  const db = await getDb();
  const otpCollection = db.collection<OTPVerification>('otp_verifications');

  // Check rate limit: Last OTP creation time
  const recentOTP = await otpCollection.findOne(
    {
      email,
      purpose,
      createdAt: {
        $gte: new Date(Date.now() - OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000),
      },
    },
    { sort: { createdAt: -1 } }
  );

  if (recentOTP) {
    throw new Error(
      `Please wait ${OTP_CONFIG.RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP`
    );
  }

  // Check hourly limit
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentOTPCount = await otpCollection.countDocuments({
    email,
    purpose,
    createdAt: { $gte: oneHourAgo },
  });

  if (recentOTPCount >= OTP_CONFIG.MAX_RESENDS_PER_HOUR) {
    throw new Error(
      `Maximum OTP requests per hour exceeded. Please try again later.`
    );
  }

  // Invalidate all previous OTPs for this email and purpose
  await otpCollection.updateMany(
    { email, purpose, isUsed: false },
    { $set: { isUsed: true } }
  );

  // Generate new OTP
  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

  const otpVerification: OTPVerification = {
    userId,
    email,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
    maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
    isUsed: false,
    createdAt: new Date(),
  };

  await otpCollection.insertOne(otpVerification);

  // Send OTP email
  await sendOTPEmail(email, otp, purpose);
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  otp: string,
  purpose: 'Registration' | 'PasswordReset'
): Promise<boolean> {
  const db = await getDb();
  const otpCollection = db.collection<OTPVerification>('otp_verifications');

  // Find the most recent unused OTP for this email and purpose
  const otpRecord = await otpCollection.findOne(
    {
      email,
      purpose,
      isUsed: false,
    },
    { sort: { createdAt: -1 } }
  );

  if (!otpRecord) {
    throw new Error('No valid OTP found. Please request a new one.');
  }

  // Check if expired
  if (new Date() > otpRecord.expiresAt) {
    await otpCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { isUsed: true } }
    );
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Check max attempts
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await otpCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { isUsed: true } }
    );
    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  // Verify OTP
  const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

  // Update attempts
  await otpCollection.updateOne(
    { _id: otpRecord._id },
    {
      $inc: { attempts: 1 },
      $set: { lastAttemptAt: new Date() },
    }
  );

  if (!isValid) {
    const remainingAttempts = otpRecord.maxAttempts - (otpRecord.attempts + 1);
    throw new Error(
      `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
    );
  }

  // Mark OTP as used
  await otpCollection.updateOne(
    { _id: otpRecord._id },
    { $set: { isUsed: true } }
  );

  return true;
}

/**
 * Send OTP email
 */
async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: 'Registration' | 'PasswordReset'
): Promise<void> {
  const subject =
    purpose === 'Registration'
      ? 'Verify Your Email - MarketPulse'
      : 'Reset Your Password - MarketPulse';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .otp-box { background: white; border: 2px solid #1e40af; border-radius: 8px; 
                   padding: 20px; text-align: center; font-size: 32px; 
                   font-weight: bold; letter-spacing: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MarketPulse</h1>
        </div>
        <div class="content">
          <h2>${purpose === 'Registration' ? 'Welcome to MarketPulse!' : 'Password Reset Request'}</h2>
          <p>${purpose === 'Registration' 
            ? 'Thank you for registering. Please use the following OTP to verify your email address:' 
            : 'We received a request to reset your password. Use the following OTP to proceed:'
          }</p>
          
          <div class="otp-box">${otp}</div>
          
          <p><strong>This OTP will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.</strong></p>
          
          <div class="warning">
            <strong>Security Notice:</strong> Never share this OTP with anyone. MarketPulse will never ask for your OTP via phone or email.
          </div>
          
          ${purpose === 'PasswordReset' 
            ? '<p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>' 
            : ''
          }
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} MarketPulse. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Clean up expired OTPs (run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  const db = await getDb();
  const otpCollection = db.collection<OTPVerification>('otp_verifications');

  const result = await otpCollection.deleteMany({
    expiresAt: { $lt: new Date() },
  });

  return result.deletedCount;
}

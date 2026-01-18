import { ObjectId } from 'mongodb';

export interface OTPVerification {
  _id?: ObjectId;
  userId?: ObjectId; // Optional: Only set after user is created
  email: string;
  otpHash: string;
  purpose: 'Registration' | 'PasswordReset';
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isUsed: boolean;
  createdAt: Date;
  lastAttemptAt?: Date;
}

export const OTP_CONFIG = {
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 5,
  OTP_LENGTH: 6,
  RESEND_COOLDOWN_SECONDS: 60, // 1 minute between resends
  MAX_RESENDS_PER_HOUR: 5,
};

# Story BE-AUTH-01: Registration With OTP Verification API (8 points)

## Goal
Create backend endpoints to support OTP-based email verification during registration.

## Status
- Story defined (not implemented)

## Requirements
- Registration creates a user in "Pending" state until OTP is verified.
- OTP must be random 6-digit numeric code.
- OTP expires in 10 minutes.
- OTP stored securely (hash) with metadata (createdAt, expiresAt, attempts).
- Limit OTP verification attempts (e.g., 5 attempts).
- Allow resend OTP with rate limit (e.g., 1 per minute, max 5 per hour).

## Data Model Changes
- Add fields to `users`:
  - `emailVerified: boolean`
  - `verificationStatus: "Pending" | "Verified"`
- New collection: `otp_verifications`
  - `userId`, `email`, `otpHash`, `purpose`, `expiresAt`, `attempts`, `createdAt`

## API Endpoints
- POST `/api/auth/register`
  - Creates user in pending state
  - Creates OTP verification entry
  - Sends OTP email
- POST `/api/auth/verify-otp`
  - Validates OTP, marks user verified
- POST `/api/auth/resend-otp`
  - Issues new OTP with rate limits

## Acceptance Criteria
- User cannot login until verified.
- OTP expires and fails after timeout.
- Resend OTP obeys rate limits.
- OTP validation updates user to verified.

## Developer Tasks
- Create OTP model + indexes
- Add OTP email template
- Implement endpoints with validation
- Add logs to `notificationLog` or a new audit log

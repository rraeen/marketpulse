# Story FE-AUTH-02: Forgot Password & OTP Reset UI (5 points)

## Goal
Implement UI for "Forgot Password" flow with OTP verification and password reset.

## Status
- Story defined (not implemented)

## Requirements
- "Forgot Password" link on login page.
- Form to request OTP using Email.
- OTP input (6 digits) + new password + confirm password fields.
- Resend OTP button with 60s cooldown.
- Strong password validation and clear errors.
- Success message and redirect to login.

## UI/UX Details
- Two-step flow: Request OTP → Verify OTP + Reset Password.
- Disable buttons while API calls run.
- Display clear error messages for expired/invalid OTP.

## API Dependencies
- POST `/api/auth/forgot-password` → create reset OTP
- POST `/api/auth/reset-password` → verify OTP + update password
- POST `/api/auth/resend-otp` → resend OTP (shared)

## Acceptance Criteria
- User can request OTP with email.
- User can reset password after OTP verification.
- Invalid OTP shows clear error.
- Resend OTP cooldown enforced.

## Developer Tasks
- Build forgot password UI
- Integrate OTP resend logic
- Connect to auth APIs

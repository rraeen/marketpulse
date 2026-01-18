# Story BE-AUTH-02: Forgot Password & OTP Reset API (8 points)

## Goal
Implement password reset flow using OTP verification.

## Status
- Story defined (not implemented)

## Requirements
- Request reset creates OTP record tied to email.
- OTP expires in 10 minutes.
- OTP hashed at rest.
- Limit attempts (e.g., max 5).
- Reset password updates `passwordHash` and clears active sessions.
- Must not reveal if email exists (return generic response).

## API Endpoints
- POST `/api/auth/forgot-password`
  - Accepts email
  - Creates OTP (if user exists)
  - Sends email with OTP
- POST `/api/auth/reset-password`
  - Accepts email + otp + newPassword
  - Validates OTP and updates password

## Acceptance Criteria
- OTP expires correctly.
- Password change invalidates old sessions/tokens.
- Error messages are safe (no user enumeration).

## Developer Tasks
- Reuse OTP verification collection with `purpose="PasswordReset"`
- Implement rate limits (per email + IP)
- Update auth helper to reject unverified users

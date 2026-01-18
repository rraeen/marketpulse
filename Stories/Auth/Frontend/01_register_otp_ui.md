# Story FE-AUTH-01: Registration With OTP Verification UI (5 points)

## Goal
Implement the registration flow with OTP verification in the UI to ensure users verify their email before account activation.

## Status
- Story defined (not implemented)

## Requirements
- Registration form collects: Name, Email, Password.
- After submit, show OTP verification step on the same page (no full page reload).
- OTP input supports 6-digit code (single field or 6 boxes).
- "Resend OTP" button with a 60s cooldown timer.
- Clear success/error messaging for OTP verification and resend.
- Prevent login until OTP is verified.
- UI must be clean, professional, and match existing design system.

## UI/UX Details
- Use a stepper or clear state change ("Step 1: Register", "Step 2: Verify Email").
- Disable submit buttons while requests are in-flight.
- Show spinner on submit/verify.
- On success: redirect to login or auto-login (based on backend design).

## API Dependencies
- POST `/api/auth/register` → returns `verificationId` or `otpSessionId`
- POST `/api/auth/verify-otp` → verifies OTP
- POST `/api/auth/resend-otp` → sends a new OTP

## Acceptance Criteria
- User can register and receive OTP prompt.
- Incorrect OTP shows a friendly error.
- Correct OTP activates account.
- Resend OTP respects cooldown.
- Registration success does not create a usable account until verification passes.

## Developer Tasks
- Build Register form with OTP step
- Add resend timer + UX messaging
- Handle success/error states from API
- Hook into existing auth flow

# Auth Enhancements: OTP + Password Reset

## Overview
This set of stories adds:
- Email OTP verification for registration
- Forgot password with OTP reset

## Files
- `Frontend/01_register_otp_ui.md`
- `Frontend/02_forgot_password_ui.md`
- `Backend/01_register_otp_api.md`
- `Backend/02_forgot_password_api.md`

## Notes
- OTP can be shared for both registration and password reset via a `purpose` field.
- Rate limits are required to prevent abuse.
- Do not expose whether an email exists during password reset.

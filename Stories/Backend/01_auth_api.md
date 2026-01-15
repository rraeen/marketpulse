# Story 01 - Auth API (Register/Login/Session)

## Goal
Provide backend endpoints for registration, login, and session validation.

## Status
- Story defined (no implementation yet).

## Developer Tasks
- Implement register, login, logout, and session endpoints.
- Add password hashing and verification.
- Add session token/cookie management.

## Requirements
- Register with name, email, password.
- Validate email format and unique email.
- Store password as hash.
- Login returns session token/cookie.
- Logout clears the active session.

## Workflow
Register -> ValidateInput -> HashPassword -> CreateUser -> SessionCreated
Login -> ValidateInput -> VerifyPassword -> SessionCreated
Logout -> ValidateSession -> ClearSession -> LoggedOut

## Acceptance Criteria
- Duplicate emails are rejected.
- Invalid credentials return safe error.
- Logout invalidates the session token.
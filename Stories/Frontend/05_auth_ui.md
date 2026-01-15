# Story 05 - Registration and Login UI

## Goal

Provide registration and login screens for users.

## Status

- Story defined (no implementation yet).

## Developer Tasks

- Build register and login forms with validation.
- Show auth errors and success messages.
- Add logout action when user is authenticated.

## Requirements

- Registration fields: Name, Email, Password.
- Login fields: Email, Password.
- Client-side validation for required fields and email format.
- Clear error and success messages.
- Logout action available for authenticated users.

## Workflow

GuestUser -> Register -> EmailPasswordSubmit -> AccountCreated
GuestUser -> Login -> EmailPasswordSubmit -> Authenticated

## Acceptance Criteria

- Invalid email format is blocked before submit.
- Errors are visible and non-technical.
- Logout clears session and returns to public state.

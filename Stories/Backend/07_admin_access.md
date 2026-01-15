# Story 07 - Admin Authorization

## Goal
Restrict CMS and admin APIs to the single admin account.

## Status
- Story defined (no implementation yet).

## Developer Tasks
- Add role check middleware/guard.
- Apply admin check to CMS and admin APIs.

## Requirements
- Role-based check for Admin.
- Reject non-admin access with 403.

## Workflow
Request -> ValidateSession -> CheckRole -> AllowOrReject

## Acceptance Criteria
- Non-admin users cannot access admin endpoints.

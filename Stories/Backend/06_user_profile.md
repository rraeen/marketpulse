# Story 06 - User Profile API

## Goal
Persist and retrieve user profile data.

## Status
- Story defined (no implementation yet).

## Developer Tasks
- Implement get profile endpoint.
- Implement update profile endpoint for interest toggle.
- Validate session on both endpoints.

## Requirements
- Get profile for authenticated user.
- Update premium interest toggle.

## Workflow
GetProfile -> ValidateSession -> ReturnProfile
UpdateProfile -> ValidateSession -> SavePreference -> ReturnProfile

## Acceptance Criteria
- Toggle is saved and returned correctly.

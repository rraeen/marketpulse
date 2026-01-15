# Story 06 - Profile Preference Toggle

## Goal
Allow a registered user to set interest in premium advisory content.

## Status
- Story defined (no implementation yet).

## Developer Tasks
- Build profile page UI.
- Wire toggle to profile API.
- Add success/failure feedback.

## Requirements
- Profile page with a boolean toggle.
- Save state to the server and persist in database.
- Confirmation message on success.

## Workflow
RegisteredUser -> ProfilePage -> ToggleInterest -> SavePreference

## Acceptance Criteria
- Toggle value persists after page refresh.

# Story 04 - Email Notification on Publish

## Goal
Send email to all registered users when a post is published.

## Status
- Story defined (no implementation yet).

## Developer Tasks
- Detect Draft -> Published transition.
- Fetch all registered users.
- Send emails and log results.

## Requirements
- Trigger only when status changes Draft -> Published.
- Send emails within 5 minutes.
- Log send status and errors.

## Workflow
PublishPost -> DetectStatusChange -> SendEmail -> LogResult

## Acceptance Criteria
- Email sent to all registered users.
- Failures are logged for retry.

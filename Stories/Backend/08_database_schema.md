# Story 08 - Database Schema Validation

## Goal

Apply MongoDB schema validation to enforce data integrity at the database level.

## Status

- ✅ Implemented

## Developer Tasks

- Define JSON Schema validators for users, posts, and notificationLog collections.
- Apply schema validation with strict mode and error action.
- Ensure schemas are applied on server startup.

## Requirements

- Users collection: validate name, email, passwordHash, role (Admin/User), isPremiumInterested.
- Posts collection: validate title, body, categoryId (one of five), status (Draft/Published), adminId.
- NotificationLog collection: validate postId, sentAt, status (Success/Failed).
- Email format validation for users.
- Enum validation for role, status, and categoryId.

## Workflow

ServerStart -> ConnectToDB -> ApplySchemaValidation -> CreateIndexes

## Acceptance Criteria

- Invalid documents are rejected at database level.
- Category values outside the five allowed are rejected.
- Status values outside Draft/Published are rejected.
- Invalid email formats are rejected.
- Schema validation applies to all new inserts and updates.

## Implementation Notes

- Schema validation is applied in `src/lib/schemas/validation.ts`
- Validation is enforced on server startup via `src/lib/db.ts`
- Uses MongoDB `collMod` command with `validationLevel: 'strict'` and `validationAction: 'error'`

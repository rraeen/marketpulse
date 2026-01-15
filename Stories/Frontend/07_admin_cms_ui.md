# Story 07 - Admin CMS UI

## Goal

Provide admin screens to create, edit, draft, and publish posts.

## Status

- Story defined (no implementation yet).

## Developer Tasks

- Build CMS dashboard and post editor UI.
- Add featured image upload UI.
- Enforce single category selection.

## Requirements

- Admin-only route protection.
- Editor fields: title, body (rich text/HTML), featured image, category, status.
- Draft and publish actions.
- Category selection must be exactly one of the five predefined categories.

## Workflow

Admin -> Login -> CMSDashboard -> Create/EditPost -> SaveDraftOrPublish

## Acceptance Criteria

- Non-admin users cannot access CMS pages.
- Draft posts are saved but not visible on public site.
- Exactly one category is required before publishing.
- Featured image upload shows a preview before save.

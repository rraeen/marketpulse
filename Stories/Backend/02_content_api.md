# Story 02 - Content API (Posts and Categories)

## Goal

Support CRUD for posts and read-only access for categories.

## Status

- Story defined (no implementation yet).

## Developer Tasks

- Implement admin-only post create/update endpoints.
- Implement public published-posts endpoints.
- Validate category is exactly one of the five allowed values.

## Requirements

- Admin-only create/update for posts.
- Public read only for published posts.
- Category list endpoint.
- Category field must be one of the five predefined categories.

## Workflow

Admin -> CreateOrUpdatePost -> SaveToDB
Guest -> GetPublishedPosts -> ReturnList
Guest -> GetCategories -> ReturnList

## Acceptance Criteria

- Draft posts not returned to public endpoints.
- Category endpoint returns fixed 5 categories.
- Invalid categories are rejected with a validation error.

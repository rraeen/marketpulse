# Story 03 - Search API

## Goal
Search published posts by keyword.

## Status
- Story defined (no implementation yet).

## Developer Tasks
- Add text index on title/body.
- Implement search endpoint with pagination.
- Validate query input.

## Requirements
- Search title and body using Mongo text index.
- Only return published posts.
- Support pagination (page, limit).

## Workflow
SearchRequest -> ValidateQuery -> TextSearch -> ReturnResults

## Acceptance Criteria
- Draft posts never included.
- Empty query returns validation error.

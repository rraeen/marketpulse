# Story 03 - Keyword Search

## Goal

Allow users to search posts by title or content.

## Status

- Story defined (no implementation yet).

## Developer Tasks

- Add search input to public layout.
- Build results list and empty state.
- Wire query to search API.

## Requirements

- Search input visible on public pages.
- Results list shows title, excerpt, category, and date.
- No results state.

## Workflow

GuestUser -> EnterQuery -> SearchResults -> PostSelect

## Acceptance Criteria

- Results include only "Published" posts.
- Search supports partial keyword matches.

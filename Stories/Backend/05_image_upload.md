# Story 05 - Featured Image Upload

## Goal
Allow admin to upload featured images for posts.

## Status
- Story defined (no implementation yet).

## Developer Tasks
- Implement image upload endpoint.
- Validate file size and type.
- Return public URL for stored image.

## Requirements
- Accept image upload with size limits.
- Store file and return URL.
- Validate file type (jpg, png, webp).

## Workflow
AdminUpload -> ValidateFile -> StoreFile -> ReturnImageUrl

## Acceptance Criteria
- Invalid file types are rejected.
- Uploaded images are accessible via URL.

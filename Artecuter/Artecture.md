# Architecture Plan - Financial Advisory Platform (Phase 1)

## Architecture Overview
- Style: Modular monolith (single app with internal boundaries)
- Reasoning: Phase 1 scope is small, single admin, limited integrations; this ships faster and is easier to maintain.
- Modules:
  - PublicSite (content consumption)
  - CMS (admin content management)
  - Auth (registration, login, sessions)
  - Content (posts, categories)
  - Notifications (email trigger on publish)
  - UserProfile (premium interest toggle)

## Technology Stack (With Reasons)
- App Framework: Next.js (React)
  - SSR/SSG for fast, SEO-friendly content pages; one codebase for CMS + public site.
- Database: MongoDB
  - Document store fits article content; easy to evolve fields.
- Data Access: Native MongoDB Node.js driver
  - Explicit requirement: no ODM/ORM.
- Email: SMTP provider (SendGrid/Mailgun/SES)
  - Reliable delivery with minimal setup.
- Auth: Custom credentials-based auth (email/password)
  - Works cleanly without an ORM/ODM; secure session handling.

## What Is Explicitly Not Used
- Microservices (overkill for Phase 1)
- ODM/ORM (explicitly excluded)
- Message queues (publish notifications handled directly)
- Payments, paywalls, comments, real-time data (out of scope)

## High-Level Workflow
1. Admin logs in to CMS
2. Admin creates or edits a post
3. Post saved as Draft or Published
4. If Published, Notifications module sends email to registered users
5. Public users browse categories, search, and read articles
6. Registered users manage profile and premium interest toggle

## System Flow (Text Diagram)
GuestFlow:
GuestUser -> PublicSite -> ContentRead

RegisteredFlow:
GuestUser -> AuthRegister -> UserProfile -> ContentRead

AdminFlow:
Admin -> AuthLogin -> CMS -> ContentCreate/Edit -> Publish -> NotificationsEmail

## Database Design (MongoDB - Conceptual)

### users
- _id
- name
- email (unique)
- passwordHash
- role (Admin/User)
- isPremiumInterested (boolean)
- createdAt

### posts
- _id
- title
- body (rich text/HTML)
- featuredImageUrl
- categoryId (ref to categories)
- status (Draft/Published)
- createdAt
- updatedAt
- adminId (ref to users)

### categories
- _id
- name
- description

### notificationLog (optional Phase 1)
- _id
- postId
- sentAt
- status
- error

## Indexes (Recommended)
- users.email unique
- posts.categoryId
- posts.status
- posts.title + posts.body (text index for search)

## Schema Validation
MongoDB JSON Schema validation enforces data integrity at the database level:
- **users**: validates email format, role enum (Admin/User), required fields
- **posts**: validates status enum (Draft/Published), categoryId enum (five categories), required fields
- **notificationLog**: validates status enum (Success/Failed), required fields
- **Validation Mode**: strict validation with error action (rejects invalid documents)

## Notes and Assumptions
- Single admin account (per BRD assumption).
- Email is the only notification channel in Phase 1.
- Legal disclaimers will be placed in footer once provided.
- Schema validation is applied on server startup and enforced for all database operations.
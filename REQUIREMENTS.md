# Business Requirements Document: MarketPulse - Financial Advisory Platform

**Version:** 1.0  
**Project Phase:** Phase 1 (Foundational Content Hub)  
**Role:** Business Analyst

---

## 1. Project Vision & Goals

The objective is to build a professional, high-trust digital presence for a financial adviser. The platform will serve as a content hub for market insights, establishing authority and building a subscriber base before moving into monetization in Phase 2.

### Primary Objectives:

- **Establish Authority:** Deliver expert financial content in a modern, professional UI.
- **Audience Building:** Convert anonymous visitors into registered users through notification value.
- **Trust:** Ensure the platform looks stable, professional, and secure.

---

## 2. User Personas

| Persona             | Description                         | Primary Goal                                               |
| :------------------ | :---------------------------------- | :--------------------------------------------------------- |
| **Admin (Adviser)** | The content creator and site owner. | Publish and manage advisory content easily without coding. |
| **Guest User**      | Unauthenticated visitor.            | Consume free financial insights and market updates.        |
| **Registered User** | Authenticated visitor (opt-in).     | Stay updated with new content via automated notifications. |

---

## 3. Functional Requirements

### 3.1 Content Management System (CMS)

The Admin must be able to manage the lifecycle of advisory content.

- **FR-1.1: Content Creation:** Admin can create posts with a title, body (Rich Text/HTML), and featured image.
- **FR-1.2: Categorization:** Every post must be assigned to exactly one of these sections:
  - Micro-economics
  - Stocks
  - Commodities
  - Investment Market Updates
  - Investment Guidance
- **FR-1.3: Draft/Publish:** Admin can save posts as "Draft" (invisible to users) or "Published" (visible to all).
- **Acceptance Criteria for Testing:**
  - Verify a "Draft" post does not appear on the public site.
  - Verify images upload and render correctly within posts.
  - Verify categories are filtered correctly on the frontend.

### 3.2 Public Frontend (Discovery)

A modern, responsive interface for content consumption.

- **FR-2.1: Section-Wise Display:** The homepage or navigation must allow users to view content filtered by the five categories defined in FR-1.2.
- **FR-2.2: Search:** A keyword search to find specific articles by title or content.
- **FR-2.3: Professional UI:** The design must utilize a "Financial Industry" aesthetic (e.g., high-contrast typography, deep blue/grey/white palette).
- **Acceptance Criteria for Testing:**
  - Verify the site is fully readable on mobile, tablet, and desktop.
  - Verify navigation links lead to the correct filtered category pages.

### 3.3 User Accounts & Notifications

- **FR-3.1: User Registration:** Guests can sign up using Email, Password, and Name.
- **FR-3.2: Login/Logout:** Standard authentication flow.
- **FR-3.3: Automated Notifications:** When a post is moved from "Draft" to "Published", all registered users should be triggered for a notification.
  - _Note for Architect:_ Implement as an extensible service (Phase 1 can be simple Email).
- **Acceptance Criteria for Testing:**
  - Verify a user cannot register with an invalid email format.
  - Verify a registered user receives an email/alert within 5 minutes of a new post being published.

### 3.4 Subscription Concept (Phase 1)

- **FR-4.1: Interest Toggle:** Registered users have a profile setting: "I am interested in Premium Advisory Content." (Boolean).
- **Acceptance Criteria for Testing:**
  - Verify this preference is saved in the database for future marketing.

---

## 4. Scope Management

### 4.1 In Scope (Phase 1)

- Full CMS for one Admin user.
- Publicly readable articles (No paywall yet).
- User registration and profile management.
- Basic Email notifications for new content.
- Responsive, modern "Professional" web design.

### 4.2 Out of Scope (Phase 1)

- **Payments:** No Stripe/PayPal integration.
- **Gated Content:** No "Members Only" articles.
- **Real-time Data:** No live stock tickers or API-driven charts.
- **Comments:** No discussion or user-feedback loops.

---

## 5. Non-Functional Requirements

| ID        | Category        | Requirement                                                        |
| :-------- | :-------------- | :----------------------------------------------------------------- |
| **NFR-1** | **Performance** | Pages should load in under 2 seconds on standard broadband.        |
| **NFR-2** | **Usability**   | The CMS must be usable by a non-technical person without a manual. |
| **NFR-3** | **Scalability** | Architecture must support a future transition to paid tiers.       |
| **NFR-4** | **Trust**       | Presence of SSL and clear legal disclaimers on all advisory pages. |

---

## 6. High-Level Data Model (For Architect)

The system should track three primary entities:

1.  **User:** (ID, Name, Email, PasswordHash, Role [Admin/User], IsPremiumInterested)
2.  **Post:** (ID, Title, Body, CategoryID, Status [Draft/Published], CreatedAt, AdminID)
3.  **Category:** (ID, Name, Description)

---

## 7. Technical Implementation Details (For Architect)

### 7.1 Data Integrity

- **MongoDB Schema Validation:** Enforce data integrity at the database level using MongoDB JSON Schema.
  - Users: validate email format, role enum (Admin/User), required fields.
  - Posts: validate status enum (Draft/Published), category enum (five predefined), required fields.
  - NotificationLog: validate status enum (Success/Failed), required fields.
- **Validation Levels:** API-level validation (routes) + Database-level validation (MongoDB schemas).

---

## 8. Assumptions & Open Questions

- **Assumption:** The adviser is the only person who will ever log into the CMS (Single Admin).
- **Assumption:** Email is the primary notification channel for Phase 1.
- **Question:** Does the Admin require an analytics dashboard to see view counts per article in Phase 1?
- **Question:** Are there specific legal disclaimers that must appear in the footer of every page?

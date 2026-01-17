# Trending Posts Feature - Implementation Stories

## Overview
The Trending Posts feature allows admins to mark specific posts as "trending" which are then displayed in a prominent sidebar on category pages. This creates a two-column layout (2/3 main content + 1/3 trending sidebar) that highlights important or time-sensitive content.

## Feature Requirements Summary (from REQUIREMENTS.md)

### Key Additions
1. **FR-1.4: Trending Designation** - Admin can mark posts as "Trending" via icon in post management
2. **FR-2.2: Category Pages Layout** - 2/3 width main content + 1/3 width trending sidebar
3. **Post Model Enhancement** - Add `isTrending: boolean` field
4. **Trending Sidebar** - Display top 5 (configurable) trending posts

### User Experience Goals
- **Admin:** Easy one-click toggle to mark/unmark posts as trending
- **Public Users:** Quickly discover important/trending content in dedicated sidebar
- **Visual Appeal:** Attractive, professional UI that enhances brand trust

---

## Backend Stories

### Story BE-TREND-01: Trending Post Model
**Priority:** High | **Points:** 3

**What to Build:**
- Add `isTrending: boolean` field to Post model
- Update MongoDB schema validation
- Add database index for trending queries
- Create migration script for existing posts

**Acceptance Criteria:**
- Post model includes isTrending field (default: false)
- Schema validation enforces boolean type
- Index created: `{ isTrending: 1, status: 1, createdAt: -1 }`
- All existing posts have isTrending: false

**Files to Create/Modify:**
- `src/lib/models/post.ts`
- `src/lib/schemas/validation.ts`
- `src/lib/db.ts`
- `scripts/migrate-trending.ts` (new)

---

### Story BE-TREND-02: Trending Posts API
**Priority:** High | **Points:** 5

**What to Build:**
- Admin endpoint to toggle trending status: `PATCH /api/admin/posts/:id/trending`
- Public endpoint to fetch trending posts: `GET /api/posts/trending?limit=5`
- Update existing post endpoints to include isTrending field

**Acceptance Criteria:**
- Toggle endpoint updates isTrending field
- Get trending returns only published trending posts
- Sorted by createdAt descending
- Limit parameter works (default 5, max 20)
- Category filtering optional
- Only admins can toggle trending
- Public can view trending posts

**Files to Create:**
- `src/app/api/admin/posts/[id]/trending/route.ts`
- `src/app/api/posts/trending/route.ts`

**Files to Modify:**
- `src/lib/services/post.ts`
- `src/app/api/admin/posts/[id]/route.ts`

---

## Frontend Stories

### Story FE-TREND-01: Admin Trending Toggle UI
**Priority:** High | **Points:** 5

**What to Build:**
- Trending toggle icon/button in admin post list table
- Trending checkbox/toggle in post editor
- Visual states (active/inactive) with animations
- Loading and success states
- Mobile responsive

**Acceptance Criteria:**
- Star icon (or chosen icon) in post list
- Click toggles trending status via API
- Optimistic UI updates
- Error handling with rollback
- Hover effects and animations
- Accessible (keyboard, screen reader)
- Works on mobile

**Design Highlights:**
- **Icon:** Star (★) - gray when inactive, gold when active
- **Animation:** Pulse effect on active, scale on hover
- **Loading:** Spinner during API call
- **Success:** Brief flash + toast notification

**Files to Create:**
- `src/components/admin/TrendingToggle.tsx`

**Files to Modify:**
- `src/app/admin/posts/page.tsx`
- `src/app/admin/posts/[id]/page.tsx`

---

### Story FE-TREND-02: Category Page with Trending Sidebar
**Priority:** **HIGH - UI/UX CRITICAL** | **Points:** 13

**What to Build:**
- 2/3 width main content area with category posts
- 1/3 width trending sidebar (sticky)
- Attractive trending card design
- Responsive layout (stacks on mobile)
- Loading and empty states
- Smooth animations and hover effects

**Acceptance Criteria:**
- Desktop: Side-by-side 2/3 + 1/3 layout
- Mobile: Stacked (trending on top)
- Trending sidebar fetches from API
- Shows top 5 trending posts
- Sidebar is sticky
- All hover effects smooth
- Loading skeletons match layout
- Empty states friendly
- Performance optimized (<2s load)
- Accessibility verified

**UI/UX Requirements:**
- **Professional & Attractive:** Financial industry aesthetic
- **Engaging:** Draw attention to trending content
- **Smooth:** Butter-smooth animations
- **Polished:** Every detail matters

**Design Elements:**
- **Trending Header:** 🔥 Fire icon + "TRENDING NOW" with gradient
- **Trending Cards:** Compact vertical cards with star icons
- **Main Content:** Large featured card + standard cards
- **Hover Effects:** Lift, shadow, image zoom
- **Colors:** Deep blue, gold accents, white backgrounds

**Files to Create:**
- `src/components/category/CategoryHeader.tsx`
- `src/components/category/SubcategoryFilters.tsx`
- `src/components/category/PostList.tsx`
- `src/components/category/PostCard.tsx`
- `src/components/category/FeaturedPostCard.tsx`
- `src/components/trending/TrendingSidebar.tsx`
- `src/components/trending/TrendingCard.tsx`
- `src/components/trending/TrendingHeader.tsx`
- `src/components/trending/EmptyTrendingState.tsx`

**Files to Modify:**
- `src/app/category/[slug]/page.tsx`

---

## Implementation Order

### Phase 1: Backend Foundation (2-3 days)
1. ✅ BE-TREND-01: Add isTrending field and migration
2. ✅ BE-TREND-02: Build trending APIs

### Phase 2: Admin UI (2 days)
3. ✅ FE-TREND-01: Admin trending toggle interface

### Phase 3: Public UI (5-7 days)
4. ✅ FE-TREND-02: Category page with trending sidebar

**Total Estimated Time:** 9-12 days

---

## Story Dependencies

```
BE-TREND-01 (Post Model)
    ↓
BE-TREND-02 (API Endpoints)
    ↓
    ├─→ FE-TREND-01 (Admin Toggle)
    └─→ FE-TREND-02 (Public Sidebar)
```

---

## Testing Checklist

### Backend Tests
- [ ] isTrending field added to posts
- [ ] Schema validation enforces boolean type
- [ ] Index created for trending queries
- [ ] Migration script runs successfully
- [ ] Toggle trending API works
- [ ] Get trending API returns correct posts
- [ ] Only published trending posts returned
- [ ] Sorting by createdAt works
- [ ] Limit parameter respected
- [ ] Authorization on admin endpoints

### Frontend Tests
- [ ] Admin can toggle trending status
- [ ] Icon shows correct state (active/inactive)
- [ ] Loading state during API call
- [ ] Success animation on toggle
- [ ] Error handling with rollback
- [ ] Toggle accessible (keyboard, screen reader)
- [ ] Category page shows 2/3 + 1/3 layout
- [ ] Trending sidebar fetches data
- [ ] Trending cards display correctly
- [ ] Sidebar is sticky
- [ ] Hover effects smooth
- [ ] Mobile layout stacks correctly
- [ ] Loading skeletons render
- [ ] Empty states friendly
- [ ] Performance <2s page load

### Integration Tests
- [ ] End-to-end: Mark post trending → appears in sidebar
- [ ] End-to-end: Unmark trending → removed from sidebar
- [ ] Category filtering works
- [ ] Multiple trending posts display correctly
- [ ] No trending posts shows empty state

---

## UI/UX Design Guidelines

### Color Palette
- **Primary:** Deep Blue (#1e3a8a)
- **Accent:** Gold (#fbbf24)
- **Trending:** Orange-red gradient (#f97316 to #dc2626)
- **Background:** Light Gray (#f9fafb)
- **Text:** Dark Gray (#1f2937)
- **Borders:** Light Gray (#e5e7eb)

### Typography
- **Headers:** Bold, 24-32px
- **Post Titles:** Bold, 18-20px (main), 16px (trending)
- **Body:** Regular, 14-16px
- **Meta:** Regular, 12-14px, gray

### Spacing
- **Section Gap:** 32-48px
- **Card Gap:** 16-24px
- **Padding:** 16-24px (cards), 4-8px (badges)

### Animations
- **Duration:** 200-300ms
- **Easing:** ease, ease-in-out
- **Hover:** scale(1.05), translateY(-4px)
- **Transitions:** transform, box-shadow, opacity

### Responsive Breakpoints
- **Desktop:** ≥1024px (side-by-side)
- **Tablet:** 768-1023px (adjusted or stacked)
- **Mobile:** <768px (stacked, trending on top)

---

## API Reference

### Endpoints

#### Toggle Trending (Admin)
```
PATCH /api/admin/posts/:id/trending
Authorization: Required (Admin only)

Request Body:
{
  "isTrending": true
}

Response: 200 OK
{
  "_id": "...",
  "title": "Post Title",
  "isTrending": true,
  "updatedAt": "2026-01-17T..."
}
```

#### Get Trending Posts (Public)
```
GET /api/posts/trending?limit=5&categoryId=...

Response: 200 OK
{
  "trending": [
    {
      "_id": "...",
      "title": "Trending Post",
      "featuredImageUrl": "/uploads/...",
      "category": {...},
      "createdAt": "..."
    }
  ],
  "total": 8
}
```

---

## Performance Targets

- **API Response Time:** <100ms (trending query)
- **Page Load Time:** <2 seconds
- **First Contentful Paint:** <1 second
- **Animation Frame Rate:** 60fps
- **Cumulative Layout Shift:** <0.1

---

## Accessibility Requirements

- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader:** Proper ARIA labels and announcements
- **Color Contrast:** WCAG AA compliance (4.5:1 minimum)
- **Focus Indicators:** Visible on all focusable elements
- **Semantic HTML:** Proper heading hierarchy, landmarks

---

## Open Questions

1. **Trending Post Limit:** How many trending posts in sidebar? (Current: 5)
   - **Decision:** Default to 5, configurable up to 20

2. **Trending Sort Order:** By date or manual order?
   - **Decision:** By createdAt descending (newest first)

3. **Category Filtering:** Should trending be category-specific?
   - **Decision:** Optional, can filter but defaults to all

4. **Auto-Expire:** Should trending expire after X days?
   - **Decision:** No auto-expire in Phase 1, manual control only

---

## Success Criteria

Feature is complete when:
- [ ] All 4 stories implemented and tested
- [ ] Admin can easily mark/unmark posts as trending
- [ ] Trending posts appear in attractive sidebar
- [ ] Layout is 2/3 + 1/3 on desktop, stacked on mobile
- [ ] All animations smooth and professional
- [ ] Performance targets met
- [ ] Accessibility verified
- [ ] All tests passing
- [ ] UI/UX approved by design lead
- [ ] Product owner signs off

---

## Rollback Plan

If issues arise:
1. Backend changes are non-breaking (isTrending defaults to false)
2. Can disable trending sidebar via feature flag if needed
3. Admin toggle can be hidden if API issues occur
4. No migration needed to roll back (soft schema change)

---

## Future Enhancements (Post-Phase 1)

1. **Manual Ordering:** Allow admin to manually order trending posts
2. **Auto-Expire:** Trending status expires after X days
3. **Trending Analytics:** Track views/clicks on trending posts
4. **Category-Specific:** Different trending posts per category
5. **Scheduled Trending:** Schedule posts to become trending at specific times
6. **Trending Badge:** Show "Trending" badge on posts throughout site

---

## Contact & Support

For questions or clarifications:
- Backend stories: Tag backend team lead
- Frontend stories: Tag frontend team lead
- UI/UX questions: Tag design lead
- Priority/scope changes: Tag product owner

---

## Resources

- **Design System:** [Link to design system]
- **Component Library:** [Link to component library]
- **Icon Library:** Lucide React, Heroicons
- **Animation Library:** Framer Motion (optional)
- **Date Formatting:** date-fns or dayjs
- **Toast Notifications:** react-hot-toast or sonner

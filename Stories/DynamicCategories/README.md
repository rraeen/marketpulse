# Dynamic Categories Feature - Implementation Stories

## Overview
This feature replaces the hardcoded 5-category system with a dynamic, hierarchical category management system. Admins can create categories and subcategories (1 level deep), and the navigation adapts automatically.

## Feature Requirements Summary

### Key Changes
1. **Dynamic Categories:** Admin can create/edit/delete categories
2. **Subcategories:** Each category can have multiple subcategories (1 level only)
3. **Smart Navbar:** First 3 categories shown, rest under "More" dropdown
4. **Subcategory Dropdowns:** Hover shows subcategories (max 5 visible, scrollable)
5. **Flexible Filtering:** 
   - Click category → shows category + all subcategory posts
   - Click subcategory → shows only subcategory posts

### URL Structure
- Category: `/category/stocks`
- Subcategory: `/category/stocks/tech-stocks`

---

## Backend Stories

### Story BE-CAT-01: Category Data Model & Schema
**Priority:** High | **Points:** 5

**What to Build:**
- MongoDB collection for categories with parent-child relationship
- Schema validation for category fields
- Indexes for slug, parentId, order
- Migration plan for existing hardcoded categories

**Acceptance Criteria:**
- Category model with parentId field (null = main, ObjectId = sub)
- Unique slug constraint
- Maximum 1 level depth enforced
- Order field for navbar positioning

**Files to Create:**
- `src/lib/models/category.ts`
- Update `src/lib/schemas/validation.ts`
- Update `src/lib/db.ts`

---

### Story BE-CAT-02: Category CRUD API
**Priority:** High | **Points:** 8

**What to Build:**
- Public API: GET /api/categories (returns tree structure)
- Admin APIs:
  - POST /api/admin/categories (create)
  - PATCH /api/admin/categories/:id (update)
  - DELETE /api/admin/categories/:id (soft delete)
  - PATCH /api/admin/categories/reorder (reorder main categories)
  - GET /api/admin/categories (get all including inactive)

**Acceptance Criteria:**
- Auto-generate slug from name
- Validate parent-child relationships
- Prevent circular references
- Cascade delete subcategories when parent deleted
- Prevent deleting categories with active posts
- Only admins can create/update/delete

**Files to Create:**
- `src/app/api/categories/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/categories/reorder/route.ts`
- `src/lib/services/category.ts`

---

### Story BE-CAT-03: Update Posts API for Dynamic Categories
**Priority:** High | **Points:** 5

**What to Build:**
- Change Post.categoryId from string to ObjectId
- Update post create/update APIs to validate dynamic categoryId
- Implement category filtering:
  - `GET /api/posts?categorySlug=stocks` (includes subcategories)
  - `GET /api/posts?categorySlug=stocks&subcategorySlug=tech-stocks` (specific subcategory)
- Populate category info in post responses

**Acceptance Criteria:**
- Post creation validates categoryId exists and is active
- Post listing can filter by category (+ subs) or subcategory only
- Post detail returns full category hierarchy
- Inactive categories not returned

**Files to Modify:**
- `src/lib/models/post.ts`
- `src/lib/services/post.ts`
- `src/app/api/admin/posts/route.ts`
- `src/app/api/posts/route.ts`
- `src/app/api/posts/[id]/route.ts`
- `src/lib/schemas/validation.ts`

---

## Frontend Stories

### Story FE-CAT-01: Admin Category Management Interface
**Priority:** High | **Points:** 8

**What to Build:**
- Admin page at `/admin/categories`
- Tree view showing categories and subcategories
- Create category modal/form
- Edit category modal/form
- Delete confirmation modal
- Drag-and-drop (or arrows) for reordering main categories

**Acceptance Criteria:**
- List shows hierarchy visually (indentation)
- Can create main categories and subcategories
- Auto-generate slug with preview
- Edit validates circular references
- Cannot delete category with posts
- Cannot convert main category with children to subcategory
- Reordering saves order field

**Files to Create:**
- `src/app/admin/categories/page.tsx`
- `src/app/admin/categories/components/CategoryList.tsx`
- `src/app/admin/categories/components/CategoryItem.tsx`
- `src/app/admin/categories/components/CreateCategoryModal.tsx`
- `src/app/admin/categories/components/EditCategoryModal.tsx`
- `src/app/admin/categories/components/DeleteCategoryModal.tsx`
- `src/app/admin/categories/components/CategoryReorder.tsx`

---

### Story FE-CAT-02: Update Post Editor for Dynamic Categories
**Priority:** High | **Points:** 5

**What to Build:**
- Replace hardcoded category dropdown in post editor
- Dynamic category selector that shows hierarchy
- Fetch categories from API
- Display main categories and subcategories with indentation
- Allow selecting either category or subcategory

**Acceptance Criteria:**
- Dropdown shows categories hierarchically (indentation or visual tree)
- Can select main category or subcategory
- Selected value is ObjectId
- Create post works with dynamic categories
- Edit post pre-selects current category
- Shows error if category was deleted

**Files to Modify:**
- `src/app/admin/posts/new/page.tsx`
- `src/app/admin/posts/[id]/page.tsx`

**Files to Create:**
- `src/components/admin/CategorySelector.tsx` or `CategoryDropdown.tsx`

---

### Story FE-CAT-03: Dynamic Navbar with More Dropdown
**Priority:** High | **Points:** 8

**What to Build:**
- Replace hardcoded navbar with dynamic categories
- Show first 3 categories (by order) in navbar
- Put remaining categories under "More" dropdown
- Hover on category shows subcategories dropdown
- If >5 subcategories, make dropdown scrollable
- Mobile hamburger menu with accordion categories

**Acceptance Criteria:**
- Fetch categories from API once on mount
- First 3 categories shown directly
- "More" dropdown shows remaining categories (if >3)
- Hover on category shows "View All" link + subcategories
- Subcategory dropdown max 5 items visible, scrollable if more
- "More" dropdown also supports subcategory hover
- Mobile menu accordion-style with all categories
- Clicking category goes to `/category/[slug]`
- Clicking subcategory goes to `/category/[parent]/[sub]`

**Files to Create:**
- `src/components/Navbar/Navbar.tsx`
- `src/components/Navbar/NavbarDesktop.tsx`
- `src/components/Navbar/NavbarMobile.tsx`
- `src/components/Navbar/CategoryDropdown.tsx`
- `src/components/Navbar/SubcategoryList.tsx`
- `src/components/Navbar/MoreDropdown.tsx`

---

### Story FE-CAT-04: Category and Subcategory Pages
**Priority:** High | **Points:** 8

**What to Build:**
- Category page: `/category/[slug]` (shows category + subcategory posts)
- Subcategory page: `/category/[parentSlug]/[subSlug]` (shows only subcategory posts)
- Breadcrumbs for both pages
- Subcategory filter pills on category page
- Post card list with pagination
- Empty states and error handling

**Acceptance Criteria:**
- Category page shows all posts from category + subcategories
- Subcategory page shows only posts from that subcategory
- Breadcrumbs navigate correctly
- Filter pills on category page navigate to subcategory pages
- Pagination works
- Post cards display correctly
- 404 for invalid slugs
- SEO metadata present
- Responsive design

**Files to Create:**
- `src/app/category/[slug]/page.tsx`
- `src/app/category/[slug]/[subSlug]/page.tsx`
- `src/components/CategoryHeader.tsx`
- `src/components/SubcategoryFilters.tsx`
- `src/components/PostCard.tsx`
- `src/components/Pagination.tsx`

---

## Implementation Order

### Phase 1: Backend Foundation (Week 1)
1. BE-CAT-01: Category Data Model ✅
2. BE-CAT-02: Category CRUD API ✅

### Phase 2: Backend Integration (Week 1-2)
3. BE-CAT-03: Update Posts API ✅

### Phase 3: Admin UI (Week 2)
4. FE-CAT-01: Admin Category Management ✅
5. FE-CAT-02: Update Post Editor ✅

### Phase 4: Public UI (Week 3)
6. FE-CAT-03: Dynamic Navbar ✅
7. FE-CAT-04: Category Pages ✅

---

## Story Dependencies

```
BE-CAT-01 (Model)
    ↓
BE-CAT-02 (CRUD API)
    ↓
    ├─→ FE-CAT-01 (Admin Management)
    ├─→ FE-CAT-02 (Post Editor Update)
    └─→ FE-CAT-03 (Dynamic Navbar)
    
BE-CAT-02 + BE-CAT-03 (Posts API)
    ↓
FE-CAT-04 (Category Pages)
```

---

## Testing Checklist

### Backend Tests
- [ ] Category CRUD operations work
- [ ] Slug uniqueness enforced
- [ ] Parent-child validation works
- [ ] Cannot create subcategory of subcategory
- [ ] Cascade delete works
- [ ] Cannot delete category with posts
- [ ] Reordering works
- [ ] Post filtering by category/subcategory works
- [ ] API returns correct data structure

### Frontend Tests
- [ ] Admin can create/edit/delete categories
- [ ] Subcategories appear under correct parent
- [ ] Reordering updates navbar order
- [ ] Post editor shows dynamic categories
- [ ] Navbar shows first 3 categories
- [ ] "More" dropdown shows remaining
- [ ] Subcategory dropdowns appear on hover
- [ ] Scrolling works if >5 subcategories
- [ ] Mobile menu accordion works
- [ ] Category page shows correct posts
- [ ] Subcategory page shows correct posts
- [ ] Filter pills navigate correctly
- [ ] Pagination works
- [ ] Breadcrumbs navigate correctly
- [ ] 404 handling works

### Integration Tests
- [ ] End-to-end flow: Create category → Create post → View on public site
- [ ] End-to-end flow: Create subcategory → Assign to post → Filter by subcategory
- [ ] End-to-end flow: Reorder categories → Verify navbar updates
- [ ] End-to-end flow: Delete category → Verify posts unassigned

---

## Migration Strategy

### Existing Data
Decision: **Delete old posts and start fresh** (as per requirements)

### Steps
1. Deploy backend with new schema
2. Run seed script to create initial categories (if needed)
3. Deploy frontend updates
4. Verify all functionality
5. Delete old hardcoded category constant file

---

## Rollback Plan

If issues arise:
1. Backend API is backward compatible (can add migration layer if needed)
2. Keep old category constant file until fully migrated
3. Database changes are non-destructive (soft deletes)
4. Can revert frontend to old navbar if needed

---

## Performance Considerations

### Optimization Points
1. **Cache categories:** Store in context/state, fetch once
2. **Index slugs:** Database index on slug field for fast lookups
3. **Lazy load subcategories:** Only fetch when dropdown opens (if needed)
4. **Pagination:** Limit posts per page to 10-20
5. **Image optimization:** Use Next.js Image component for post cards

### Expected Performance
- Category list API: <100ms
- Post listing API: <200ms
- Page load: <1s (including data fetch)
- Navbar render: <50ms

---

## Open Questions & Decisions

1. **Subcategory display limit:** Max 5 visible, scroll if more ✅
2. **Mobile menu style:** Accordion ✅
3. **Category order:** Drag-drop or arrows ✅ (either is acceptable)
4. **Existing posts:** Delete and start fresh ✅
5. **URL structure:** `/category/[slug]/[subslug]` ✅

---

## Contact & Support

For questions or clarifications:
- Backend stories: Tag backend team lead
- Frontend stories: Tag frontend team lead
- Design questions: Tag UI/UX designer
- Priority/scope changes: Tag product owner

---

## Success Criteria

Feature is complete when:
- [ ] All 7 stories implemented and tested
- [ ] Admin can fully manage categories without code changes
- [ ] Navbar dynamically updates based on category changes
- [ ] Public users can browse by category and subcategory
- [ ] Performance targets met
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Product owner signs off

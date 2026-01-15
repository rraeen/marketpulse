# Manual Test - Public Site

## Test Objective
Verify public users can browse, filter, search, and read published posts.

## Preconditions
- Application is running
- At least 5 published posts exist across different categories
- At least 2 draft posts exist

## Test Cases

### TC-PUBLIC-01: View Homepage
**Steps:**
1. Navigate to homepage
2. Observe layout and navigation

**Expected Result:**
- Professional financial aesthetic (blue/grey/white)
- Navigation links for all 5 categories visible
- Footer with legal disclaimer visible
- Responsive on mobile/tablet/desktop

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-02: Browse Published Posts
**Steps:**
1. Navigate to homepage
2. View list of published posts

**Expected Result:**
- Only "Published" posts visible
- Draft posts NOT visible
- Each post shows: title, excerpt, featured image, date

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-03: Filter by Category
**Steps:**
1. Click on "Stocks" category link
2. Observe filtered results

**Expected Result:**
- Only posts with "Stocks" category displayed
- Posts from other categories NOT displayed
- Empty state message if no posts

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-04: View Post Detail
**Steps:**
1. Click on any published post
2. Observe post detail page

**Expected Result:**
- Full post content displayed
- Title, body, featured image, category, date visible
- Rich text/HTML rendered correctly
- Navigation and footer present

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-05: Search Posts (Valid Query)
**Steps:**
1. Enter search query: "investment"
2. Click search button

**Expected Result:**
- Posts containing "investment" in title or body displayed
- Only published posts in results
- Pagination if many results

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-06: Search Posts (Empty Query)
**Steps:**
1. Leave search box empty
2. Click search button

**Expected Result:**
- Error message: "Search query is required"
- No results displayed

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-07: Search Posts (No Results)
**Steps:**
1. Enter search query: "zzzznonexistent"
2. Click search button

**Expected Result:**
- Empty state message displayed
- No posts shown

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-08: Pagination
**Steps:**
1. Navigate to category with >10 posts
2. Observe pagination controls
3. Click "Next" page

**Expected Result:**
- Pagination controls visible
- Page 2 loads next 10 posts
- Page number updates

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-09: Responsive Design (Mobile)
**Steps:**
1. Open site on mobile device or resize browser to mobile width
2. Navigate through pages

**Expected Result:**
- Layout adapts to mobile screen
- All content readable
- Navigation accessible
- No horizontal scroll

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PUBLIC-10: Direct Access to Draft Post
**Steps:**
1. Get ID of a draft post
2. Try to access /posts/[draftPostId] directly

**Expected Result:**
- 404 error or "Post not found"
- Draft content NOT accessible

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

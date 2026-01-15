# Manual Test - Admin CMS

## Test Objective
Verify admin can create, edit, publish, and delete posts with proper validation.

## Preconditions
- Application is running
- Logged in as Admin (admin@marketpulse.com / admin123)

## Test Cases

### TC-CMS-01: Create Draft Post
**Steps:**
1. Navigate to CMS dashboard
2. Click "Create New Post"
3. Enter:
   - Title: "Test Post Draft"
   - Body: "This is a test post body with some content."
   - Category: "Stocks"
   - Status: "Draft"
4. Click Save

**Expected Result:**
- Post created successfully
- Post visible in admin dashboard
- Post NOT visible on public site

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-02: Create Published Post
**Steps:**
1. Create new post with:
   - Title: "Test Published Post"
   - Body: "Public content"
   - Category: "Investment Market Updates"
   - Status: "Published"
2. Click Save

**Expected Result:**
- Post created successfully
- Post visible in admin dashboard
- Post visible on public site
- Email notifications sent to registered users

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-03: Upload Featured Image
**Steps:**
1. Create new post
2. Click upload image button
3. Select valid image (JPG, PNG, or WebP, <5MB)
4. Save post

**Expected Result:**
- Image uploads successfully
- Image URL stored in post
- Image visible in post preview

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-04: Invalid Image Type
**Steps:**
1. Try to upload PDF or TXT file as featured image

**Expected Result:**
- Error message: "Invalid file type. Only JPG, PNG, and WebP are allowed."
- Upload rejected

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-05: Image Size Validation
**Steps:**
1. Try to upload image larger than 5MB

**Expected Result:**
- Error message: "File too large. Maximum size is 5MB."
- Upload rejected

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-06: Edit Existing Post
**Steps:**
1. Open existing post from dashboard
2. Modify title and body
3. Save changes

**Expected Result:**
- Post updated successfully
- Changes reflected immediately
- updatedAt timestamp changed

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-07: Publish Draft Post
**Steps:**
1. Open existing draft post
2. Change status from "Draft" to "Published"
3. Save

**Expected Result:**
- Status changed successfully
- Post now visible on public site
- Email notifications sent to registered users

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-08: Delete Post
**Steps:**
1. Open existing post
2. Click Delete button
3. Confirm deletion

**Expected Result:**
- Post deleted from database
- Post no longer visible in admin dashboard
- Post no longer visible on public site

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-09: Category Validation
**Steps:**
1. Try to create post with invalid category (via API)

**Expected Result:**
- Error message: "Invalid category"
- Post not created

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-CMS-10: Required Fields Validation
**Steps:**
1. Try to create post without title
2. Try to create post without body
3. Try to create post without category

**Expected Result:**
- Error messages for missing fields
- Post not created

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

# Manual Test - Profile & Notifications

## Test Objective
Verify user profile management and email notifications work correctly.

## Preconditions
- Application is running
- At least one registered user exists
- SMTP configured or mock email enabled

## Test Cases

### TC-PROFILE-01: View Profile
**Steps:**
1. Login as registered user
2. Navigate to profile page

**Expected Result:**
- User name displayed
- Email displayed
- isPremiumInterested toggle visible

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PROFILE-02: Toggle Premium Interest (Enable)
**Steps:**
1. Navigate to profile page
2. Toggle "I am interested in Premium Advisory Content" to ON
3. Save

**Expected Result:**
- Success message displayed
- Toggle state persists after page refresh
- Database updated (isPremiumInterested = true)

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-PROFILE-03: Toggle Premium Interest (Disable)
**Steps:**
1. Navigate to profile page with toggle ON
2. Toggle to OFF
3. Save

**Expected Result:**
- Success message displayed
- Toggle state persists after page refresh
- Database updated (isPremiumInterested = false)

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-NOTIFY-01: Email on New Published Post
**Steps:**
1. Register 2 test users
2. Login as admin
3. Create and publish a new post

**Expected Result:**
- Both registered users receive email within 5 minutes
- Email subject: "New Article: [Post Title]"
- Email body contains post title and link
- Email sent from: MarketPulse <no-reply@marketpulse.com>

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-NOTIFY-02: No Email on Draft Post
**Steps:**
1. Register test user
2. Login as admin
3. Create and save post as "Draft"

**Expected Result:**
- NO email sent to registered users
- Notification log empty for this post

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-NOTIFY-03: Email on Draft to Published
**Steps:**
1. Register test user
2. Admin creates draft post
3. Admin changes draft to "Published"

**Expected Result:**
- Email sent to registered users
- Notification triggered only on status change
- Email received within 5 minutes

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-NOTIFY-04: Notification Log (Success)
**Steps:**
1. After publishing post, check notificationLog collection in database

**Expected Result:**
- Entry exists for each registered user
- postId matches published post
- status = "Success"
- sentAt timestamp present
- No error field

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-NOTIFY-05: Notification Log (Failure)
**Steps:**
1. Configure invalid SMTP settings
2. Publish a post
3. Check notificationLog collection

**Expected Result:**
- Entry exists with status = "Failed"
- error field contains error message
- Failure logged for retry

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-NOTIFY-06: No Email to Admin
**Steps:**
1. Admin user exists (admin@marketpulse.com)
2. Publish a post
3. Check admin's email

**Expected Result:**
- Admin does NOT receive notification email
- Only users with role = "User" receive emails

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-NOTIFY-07: Batch Email Processing
**Steps:**
1. Register 25 test users
2. Publish a post
3. Monitor email sending

**Expected Result:**
- Emails sent in batches (10 per batch)
- All 25 users receive email
- No rate limit issues

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

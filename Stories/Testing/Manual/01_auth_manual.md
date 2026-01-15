# Manual Test - Authentication Flow

## Test Objective
Verify user registration, login, logout, and session management work correctly.

## Preconditions
- Application is running on http://localhost:3000
- MongoDB is running and accessible
- Admin user seeded (admin@marketpulse.com / admin123)

## Test Cases

### TC-AUTH-01: User Registration (Valid)
**Steps:**
1. Navigate to registration page
2. Enter valid data:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "Test@1234"
3. Click Register button

**Expected Result:**
- User is registered successfully
- Success message displayed
- User is redirected/logged in

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-AUTH-02: User Registration (Invalid Email)
**Steps:**
1. Navigate to registration page
2. Enter invalid email: "notanemail"
3. Click Register button

**Expected Result:**
- Error message: "Invalid email format"
- User not registered

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-AUTH-03: User Registration (Duplicate Email)
**Steps:**
1. Navigate to registration page
2. Enter email that already exists: "admin@marketpulse.com"
3. Click Register button

**Expected Result:**
- Error message: "Email already registered"
- User not registered

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-AUTH-04: Login (Valid Credentials)
**Steps:**
1. Navigate to login page
2. Enter:
   - Email: "admin@marketpulse.com"
   - Password: "admin123"
3. Click Login button

**Expected Result:**
- Login successful
- Session cookie set
- Redirected to appropriate page

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-AUTH-05: Login (Invalid Credentials)
**Steps:**
1. Navigate to login page
2. Enter:
   - Email: "admin@marketpulse.com"
   - Password: "wrongpassword"
3. Click Login button

**Expected Result:**
- Error message: "Invalid credentials"
- User not logged in

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-AUTH-06: Logout
**Steps:**
1. Login as any user
2. Click Logout button

**Expected Result:**
- Session cookie cleared
- User logged out
- Redirected to public page

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-AUTH-07: Session Persistence
**Steps:**
1. Login as any user
2. Refresh the page
3. Check if user is still logged in

**Expected Result:**
- User remains logged in after refresh
- Session persists

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

---

### TC-AUTH-08: Rate Limiting
**Steps:**
1. Attempt to login with wrong password 5 times rapidly

**Expected Result:**
- After multiple failed attempts, rate limit error shown
- HTTP 429 status code
- Retry-After header present

**Actual Result:** _____

**Status:** [ ] Pass [ ] Fail

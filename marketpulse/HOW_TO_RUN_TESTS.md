# How to Run Tests - Quick Start Guide

## Prerequisites

All dependencies are already installed. The server **does not need to be running** for unit tests.

---

## 🚀 Quick Start

### Run All Unit Tests
```bash
npm test
```

**Expected Output:**
```
Test Suites: 6 passed, 6 total
Tests:       62 passed, 62 total
Time:        ~8 seconds
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

Tests will re-run automatically when you save files. Great for development!

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

**Expected Coverage:**
- Statements: ~73%
- Branches: ~66%
- Functions: ~63%
- Lines: ~74%

### Run Specific Test File
```bash
npm test -- tests/unit/services/auth.test.ts
npm test -- tests/unit/utils/validation.test.ts
```

---

## 🎭 E2E Tests (Playwright)

### Run All E2E Tests
```bash
npm run test:e2e
```

**Note:** Playwright will automatically start the dev server on `http://localhost:3000`

### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```

Opens Playwright's interactive UI for debugging tests

### Run Specific Browser
```bash
# Chromium only
npm run test:e2e -- --project=chromium

# Firefox only
npm run test:e2e -- --project=firefox

# Mobile
npm run test:e2e -- --project="Mobile Chrome"
```

### View E2E Test Report
```bash
npm run test:e2e:report
```

---

## 🧪 What Each Test Suite Covers

### Auth Service Tests (15 tests)
**File:** `tests/unit/services/auth.test.ts`  
**What it tests:**
- User registration
- Login/logout
- JWT token generation and verification
- Password hashing
- Error handling

### Post Service Tests (22 tests)
**File:** `tests/unit/services/post.test.ts`  
**What it tests:**
- Creating, updating, deleting posts
- Filtering and pagination
- Category and status validation
- Public vs draft post handling

### Validation Tests (18 tests across 2 files)
**Files:** `tests/unit/utils/validation.test.ts`, `tests/unit/utils/password-validation.test.ts`  
**What it tests:**
- Email format validation
- Password strength requirements
- Name validation
- Input sanitization

### Utility Tests (10 tests across 2 files)
**Files:** `tests/unit/utils/objectid-validation.test.ts`, `tests/unit/utils/rate-limiter.test.ts`  
**What it tests:**
- MongoDB ObjectId validation
- Rate limiting logic
- Request throttling

### E2E Auth Tests
**File:** `tests/e2e/auth.spec.ts`  
**What it tests:**
- User registration flow
- Login flow
- Logout flow
- Protected route access

### E2E CMS Tests
**File:** `tests/e2e/cms.spec.ts`  
**What it tests:**
- Creating posts in admin panel
- Editing posts
- Deleting posts
- Form validation

---

## 🔍 Debugging Failed Tests

### If Tests Fail:

1. **Check MongoDB Memory Server:**
   ```bash
   npm test -- --detectOpenHandles
   ```
   This helps identify async operations that aren't cleaned up

2. **Run Single Test:**
   ```bash
   npm test -- tests/unit/services/auth.test.ts
   ```

3. **Check Coverage:**
   ```bash
   npm run test:coverage
   ```
   Open `coverage/lcov-report/index.html` in browser

4. **Verbose Output:**
   ```bash
   npm test -- --verbose
   ```

---

## ⚠️ Common Issues

### "Worker process has failed to exit gracefully"
**Cause:** MongoDB Memory Server cleanup delay  
**Impact:** None - tests still pass  
**Fix:** Can be ignored safely

### E2E Tests Timeout
**Cause:** Server not starting  
**Fix:** Check port 3000 is available  
**Command:** `netstat -ano | findstr :3000`

### Jest Can't Find Modules
**Cause:** Path mapping issue  
**Fix:** Run from `marketpulse` directory  
```bash
cd marketpulse
npm test
```

---

## 📊 Understanding Test Output

### Successful Run:
```
PASS tests/unit/services/auth.test.ts
  Auth Service Unit Tests
    registerUser
      ✓ should register a new user with valid data (10ms)
      ✓ should throw error for duplicate email (5ms)
    ...
```

### Failed Test:
```
FAIL tests/unit/services/auth.test.ts
  ● Auth Service › registerUser › should register user

    expect(received).toBe(expected)

    Expected: "test@example.com"
    Received: "wrong@example.com"

      at Object.<anonymous> (auth.test.ts:15:30)
```

---

## 🎓 Best Practices

### When Adding New Tests:

1. **Follow the existing structure:**
   - Services go in `tests/unit/services/`
   - Utils go in `tests/unit/utils/`
   - E2E go in `tests/e2e/`

2. **Use descriptive test names:**
   ```typescript
   it('should reject registration with duplicate email', async () => {
     // Test code
   });
   ```

3. **Clean up after tests:**
   ```typescript
   beforeEach(async () => {
     await db.collection('users').deleteMany({});
   });
   ```

4. **Test both happy and unhappy paths:**
   - Valid input (success case)
   - Invalid input (error cases)
   - Edge cases
   - Boundary conditions

---

## 🎯 Quick Command Reference

```bash
# Unit Tests
npm test                      # Run all
npm run test:watch            # Watch mode
npm run test:coverage         # With coverage

# E2E Tests
npm run test:e2e             # Run all
npm run test:e2e:ui          # Interactive mode
npm run test:e2e:report      # View report

# Specific Tests
npm test -- auth.test.ts     # Run auth tests only
npm test -- services/        # Run all service tests
npm test -- utils/           # Run all util tests
```

---

## 📞 Need Help?

If tests fail or you encounter issues:

1. Check this guide for common issues
2. Review test output carefully
3. Run with `--verbose` for more details
4. Check coverage report for uncovered code
5. Consult test files for examples

**All tests should pass out of the box. If they don't, there's likely an environment issue.**

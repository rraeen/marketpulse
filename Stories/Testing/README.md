# Testing Documentation - MarketPulse

## Overview
This folder contains comprehensive testing documentation for both **manual** and **automated** testing of the MarketPulse Financial Advisory Platform.

## Folder Structure

```
Stories/Testing/
├── README.md                        # This file
├── Manual/                          # Manual test cases for QA testers
│   ├── 01_auth_manual.md
│   ├── 02_admin_cms_manual.md
│   ├── 03_public_site_manual.md
│   └── 04_profile_notifications_manual.md
└── Automation/                      # Automated test specifications
    ├── 01_setup_automation.md       # Setup guide
    ├── 02_api_auth_tests.md         # API: Auth integration tests
    ├── 03_api_posts_tests.md        # API: Posts integration tests
    ├── 04_e2e_auth_tests.md         # E2E: Auth flow tests
    └── 05_e2e_cms_tests.md          # E2E: CMS flow tests
```

## Manual Testing

### Purpose
Manual test cases for QA engineers to verify functionality, UX, and edge cases before and after deployment.

### Test Modules
1. **Authentication** - Registration, login, logout, sessions
2. **Admin CMS** - Post CRUD, image upload, validation
3. **Public Site** - Browsing, filtering, search, responsive design
4. **Profile & Notifications** - User profile, email notifications

### Execution
- Follow step-by-step instructions in each manual test file
- Mark Pass/Fail for each test case
- Document actual results and issues found

### Test Reporting
Create a test execution report:
- Date and tester name
- Total tests executed / passed / failed
- Critical issues found
- Screenshots of failures

---

## Automated Testing

### Technology Stack
- **Unit & Integration Tests:** Jest + Supertest
- **E2E Tests:** Playwright
- **Coverage:** Istanbul (via Jest)
- **Test Database:** MongoDB Memory Server (for unit/integration)

### Test Levels

#### 1. Unit Tests
Test individual functions and utilities in isolation.

**Location:** `tests/unit/`

**Examples:**
- Password validation
- Email format validation
- ObjectId validation
- Search query sanitization

#### 2. Integration Tests
Test API endpoints with real database (memory).

**Location:** `tests/integration/`

**Coverage:**
- Auth API (register, login, logout, session)
- Posts API (CRUD, validation, permissions)
- Search API (query, pagination)
- Profile API (get, update)
- Categories API

#### 3. E2E Tests
Test complete user journeys in a real browser.

**Location:** `tests/e2e/`

**Coverage:**
- Authentication flow
- Admin CMS workflows
- Public site browsing
- Profile management
- Mobile responsiveness

### Setup

#### Prerequisites
```bash
# Install dependencies
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
npm install --save-dev @playwright/test
npm install --save-dev mongodb-memory-server
```

#### Configuration
Follow the setup guide in `Automation/01_setup_automation.md` for:
- Jest configuration
- Playwright configuration
- Test database setup
- NPM scripts

### Running Tests

#### All Tests
```bash
npm test                        # Unit + Integration tests
npm run test:e2e                # E2E tests
```

#### Watch Mode (Development)
```bash
npm run test:watch              # Auto-rerun tests on file changes
```

#### Coverage Report
```bash
npm run test:coverage           # Generate HTML coverage report
```

#### E2E with UI
```bash
npm run test:e2e:ui            # Interactive E2E test runner
```

#### Specific Test Files
```bash
npm test -- tests/integration/auth.test.ts
npm run test:e2e -- tests/e2e/cms.spec.ts
```

### Coverage Requirements

| Module | Minimum Coverage |
|--------|------------------|
| Auth Services | 85% |
| Post Services | 85% |
| Notification Services | 80% |
| Utilities | 90% |
| API Routes | 80% |
| E2E Critical Paths | 100% |

### CI/CD Integration

#### GitHub Actions
Tests run automatically on every push and pull request.

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Test Data Management

#### Test Fixtures
Store test data in `tests/fixtures/`:
- Sample images (valid, invalid, oversized)
- Sample posts (JSON)
- Sample users (JSON)

#### Database Seeding
For E2E tests, seed database with:
- 1 admin user (admin@marketpulse.com / admin123)
- 5-10 published posts across all categories
- 2-3 draft posts
- 2-3 registered users

```bash
npm run seed:test-data
```

---

## Test Maintenance

### When to Update Tests

1. **New Feature Added**
   - Add manual test cases
   - Add integration tests for APIs
   - Add E2E tests for user flows

2. **Bug Fixed**
   - Add regression test to prevent recurrence

3. **UI Changed**
   - Update E2E selectors
   - Update accessibility tests

4. **API Changed**
   - Update integration test expectations
   - Update E2E API mocks if used

### Best Practices

1. **Isolation:** Each test should be independent
2. **Clean State:** Reset database before each test
3. **Clear Names:** Test names describe what they verify
4. **Assertions:** Test one thing per test case
5. **Documentation:** Comment complex test logic

---

## Troubleshooting

### Common Issues

#### Tests Fail Locally But Pass in CI
- Check environment variables
- Verify Node.js version matches CI
- Check database connection

#### E2E Tests Timeout
- Increase timeout in Playwright config
- Check if dev server started
- Verify network connectivity

#### Flaky Tests
- Add explicit waits for async operations
- Use `waitForSelector` instead of fixed delays
- Check for race conditions

#### Coverage Below Threshold
- Review uncovered lines in coverage report
- Add tests for edge cases
- Ensure all branches tested

---

## Reporting Issues

When reporting test failures:
1. Test name and file
2. Expected vs actual behavior
3. Error message and stack trace
4. Screenshots (for E2E tests)
5. Environment (OS, browser, Node version)
6. Steps to reproduce

---

## Contact

For questions or issues with testing:
- Create an issue in the project repository
- Tag with `testing` label
- Assign to QA lead or test automation engineer

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-15 | Initial testing documentation |

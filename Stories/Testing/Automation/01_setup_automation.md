# Automation Test Setup

## Test Objective

Set up automated testing infrastructure for unit, integration, and E2E tests.

## Technology Stack

- **Unit/Integration Tests:** Jest + Supertest
- **E2E Tests:** Playwright
- **Coverage:** Istanbul (via Jest)

## Installation

### Install Testing Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
npm install --save-dev @playwright/test
npm install --save-dev mongodb-memory-server
```

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Setup File (`tests/setup.ts`)

```typescript
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = "test-secret-key-123";
  process.env.NODE_ENV = "test";
});

afterAll(async () => {
  await mongod.stop();
});
```

## Folder Structure

```
tests/
├── setup.ts
├── unit/                 # Unit tests
│   ├── services/
│   ├── utils/
│   └── models/
├── integration/          # API integration tests
│   ├── auth.test.ts
│   ├── posts.test.ts
│   ├── profile.test.ts
│   └── search.test.ts
└── e2e/                  # End-to-end tests
    ├── auth.spec.ts
    ├── cms.spec.ts
    ├── public-site.spec.ts
    └── profile.spec.ts
```

## NPM Scripts (add to package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Running Tests

### Unit & Integration Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

### E2E Tests

```bash
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # Run with UI mode
npm run test:e2e:report    # Show test report
```

## CI/CD Integration

Tests should run on every push and pull request:

```yaml
# .github/workflows/test.yml
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
```

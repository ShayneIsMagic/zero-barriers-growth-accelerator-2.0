# Test Mode Documentation

This directory contains all testing infrastructure for the Zero Barriers Growth Accelerator.

## 🧪 Test Types

### 1. Unit Tests (Vitest)
Located in: `src/test/*.test.tsx` and throughout `src/` directory

**Run Commands:**
```bash
npm test              # Run all unit tests
npm run test:watch    # Run in watch mode
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
```

### 2. E2E Tests (Playwright)
Located in: `src/test/e2e/*.spec.ts`

**Run Commands:**
```bash
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Run with Playwright UI
```

### 3. Test Mode Development
Run the app in test mode with test auth enabled:

```bash
npm run dev:test      # Start dev server in test mode
```

## 📁 Directory Structure

```
src/test/
├── setup.ts              # Global test setup and mocks
├── utils/
│   └── test-helpers.ts   # Reusable test utilities
├── e2e/
│   └── *.spec.ts         # Playwright E2E tests
├── example.test.tsx      # Example unit test
└── README.md             # This file
```

## 🛠️ Test Utilities

### `renderWithProviders()`
Renders components with all necessary providers (Auth, Theme, etc.)

```typescript
import { renderWithProviders } from '@/test/utils/test-helpers';

test('renders component', () => {
  renderWithProviders(<MyComponent />);
  // ... assertions
});
```

### Mock Data
Pre-configured mock data available:
- `mockUser` - Standard test user
- `mockAdminUser` - Admin test user
- `mockAnalysisResult` - Sample analysis data

### Mock Fetch
Helper functions for mocking API calls:

```typescript
import { mockFetch, mockFetchError } from '@/test/utils/test-helpers';

// Mock successful response
mockFetch({ success: true, data: {...} });

// Mock error
mockFetchError('API Error');
```

## 🔧 Configuration Files

### vitest.config.ts
- Configures Vitest test runner
- Sets up jsdom environment
- Defines coverage settings
- Configures path aliases

### playwright.config.ts
- Configures Playwright E2E tests
- Defines browser configurations
- Sets up test reporters
- Configures dev server

### .env.test
- Test environment variables
- Test credentials
- Feature flags for testing

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils/test-helpers';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can complete flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  await expect(page).toHaveURL(/dashboard/);
});
```

## 🎯 Test Coverage

Generate and view coverage report:

```bash
npm run test:coverage
```

Coverage report will be in `coverage/` directory.

## 🐛 Debugging Tests

### Debug with ESLint

ESLint is configured to help catch issues during development:

```bash
npm run lint           # Check for errors
npm run lint:fix       # Auto-fix issues
```

**VS Code Integration:**
- ESLint runs automatically while typing
- Errors appear inline with Error Lens extension
- Auto-fix on save is enabled
- See `.vscode/settings.json` for configuration

### Debug with React Dev Tools

Install the React Developer Tools browser extension:
- **Chrome**: [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- **Firefox**: [React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Key Features:**
- 🔍 Inspect component props and state
- 🪝 Debug React Hooks (useState, useEffect, etc.)
- ⚡ Profile component performance
- 🎯 Track component re-renders
- 🌳 View component tree hierarchy

### Debug Unit Tests
```bash
npm run test:ui     # Opens Vitest UI for visual debugging
```

**VS Code Debugger:**
1. Set breakpoint in test file
2. Open Debug panel (Cmd+Shift+D)
3. Select "Debug Vitest Tests"
4. Press F5

### Debug E2E Tests
```bash
npm run test:e2e:ui # Opens Playwright UI
npx playwright test --debug  # Playwright Inspector
```

**VS Code Debugger:**
1. Set breakpoint in test file
2. Select "Debug Playwright Tests"
3. Press F5

### Complete Debugging Guide

For comprehensive debugging instructions including:
- ESLint configuration and tips
- React Dev Tools features and usage
- Browser DevTools techniques
- VS Code debugging setup
- Common issues and solutions

**See: [DEBUGGING_GUIDE.md](../../DEBUGGING_GUIDE.md)**

## 📝 Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `afterEach` to clean up state
3. **Descriptive Names**: Use clear test descriptions
4. **Arrange-Act-Assert**: Structure tests consistently
5. **Mock External Deps**: Don't hit real APIs in tests
6. **Test User Behavior**: Test what users do, not implementation

## 🚀 CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Pre-deployment checks

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)


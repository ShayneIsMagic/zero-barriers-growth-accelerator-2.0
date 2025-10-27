# 🧪 Test Mode Setup - Complete Guide

Your test mode is now fully configured with ESLint and React Dev Tools integration!

## ✅ What's Been Set Up

### 1. Test Configuration Files

- ✅ `vitest.config.ts` - Unit test configuration
- ✅ `playwright.config.ts` - E2E test configuration
- ✅ `src/test/setup.ts` - Global test setup with mocks
- ✅ `src/test/utils/test-helpers.ts` - Reusable test utilities
- ✅ `src/test/example.test.tsx` - Example unit test
- ✅ `src/test/e2e/example.spec.ts` - Example E2E test

### 2. ESLint Integration

- ✅ Enhanced `.eslintrc.json` with better rules
- ✅ VS Code auto-fix on save
- ✅ Real-time linting while typing
- ✅ New npm scripts: `lint:fix` and `lint:check`

### 3. VS Code Configuration

- ✅ `.vscode/settings.json` - Editor settings with ESLint
- ✅ `.vscode/launch.json` - Debug configurations
- ✅ `.vscode/extensions.json` - Recommended extensions

### 4. React Dev Tools

- ✅ `src/lib/dev-tools-setup.ts` - Dev tools helpers
- ✅ `src/components/DevToolsInitializer.tsx` - Auto-initialization
- ✅ Enhanced console logging
- ✅ Performance monitoring
- ✅ Error boundary logging

### 5. Documentation

- ✅ `src/test/README.md` - Test documentation
- ✅ `DEBUGGING_GUIDE.md` - Comprehensive debugging guide
- ✅ `TEST_MODE_SETUP.md` - This file

---

## 🚀 Quick Start

### Start Development in Test Mode

```bash
# Run app in test mode with enhanced debugging
npm run dev:test
```

This starts the dev server with:

- Test authentication enabled
- Enhanced console logging
- React Dev Tools helpers
- Performance monitoring
- Error tracking

### Run Tests

```bash
# Unit tests
npm test                    # Run all unit tests
npm run test:watch          # Watch mode
npm run test:ui             # Visual UI
npm run test:coverage       # With coverage

# E2E tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # With Playwright UI

# Linting
npm run lint                # Check for errors
npm run lint:fix            # Auto-fix issues
```

---

## 🛠️ Using ESLint

### Automatic Linting (VS Code)

If you have VS Code open, ESLint is already running!

**Features:**

- ✅ Errors appear inline as you type
- ✅ Auto-fix on save (Cmd+S / Ctrl+S)
- ✅ Organize imports automatically
- ✅ Red squiggles under errors
- ✅ Yellow squiggles under warnings

### Manual Linting

```bash
# Check for errors
npm run lint

# Fix all auto-fixable issues
npm run lint:fix

# Check specific directory
npx eslint src/components/
```

### Common ESLint Rules

```typescript
// ❌ Warning: Unused variable
const unusedVar = 'hello';

// ✅ Fix: Remove or use underscore prefix
const _unusedVar = 'hello'; // Ignored by ESLint

// ❌ Warning: console.log in production code
console.log('debug info');

// ✅ Fix: Use in development only
if (process.env.NODE_ENV === 'development') {
  console.log('debug info');
}

// ❌ Error: Hook rules violation
if (condition) {
  useState('value'); // Hooks must be at top level
}

// ✅ Fix: Move hook to top
const [value, setValue] = useState('value');
if (condition) {
  setValue('new value');
}
```

---

## ⚛️ Using React Dev Tools

### Installation

Install the browser extension:

**Chrome:**
https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi

**Firefox:**
https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

### Quick Usage

1. **Start your app:**

   ```bash
   npm run dev:test
   ```

2. **Open browser DevTools:**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

3. **Click "Components" tab** (appears when React is detected)

4. **Use the features:**
   - 🔍 **Inspect components** - Click element picker icon, then click any component
   - 📝 **View props** - See all props passed to components
   - 🎯 **View state** - See component state in real-time
   - 🪝 **Debug hooks** - Inspect useState, useEffect, etc.
   - ⚡ **Profile performance** - Click "Profiler" tab to record

### Console Helpers

When running in test mode, you have access to helper functions:

```javascript
// Open browser console (F12) and type:

logComponentTree(); // Shows React component tree tips
logPerformance(); // Shows page performance metrics
```

---

## 🐛 Debugging in VS Code

### Setup (Already Done!)

The `.vscode/launch.json` is already configured with debug profiles.

### Using the Debugger

1. **Set a breakpoint:**
   - Click in the gutter (left of line numbers)
   - Or press `F9` on a line

2. **Start debugging:**
   - Press `F5`
   - Or: Debug panel (Cmd+Shift+D) → Select profile → Click play

3. **Available debug configurations:**
   - **Next.js: debug server-side** - Debug API routes
   - **Next.js: debug client-side** - Debug React components
   - **Debug Full Stack** - Debug both simultaneously
   - **Debug Vitest Tests** - Debug unit tests
   - **Debug Playwright Tests** - Debug E2E tests
   - **Test Mode: Dev Server** - Run in test mode

### Debugging Tips

```typescript
// Set breakpoint here
const result = someFunction(); // ← Click here to add breakpoint

// Or use debugger statement
debugger; // Pauses execution here

// Conditional breakpoint (right-click breakpoint):
// Only breaks when condition is true
// Example: user.id === 'test-123'
```

**Keyboard Shortcuts:**

- `F5` - Start debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `Shift+F5` - Stop debugging

---

## 📝 Writing Tests

### Unit Test Example

Create a file: `src/components/MyComponent.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/test-helpers';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);

    const element = screen.getByText('Hello World');
    expect(element).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    renderWithProviders(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    await button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Example

Create a file: `src/test/e2e/my-feature.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('user can complete workflow', async ({ page }) => {
  // Navigate to page
  await page.goto('/dashboard');

  // Wait for page load
  await page.waitForLoadState('networkidle');

  // Interact with elements
  await page.click('text=Get Started');
  await page.fill('input[name="url"]', 'https://example.com');
  await page.click('button[type="submit"]');

  // Assert results
  await expect(page.locator('.analysis-result')).toBeVisible();
});
```

---

## 🎯 Common Workflows

### Workflow 1: Debug a React Component

1. Open component file in VS Code
2. Set breakpoint in component code
3. Press `F5` → Select "Next.js: debug client-side"
4. Open browser, interact with component
5. Execution pauses at breakpoint
6. Inspect variables, step through code

### Workflow 2: Debug API Route

1. Open API route file (e.g., `src/app/api/analyze/route.ts`)
2. Set breakpoint
3. Press `F5` → Select "Next.js: debug server-side"
4. Make API call from frontend
5. Debugger pauses at breakpoint

### Workflow 3: Fix ESLint Errors

1. Run `npm run lint` to see all errors
2. Run `npm run lint:fix` to auto-fix
3. Manually fix remaining issues
4. Commit changes

### Workflow 4: Profile Performance

1. Start app: `npm run dev:test`
2. Open browser DevTools → React tab → Profiler
3. Click record (●)
4. Interact with app
5. Stop recording
6. Analyze render times
7. Optimize slow components

### Workflow 5: Debug Failing Test

1. Run `npm run test:ui` or `npm run test:e2e:ui`
2. Click failing test
3. View error details
4. Set breakpoint in test
5. Press `F5` → Select appropriate debug config
6. Step through test execution

---

## 🔧 Troubleshooting

### ESLint Not Working

```bash
# Restart ESLint server (VS Code)
Cmd+Shift+P → "ESLint: Restart ESLint Server"

# Check ESLint is installed
npm list eslint

# Reinstall if needed
npm install --save-dev eslint
```

### React Dev Tools Not Showing

1. Make sure React is actually running
2. Refresh the page
3. Try in incognito mode
4. Update React Dev Tools extension
5. Check browser console for errors

### Breakpoints Not Working

1. Make sure source maps are enabled
2. Restart debug session
3. Try adding `debugger;` statement instead
4. Check file is actually being executed

### Tests Failing

```bash
# Clear cache
rm -rf node_modules/.vite
rm -rf .next

# Reinstall dependencies
npm install

# Run tests with verbose output
npm test -- --reporter=verbose
```

---

## 📚 Additional Resources

### Documentation Files

- **[DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)** - Comprehensive debugging guide
- **[src/test/README.md](./src/test/README.md)** - Test documentation
- **[README.md](./README.md)** - Project documentation

### External Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React DevTools Guide](https://react.dev/learn/react-developer-tools)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

---

## 🎉 You're All Set!

Your test mode is fully configured with:

- ✅ ESLint for code quality
- ✅ React Dev Tools for component debugging
- ✅ VS Code debugging for full-stack debugging
- ✅ Vitest for unit testing
- ✅ Playwright for E2E testing
- ✅ Comprehensive documentation

### Start Testing Now!

```bash
# Start in test mode
npm run dev:test

# Open browser to http://localhost:3000
# Open browser DevTools (F12)
# Start debugging!
```

---

**Happy Testing & Debugging! 🚀**

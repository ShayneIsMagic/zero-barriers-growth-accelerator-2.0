# 🐛 Debugging Guide

Complete guide for debugging the Zero Barriers Growth Accelerator using ESLint, React Dev Tools, and other debugging tools.

## 📋 Table of Contents

- [ESLint Setup](#eslint-setup)
- [React Dev Tools](#react-dev-tools)
- [VS Code Debugging](#vs-code-debugging)
- [Browser DevTools](#browser-devtools)
- [Test Debugging](#test-debugging)
- [Common Issues](#common-issues)

---

## 🔍 ESLint Setup

### Installation & Configuration

ESLint is already configured in the project. To use it effectively:

#### Run ESLint Manually

```bash
# Lint all files
npm run lint

# Lint specific files
npx eslint src/components/**/*.tsx

# Lint with auto-fix
npx eslint --fix src/

# Lint and show warnings
npx eslint --max-warnings 0 src/
```

#### VS Code Integration

The project includes VS Code settings for automatic ESLint integration:

1. **Install ESLint Extension**
   - Open VS Code Extensions (Cmd+Shift+X / Ctrl+Shift+X)
   - Search for "ESLint"
   - Install by Dirk Baeumer

2. **Automatic Features**
   - ✅ Lint on type (real-time feedback)
   - ✅ Auto-fix on save
   - ✅ Inline error/warning display
   - ✅ Organize imports on save

3. **Error Lens Extension** (Recommended)
   - Install "Error Lens" extension
   - Shows errors inline in your code
   - Highlights issues immediately

#### ESLint Configuration

Current rules in `.eslintrc.json`:

```json
{
  "rules": {
    "no-unused-vars": "warn",           // Warns about unused variables
    "no-console": "warn",               // Warns about console.log
    "no-debugger": "warn",              // Warns about debugger statements
    "react-hooks/rules-of-hooks": "error",  // Enforces Hook rules
    "react-hooks/exhaustive-deps": "warn",  // Warns about missing dependencies
    "jsx-a11y/alt-text": "warn",        // Accessibility warnings
  }
}
```

#### Custom ESLint Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "lint:fix": "eslint --fix src/",
    "lint:check": "eslint src/",
    "lint:watch": "esw --watch --cache src/"
  }
}
```

---

## ⚛️ React Dev Tools

### Installation

1. **Chrome Extension**
   - Visit: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
   - Click "Add to Chrome"

2. **Firefox Add-on**
   - Visit: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
   - Click "Add to Firefox"

3. **Edge Extension**
   - Visit: https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil
   - Click "Get"

### Using React Dev Tools

#### Components Tab

1. **Open DevTools** (F12 or Cmd+Option+I / Ctrl+Shift+I)
2. **Click "Components" tab** (appears when React is detected)

**Features:**
- 🔍 **Component Tree**: View entire component hierarchy
- 📝 **Props Inspector**: See all props passed to components
- 🎯 **State Inspector**: View and edit component state
- 🔗 **Context Values**: Inspect React Context values
- 🪝 **Hooks Inspector**: Debug useState, useEffect, custom hooks
- 🎨 **Element Picker**: Click to select component on page

#### Profiler Tab

Measure component performance:

1. Click "Profiler" tab
2. Click record button (●)
3. Interact with your app
4. Stop recording
5. Analyze render times and causes

**What to Look For:**
- Unnecessary re-renders
- Slow components
- Render frequency
- Component update causes

#### Key Features

**1. Search Components**
```
Use search bar to filter components by name
Type "/" to focus search
```

**2. Inspect Element**
```
Right-click any element → "Inspect"
Jumps to component in React DevTools
```

**3. Edit Props/State**
```
Click on value in inspector
Edit directly
Press Enter to apply
```

**4. Console Logging**
```
Select component
Type $r in console
Access selected component
```

**5. Component Source**
```
Click "</>" icon next to component name
Opens source file in VS Code (with setup)
```

### React Dev Tools Configuration

Add to your app for better debugging:

```tsx
// src/lib/dev-tools-config.ts
if (process.env.NODE_ENV === 'development') {
  // Enable why-did-you-render
  if (typeof window !== 'undefined') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      trackHooks: true,
      logOwnerReasons: true,
    });
  }
}
```

### Test Mode with React Dev Tools

When running in test mode:

```bash
npm run dev:test
```

React Dev Tools shows:
- Test user authentication state
- Mock data being used
- Component props in test scenarios

---

## 💻 VS Code Debugging

### Built-in Debugger

The project includes pre-configured launch configurations.

#### Debug Next.js Server

1. Open Debug panel (Cmd+Shift+D / Ctrl+Shift+D)
2. Select "Next.js: debug server-side"
3. Press F5 or click green play button
4. Set breakpoints in server-side code
5. Trigger the code path

#### Debug Client-Side

1. Select "Next.js: debug client-side"
2. Press F5
3. Opens Chrome with debugger attached
4. Set breakpoints in client code
5. Interact with app

#### Debug Full Stack

1. Select "Debug Full Stack (Compound)"
2. Debugs both server and client simultaneously
3. Switch between server/client in debugger

#### Debug Tests

**Vitest:**
1. Select "Debug Vitest Tests"
2. Set breakpoints in test files
3. Press F5

**Playwright:**
1. Select "Debug Playwright Tests"
2. Set breakpoints
3. Press F5

### Breakpoints

**Set Breakpoints:**
- Click in gutter next to line number
- Press F9 on a line
- Use `debugger;` statement in code

**Conditional Breakpoints:**
- Right-click breakpoint
- Select "Edit Breakpoint"
- Add condition (e.g., `user.id === 'test-123'`)

**Logpoints:**
- Right-click in gutter
- Select "Add Logpoint"
- Enter expression to log (e.g., `{user}`)

### Debug Console

**Evaluate Expressions:**
```javascript
// Type in Debug Console while paused
console.log(user)
JSON.stringify(state, null, 2)
Object.keys(props)
```

---

## 🌐 Browser DevTools

### Chrome DevTools

#### Console Tab

**Log Filtering:**
```javascript
// Use console methods
console.log('Info')      // Info logs
console.warn('Warning')  // Warnings
console.error('Error')   // Errors
console.debug('Debug')   // Debug logs

// Filter by level in DevTools
Click icons in console toolbar
```

**Advanced Logging:**
```javascript
// Styled logs
console.log('%c Custom styled log', 'color: blue; font-size: 20px');

// Table view
console.table([{ name: 'User 1' }, { name: 'User 2' }]);

// Grouping
console.group('API Calls');
console.log('Call 1');
console.log('Call 2');
console.groupEnd();

// Timing
console.time('Operation');
// ... code ...
console.timeEnd('Operation');
```

#### Network Tab

**Monitor API Calls:**
1. Open Network tab
2. Filter by "Fetch/XHR"
3. Click request to see:
   - Request headers
   - Response body
   - Timing information
   - Initiator (what triggered it)

**Preserve Log:**
- Check "Preserve log" to keep requests across page loads

#### Application Tab

**Inspect Storage:**
- **Local Storage**: Analysis results
- **Session Storage**: Temporary data
- **Cookies**: Authentication tokens
- **Cache Storage**: Service worker cache

#### Sources Tab

**Debug JavaScript:**
1. Open Sources tab
2. Find file in file tree
3. Set breakpoints
4. Trigger code
5. Step through execution

**Keyboard Shortcuts:**
- F8: Resume
- F10: Step over
- F11: Step into
- Shift+F11: Step out

---

## 🧪 Test Debugging

### Debug Vitest Unit Tests

**Method 1: VS Code Debugger**
```bash
# Use launch configuration
1. Set breakpoint in test
2. Select "Debug Vitest Tests"
3. Press F5
```

**Method 2: Vitest UI**
```bash
npm run test:ui

# Features:
- Visual test runner
- Click test to run
- See test results
- View coverage
- Time travel debugging
```

**Method 3: Console Logs**
```typescript
it('should work', () => {
  console.log('Debug info:', value);
  expect(value).toBe(expected);
});
```

### Debug Playwright E2E Tests

**Method 1: Playwright UI Mode**
```bash
npm run test:e2e:ui

# Features:
- Time travel through test
- Pick locator tool
- View DOM at each step
- See network calls
- Screenshots at each action
```

**Method 2: Headed Mode**
```bash
# See browser while testing
npx playwright test --headed

# With slow motion
npx playwright test --headed --slow-mo 1000
```

**Method 3: Debug Mode**
```bash
# Open Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test example.spec.ts --debug
```

**Method 4: VS Code**
```bash
1. Set breakpoint in test
2. Select "Debug Playwright Tests"
3. Press F5
```

### Test Debugging Tips

**1. Isolate Test**
```typescript
// Run only this test
it.only('should work', () => {
  // test code
});

// Skip this test
it.skip('not ready yet', () => {
  // test code
});
```

**2. Increase Timeout**
```typescript
it('slow test', async () => {
  // test code
}, 30000); // 30 second timeout
```

**3. Add Debug Output**
```typescript
it('should work', async () => {
  const result = await someFunction();
  console.log('Result:', JSON.stringify(result, null, 2));
  expect(result).toBeTruthy();
});
```

---

## 🔧 Common Issues

### ESLint Issues

**Issue: ESLint not running**
```bash
# Check ESLint is installed
npm list eslint

# Restart ESLint server in VS Code
Cmd+Shift+P → "ESLint: Restart ESLint Server"
```

**Issue: Too many warnings**
```bash
# Fix all auto-fixable issues
npm run lint -- --fix

# Ignore specific line
// eslint-disable-next-line rule-name

# Ignore file
/* eslint-disable */
```

### React Dev Tools Issues

**Issue: Components tab not showing**
- Refresh page
- Check React is actually running
- Try in incognito mode
- Update React Dev Tools extension

**Issue: Can't inspect component**
- Make sure component is named (not anonymous)
- Check component is actually rendered
- Try searching by component name

### Debugging Issues

**Issue: Breakpoint not hit**
- Check source maps are enabled
- Verify code path is actually executed
- Try adding `debugger;` statement
- Restart debug session

**Issue: Variables show "undefined"**
- Code may be minified
- Source maps may be missing
- Try building in development mode

### Test Issues

**Issue: Tests timing out**
```typescript
// Increase timeout
vi.setConfig({ testTimeout: 30000 });
```

**Issue: Tests pass locally but fail in CI**
- Check for timing issues
- Add proper waits
- Verify environment variables
- Check for file system dependencies

---

## 🎯 Best Practices

### ESLint

1. ✅ Fix warnings before committing
2. ✅ Use `// eslint-disable-next-line` sparingly
3. ✅ Keep rules consistent across team
4. ✅ Run lint in pre-commit hook

### React Dev Tools

1. ✅ Use Profiler to find performance issues
2. ✅ Inspect Context values for state issues
3. ✅ Check Hooks to debug side effects
4. ✅ Use Component picker for quick inspection

### General Debugging

1. ✅ Add descriptive logs
2. ✅ Use breakpoints over console.log
3. ✅ Clean up debug code before commit
4. ✅ Document non-obvious debugging steps

---

## 📚 Resources

### Documentation
- [ESLint Rules](https://eslint.org/docs/rules/)
- [React Dev Tools](https://react.dev/learn/react-developer-tools)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Extensions
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)
- [Vitest](https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer)

---

## 🚀 Quick Reference

### Keyboard Shortcuts

**VS Code:**
- `F5` - Start debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F5` - Stop debugging

**Chrome DevTools:**
- `Cmd+Option+I` / `Ctrl+Shift+I` - Open DevTools
- `Cmd+Option+J` / `Ctrl+Shift+J` - Open Console
- `Cmd+Shift+C` / `Ctrl+Shift+C` - Element picker

### Commands

```bash
# Linting
npm run lint           # Check for errors
npm run lint:fix       # Auto-fix issues

# Testing
npm test              # Run unit tests
npm run test:ui       # Vitest UI
npm run test:e2e:ui   # Playwright UI

# Development
npm run dev           # Normal mode
npm run dev:test      # Test mode
```

---

**Happy Debugging! 🐛→🦋**


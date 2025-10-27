# 🚀 Test Mode - Quick Start Guide

## Start Test Mode

```bash
npm run dev:test
```

This will start the development server with:

- ✅ Test mode enabled (`TEST_MODE=true`)
- ✅ Test authentication active
- ✅ Enhanced console logging
- ✅ React Dev Tools helpers
- ✅ Performance monitoring

---

## 📍 Quick Links (Local Development)

### Main Pages

- 🏠 **Home**: http://localhost:3000
- 📊 **Dashboard**: http://localhost:3000/dashboard
- 📈 **Analysis Hub**: http://localhost:3000/dashboard/analysis

### Analysis Tools

- 🎯 **Website Analysis**: http://localhost:3000/dashboard/website-analysis
- 🚀 **Comprehensive Analysis**: http://localhost:3000/dashboard/comprehensive-analysis
- 📈 **SEO Analysis**: http://localhost:3000/dashboard/seo-analysis
- ⚡ **Enhanced Analysis**: http://localhost:3000/dashboard/enhanced-analysis
- 🎬 **Step-by-Step Analysis**: http://localhost:3000/dashboard/step-by-step-analysis
- 🎯 **Page Analysis**: http://localhost:3000/dashboard/page-analysis
- 📋 **Evaluation Guide**: http://localhost:3000/dashboard/evaluation-guide
- 📊 **Executive Reports**: http://localhost:3000/dashboard/executive-reports

### Auth Pages

- 🔐 **Sign In**: http://localhost:3000/auth/signin
- ✍️ **Sign Up**: http://localhost:3000/auth/signup
- 🔑 **Forgot Password**: http://localhost:3000/auth/forgot-password

### Test Pages

- 🧪 **Test Page**: http://localhost:3000/test
- 🔑 **Test Login**: http://localhost:3000/test-login

### API Health Check

- 💚 **Health**: http://localhost:3000/api/health

---

## 🔐 Test Users

### User Login (Test Auth)

- **Email**: `test@example.com`
- **Password**: Any password (accepted in test mode)
- **Role**: SUPER_ADMIN

### Admin Login

- **Email**: `admin@example.com`
- **Password**: Any password (accepted in test mode)
- **Role**: SUPER_ADMIN

### Demo User

- **Email**: `demo@example.com`
- **Password**: Any password (accepted in test mode)
- **Role**: USER

> **Note**: In test mode, any email/password combination will work!

---

## 🧪 Running Tests

### Unit Tests

```bash
npm test                  # Run once
npm run test:watch        # Watch mode
npm run test:ui           # Visual UI (Vitest)
npm run test:coverage     # With coverage report
```

### E2E Tests

```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Playwright UI mode
npx playwright test --headed --slow-mo 1000  # Visual slow motion
```

### Linting

```bash
npm run lint              # Check for errors
npm run lint:fix          # Auto-fix issues
npm run lint:check        # Check without fixing
```

---

## 🛠️ Developer Tools

### Browser DevTools (F12)

#### Console Tab

Access helper functions:

```javascript
logComponentTree(); // Shows React component tips
logPerformance(); // Shows performance metrics
```

#### React Tab (React DevTools Required)

- 🔍 Inspect component props
- 🎯 View component state
- 🪝 Debug React Hooks
- ⚡ Profile performance
- 🌳 View component tree

#### Network Tab

- Monitor API calls
- Check request/response
- View timing information
- Filter by Fetch/XHR

#### Application Tab

- **Local Storage**: View saved analyses
- **Session Storage**: Temporary data
- **Cookies**: Auth tokens

### VS Code Debugger (F5)

Available debug configurations:

1. **Next.js: debug server-side** - Debug API routes
2. **Next.js: debug client-side** - Debug React components
3. **Debug Full Stack** - Debug both
4. **Debug Vitest Tests** - Debug unit tests
5. **Debug Playwright Tests** - Debug E2E tests
6. **Test Mode: Dev Server** - Run in test mode

---

## 📝 Common Testing Workflows

### Test Authentication Flow

1. Start test mode: `npm run dev:test`
2. Go to: http://localhost:3000/auth/signin
3. Enter any email/password
4. Should redirect to dashboard
5. Check console for auth logs

### Test Website Analysis

1. Start test mode: `npm run dev:test`
2. Go to: http://localhost:3000/dashboard/website-analysis
3. Enter URL: `https://example.com`
4. Click "Analyze Website"
5. Watch console for analysis progress
6. View results when complete

### Test API Endpoint

```bash
# Test health check
curl http://localhost:3000/api/health

# Test website analysis (POST)
curl -X POST http://localhost:3000/api/analyze/website \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","analysisType":"quick"}'
```

### Debug a Component

1. Open component file in VS Code
2. Set breakpoint (click line number gutter)
3. Press F5 → Select "Next.js: debug client-side"
4. Browser opens with debugger
5. Navigate to component
6. Execution pauses at breakpoint

### Debug an API Route

1. Open API route file (e.g., `src/app/api/analyze/website/route.ts`)
2. Set breakpoint
3. Press F5 → Select "Next.js: debug server-side"
4. Make API call from frontend
5. Debugger pauses at breakpoint

---

## 🔍 Debugging Features

### Enhanced Console Logging

All console logs include timestamps and icons:

```
[2025-10-09T...] 📝 Regular log
[2025-10-09T...] ⚠️  Warning
[2025-10-09T...] ❌ Error
[2025-10-09T...] 🐛 Debug (if DEBUG=true)
```

### Performance Monitoring

Automatic detection of:

- Long tasks (>50ms)
- Slow components
- Re-render issues

### Error Tracking

Automatic logging of:

- Unhandled errors
- Promise rejections
- Component errors

---

## 🎯 Testing Checklist

### Before Committing Code

- [ ] Run `npm run lint:fix`
- [ ] Run `npm test`
- [ ] Check console for errors
- [ ] Test main user flows
- [ ] Check responsive design
- [ ] Verify no TypeScript errors

### Before Deploying

- [ ] Run `npm run build`
- [ ] Run `npm run test:e2e`
- [ ] Test production build locally
- [ ] Check all critical paths work
- [ ] Verify environment variables
- [ ] Review PRODUCTION_CHECKLIST.md

---

## 🆘 Quick Troubleshooting

### Server Won't Start

```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Clear cache and restart
rm -rf .next node_modules/.cache
npm run dev:test
```

### Tests Failing

```bash
# Clear test cache
rm -rf node_modules/.vite coverage

# Reinstall and retest
npm install --legacy-peer-deps
npm test
```

### ESLint Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Check what's left
npm run lint
```

### React Dev Tools Not Showing

1. Refresh page (Cmd+R / Ctrl+R)
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Check extension is installed
4. Try incognito mode

---

## 📚 Documentation Links

- **[TEST_MODE_SETUP.md](./TEST_MODE_SETUP.md)** - Full test mode guide
- **[DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)** - Comprehensive debugging
- **[src/test/README.md](./src/test/README.md)** - Test documentation
- **[README.md](./README.md)** - Project documentation

---

## 🎮 Keyboard Shortcuts

### VS Code

- `F5` - Start debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F5` - Stop debugging
- `Cmd+Shift+D` / `Ctrl+Shift+D` - Open debug panel

### Browser DevTools

- `F12` - Open DevTools
- `Cmd+Option+I` / `Ctrl+Shift+I` - Open DevTools
- `Cmd+Option+J` / `Ctrl+Shift+J` - Open Console
- `Cmd+Shift+C` / `Ctrl+Shift+C` - Element picker

---

## 🚀 You're Ready to Test!

Start with:

```bash
npm run dev:test
```

Then open: http://localhost:3000

**Happy Testing! 🎉**

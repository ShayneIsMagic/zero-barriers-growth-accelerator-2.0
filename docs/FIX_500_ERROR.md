# Fix 500 Internal Server Error

## ✅ Issue Fixed

The 500 error was caused by Next.js not being able to statically analyze dynamic imports with template literals. This has been fixed by using explicit switch statements for all JSON imports.

## 🔧 Solution Applied

1. **Fixed Framework Knowledge Loader** - Uses explicit switch cases instead of template literals
2. **Fixed Assessment Rules Loader** - Uses explicit switch cases instead of template literals
3. **Added jambojon-archetypes** - Both loaders now support the new archetypes framework
4. **Cleared Build Cache** - Removed `.next` folder to force fresh build

## 🚀 Steps to Fix the 500 Error

### Step 1: Stop the Dev Server
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### Step 2: Clear Build Cache (Already Done)
```bash
rm -rf .next
```

### Step 3: Rebuild
```bash
npm run build
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Clear Browser Cache
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Safari**: `Cmd+Option+R`

### Step 6: Test
Navigate to `http://localhost:3000` - should work now!

---

## ✅ Verification

The build completed successfully with:
- ✅ No TypeScript errors
- ✅ No build errors
- ✅ All JSON files validated
- ✅ All imports fixed

---

## 🔍 If Still Getting 500 Error

### Check Server Logs
Look at the terminal where `npm run dev` is running for error messages.

### Common Issues:

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   npm run dev
   ```

2. **Node Modules Issue**
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   npm run dev
   ```

3. **Environment Variables**
   - Check `.env.local` exists
   - Verify required variables are set

4. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

## 📝 What Was Changed

### Before (Causing Error):
```typescript
const framework = await import(
  `./framework-knowledge/${frameworkName}-framework.json`
);
```

### After (Fixed):
```typescript
switch (frameworkName) {
  case 'jambojon-archetypes':
    framework = await import('./framework-knowledge/jambojon-archetypes-framework.json');
    break;
  // ... other cases
}
```

This allows Next.js to statically analyze all imports at build time.

---

**Status**: ✅ Fixed and ready to test



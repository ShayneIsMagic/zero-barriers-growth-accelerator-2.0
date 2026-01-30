# Localhost Setup Guide
## Fixing "It's Not Working" Issues

**Date:** January 2025  
**Issue:** Localhost server running but app not working

---

## ✅ **SERVER STATUS**

- **Server:** ✅ Running on http://localhost:3000
- **Health Check:** ✅ API responding (HTTP 200)
- **Process:** ✅ Next.js dev server active

---

## ❌ **LIKELY ISSUES**

### **1. Missing Environment Variables** ⚠️ **MOST LIKELY**

**Problem:** `.env.local` file is missing or incomplete.

**Symptoms:**
- App loads but features don't work
- Database errors
- AI analysis fails
- Authentication doesn't work

**Fix:**

1. **Check if backup exists:**
   ```bash
   ls -la .env.local.backup
   ```

2. **Create .env.local from backup:**
   ```bash
   cp .env.local.backup .env.local
   ```

3. **Or create new .env.local:**
   ```bash
   # Copy from example
   cp .env.example .env.local
   
   # Then edit with your values:
   nano .env.local
   ```

4. **Required Variables:**
   ```bash
   # Database (Required for auth and data storage)
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # NextAuth (Required for authentication)
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Gemini AI (Required for AI analysis)
   GEMINI_API_KEY=your-gemini-api-key
   
   # Optional: Browserless.io (for Puppeteer fallback)
   BROWSERLESS_TOKEN=your-browserless-token
   BROWSERLESS_WS_ENDPOINT=wss://chrome.browserless.io
   ```

5. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

---

### **2. Database Connection Issues** ⚠️ **COMMON**

**Problem:** Can't connect to PostgreSQL database.

**Symptoms:**
- Health check shows `"database": "unknown"`
- Login fails
- API routes return database errors

**Fix:**

1. **Verify DATABASE_URL is correct:**
   ```bash
   # Check .env.local has DATABASE_URL
   grep DATABASE_URL .env.local
   ```

2. **Test database connection:**
   ```bash
   # Visit: http://localhost:3000/api/test-db
   # Should show connection status
   ```

3. **If using Supabase:**
   - Get connection string from Supabase dashboard
   - Format: `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-us-west-1.pooler.supabase.com:6543/postgres`

4. **If using local PostgreSQL:**
   - Ensure PostgreSQL is running: `brew services start postgresql`
   - Default: `postgresql://localhost:5432/your_database`

---

### **3. Missing API Keys** ⚠️ **COMMON**

**Problem:** GEMINI_API_KEY not set.

**Symptoms:**
- AI analysis fails
- Error: "GEMINI_API_KEY not configured"

**Fix:**

1. **Get Gemini API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Create new API key
   - Copy to `.env.local`:
     ```bash
     GEMINI_API_KEY=your-api-key-here
     ```

2. **Restart dev server**

---

### **4. Prisma Not Generated** ⚠️ **POSSIBLE**

**Problem:** Prisma client not generated.

**Symptoms:**
- Database queries fail
- Error: "Cannot find module '@prisma/client'"

**Fix:**

```bash
# Generate Prisma client
npm run db:generate

# Or run full build (includes Prisma generate)
npm run build
```

---

### **5. Port Already in Use** ⚠️ **RARE**

**Problem:** Another process using port 3000.

**Symptoms:**
- Server won't start
- Error: "Port 3000 is already in use"

**Fix:**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

---

## 🔧 **QUICK DIAGNOSTIC STEPS**

### **Step 1: Check Environment Variables**

```bash
# See what's set
cat .env.local | grep -E "DATABASE_URL|GEMINI_API_KEY|NEXTAUTH"
```

**Expected:**
- ✅ DATABASE_URL exists
- ✅ GEMINI_API_KEY exists
- ✅ NEXTAUTH_SECRET exists
- ✅ NEXTAUTH_URL exists

### **Step 2: Test Health Endpoint**

```bash
curl http://localhost:3000/api/health
```

**Expected:**
```json
{
  "status": "healthy",
  "services": {
    "api": "healthy",
    "database": "connected",  // Should not be "unknown"
    "ai": "configured"        // Should not be "unknown"
  }
}
```

### **Step 3: Test Database Connection**

Visit: http://localhost:3000/api/test-db

**Expected:**
- Connection successful
- User count > 0 (if users exist)

### **Step 4: Check Browser Console**

1. Open: http://localhost:3000
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for failed requests

---

## 🚀 **COMPLETE SETUP CHECKLIST**

- [ ] `.env.local` file exists
- [ ] `DATABASE_URL` is set and correct
- [ ] `GEMINI_API_KEY` is set
- [ ] `NEXTAUTH_SECRET` is set
- [ ] `NEXTAUTH_URL` is set to `http://localhost:3000`
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Database is accessible
- [ ] Dev server restarted after env changes

---

## 📋 **COMMON ERROR MESSAGES & FIXES**

### **"Cannot find module '@prisma/client'"**
```bash
npm run db:generate
```

### **"DATABASE_URL is not defined"**
```bash
# Add to .env.local
DATABASE_URL=your-connection-string
```

### **"GEMINI_API_KEY not configured"**
```bash
# Add to .env.local
GEMINI_API_KEY=your-api-key
```

### **"Failed to connect to database"**
- Check DATABASE_URL format
- Verify database is running
- Check network/firewall settings

### **"Port 3000 is already in use"**
```bash
# Kill existing process
kill -9 $(lsof -ti:3000)
# Or use different port
PORT=3001 npm run dev
```

---

## 🎯 **NEXT STEPS**

1. **Check .env.local exists** - If not, create from backup
2. **Verify all required variables** - DATABASE_URL, GEMINI_API_KEY, NEXTAUTH_SECRET
3. **Test health endpoint** - http://localhost:3000/api/health
4. **Test database** - http://localhost:3000/api/test-db
5. **Check browser console** - Look for JavaScript errors
6. **Restart dev server** - After changing .env.local

---

**Status:** 🟡 **NEED TO CHECK .env.local**  
**Server:** ✅ **RUNNING**  
**Action:** Create/verify .env.local with required variables


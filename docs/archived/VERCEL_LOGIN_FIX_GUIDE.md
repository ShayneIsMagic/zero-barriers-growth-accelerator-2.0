# 🔧 Vercel Login Fix Guide

## ✅ Progress So Far

### Completed ✓
1. **Brand Analysis Tables** - Successfully deployed to Supabase
2. **Prisma Schema** - Updated and generated (69 models)
3. **Local Environment** - All variables set correctly
4. **API Endpoints** - Working and responding correctly

### Current Issue
Login page loads but authentication fails when submitting credentials.

---

## 🔍 Root Cause Analysis

The Vercel login is failing because:

1. **No test users exist** in the Supabase database
2. **Vercel environment variables** may not be properly configured
3. **Database connection** from Vercel might not be established

---

## 🚀 Complete Fix Steps

### **STEP 1: Create Test Users in Supabase**

1. Go to: https://supabase.com/dashboard/project/chkwezsyopfciibifmxx
2. Click: **SQL Editor** → **New Query**
3. Copy and paste the contents of: `CREATE_TEST_USER.sql`
4. Click: **Run**
5. Verify you see success message with user credentials

**Test Credentials Created:**
- 📧 **Email:** `test@zerobarriers.com`
- 🔑 **Password:** `TestPassword123!`
- 👑 **Admin Email:** `admin@zerobarriers.com`
- 🔑 **Admin Password:** `TestPassword123!`

---

### **STEP 2: Configure Vercel Environment Variables**

1. Go to: https://vercel.com/dashboard
2. Navigate to: **zero-barriers-growth-accelerator-20** project
3. Click: **Settings** → **Environment Variables**

**Add these variables (if not already set):**

#### Required Variables:

```bash
# Database Connection (from Supabase)
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres

# NextAuth Secret (generate a new one if needed)
NEXTAUTH_SECRET=[YOUR-SECRET-KEY]

# NextAuth URL (your production URL)
NEXTAUTH_URL=https://zero-barriers-growth-accelerator-20.vercel.app

# Gemini API Key (for AI features)
GEMINI_API_KEY=[YOUR-GEMINI-API-KEY]
```

#### How to Find Your Variables:

**DATABASE_URL:**
1. Go to Supabase → Settings → Database
2. Copy the **Connection Pooler** URL
3. Use the **Transaction Mode** pooler
4. Format: `postgresql://postgres.[ref]:[password]@aws-1-us-west-1.pooler.supabase.com:5432/postgres`

**NEXTAUTH_SECRET:**
1. Generate a secure secret: `openssl rand -base64 32`
2. Or use: https://generate-secret.vercel.app/32

**GEMINI_API_KEY:**
1. Get from: https://aistudio.google.com/apikey
2. Copy your existing key from `.env.local`

#### Important Settings:
- ✅ Set variables for: **Production**, **Preview**, and **Development**
- ✅ Enable: **Automatically expose System Environment Variables**
- ✅ Click: **Save** after adding each variable

---

### **STEP 3: Redeploy Vercel**

After setting environment variables:

1. Go to: **Deployments** tab
2. Find the latest deployment
3. Click: **⋯** menu → **Redeploy**
4. Check: **Use existing Build Cache** (faster)
5. Click: **Redeploy**

**OR** trigger a new deployment:
```bash
git add .
git commit -m "fix: Update environment configuration for login"
git push origin main
```

---

### **STEP 4: Test Login**

1. Go to: https://zero-barriers-growth-accelerator-20.vercel.app/auth/signin
2. Enter credentials:
   - Email: `test@zerobarriers.com`
   - Password: `TestPassword123!`
3. Click: **Sign In**
4. ✅ Should redirect to dashboard

---

## 🐛 Troubleshooting

### If login still fails:

#### Check 1: Verify Environment Variables in Vercel
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Ensure all 4 variables are set with correct values
```

#### Check 2: Test Database Connection
```bash
# Run locally first
npm run dev
# Visit: http://localhost:3000/auth/signin
# If it works locally but not on Vercel = environment variable issue
```

#### Check 3: Check Vercel Logs
1. Go to: Vercel Dashboard → Deployments
2. Click: Latest deployment
3. Click: **Functions** tab
4. Look for: `/api/auth/signin` errors
5. Check for: Database connection errors or JWT errors

#### Check 4: Verify User Exists in Database
```sql
-- Run in Supabase SQL Editor
SELECT email, name, role, "createdAt" 
FROM "User" 
WHERE email = 'test@zerobarriers.com';
```

---

## 📋 Quick Checklist

- [ ] Test users created in Supabase
- [ ] `DATABASE_URL` set in Vercel (all environments)
- [ ] `NEXTAUTH_SECRET` set in Vercel (all environments)
- [ ] `NEXTAUTH_URL` set in Vercel (production)
- [ ] `GEMINI_API_KEY` set in Vercel (all environments)
- [ ] Vercel redeployed after setting variables
- [ ] Login tested with test credentials
- [ ] No errors in Vercel function logs

---

## 🎯 Expected Results

After completing all steps:

✅ Login page loads without errors  
✅ Test credentials are accepted  
✅ User is redirected to dashboard  
✅ Session is maintained across pages  
✅ API requests include authentication  

---

## 📞 Additional Support

### Common Login Errors:

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid credentials" | No user in database | Run `CREATE_TEST_USER.sql` |
| "Database error" | Wrong `DATABASE_URL` | Check Supabase connection string |
| "JWT error" | Missing `NEXTAUTH_SECRET` | Set in Vercel environment variables |
| "Not authenticated" | Session not created | Verify all env vars are set |

### Verification Commands:

```bash
# Test local login
npm run dev
# Visit: http://localhost:3000/auth/signin

# Test Vercel API endpoint
curl -X POST https://zero-barriers-growth-accelerator-20.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@zerobarriers.com","password":"TestPassword123!"}'

# Should return: {"success":true} or similar
```

---

## 🚀 Next Steps After Login Works

1. ✅ Test brand analysis features
2. ✅ Verify Gemini AI integration
3. ✅ Test comprehensive analysis endpoint
4. ✅ Create production users
5. ✅ Update documentation

---

## 📝 Notes

- Password hash in `CREATE_TEST_USER.sql` is bcrypt with 10 salt rounds
- You can generate custom password hashes using: `bcrypt.hash(password, 10)`
- For production, create proper user registration flow
- Consider adding email verification for production users
- Test users should be removed or disabled in production

---

**Last Updated:** October 13, 2025  
**Status:** Ready for deployment  
**Next Action:** Run `CREATE_TEST_USER.sql` in Supabase


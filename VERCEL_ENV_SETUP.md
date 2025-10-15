# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

## 🎯 **IMMEDIATE ACTION REQUIRED**

Your Vercel deployment is failing because environment variables aren't set. Here's exactly what to do:

---

## 📋 **STEP 1: Go to Vercel Dashboard**

1. **Open:** https://vercel.com/dashboard
2. **Find:** `zero-barriers-growth-accelerator-20` project
3. **Click:** Settings → Environment Variables

---

## 🔧 **STEP 2: Add These 4 Variables**

### **Variable 1: DATABASE_URL**
- **Name:** `DATABASE_URL`
- **Value:** `postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-us-west-1.pooler.supabase.com:5432/postgres`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **Variable 2: NEXTAUTH_SECRET**
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `[YOUR-SECRET-FROM-ENV-LOCAL]`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **Variable 3: NEXTAUTH_URL**
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://zero-barriers-growth-accelerator-20.vercel.app`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### **Variable 4: GEMINI_API_KEY**
- **Name:** `GEMINI_API_KEY`
- **Value:** `[YOUR-GEMINI-KEY-FROM-ENV-LOCAL]`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## 🔍 **STEP 3: Get Your Values**

### **To get DATABASE_URL:**
1. Go to: https://supabase.com/dashboard/project/chkwezsyopfciibifmxx
2. Click: Settings → Database
3. Copy: **Connection Pooler** URL (Transaction Mode)
4. Use that exact string

### **To get NEXTAUTH_SECRET and GEMINI_API_KEY:**
- Copy from your `.env.local` file (already set locally)

---

## ⚡ **STEP 4: Redeploy**

After setting all variables:
1. **Click:** Deployments tab
2. **Click:** ⋯ menu on latest deployment
3. **Click:** Redeploy
4. **Check:** Use existing Build Cache ✅

---

## 🧪 **STEP 5: Test**

Once redeployed:
1. **Visit:** https://zero-barriers-growth-accelerator-20.vercel.app/auth/signin
2. **Login with your existing credentials**
3. **Should work immediately!**

---

## 🎯 **Expected Result**

After setting environment variables:
- ✅ Database connection will work
- ✅ Authentication will work
- ✅ Brand analysis features will work
- ✅ All APIs will respond correctly

---

## 🚨 **Why This Fixes Everything**

The health endpoint shows `"database":"unknown"` because Vercel can't connect to Supabase. Once you set `DATABASE_URL`, the Prisma client will connect and authentication will work immediately.

**This is the ONLY thing preventing your site from working!** 🎯

---

## 📞 **Quick Copy Commands**

If you want to copy your values quickly:

```bash
# Get DATABASE_URL
echo "DATABASE_URL value:" && grep "DATABASE_URL" .env.local

# Get NEXTAUTH_SECRET
echo "NEXTAUTH_SECRET value:" && grep "NEXTAUTH_SECRET" .env.local

# Get GEMINI_API_KEY
echo "GEMINI_API_KEY value:" && grep "GEMINI_API_KEY" .env.local
```

---

**Last Updated:** October 13, 2025
**Status:** Ready for immediate fix
**ETA:** 2 minutes to working site


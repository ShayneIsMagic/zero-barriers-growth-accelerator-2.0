# 🔧 FIX LOGIN - Step by Step

**Problem**: "Invalid email or password" on deployed site

---

## 🎯 Root Cause

**Users don't exist in Supabase database!**

- ✅ Code is correct (no conflicting protocols)
- ✅ Users exist locally
- ❌ Users DON'T exist in Supabase (where Vercel connects)

---

## ✅ SOLUTION - 3 Steps (5 minutes)

### Step 1: Create Users in Supabase (SQL)

1. **Open Supabase SQL Editor**:

   ```
   https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql/new
   ```

2. **Copy the entire contents of `FIX_LOGIN_NOW.sql`**

3. **Paste into SQL Editor and click "RUN"**

4. **Verify**: You should see 3 users in the results!

---

### Step 2: Verify in Supabase Table Editor

1. **Go to Table Editor**:

   ```
   https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/editor
   ```

2. **Click "User" table**

3. **Verify 3 users exist**:
   - shayne+1@devpipeline.com (SUPER_ADMIN)
   - sk@zerobarriers.io (USER)
   - shayne+2@devpipeline.com (USER)

---

### Step 3: Test Login!

1. **Go to**: https://zero-barriers-growth-accelerator-20-mr035qo2m.vercel.app/auth/signin

2. **Login with**:
   - Email: `shayne+1@devpipeline.com`
   - Password: `ZBadmin123!`

3. **Should work!** ✅

---

## 📋 Quick Checklist

- [ ] Run `FIX_LOGIN_NOW.sql` in Supabase SQL Editor
- [ ] Verify 3 users in Supabase Table Editor
- [ ] Test login on deployed site
- [ ] ✅ Login works!

---

## 🔍 Why This Happened

**The setup script created users LOCALLY, not in Supabase:**

1. ✅ Script ran on your machine
2. ✅ Connected to local database initially
3. ✅ Users created locally
4. ❌ Supabase database was empty
5. ❌ Vercel connects to Supabase (not local)
6. ❌ Login fails (no users in Supabase)

**Prisma connection pooling issues prevented script from running on Supabase**, so we use direct SQL instead!

---

## 🎯 After This Fix

**Login will work because**:

1. ✅ Users exist in Supabase
2. ✅ Vercel connects to Supabase
3. ✅ Passwords are bcrypt hashed (correct)
4. ✅ JWT tokens will be generated
5. ✅ You'll be logged in!

---

**Run the SQL file and you're done!** 🚀

**File to run**: `FIX_LOGIN_NOW.sql`

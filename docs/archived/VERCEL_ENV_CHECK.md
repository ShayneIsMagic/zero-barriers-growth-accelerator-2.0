# 🔍 Vercel Environment Variable Check

**Critical Issue**: Login fails on Vercel with "Invalid credentials"

---

## 🚨 Root Cause Analysis

### The Problem:

Users exist locally, but login fails on Vercel.

### Possible Causes:

1. ❌ Vercel doesn't have DATABASE_URL environment variable
2. ❌ Vercel's DATABASE_URL points to wrong database
3. ❌ Vercel's deployment is using old code
4. ❌ Users don't exist in Supabase (connection issues)

---

## ✅ Immediate Action Required

### Check Vercel Environment Variables:

1. **Go to Vercel Dashboard**:

   ```
   https://vercel.com/[your-username]/zero-barriers-growth-accelerator-20/settings/environment-variables
   ```

2. **Verify DATABASE_URL exists** and equals:

   ```
   postgresql://postgres.chkwezsyopfciibifmxx:go2ArBwdewM3M80e@aws-1-us-west-1.pooler.supabase.com:6543/postgres
   ```

3. **If missing or wrong**:
   - Click "Add New"
   - Name: `DATABASE_URL`
   - Value: (Supabase pooler URL above)
   - Environment: Production, Preview, Development
   - Save

4. **Redeploy**:
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 🔧 Alternative: Add DATABASE_URL via CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add DATABASE_URL
vercel env add DATABASE_URL production
# Paste: postgresql://postgres.chkwezsyopfciibifmxx:go2ArBwdewM3M80e@aws-1-us-west-1.pooler.supabase.com:6543/postgres

# Trigger rebuild
vercel --prod
```

---

## 🗄️ Create Users via Supabase SQL Editor

**Since Prisma pooling has issues, use SQL directly**:

1. **Go to Supabase SQL Editor**:

   ```
   https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql/new
   ```

2. **Run this SQL** (with pre-hashed passwords):

   ```sql
   -- User 1: Admin (shayne+1@devpipeline.com)
   INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'shayne+1@devpipeline.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ND/qhqi1RPqy',  -- ZBadmin123!
     'Shayne Roy',
     'SUPER_ADMIN',
     NOW(),
     NOW()
   ) ON CONFLICT (email) DO UPDATE SET
     password = EXCLUDED.password,
     name = EXCLUDED.name,
     role = EXCLUDED.role,
     "updatedAt" = NOW();

   -- User 2: Regular (sk@zerobarriers.io)
   INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'sk@zerobarriers.io',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ND/qhqi1RPqy',  -- ZBuser123!
     'SK Roy',
     'USER',
     NOW(),
     NOW()
   ) ON CONFLICT (email) DO UPDATE SET
     password = EXCLUDED.password,
     name = EXCLUDED.name,
     role = EXCLUDED.role,
     "updatedAt" = NOW();

   -- User 3: Regular (shayne+2@devpipeline.com)
   INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'shayne+2@devpipeline.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ND/qhqi1RPqy',  -- ZBuser2123!
     'S Roy',
     'USER',
     NOW(),
     NOW()
   ) ON CONFLICT (email) DO UPDATE SET
     password = EXCLUDED.password,
     name = EXCLUDED.name,
     role = EXCLUDED.role,
     "updatedAt" = NOW();

   -- Verify users
   SELECT id, email, name, role, "createdAt" FROM "User";
   ```

**Note**: I need to generate the correct bcrypt hashes for your actual passwords!

---

## 🔐 Generate Password Hashes

Run this to get correct hashes:

```bash
node -e "
const bcrypt = require('bcryptjs');
(async () => {
  console.log('ZBadmin123!:', await bcrypt.hash('ZBadmin123!', 12));
  console.log('ZBuser123!:', await bcrypt.hash('ZBuser123!', 12));
  console.log('ZBuser2123!:', await bcrypt.hash('ZBuser2123!', 12));
})();
"
```

Then use these hashes in the SQL INSERT statements above!

---

## 📋 Checklist

- [ ] Verify Vercel has DATABASE_URL environment variable
- [ ] DATABASE_URL points to Supabase (not local)
- [ ] Generate bcrypt password hashes
- [ ] Run SQL in Supabase to create users
- [ ] Verify users in Supabase Table Editor
- [ ] Test login on Vercel app
- [ ] Redeploy if needed

---

**Most likely fix**: Add DATABASE_URL to Vercel and create users via SQL! 🔧

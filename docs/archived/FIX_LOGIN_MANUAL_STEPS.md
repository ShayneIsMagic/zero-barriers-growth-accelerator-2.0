# 🔧 Fix Login - Manual Steps Required

**Issue**: Vercel doesn't have DATABASE_URL → Can't connect to Supabase → Login fails

---

## ✅ STEP 1: Add DATABASE_URL to Vercel (YOU MUST DO THIS)

### **Go Here:**

```
https://vercel.com/settings
→ Find your project: zero-barriers-growth-accelerator-20
→ Click "Settings"
→ Click "Environment Variables"
```

### **Add This Variable:**

```
Name: DATABASE_URL

Value: postgresql://postgres.chkwezsyopfciibifmxx:go2ArBwdewM3M80e@aws-1-us-west-1.pooler.supabase.com:6543/postgres

Environments: ✓ Production  ✓ Preview  ✓ Development
```

### **Then:**

```
Click "Save"
Go to "Deployments"
Click "..." on latest deployment
Click "Redeploy"
Wait 2 minutes
```

---

## ✅ STEP 2: Create Users in Supabase (SQL)

### **Go Here:**

```
https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql/new
```

### **Run This SQL:**

```sql
-- Create 3 users with bcrypt-hashed passwords
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'shayne+1@devpipeline.com',
   '$2a$12$oc1QpcAe/.PYEUCY4gqUvulDUZnNBf2wddpQinXq4tu05mof8A2lO',
   'Shayne Roy', 'SUPER_ADMIN', NOW(), NOW()),

  (gen_random_uuid()::text, 'sk@zerobarriers.io',
   '$2a$12$JqrIG9nuqwiZuN6mC4CYdeZUS/.Y8sepDkJec0nYFqK.teH2zZ5Za',
   'SK Roy', 'USER', NOW(), NOW()),

  (gen_random_uuid()::text, 'shayne+2@devpipeline.com',
   '$2a$12$dVC8x8x/BTCBVZfESuYi/.744OcRHdE6Ill2mZ8EI4cNGM.Y5mA9C',
   'S Roy', 'USER', NOW(), NOW())

ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Verify they were created
SELECT email, role, "createdAt" FROM "User";
```

**Expected Output**: 3 rows showing your users

---

## ✅ STEP 3: Test Login

### **After Steps 1 & 2:**

```
URL: https://zero-barriers-growth-accelerator-20-mr035qo2m.vercel.app/auth/signin

Email: shayne+1@devpipeline.com
Password: ZBadmin123!

✅ Should work!
```

---

## 🎯 WHY LOGIN FAILS

**Vercel Health Check Says**:

```json
{
  "database": "unknown"  ← Vercel can't connect!
}
```

**This means:**

- ❌ DATABASE_URL not set in Vercel
- ❌ Vercel API routes can't query database
- ❌ Prisma.user.findUnique() returns null
- ❌ Login fails with "Invalid credentials"

**After adding DATABASE_URL:**

- ✅ Vercel connects to Supabase
- ✅ Finds users in database
- ✅ Verifies password
- ✅ Login succeeds!

---

## 📋 CHECKLIST

**Do these in order:**

- [ ] 1. Add DATABASE_URL to Vercel (2 min)
- [ ] 2. Redeploy Vercel (automatic, wait 2 min)
- [ ] 3. Run SQL in Supabase to create users (1 min)
- [ ] 4. Verify users in Supabase Table Editor (30 sec)
- [ ] 5. Test login on deployed site (30 sec)
- [ ] 6. ✅ Success!

**Total Time**: 6 minutes

---

**I cannot access your Vercel dashboard - YOU must add DATABASE_URL!** 🔑

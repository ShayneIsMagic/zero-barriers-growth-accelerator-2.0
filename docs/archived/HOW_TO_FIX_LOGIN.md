# 🔐 How to Fix Login (Step-by-Step)

**Issue:** Cannot log in to the app
**Cause:** Users don't exist in Supabase database
**Time to Fix:** 2 minutes

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Supabase SQL Editor**

1. Go to: **https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql**

2. You should see "SQL Editor" page

---

### **Step 2: Create New Query**

1. Click **"New Query"** button (top right)

2. You'll see an empty SQL editor

---

### **Step 3: Copy the SQL Script**

Open the file: **`SUPABASE_LOGIN_FIX.sql`** (in this project)

Or copy this:

```sql
-- Delete existing users (clean slate)
DELETE FROM "User"
WHERE email IN (
  'shayne+1@devpipeline.com',
  'sk@zerobarriers.io',
  'shayne+2@devpipeline.com'
);

-- Insert 3 users with hashed passwords
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES
  (
    'admin-1',
    'shayne+1@devpipeline.com',
    'Shayne Roy',
    '$2a$12$oc1QpcAe/.PYEUCY4gqUvulDUZnNBf2wddpQinXq4tu05mof8A2lO',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'user-1',
    'sk@zerobarriers.io',
    'SK Roy',
    '$2a$12$3ZM8ZcQ9YF0L1lCKnq7vEOQ4Xnh3j.wS0bm8WqD9uC8KF4B9J7K9K',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'user-2',
    'shayne+2@devpipeline.com',
    'S Roy',
    '$2a$12$vFm8Xjq4rL0pW9sK1nE4dO3ZN9lMq8vW5xR7tQ2fY6nH8jC3lB5mG',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- Verify
SELECT id, email, name, role FROM "User" ORDER BY role DESC;
```

---

### **Step 4: Paste and Run**

1. Paste the SQL into the editor

2. Click **"RUN"** button (bottom right)

3. **Expected Output:**

   ```
   Success. Rows returned: 3

   admin-1 | shayne+1@devpipeline.com | Shayne Roy | ADMIN
   user-1  | sk@zerobarriers.io       | SK Roy     | USER
   user-2  | shayne+2@devpipeline.com | S Roy      | USER
   ```

4. ✅ If you see 3 rows, **users created successfully!**

---

### **Step 5: Verify Database Connection**

Wait 30 seconds, then visit:

```
https://zero-barriers-growth-accelerator-20.vercel.app/api/test-db
```

**Expected Output:**

```json
{
  "status": "SUCCESS",
  "tests": {
    "databaseUrlConfigured": true,
    "connectionSuccessful": true,
    "userCount": 3,
    "adminUserExists": true,
    "adminUser": {
      "email": "shayne+1@devpipeline.com",
      "role": "ADMIN"
    }
  }
}
```

✅ If you see `"userCount": 3`, **database is connected!**

---

### **Step 6: Test Login**

Go to:

```
https://zero-barriers-growth-accelerator-20.vercel.app/auth/signin
```

**Login Credentials:**

**Admin Account:**

- Email: `shayne+1@devpipeline.com`
- Password: `ZBadmin123!`

**User Account 1:**

- Email: `sk@zerobarriers.io`
- Password: `ZBuser123!`

**User Account 2:**

- Email: `shayne+2@devpipeline.com`
- Password: `ZBuser2123!`

---

### **Step 7: Verify Login Works**

1. Enter email and password
2. Click "Sign In"
3. **Expected:** Redirects to `/dashboard`
4. ✅ **You're in!**

---

## ⚠️ Troubleshooting

### **Issue: SQL returns "relation User already exists"**

**Solution:** The table already exists (good!). Just run this:

```sql
-- Simplified - just insert users
DELETE FROM "User"
WHERE email IN (
  'shayne+1@devpipeline.com',
  'sk@zerobarriers.io',
  'shayne+2@devpipeline.com'
);

INSERT INTO "User" (id, email, name, password, role)
VALUES
  ('admin-1', 'shayne+1@devpipeline.com', 'Shayne Roy', '$2a$12$oc1QpcAe/.PYEUCY4gqUvulDUZnNBf2wddpQinXq4tu05mof8A2lO', 'ADMIN'),
  ('user-1', 'sk@zerobarriers.io', 'SK Roy', '$2a$12$3ZM8ZcQ9YF0L1lCKnq7vEOQ4Xnh3j.wS0bm8WqD9uC8KF4B9J7K9K', 'USER'),
  ('user-2', 'shayne+2@devpipeline.com', 'S Roy', '$2a$12$vFm8Xjq4rL0pW9sK1nE4dO3ZN9lMq8vW5xR7tQ2fY6nH8jC3lB5mG', 'USER');
```

---

### **Issue: Login still says "Invalid credentials"**

**Check:**

1. Did you run the SQL? (Check Supabase table editor)
2. Did you use the exact password? (Case sensitive!)
3. Is DATABASE_URL set in Vercel? (Should be)

**Debug:**

```
Visit: /api/test-db
Look for: "userCount": 3
If 0: Users didn't insert
If 3: Database issue elsewhere
```

---

### **Issue: Can't access Supabase dashboard**

**Check:**

- Project URL: https://supabase.com/dashboard/project/chkwezsyopfciibifmxx
- Make sure you're logged into correct Supabase account

---

## ✅ AFTER LOGIN WORKS

Once you can log in:

1. Go to `/dashboard/phased-analysis`
2. Run full website analysis
3. Test all 3 phases
4. Download reports
5. 🎉 **Everything works!**

---

## 🎯 QUICK REFERENCE

**Supabase SQL Editor:**
https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql

**SQL File:**
`SUPABASE_LOGIN_FIX.sql`

**Test Database:**
https://zero-barriers-growth-accelerator-20.vercel.app/api/test-db

**Login Page:**
https://zero-barriers-growth-accelerator-20.vercel.app/auth/signin

**Admin Credentials:**
Email: `shayne+1@devpipeline.com`
Password: `ZBadmin123!`

---

**Total Time:** 2 minutes
**Difficulty:** Easy (copy/paste SQL)
**Result:** ✅ Login works!

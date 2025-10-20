# 🚀 Final Supabase Setup Steps

## Step 1: Create Tables (Copy & Paste This SQL)

**In the Supabase SQL Editor** (should be open):

### COPY THIS ENTIRE SQL BLOCK:

```sql
-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  role TEXT DEFAULT 'USER' NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Analysis table
CREATE TABLE "Analysis" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  content TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' NOT NULL,
  score DOUBLE PRECISION,
  insights TEXT,
  frameworks TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");
CREATE INDEX "Analysis_status_idx" ON "Analysis"(status);
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");
CREATE INDEX "User_email_idx" ON "User"(email);
```

### THEN:

1. **Click "Run"** (bottom right green button)
2. **Wait 2 seconds**
3. **You should see**: "Success. No rows returned"

---

## Step 2: Create Your Users

**After SQL runs successfully**, run this locally:

```bash
npm run setup:users
```

This will create **3 users** with properly hashed passwords:
1. Shayne Roy (Admin) - shayne+1@devpipeline.com
2. SK Roy (User) - sk@zerobarriers.io
3. S Roy (User) - shayne+2@devpipeline.com

---

## Step 3: Verify in Supabase

Go to Table Editor:
https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/editor

You should see:
- **"User" table** with 3 rows
- **"Analysis" table** (empty initially)

---

## Step 4: Test Login

Go to: https://zero-barriers-growth-accelerator-20-mr035qo2m.vercel.app/auth/signin

Try logging in with:
- shayne+1@devpipeline.com / ZBadmin123!

Should work! ✅

---

**Copy the SQL above, paste in Supabase SQL Editor, click "Run", then tell me what happens!** 🚀


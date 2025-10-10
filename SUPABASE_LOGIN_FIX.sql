-- ========================================
-- FIX LOGIN - Create Users in Supabase
-- ========================================
-- Run this in: Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql

-- Step 1: Ensure User table exists (should already exist from Prisma)
-- If you get "relation already exists" error, that's fine - skip to Step 2

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Delete any existing test users (clean slate)
DELETE FROM "User" 
WHERE email IN (
  'shayne+1@devpipeline.com',
  'sk@zerobarriers.io',
  'shayne+2@devpipeline.com'
);

-- Step 3: Insert the 3 users with hashed passwords
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

-- Step 4: Verify users were created
SELECT id, email, name, role, "createdAt" 
FROM "User" 
ORDER BY role DESC, email;

-- Expected output:
-- admin-1 | shayne+1@devpipeline.com | Shayne Roy | ADMIN
-- user-1  | sk@zerobarriers.io       | SK Roy     | USER
-- user-2  | shayne+2@devpipeline.com | S Roy      | USER

-- ========================================
-- PASSWORDS (for reference)
-- ========================================
-- Shayne Roy (Admin): ZBadmin123!
-- SK Roy (User):      ZBuser123!
-- S Roy (User):       ZBuser2123!
-- ========================================

-- ✅ DONE! 
-- Now test login at:
-- https://zero-barriers-growth-accelerator-20.vercel.app/auth/signin


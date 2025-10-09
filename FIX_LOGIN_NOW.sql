-- ============================================
-- FIX LOGIN - Create Users in Supabase
-- ============================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql/new

-- User 1: Admin (shayne+1@devpipeline.com / ZBadmin123!)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'shayne+1@devpipeline.com',
  '$2a$12$oc1QpcAe/.PYEUCY4gqUvulDUZnNBf2wddpQinXq4tu05mof8A2lO',
  'Shayne Roy',
  'SUPER_ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- User 2: Regular (sk@zerobarriers.io / ZBuser123!)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'sk@zerobarriers.io',
  '$2a$12$JqrIG9nuqwiZuN6mC4CYdeZUS/.Y8sepDkJec0nYFqK.teH2zZ5Za',
  'SK Roy',
  'USER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- User 3: Regular (shayne+2@devpipeline.com / ZBuser2123!)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'shayne+2@devpipeline.com',
  '$2a$12$dVC8x8x/BTCBVZfESuYi/.744OcRHdE6Ill2mZ8EI4cNGM.Y5mA9C',
  'S Roy',
  'USER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- Verify users were created
SELECT id, email, name, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC;


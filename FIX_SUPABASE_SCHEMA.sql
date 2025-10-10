-- ========================================
-- FIX SUPABASE SCHEMA - Add Missing Columns
-- ========================================
-- Run this in Supabase SQL Editor
-- Project: chkwezsyopfciibifmxx
-- https://supabase.com/dashboard/project/chkwezsyopfciibifmxx/sql/new
--
-- Problem: Analysis table missing 'insights' column
-- Solution: Add it (and verify other columns)
-- ========================================

-- Check current Analysis table structure
-- (Run this first to see what's there)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Analysis'
ORDER BY ordinal_position;

-- If 'insights' column is missing, add it:
ALTER TABLE "Analysis"
ADD COLUMN IF NOT EXISTS "insights" TEXT;

-- Verify it was added:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Analysis'
ORDER BY ordinal_position;

-- ========================================
-- EXPECTED SCHEMA (from Prisma)
-- ========================================
-- "Analysis" table should have:
-- - id (TEXT, PRIMARY KEY)
-- - content (TEXT, NOT NULL)
-- - contentType (TEXT, NOT NULL)
-- - status (TEXT, DEFAULT 'PENDING')
-- - score (DOUBLE PRECISION / FLOAT)
-- - insights (TEXT) ← THIS WAS MISSING!
-- - frameworks (TEXT)
-- - createdAt (TIMESTAMP, DEFAULT now())
-- - updatedAt (TIMESTAMP)
-- - userId (TEXT, FOREIGN KEY to User.id)
-- ========================================

-- If you see other missing columns, add them too:
ALTER TABLE "Analysis"
ADD COLUMN IF NOT EXISTS "frameworks" TEXT;

-- Done! Now Prisma and Supabase should match ✅


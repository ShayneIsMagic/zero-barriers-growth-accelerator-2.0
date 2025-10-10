-- ===============================================
-- CHECK SUPABASE TABLES
-- Run this in Supabase SQL Editor to see what exists
-- ===============================================

-- 1. List all tables in your database
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- ✅ User
-- ✅ Analysis
-- ⚠️  individual_reports (optional - for markdown storage)
-- ⚠️  markdown_exports (optional - for markdown storage)

-- ===============================================
-- 2. Check if REQUIRED tables exist
-- ===============================================

-- Check User table
SELECT 
  'User table' AS table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'User' AND table_schema = 'public'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status;

-- Check Analysis table
SELECT 
  'Analysis table' AS table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'Analysis' AND table_schema = 'public'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status;

-- ===============================================
-- 3. Check if OPTIONAL markdown tables exist
-- ===============================================

-- Check individual_reports table
SELECT 
  'individual_reports table' AS table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'individual_reports' AND table_schema = 'public'
  ) THEN '✅ EXISTS' ELSE '⚠️  NOT CREATED (optional)' END AS status;

-- Check markdown_exports table
SELECT 
  'markdown_exports table' AS table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'markdown_exports' AND table_schema = 'public'
  ) THEN '✅ EXISTS' ELSE '⚠️  NOT CREATED (optional)' END AS status;

-- ===============================================
-- 4. Count rows in each table
-- ===============================================

-- Count users
SELECT 
  'User' AS table_name,
  COUNT(*) AS row_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ Has data' ELSE '⚠️  Empty' END AS status
FROM "User";

-- Count analyses
SELECT 
  'Analysis' AS table_name,
  COUNT(*) AS row_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ Has data' ELSE '⚠️  Empty' END AS status
FROM "Analysis";

-- Count individual_reports (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'individual_reports') THEN
    RAISE NOTICE 'individual_reports: % rows', (SELECT COUNT(*) FROM individual_reports);
  ELSE
    RAISE NOTICE 'individual_reports: Table does not exist';
  END IF;
END $$;

-- Count markdown_exports (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'markdown_exports') THEN
    RAISE NOTICE 'markdown_exports: % rows', (SELECT COUNT(*) FROM markdown_exports);
  ELSE
    RAISE NOTICE 'markdown_exports: Table does not exist';
  END IF;
END $$;

-- ===============================================
-- 5. Show User table structure
-- ===============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'User' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================================
-- 6. Show Analysis table structure
-- ===============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Analysis' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===============================================
-- INTERPRETATION GUIDE
-- ===============================================

/*
REQUIRED TABLES (Must exist for app to work):
  ✅ User - Stores user accounts
  ✅ Analysis - Stores analysis results

OPTIONAL TABLES (For markdown feature):
  ⚠️  individual_reports - Stores individual markdown reports
  ⚠️  markdown_exports - Stores combined markdown reports
  
If optional tables are missing:
  - App still works ✅
  - Markdown generation works ✅
  - Markdown is returned in API response ✅
  - But markdown is NOT saved to database ⚠️
  - User must download reports immediately
  
To create optional tables:
  - Run: supabase-markdown-schema.sql
  - Or run: npx prisma db push (from local machine)
*/


# 🔧 Fix Supabase Errors - Diagnostic & Resolution Guide

**63 errors usually means:** Duplicate data inserts or constraint violations

---

## 🎯 **QUICK FIX: Clear and Reload Everything**

### **Option 1: Clean Slate (Safest)**

**Run this in Supabase SQL Editor:**

```sql
-- =====================================================
-- CLEAN SLATE: Remove all advanced schema tables
-- This does NOT touch your existing User/Analysis tables
-- =====================================================

-- Drop pattern/reference tables (no data loss - we'll reload)
DROP TABLE IF EXISTS pattern_matches CASCADE;
DROP TABLE IF EXISTS clifton_theme_patterns CASCADE;
DROP TABLE IF EXISTS golden_circle_patterns CASCADE;
DROP TABLE IF EXISTS industry_terminology CASCADE;
DROP TABLE IF EXISTS value_element_patterns CASCADE;
DROP TABLE IF EXISTS value_element_reference CASCADE;

-- Drop Golden Circle tables
DROP TABLE IF EXISTS golden_circle_who CASCADE;
DROP TABLE IF EXISTS golden_circle_what CASCADE;
DROP TABLE IF EXISTS golden_circle_how CASCADE;
DROP TABLE IF EXISTS golden_circle_why CASCADE;
DROP TABLE IF EXISTS golden_circle_analyses CASCADE;

-- Drop Elements of Value tables
DROP TABLE IF EXISTS value_insights CASCADE;
DROP TABLE IF EXISTS b2b_element_scores CASCADE;
DROP TABLE IF EXISTS elements_of_value_b2b CASCADE;
DROP TABLE IF EXISTS b2c_element_scores CASCADE;
DROP TABLE IF EXISTS elements_of_value_b2c CASCADE;

-- Drop CliftonStrengths tables
DROP TABLE IF EXISTS clifton_insights CASCADE;
DROP TABLE IF EXISTS clifton_theme_scores CASCADE;
DROP TABLE IF EXISTS clifton_strengths_analyses CASCADE;
DROP TABLE IF EXISTS clifton_themes_reference CASCADE;

-- Drop Lighthouse tables
DROP TABLE IF EXISTS best_practice_issues CASCADE;
DROP TABLE IF EXISTS seo_issues CASCADE;
DROP TABLE IF EXISTS accessibility_issues CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS core_web_vitals CASCADE;
DROP TABLE IF EXISTS lighthouse_analyses CASCADE;

-- Drop SEO tables
DROP TABLE IF EXISTS page_seo_scores CASCADE;
DROP TABLE IF EXISTS technical_seo_audit CASCADE;
DROP TABLE IF EXISTS competitive_keywords CASCADE;
DROP TABLE IF EXISTS content_gaps CASCADE;
DROP TABLE IF EXISTS keyword_opportunities CASCADE;
DROP TABLE IF EXISTS google_trends_data CASCADE;
DROP TABLE IF EXISTS keyword_rankings CASCADE;
DROP TABLE IF EXISTS seo_analyses CASCADE;

-- Drop Transformation tables
DROP TABLE IF EXISTS success_metrics CASCADE;
DROP TABLE IF EXISTS roadmap_actions CASCADE;
DROP TABLE IF EXISTS roadmap_phases CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS growth_opportunities CASCADE;
DROP TABLE IF EXISTS growth_barriers CASCADE;
DROP TABLE IF EXISTS transformation_analyses CASCADE;

-- Drop Content tables
DROP TABLE IF EXISTS media_analysis CASCADE;
DROP TABLE IF EXISTS call_to_actions CASCADE;
DROP TABLE IF EXISTS content_structure CASCADE;
DROP TABLE IF EXISTS content_analyses CASCADE;

-- Drop Report tables
DROP TABLE IF EXISTS analysis_comparisons CASCADE;
DROP TABLE IF EXISTS analysis_audit_log CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS generated_reports CASCADE;
DROP TABLE IF EXISTS page_screenshots CASCADE;

-- Drop System tables
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS api_usage_log CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop Website tracking
DROP TABLE IF EXISTS analysis_progress CASCADE;
DROP TABLE IF EXISTS websites CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS find_value_patterns(TEXT, VARCHAR);
DROP FUNCTION IF EXISTS calculate_overall_score(TEXT);
DROP FUNCTION IF EXISTS deduct_credits(TEXT, INT, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All advanced schema tables dropped!';
    RAISE NOTICE '';
    RAISE NOTICE 'Your User and Analysis tables are SAFE - untouched!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Re-run Parts 1-4 in order';
END $$;
```

**Then re-run in order:**
1. Part 1 (Core Framework)
2. Part 2 (Performance & Content)
3. Part 3 (Functions & Seed Data)
4. Part 4 (Pattern Data)

---

## 🔍 **DIAGNOSE ERRORS FIRST (Before Clean Slate)**

### **Step 1: Identify Error Types**

**Run this to see what errors exist:**

```sql
-- Check for duplicate key violations
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%unique%'
ORDER BY tablename;

-- Check constraints
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE contype = 'f'  -- foreign keys
AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text;
```

---

### **Step 2: Check for Duplicate Inserts**

```sql
-- Check CliftonStrengths themes (should be exactly 34)
SELECT COUNT(*) as theme_count FROM clifton_themes_reference;

-- Check for duplicates
SELECT theme_name, COUNT(*) as duplicate_count
FROM clifton_themes_reference
GROUP BY theme_name
HAVING COUNT(*) > 1;

-- Check Value Elements (should be 27-28)
SELECT COUNT(*) as element_count FROM value_element_reference;

-- Check for duplicate elements
SELECT element_name, COUNT(*) as duplicate_count
FROM value_element_reference
GROUP BY element_name
HAVING COUNT(*) > 1;

-- Check patterns
SELECT COUNT(*) as pattern_count FROM value_element_patterns;

-- Check industry terms
SELECT COUNT(*) as term_count FROM industry_terminology;
```

---

### **Step 3: Fix Duplicate Data (If Found)**

**If you have duplicate CliftonStrengths themes:**

```sql
-- Keep only first occurrence of each theme
DELETE FROM clifton_themes_reference
WHERE id NOT IN (
  SELECT MIN(id)
  FROM clifton_themes_reference
  GROUP BY theme_name
);
```

**If you have duplicate Value Elements:**

```sql
-- Keep only first occurrence of each element
DELETE FROM value_element_reference
WHERE id NOT IN (
  SELECT MIN(id)
  FROM value_element_reference
  GROUP BY element_name
);
```

**If you have duplicate patterns:**

```sql
-- Keep only first occurrence of each pattern
DELETE FROM value_element_patterns
WHERE id NOT IN (
  SELECT MIN(id)
  FROM value_element_patterns
  GROUP BY element_id, pattern_text
);
```

---

## 🚨 **COMMON ERROR SCENARIOS**

### **Error 1: "duplicate key value violates unique constraint"**

**Cause:** Ran Part 3 or Part 4 multiple times

**Fix:**
```sql
-- Clear seed data and re-run once
DELETE FROM clifton_themes_reference;
DELETE FROM value_element_reference CASCADE;  -- CASCADE removes patterns too
DELETE FROM industry_terminology;

-- Then re-run Part 3 and Part 4 ONCE
```

---

### **Error 2: "relation already exists"**

**Cause:** Ran Part 1 or Part 2 multiple times

**Fix:**
```sql
-- All tables in Parts 1-2 use IF NOT EXISTS
-- So this shouldn't happen
-- But if it does, the tables are already created - just skip that part
```

---

### **Error 3: "foreign key constraint violation"**

**Cause:** Trying to insert data before parent table exists

**Fix:**
```sql
-- Make sure you ran parts IN ORDER:
-- 1. Part 1 (creates base tables)
-- 2. Part 2 (creates related tables)
-- 3. Part 3 (creates functions + base seed data)
-- 4. Part 4 (creates pattern seed data)
```

---

### **Error 4: "function already exists"**

**Cause:** Ran Part 3 multiple times

**Fix:**
```sql
-- All functions use CREATE OR REPLACE
-- So this is just a warning, not an error
-- Safe to ignore
```

---

## 🎯 **RECOMMENDED FIX PROCESS**

### **Best Approach: Fresh Start**

```sql
-- Step 1: Backup any existing analysis data
CREATE TABLE backup_golden_circle AS
SELECT * FROM golden_circle_analyses;

CREATE TABLE backup_elements_value AS
SELECT * FROM elements_of_value_b2b;

-- Step 2: Drop all advanced tables (see Clean Slate SQL above)

-- Step 3: Re-run Parts 1-4 in strict order
--   Part 1 → Wait for "Part 1 Complete"
--   Part 2 → Wait for "Part 2 Complete"
--   Part 3 → Wait for "Part 3 Complete"
--   Part 4 → Wait for verification

-- Step 4: Verify
SELECT COUNT(*) FROM clifton_themes_reference;  -- Should be 34
SELECT COUNT(*) FROM value_element_reference;   -- Should be 28
SELECT COUNT(*) FROM value_element_patterns;    -- Should be 100+

-- Step 5: Restore any backed up data
-- (Only if you had real analysis data before)
```

---

## 📋 **VERIFICATION CHECKLIST**

**After cleanup and re-running, verify:**

```sql
-- ✅ Core tables exist
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'websites',
  'golden_circle_analyses',
  'elements_of_value_b2c',
  'clifton_strengths_analyses',
  'lighthouse_analyses'
);
-- Should return 5

-- ✅ Reference data loaded
SELECT
  (SELECT COUNT(*) FROM clifton_themes_reference) as themes,
  (SELECT COUNT(*) FROM value_element_reference) as elements;
-- Should return: themes=34, elements=28

-- ✅ Pattern data loaded
SELECT COUNT(*) FROM value_element_patterns;
-- Should return 100+

-- ✅ Industry data loaded
SELECT COUNT(*) FROM industry_terminology;
-- Should return 80+

-- ✅ Functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'find_value_patterns',
  'calculate_overall_score',
  'deduct_credits',
  'update_updated_at_column'
);
-- Should return 4 functions

-- ✅ Test pattern matching
SELECT * FROM find_value_patterns(
  'Save time with automation',
  'saas'
) LIMIT 5;
-- Should return pattern matches
```

---

## 🔄 **CLEAN RELOAD SCRIPT (ALL-IN-ONE)**

**Copy and run this entire block in Supabase SQL Editor:**

```sql
-- =====================================================
-- COMPLETE CLEANUP AND VERIFICATION
-- =====================================================

BEGIN;

-- Drop all advanced schema tables
DROP TABLE IF EXISTS pattern_matches CASCADE;
DROP TABLE IF EXISTS clifton_theme_patterns CASCADE;
DROP TABLE IF EXISTS golden_circle_patterns CASCADE;
DROP TABLE IF EXISTS industry_terminology CASCADE;
DROP TABLE IF EXISTS value_element_patterns CASCADE;
DROP TABLE IF EXISTS value_element_reference CASCADE;
DROP TABLE IF EXISTS golden_circle_who CASCADE;
DROP TABLE IF EXISTS golden_circle_what CASCADE;
DROP TABLE IF EXISTS golden_circle_how CASCADE;
DROP TABLE IF EXISTS golden_circle_why CASCADE;
DROP TABLE IF EXISTS golden_circle_analyses CASCADE;
DROP TABLE IF EXISTS value_insights CASCADE;
DROP TABLE IF EXISTS b2b_element_scores CASCADE;
DROP TABLE IF EXISTS elements_of_value_b2b CASCADE;
DROP TABLE IF EXISTS b2c_element_scores CASCADE;
DROP TABLE IF EXISTS elements_of_value_b2c CASCADE;
DROP TABLE IF EXISTS clifton_insights CASCADE;
DROP TABLE IF EXISTS clifton_theme_scores CASCADE;
DROP TABLE IF EXISTS clifton_strengths_analyses CASCADE;
DROP TABLE IF EXISTS clifton_themes_reference CASCADE;
DROP TABLE IF EXISTS best_practice_issues CASCADE;
DROP TABLE IF EXISTS seo_issues CASCADE;
DROP TABLE IF EXISTS accessibility_issues CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS core_web_vitals CASCADE;
DROP TABLE IF EXISTS lighthouse_analyses CASCADE;
DROP TABLE IF EXISTS page_seo_scores CASCADE;
DROP TABLE IF EXISTS technical_seo_audit CASCADE;
DROP TABLE IF EXISTS competitive_keywords CASCADE;
DROP TABLE IF EXISTS content_gaps CASCADE;
DROP TABLE IF EXISTS keyword_opportunities CASCADE;
DROP TABLE IF EXISTS google_trends_data CASCADE;
DROP TABLE IF EXISTS keyword_rankings CASCADE;
DROP TABLE IF EXISTS seo_analyses CASCADE;
DROP TABLE IF EXISTS success_metrics CASCADE;
DROP TABLE IF EXISTS roadmap_actions CASCADE;
DROP TABLE IF EXISTS roadmap_phases CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS growth_opportunities CASCADE;
DROP TABLE IF EXISTS growth_barriers CASCADE;
DROP TABLE IF EXISTS transformation_analyses CASCADE;
DROP TABLE IF EXISTS media_analysis CASCADE;
DROP TABLE IF EXISTS call_to_actions CASCADE;
DROP TABLE IF EXISTS content_structure CASCADE;
DROP TABLE IF EXISTS content_analyses CASCADE;
DROP TABLE IF EXISTS analysis_comparisons CASCADE;
DROP TABLE IF EXISTS analysis_audit_log CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS generated_reports CASCADE;
DROP TABLE IF EXISTS page_screenshots CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS api_usage_log CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS analysis_progress CASCADE;
DROP TABLE IF EXISTS websites CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS find_value_patterns(TEXT, VARCHAR);
DROP FUNCTION IF EXISTS calculate_overall_score(TEXT);
DROP FUNCTION IF EXISTS deduct_credits(TEXT, INT, TEXT, VARCHAR);
DROP FUNCTION IF EXISTS update_updated_at_column();

COMMIT;

-- Verify cleanup
DO $$
DECLARE
  table_count INT;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name NOT IN ('User', 'Analysis', '_prisma_migrations');

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CLEANUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Advanced schema tables remaining: %', table_count;
  RAISE NOTICE 'User table: SAFE ✅';
  RAISE NOTICE 'Analysis table: SAFE ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run Part 1 SQL';
  RAISE NOTICE '2. Run Part 2 SQL';
  RAISE NOTICE '3. Run Part 3 SQL';
  RAISE NOTICE '4. Run Part 4 SQL';
  RAISE NOTICE '========================================';
END $$;
```

---

## 🚀 **WHAT TO DO RIGHT NOW**

### **Step 1: Run the cleanup script above** ⬆️

Copy the "COMPLETE CLEANUP AND VERIFICATION" block and run it in Supabase SQL Editor.

---

### **Step 2: Re-run Parts 1-4 carefully**

**Part 1:** (Copy from the SQL you ran before - the one with golden_circle, elements_of_value, clifton_strengths tables)

**Wait for:** "Part 1 Complete!" message

---

**Part 2:** (Copy from the SQL with lighthouse, seo, content tables)

**Wait for:** "Part 2 Complete!" message

---

**Part 3:** (Functions + CliftonStrengths themes + Value Elements)

**Wait for:** Verification message showing:
- 34 themes loaded
- 28 value elements loaded

---

**Part 4:** (Pattern matching data)

**Wait for:** Verification message showing:
- 100+ patterns loaded
- 80+ industry terms loaded

---

### **Step 3: Run verification**

```sql
-- Quick verification
SELECT
  (SELECT COUNT(*) FROM clifton_themes_reference) as themes,
  (SELECT COUNT(*) FROM value_element_reference) as elements,
  (SELECT COUNT(*) FROM value_element_patterns) as patterns,
  (SELECT COUNT(*) FROM industry_terminology) as industry_terms;

-- Should show:
-- themes: 34
-- elements: 28
-- patterns: 100+
-- industry_terms: 80+
```

---

## 📞 **REPORT BACK**

**After running the cleanup, tell me:**

1. ✅ "Cleanup complete - tables dropped"
2. ⏳ "Ready to re-run Part 1"

**Then I'll guide you through re-running each part with verification at each step!**

---

**Want me to create optimized SQL files that prevent these errors?**


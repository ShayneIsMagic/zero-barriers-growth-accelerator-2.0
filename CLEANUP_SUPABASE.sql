-- =====================================================
-- COMPLETE CLEANUP - Run this in Supabase SQL Editor
-- This is SAFE - only removes advanced schema tables
-- Your User and Analysis tables are NOT touched
-- =====================================================

BEGIN;

-- Drop pattern/reference tables
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

COMMIT;

-- Verification message
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
  RAISE NOTICE 'Next: Re-run Parts 1-4 in order';
  RAISE NOTICE '========================================';
END $$;


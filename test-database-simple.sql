-- =====================================================
-- SIMPLE DATABASE TEST
-- Run this in Supabase SQL Editor to verify everything
-- =====================================================

-- Test 1: Count Tables
SELECT 
  'Tables Created' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 60 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Test 2: CliftonStrengths Themes
SELECT 
  'CliftonStrengths Themes' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 34 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM clifton_themes_reference;

-- Test 3: Value Elements
SELECT 
  'Value Elements' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 27 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM value_element_reference;

-- Test 4: Synonym Patterns
SELECT 
  'Synonym Patterns' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 50 THEN '✅ PASS' ELSE '⚠️ LOW' END as status
FROM value_element_patterns;

-- Test 5: Industry Terms
SELECT 
  'Industry Terms' as test,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 40 THEN '✅ PASS' ELSE '⚠️ LOW' END as status
FROM industry_terminology;

-- Test 6: Pattern Matching Function
SELECT 
  'Pattern Matching Test' as test,
  COUNT(*) as matches_found,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM find_value_patterns(
  'Save time with automation. Affordable and easy to use.',
  'saas'
);

-- Test 7: Show Detected Patterns
SELECT 
  element_name,
  pattern_text,
  match_count,
  confidence
FROM find_value_patterns(
  'Save time with our lightning-fast automation. Affordable pricing. Easy drag-and-drop interface.',
  'saas'
)
ORDER BY confidence DESC
LIMIT 10;

-- Test 8: Supported Industries
SELECT 
  'Supported Industries:' as info,
  string_agg(DISTINCT industry, ', ' ORDER BY industry) as industries
FROM industry_terminology;

-- Test 9: Theme Distribution
SELECT 
  domain,
  COUNT(*) as theme_count
FROM clifton_themes_reference
GROUP BY domain
ORDER BY domain;

-- Test 10: Value Element Categories
SELECT 
  element_category,
  COUNT(*) as element_count
FROM value_element_reference
GROUP BY element_category
ORDER BY element_category;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================

DO $$
DECLARE
  table_count INT;
  theme_count INT;
  value_count INT;
  pattern_count INT;
  industry_count INT;
  industry_list TEXT;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  SELECT COUNT(*) INTO theme_count FROM clifton_themes_reference;
  SELECT COUNT(*) INTO value_count FROM value_element_reference;
  SELECT COUNT(*) INTO pattern_count FROM value_element_patterns;
  SELECT COUNT(*) INTO industry_count FROM industry_terminology;
  SELECT string_agg(DISTINCT industry, ', ' ORDER BY industry) INTO industry_list FROM industry_terminology;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 DATABASE VERIFICATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables: % %', table_count, CASE WHEN table_count >= 60 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'CliftonStrengths: % %', theme_count, CASE WHEN theme_count = 34 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Value Elements: % %', value_count, CASE WHEN value_count >= 27 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Patterns: % %', pattern_count, CASE WHEN pattern_count >= 50 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE 'Industry Terms: % %', industry_count, CASE WHEN industry_count >= 40 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Industries: %', industry_list;
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
  IF table_count >= 60 AND theme_count = 34 AND value_count >= 27 THEN
    RAISE NOTICE '✅ ALL CRITICAL TESTS PASSED!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Enable RLS: Run ENABLE_RLS_SECURITY.sql';
    RAISE NOTICE '2. Test API: Start npm run dev';
    RAISE NOTICE '3. Deploy: git push origin feature/advanced-schema';
  ELSE
    RAISE NOTICE '❌ SOME TESTS FAILED - Review results above';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;


-- =====================================================
-- SEED DATA VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check what's loaded
-- =====================================================

-- =====================================================
-- 1. CLIFTONSTRENGTHS THEMES (Should be 34)
-- =====================================================

SELECT 
  '1. CliftonStrengths Themes' as check_name,
  COUNT(*) as actual_count,
  34 as expected_count,
  CASE WHEN COUNT(*) = 34 THEN '✅ Complete' ELSE '❌ Missing rows' END as status
FROM clifton_themes_reference;

-- Show breakdown by domain
SELECT 
  domain,
  COUNT(*) as theme_count,
  CASE 
    WHEN domain = 'strategic_thinking' AND COUNT(*) = 8 THEN '✅'
    WHEN domain = 'executing' AND COUNT(*) = 9 THEN '✅'
    WHEN domain = 'influencing' AND COUNT(*) = 8 THEN '✅'
    WHEN domain = 'relationship_building' AND COUNT(*) = 9 THEN '✅'
    ELSE '❌'
  END as status
FROM clifton_themes_reference
GROUP BY domain
ORDER BY domain;

-- List all themes
SELECT theme_name, domain 
FROM clifton_themes_reference 
ORDER BY domain, theme_name;

-- =====================================================
-- 2. VALUE ELEMENTS (Should be 27-28)
-- =====================================================

SELECT 
  '2. Value Elements' as check_name,
  COUNT(*) as actual_count,
  28 as expected_count,
  CASE WHEN COUNT(*) >= 27 THEN '✅ Complete' ELSE '❌ Missing rows' END as status
FROM value_element_reference;

-- Show breakdown by category
SELECT 
  element_category,
  COUNT(*) as element_count
FROM value_element_reference
GROUP BY element_category
ORDER BY element_category;

-- List all value elements
SELECT element_name, element_category, display_name
FROM value_element_reference
ORDER BY element_category, element_name;

-- =====================================================
-- 3. VALUE ELEMENT PATTERNS (Should be 100+)
-- =====================================================

SELECT 
  '3. Value Element Patterns' as check_name,
  COUNT(*) as actual_count,
  100 as expected_minimum,
  CASE WHEN COUNT(*) >= 100 THEN '✅ Complete' ELSE '❌ Missing patterns' END as status
FROM value_element_patterns;

-- Show breakdown by pattern type
SELECT 
  pattern_type,
  COUNT(*) as pattern_count
FROM value_element_patterns
GROUP BY pattern_type
ORDER BY pattern_count DESC;

-- Show patterns per element
SELECT 
  ver.element_name,
  COUNT(vep.id) as pattern_count
FROM value_element_reference ver
LEFT JOIN value_element_patterns vep ON vep.element_id = ver.id
GROUP BY ver.element_name
ORDER BY pattern_count DESC;

-- =====================================================
-- 4. INDUSTRY TERMINOLOGY (Should be 80+)
-- =====================================================

SELECT 
  '4. Industry Terminology' as check_name,
  COUNT(*) as actual_count,
  80 as expected_minimum,
  CASE WHEN COUNT(*) >= 80 THEN '✅ Complete' ELSE '❌ Missing terms' END as status
FROM industry_terminology;

-- Show breakdown by industry
SELECT 
  industry,
  COUNT(*) as term_count
FROM industry_terminology
GROUP BY industry
ORDER BY term_count DESC;

-- =====================================================
-- 5. GOLDEN CIRCLE PATTERNS (Optional - may be empty)
-- =====================================================

SELECT 
  '5. Golden Circle Patterns' as check_name,
  COUNT(*) as actual_count,
  'Optional' as expected_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ Loaded' ELSE '⚠️ Empty (optional)' END as status
FROM golden_circle_patterns;

-- =====================================================
-- 6. CLIFTON THEME PATTERNS (Optional - may be empty)
-- =====================================================

SELECT 
  '6. Clifton Theme Patterns' as check_name,
  COUNT(*) as actual_count,
  'Optional' as expected_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ Loaded' ELSE '⚠️ Empty (optional)' END as status
FROM clifton_theme_patterns;

-- =====================================================
-- SUMMARY: ALL SEED DATA
-- =====================================================

SELECT 
  'SUMMARY' as section,
  (SELECT COUNT(*) FROM clifton_themes_reference) as clifton_themes,
  (SELECT COUNT(*) FROM value_element_reference) as value_elements,
  (SELECT COUNT(*) FROM value_element_patterns) as patterns,
  (SELECT COUNT(*) FROM industry_terminology) as industry_terms,
  (SELECT COUNT(*) FROM golden_circle_patterns) as gc_patterns,
  (SELECT COUNT(*) FROM clifton_theme_patterns) as ct_patterns;

-- =====================================================
-- MISSING DATA DETECTION
-- =====================================================

DO $$
DECLARE
  clifton_count INT;
  value_count INT;
  pattern_count INT;
  industry_count INT;
  missing_items TEXT := '';
BEGIN
  SELECT COUNT(*) INTO clifton_count FROM clifton_themes_reference;
  SELECT COUNT(*) INTO value_count FROM value_element_reference;
  SELECT COUNT(*) INTO pattern_count FROM value_element_patterns;
  SELECT COUNT(*) INTO industry_count FROM industry_terminology;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA VERIFICATION REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'CliftonStrengths Themes: % / 34 expected', clifton_count;
  IF clifton_count < 34 THEN
    RAISE NOTICE '  ❌ MISSING % themes!', 34 - clifton_count;
    missing_items := missing_items || 'CliftonStrengths themes, ';
  ELSE
    RAISE NOTICE '  ✅ Complete';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Value Elements: % / 28 expected', value_count;
  IF value_count < 27 THEN
    RAISE NOTICE '  ❌ MISSING % elements!', 28 - value_count;
    missing_items := missing_items || 'Value elements, ';
  ELSE
    RAISE NOTICE '  ✅ Complete';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Synonym Patterns: % / 100+ expected', pattern_count;
  IF pattern_count < 100 THEN
    RAISE NOTICE '  ⚠️  Only % patterns loaded (expected 100+)', pattern_count;
    missing_items := missing_items || 'Synonym patterns, ';
  ELSE
    RAISE NOTICE '  ✅ Complete';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Industry Terms: % / 80+ expected', industry_count;
  IF industry_count < 80 THEN
    RAISE NOTICE '  ⚠️  Only % terms loaded (expected 80+)', industry_count;
    missing_items := missing_items || 'Industry terms, ';
  ELSE
    RAISE NOTICE '  ✅ Complete';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
  IF missing_items != '' THEN
    RAISE NOTICE 'MISSING DATA: %', TRIM(TRAILING ', ' FROM missing_items);
    RAISE NOTICE '';
    RAISE NOTICE 'ACTION REQUIRED: Run Part 4 SQL to load missing data';
  ELSE
    RAISE NOTICE '✅ ALL SEED DATA LOADED SUCCESSFULLY!';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;


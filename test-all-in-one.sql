-- =====================================================
-- ALL-IN-ONE DATABASE TEST
-- Shows all results in a single table
-- =====================================================

SELECT
  test_name,
  actual_count,
  expected_count,
  status
FROM (
  SELECT
    'Tables Created' as test_name,
    COUNT(*)::text as actual_count,
    '60+' as expected_count,
    CASE WHEN COUNT(*) >= 60 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'

  UNION ALL

  SELECT
    'CliftonStrengths Themes' as test_name,
    COUNT(*)::text as actual_count,
    '34' as expected_count,
    CASE WHEN COUNT(*) = 34 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM clifton_themes_reference

  UNION ALL

  SELECT
    'Value Elements' as test_name,
    COUNT(*)::text as actual_count,
    '28' as expected_count,
    CASE WHEN COUNT(*) >= 27 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM value_element_reference

  UNION ALL

  SELECT
    'Synonym Patterns' as test_name,
    COUNT(*)::text as actual_count,
    '50+' as expected_count,
    CASE WHEN COUNT(*) >= 50 THEN '✅ PASS' ELSE '⚠️ LOW' END as status
  FROM value_element_patterns

  UNION ALL

  SELECT
    'Industry Terms' as test_name,
    COUNT(*)::text as actual_count,
    '40+' as expected_count,
    CASE WHEN COUNT(*) >= 40 THEN '✅ PASS' ELSE '⚠️ LOW' END as status
  FROM industry_terminology

  UNION ALL

  SELECT
    'Pattern Matching Function' as test_name,
    COUNT(*)::text as actual_count,
    '1+' as expected_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
  FROM find_value_patterns(
    'Save time with automation. Affordable and easy.',
    'saas'
  )

  UNION ALL

  SELECT
    'Supported Industries' as test_name,
    COUNT(DISTINCT industry)::text as actual_count,
    '8+' as expected_count,
    CASE WHEN COUNT(DISTINCT industry) >= 8 THEN '✅ PASS' ELSE '⚠️ LOW' END as status
  FROM industry_terminology
) tests
ORDER BY test_name;


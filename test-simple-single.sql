-- Quick verification - Shows everything important in ONE table

SELECT 
  'Tables in Database' as metric,
  COUNT(*)::text as value,
  CASE WHEN COUNT(*) >= 60 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  'CliftonStrengths Themes',
  COUNT(*)::text,
  CASE WHEN COUNT(*) = 34 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM clifton_themes_reference

UNION ALL

SELECT 
  'Value Elements (B2C/B2B)',
  COUNT(*)::text,
  CASE WHEN COUNT(*) = 28 THEN '✅ PASS' ELSE '❌ FAIL' END
FROM value_element_reference

UNION ALL

SELECT 
  'Synonym Patterns',
  COUNT(*)::text,
  CASE WHEN COUNT(*) >= 50 THEN '✅ PASS' ELSE '⚠️ LOW' END
FROM value_element_patterns

UNION ALL

SELECT 
  'Industry Terms',
  COUNT(*)::text,
  CASE WHEN COUNT(*) >= 40 THEN '✅ PASS' ELSE '⚠️ LOW' END
FROM industry_terminology

UNION ALL

SELECT 
  'Supported Industries',
  COUNT(DISTINCT industry)::text,
  '✅ ' || COUNT(DISTINCT industry)::text || ' industries'
FROM industry_terminology;

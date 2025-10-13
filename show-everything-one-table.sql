-- ONE table showing EVERYTHING

SELECT * FROM (
  SELECT 1 as sort_order, 'Total Tables' as metric, COUNT(*)::text as value
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  
  UNION ALL
  
  SELECT 2, 'B2C Elements (Consumer)', COUNT(*)::text || ' / 30'
  FROM value_element_reference
  
  UNION ALL
  
  SELECT 3, 'B2B Elements (Business)', COUNT(*)::text || ' / 40'
  FROM b2b_value_element_reference
  
  UNION ALL
  
  SELECT 4, 'CliftonStrengths Themes', COUNT(*)::text || ' / 34'
  FROM clifton_themes_reference
  
  UNION ALL
  
  SELECT 5, 'Synonym Patterns', COUNT(*)::text
  FROM value_element_patterns
  
  UNION ALL
  
  SELECT 6, 'Industry Terms', COUNT(*)::text
  FROM industry_terminology
  
  UNION ALL
  
  SELECT 7, 'Supported Industries', COUNT(DISTINCT industry)::text
  FROM industry_terminology
) results
ORDER BY sort_order;

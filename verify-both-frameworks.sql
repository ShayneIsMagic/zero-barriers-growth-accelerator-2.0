-- Verify BOTH B2C and B2B Elements are complete

SELECT 
  'B2C Elements (Consumer)' as framework,
  COUNT(*) as total_elements,
  30 as expected,
  CASE WHEN COUNT(*) = 30 THEN '✅ COMPLETE' ELSE '❌ INCOMPLETE' END as status
FROM value_element_reference

UNION ALL

SELECT 
  'B2B Elements (Business)' as framework,
  COUNT(*) as total_elements,
  40 as expected,
  CASE WHEN COUNT(*) = 40 THEN '✅ COMPLETE' ELSE '❌ INCOMPLETE' END as status
FROM b2b_value_element_reference;

-- Show B2C breakdown
SELECT 
  'B2C - ' || element_category as category,
  COUNT(*) as count
FROM value_element_reference
GROUP BY element_category
ORDER BY 
  CASE element_category
    WHEN 'functional' THEN 1
    WHEN 'emotional' THEN 2
    WHEN 'life_changing' THEN 3
    WHEN 'social_impact' THEN 4
  END;

-- Show B2B breakdown
SELECT 
  'B2B - ' || category as category,
  COUNT(*) as count
FROM b2b_value_element_reference
GROUP BY category
ORDER BY 
  CASE category
    WHEN 'table_stakes' THEN 1
    WHEN 'functional' THEN 2
    WHEN 'ease_of_business' THEN 3
    WHEN 'individual' THEN 4
    WHEN 'inspirational' THEN 5
  END;

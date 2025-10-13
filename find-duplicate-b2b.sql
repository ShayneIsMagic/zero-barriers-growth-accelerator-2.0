-- Find all B2B elements to see what the extra 2 are

SELECT 
  category,
  subcategory,
  COUNT(*) as count,
  string_agg(display_name, ', ' ORDER BY display_name) as elements
FROM b2b_value_element_reference
GROUP BY category, subcategory
ORDER BY 
  CASE category
    WHEN 'table_stakes' THEN 1
    WHEN 'functional' THEN 2
    WHEN 'ease_of_business' THEN 3
    WHEN 'individual' THEN 4
    WHEN 'inspirational' THEN 5
  END,
  subcategory;

-- List ALL elements to find duplicates
SELECT 
  element_name,
  category,
  subcategory,
  display_name
FROM b2b_value_element_reference
ORDER BY category, subcategory, element_name;

-- Expected counts by category
SELECT 
  'Table Stakes' as category,
  4 as expected,
  (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'table_stakes') as actual,
  CASE WHEN (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'table_stakes') = 4 THEN '✅' ELSE '❌' END as status
  
UNION ALL

SELECT 'Functional', 9,
  (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'functional'),
  CASE WHEN (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'functional') = 9 THEN '✅' ELSE '❌' END
  
UNION ALL

SELECT 'Ease of Business', 17,
  (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'ease_of_business'),
  CASE WHEN (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'ease_of_business') = 17 THEN '✅' ELSE '❌' END
  
UNION ALL

SELECT 'Individual', 7,
  (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'individual'),
  CASE WHEN (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'individual') = 7 THEN '✅' ELSE '❌' END
  
UNION ALL

SELECT 'Inspirational', 4,
  (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'inspirational'),
  CASE WHEN (SELECT COUNT(*) FROM b2b_value_element_reference WHERE category = 'inspirational') = 4 THEN '✅' ELSE '❌' END;

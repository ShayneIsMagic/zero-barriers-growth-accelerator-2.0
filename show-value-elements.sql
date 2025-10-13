-- Show all 28 Value Elements by category

SELECT 
  element_category,
  COUNT(*) as element_count,
  string_agg(display_name, ', ' ORDER BY element_name) as elements
FROM value_element_reference
GROUP BY element_category
ORDER BY 
  CASE element_category
    WHEN 'functional' THEN 1
    WHEN 'emotional' THEN 2
    WHEN 'life_changing' THEN 3
    WHEN 'social_impact' THEN 4
  END;

-- Show all elements individually
SELECT 
  element_name,
  element_category,
  display_name,
  business_type,
  definition
FROM value_element_reference
ORDER BY 
  CASE element_category
    WHEN 'functional' THEN 1
    WHEN 'emotional' THEN 2
    WHEN 'life_changing' THEN 3
    WHEN 'social_impact' THEN 4
  END,
  element_name;

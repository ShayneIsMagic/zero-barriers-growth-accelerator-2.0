-- Show ALL 42 B2B elements to identify the extras

-- Inspirational elements (check if 4 is correct or should be 3)
SELECT 'INSPIRATIONAL ELEMENTS:' as info, element_name, display_name
FROM b2b_value_element_reference
WHERE category = 'inspirational'
ORDER BY element_name;

-- Ease of Business elements (should be 17, showing 18)
SELECT 'EASE OF BUSINESS ELEMENTS:' as info, subcategory, element_name, display_name
FROM b2b_value_element_reference
WHERE category = 'ease_of_business'
ORDER BY subcategory, element_name;

-- Count by subcategory in Ease of Business
SELECT 
  subcategory,
  COUNT(*) as count,
  string_agg(display_name, ', ' ORDER BY display_name) as elements
FROM b2b_value_element_reference
WHERE category = 'ease_of_business'
GROUP BY subcategory
ORDER BY subcategory;

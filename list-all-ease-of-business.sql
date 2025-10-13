-- List ALL Ease of Business elements to find the duplicate

SELECT 
  subcategory,
  element_name,
  display_name
FROM b2b_value_element_reference
WHERE category = 'ease_of_business'
ORDER BY subcategory, element_name;

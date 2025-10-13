-- Ultra-simple test - just count everything

SELECT COUNT(*) as b2c_elements FROM value_element_reference;

SELECT COUNT(*) as b2b_elements FROM b2b_value_element_reference;

SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

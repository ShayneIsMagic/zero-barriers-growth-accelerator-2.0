-- =====================================================
-- CHECK USER TABLE STRUCTURE
-- Run this first to see the actual column names
-- =====================================================

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;


-- =====================================================
-- CHECK WHAT DATABASE FUNCTIONS ACTUALLY EXIST
-- This will show us what's missing
-- =====================================================

-- Check if the find_value_patterns function exists
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'find_value_patterns';

-- Check if the calculate_brand_alignment_score function exists
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'calculate_brand_alignment_score';

-- Check what tables actually exist in the database
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%golden%' OR table_name LIKE '%element%' OR table_name LIKE '%clifton%'
ORDER BY table_name;

-- Check if the detailed analysis tables exist
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'golden_circle_analyses',
    'elements_of_value_b2c',
    'elements_of_value_b2b',
    'clifton_strengths_analyses',
    'lighthouse_analyses',
    'seo_analyses'
)
ORDER BY table_name;

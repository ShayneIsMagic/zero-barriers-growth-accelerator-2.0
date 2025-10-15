-- =====================================================
-- CHECK WHAT FUNCTIONS ARE MISSING
-- Focus on the functions the services are trying to call
-- =====================================================

-- Check if find_value_patterns function exists
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    'find_value_patterns' as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'find_value_patterns';

-- Check if calculate_brand_alignment_score function exists
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    'calculate_brand_alignment_score' as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'calculate_brand_alignment_score';

-- Check if find_brand_patterns_in_content function exists
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    'find_brand_patterns_in_content' as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'find_brand_patterns_in_content';

-- Check if deduct_credits function exists
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    'deduct_credits' as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'deduct_credits';

-- Check if calculate_overall_score function exists
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    'calculate_overall_score' as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'calculate_overall_score';

-- List ALL functions in public schema to see what we have
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%pattern%' OR p.proname LIKE '%brand%' OR p.proname LIKE '%credit%' OR p.proname LIKE '%score%'
ORDER BY p.proname;

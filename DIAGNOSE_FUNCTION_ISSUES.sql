-- =====================================================
-- DIAGNOSE FUNCTION SEARCH PATH ISSUES
-- Let's see exactly what's wrong with these 4 functions
-- =====================================================

-- Check the exact function signatures and their current config
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as security_definer,
    p.proconfig as current_config,
    CASE
        WHEN p.proconfig IS NULL THEN 'No config at all'
        WHEN 'search_path=public' = ANY(p.proconfig) THEN 'search_path=public is SET'
        ELSE 'Other config: ' || array_to_string(p.proconfig, ', ')
    END as search_path_status,
    p.prokind as function_kind
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'calculate_brand_alignment_score',
    'find_brand_patterns_in_content',
    'deduct_credits',
    'find_value_patterns'
)
ORDER BY p.proname;

-- Check if these functions actually exist and their exact signatures
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as exact_signature,
    p.proargtypes as argument_types,
    p.pronargs as num_args
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'calculate_brand_alignment_score',
    'find_brand_patterns_in_content',
    'deduct_credits',
    'find_value_patterns'
)
ORDER BY p.proname;

-- Try to manually set search_path for each function with exact signatures
DO $$
DECLARE
    func_record RECORD;
    success_count integer := 0;
    error_count integer := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ATTEMPTING TO FIX FUNCTION SEARCH PATHS';
    RAISE NOTICE '========================================';

    -- Try each function individually
    FOR func_record IN
        SELECT
            p.proname as func_name,
            pg_get_function_identity_arguments(p.oid) as signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'calculate_brand_alignment_score',
            'find_brand_patterns_in_content',
            'deduct_credits',
            'find_value_patterns'
        )
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION "public"."%s"(%s) SET search_path = public',
                          func_record.func_name, func_record.signature);
            RAISE NOTICE 'SUCCESS: Fixed %s', func_record.func_name;
            success_count := success_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Failed to fix %s - %', func_record.func_name, SQLERRM;
                error_count := error_count + 1;
        END;
    END LOOP;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESULTS: % successful, % errors', success_count, error_count;
    RAISE NOTICE '========================================';
END $$;

-- Check the results after the fix attempt
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.proconfig as current_config,
    CASE
        WHEN p.proconfig IS NULL THEN 'No config'
        WHEN 'search_path=public' = ANY(p.proconfig) THEN '✅ search_path=public SET'
        ELSE '❌ Other config: ' || array_to_string(p.proconfig, ', ')
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'calculate_brand_alignment_score',
    'find_brand_patterns_in_content',
    'deduct_credits',
    'find_value_patterns'
)
ORDER BY p.proname;

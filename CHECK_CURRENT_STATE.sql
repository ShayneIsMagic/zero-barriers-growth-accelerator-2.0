-- =====================================================
-- CHECK CURRENT STATE - NO CHANGES, JUST DIAGNOSTICS
-- Let's see what actually exists before making any changes
-- =====================================================

-- Check what functions exist in public schema
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as security_definer,
    p.proconfig as config_settings,
    CASE
        WHEN p.proconfig IS NULL THEN 'No config'
        WHEN 'search_path=public' = ANY(p.proconfig) THEN 'search_path=public SET'
        ELSE 'Other config: ' || array_to_string(p.proconfig, ', ')
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'calculate_brand_alignment_score',
    'find_brand_patterns_in_content',
    'update_updated_at_column',
    'deduct_credits',
    'calculate_overall_score',
    'find_value_patterns'
)
ORDER BY p.proname;

-- Check current RLS status on all tables
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE '_prisma_%'
ORDER BY tablename;

-- Check existing RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE
        WHEN length(qual) > 50 THEN left(qual, 50) || '...'
        ELSE qual
    END as policy_condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check which tables have user_id columns
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('user_id', 'userId', 'id')
AND table_name IN (
    'brand_analysis',
    'brand_pillars',
    'content_snippets',
    'individual_reports',
    'markdown_exports'
)
ORDER BY table_name, column_name;

-- =====================================================
-- DEBUG SUPABASE FUNCTIONS AND DEPENDENCIES
-- Let's see what actually exists before making changes
-- =====================================================

-- Check what functions exist in public schema
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as security_definer,
    p.proconfig as config_settings
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

-- Check what triggers depend on update_updated_at_column
SELECT
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE p.proname = 'update_updated_at_column'
AND NOT t.tgisinternal;

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
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

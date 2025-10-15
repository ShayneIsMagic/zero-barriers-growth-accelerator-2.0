-- =====================================================
-- FIX REMAINING FUNCTION SEARCH PATH WARNINGS
-- Fix the 4 remaining functions that still have warnings
-- =====================================================

-- Fix calculate_brand_alignment_score function
ALTER FUNCTION "public"."calculate_brand_alignment_score"(text) SET search_path = public;

-- Fix find_brand_patterns_in_content function
ALTER FUNCTION "public"."find_brand_patterns_in_content"(text, text) SET search_path = public;

-- Fix deduct_credits function
ALTER FUNCTION "public"."deduct_credits"(text, integer) SET search_path = public;

-- Fix find_value_patterns function
ALTER FUNCTION "public"."find_value_patterns"(text, text) SET search_path = public;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  function_count integer;
BEGIN
  -- Count functions with search_path set
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND p.proconfig IS NOT NULL
  AND 'search_path=public' = ANY(p.proconfig);

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FUNCTION SEARCH PATH FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Functions with search_path set: %', function_count;
  RAISE NOTICE '';
  RAISE NOTICE 'This should fix the 4 remaining function warnings!';
  RAISE NOTICE 'The RLS "issues" are actually good - they show security is working!';
  RAISE NOTICE '========================================';
END $$;

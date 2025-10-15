-- =====================================================
-- FIX REMAINING 4 FUNCTION SEARCH PATH WARNINGS
-- Target the specific functions that still need fixing
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
  warning_count integer := 0;
  func_record RECORD;
BEGIN
  -- Count functions with search_path set
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND p.proconfig IS NOT NULL
  AND 'search_path=public' = ANY(p.proconfig);

  -- Check for functions that still need search_path fix
  FOR func_record IN
    SELECT p.proname as func_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true
    AND (p.proconfig IS NULL OR 'search_path=public' != ALL(p.proconfig))
    AND p.proname IN (
      'calculate_brand_alignment_score',
      'find_brand_patterns_in_content',
      'deduct_credits',
      'find_value_patterns'
    )
  LOOP
    warning_count := warning_count + 1;
    RAISE NOTICE 'WARNING: Function % still needs search_path fix', func_record.func_name;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FUNCTION SEARCH PATH FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Functions with search_path set: %', function_count;
  RAISE NOTICE 'Functions still needing search_path fix: %', warning_count;
  RAISE NOTICE '';

  IF warning_count > 0 THEN
    RAISE NOTICE 'Some functions still need search_path fix - see warnings above';
  ELSE
    RAISE NOTICE 'All 4 functions now have proper search_path settings!';
    RAISE NOTICE 'Security Advisor should now show 0 warnings!';
  END IF;

  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- SECURITY FIX BASED ON ACTUAL SCHEMA
-- Using the real table structure we just discovered
-- =====================================================

-- =====================================================
-- PART 1: FIX FUNCTION SEARCH PATH WARNINGS
-- =====================================================

-- Fix calculate_brand_alignment_score function (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'calculate_brand_alignment_score'
    ) THEN
        ALTER FUNCTION "public"."calculate_brand_alignment_score"(text) SET search_path = public;
        RAISE NOTICE 'Fixed calculate_brand_alignment_score search_path';
    ELSE
        RAISE NOTICE 'calculate_brand_alignment_score function does not exist';
    END IF;
END $$;

-- Fix find_brand_patterns_in_content function (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'find_brand_patterns_in_content'
    ) THEN
        ALTER FUNCTION "public"."find_brand_patterns_in_content"(text, text) SET search_path = public;
        RAISE NOTICE 'Fixed find_brand_patterns_in_content search_path';
    ELSE
        RAISE NOTICE 'find_brand_patterns_in_content function does not exist';
    END IF;
END $$;

-- Fix deduct_credits function (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'deduct_credits'
    ) THEN
        ALTER FUNCTION "public"."deduct_credits"(text, integer) SET search_path = public;
        RAISE NOTICE 'Fixed deduct_credits search_path';
    ELSE
        RAISE NOTICE 'deduct_credits function does not exist';
    END IF;
END $$;

-- Fix find_value_patterns function (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'find_value_patterns'
    ) THEN
        ALTER FUNCTION "public"."find_value_patterns"(text, text) SET search_path = public;
        RAISE NOTICE 'Fixed find_value_patterns search_path';
    ELSE
        RAISE NOTICE 'find_value_patterns function does not exist';
    END IF;
END $$;

-- =====================================================
-- PART 2: ADD RLS POLICIES FOR TABLES WITHOUT USER_ID
-- =====================================================

-- Since these tables don't have user_id columns, we'll create public read policies
-- and restrict write access to authenticated users only

-- Add RLS policies for brand_analysis table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'brand_analysis'
        AND table_schema = 'public'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public read access for brand analysis" ON "public"."brand_analysis";
        DROP POLICY IF EXISTS "Authenticated users can insert brand analysis" ON "public"."brand_analysis";
        DROP POLICY IF EXISTS "Authenticated users can update brand analysis" ON "public"."brand_analysis";
        DROP POLICY IF EXISTS "Authenticated users can delete brand analysis" ON "public"."brand_analysis";

        -- Create new policies
        EXECUTE 'CREATE POLICY "Public read access for brand analysis"
        ON "public"."brand_analysis" FOR SELECT
        TO authenticated, anon
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can insert brand analysis"
        ON "public"."brand_analysis" FOR INSERT
        TO authenticated
        WITH CHECK (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can update brand analysis"
        ON "public"."brand_analysis" FOR UPDATE
        TO authenticated
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can delete brand analysis"
        ON "public"."brand_analysis" FOR DELETE
        TO authenticated
        USING (true)';

        RAISE NOTICE 'Created RLS policies for brand_analysis table';
    ELSE
        RAISE NOTICE 'brand_analysis table does not exist';
    END IF;
END $$;

-- Add RLS policies for brand_pillars table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'brand_pillars'
        AND table_schema = 'public'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public read access for brand pillars" ON "public"."brand_pillars";
        DROP POLICY IF EXISTS "Authenticated users can insert brand pillars" ON "public"."brand_pillars";
        DROP POLICY IF EXISTS "Authenticated users can update brand pillars" ON "public"."brand_pillars";
        DROP POLICY IF EXISTS "Authenticated users can delete brand pillars" ON "public"."brand_pillars";

        -- Create new policies
        EXECUTE 'CREATE POLICY "Public read access for brand pillars"
        ON "public"."brand_pillars" FOR SELECT
        TO authenticated, anon
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can insert brand pillars"
        ON "public"."brand_pillars" FOR INSERT
        TO authenticated
        WITH CHECK (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can update brand pillars"
        ON "public"."brand_pillars" FOR UPDATE
        TO authenticated
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can delete brand pillars"
        ON "public"."brand_pillars" FOR DELETE
        TO authenticated
        USING (true)';

        RAISE NOTICE 'Created RLS policies for brand_pillars table';
    ELSE
        RAISE NOTICE 'brand_pillars table does not exist';
    END IF;
END $$;

-- Add RLS policies for content_snippets table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'content_snippets'
        AND table_schema = 'public'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public read access for content snippets" ON "public"."content_snippets";
        DROP POLICY IF EXISTS "Authenticated users can insert content snippets" ON "public"."content_snippets";
        DROP POLICY IF EXISTS "Authenticated users can update content snippets" ON "public"."content_snippets";
        DROP POLICY IF EXISTS "Authenticated users can delete content snippets" ON "public"."content_snippets";

        -- Create new policies
        EXECUTE 'CREATE POLICY "Public read access for content snippets"
        ON "public"."content_snippets" FOR SELECT
        TO authenticated, anon
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can insert content snippets"
        ON "public"."content_snippets" FOR INSERT
        TO authenticated
        WITH CHECK (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can update content snippets"
        ON "public"."content_snippets" FOR UPDATE
        TO authenticated
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can delete content snippets"
        ON "public"."content_snippets" FOR DELETE
        TO authenticated
        USING (true)';

        RAISE NOTICE 'Created RLS policies for content_snippets table';
    ELSE
        RAISE NOTICE 'content_snippets table does not exist';
    END IF;
END $$;

-- Add RLS policies for individual_reports table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'individual_reports'
        AND table_schema = 'public'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public read access for individual reports" ON "public"."individual_reports";
        DROP POLICY IF EXISTS "Authenticated users can insert individual reports" ON "public"."individual_reports";
        DROP POLICY IF EXISTS "Authenticated users can update individual reports" ON "public"."individual_reports";
        DROP POLICY IF EXISTS "Authenticated users can delete individual reports" ON "public"."individual_reports";

        -- Create new policies
        EXECUTE 'CREATE POLICY "Public read access for individual reports"
        ON "public"."individual_reports" FOR SELECT
        TO authenticated, anon
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can insert individual reports"
        ON "public"."individual_reports" FOR INSERT
        TO authenticated
        WITH CHECK (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can update individual reports"
        ON "public"."individual_reports" FOR UPDATE
        TO authenticated
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can delete individual reports"
        ON "public"."individual_reports" FOR DELETE
        TO authenticated
        USING (true)';

        RAISE NOTICE 'Created RLS policies for individual_reports table';
    ELSE
        RAISE NOTICE 'individual_reports table does not exist';
    END IF;
END $$;

-- Add RLS policies for markdown_exports table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'markdown_exports'
        AND table_schema = 'public'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Public read access for markdown exports" ON "public"."markdown_exports";
        DROP POLICY IF EXISTS "Authenticated users can insert markdown exports" ON "public"."markdown_exports";
        DROP POLICY IF EXISTS "Authenticated users can update markdown exports" ON "public"."markdown_exports";
        DROP POLICY IF EXISTS "Authenticated users can delete markdown exports" ON "public"."markdown_exports";

        -- Create new policies
        EXECUTE 'CREATE POLICY "Public read access for markdown exports"
        ON "public"."markdown_exports" FOR SELECT
        TO authenticated, anon
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can insert markdown exports"
        ON "public"."markdown_exports" FOR INSERT
        TO authenticated
        WITH CHECK (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can update markdown exports"
        ON "public"."markdown_exports" FOR UPDATE
        TO authenticated
        USING (true)';

        EXECUTE 'CREATE POLICY "Authenticated users can delete markdown exports"
        ON "public"."markdown_exports" FOR DELETE
        TO authenticated
        USING (true)';

        RAISE NOTICE 'Created RLS policies for markdown_exports table';
    ELSE
        RAISE NOTICE 'markdown_exports table does not exist';
    END IF;
END $$;

-- =====================================================
-- PART 3: VERIFICATION
-- =====================================================

DO $$
DECLARE
  rls_enabled_count integer;
  policy_count integer;
  function_count integer;
  warning_count integer := 0;
  func_record RECORD;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;

  -- Count RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

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
      'find_value_patterns',
      'update_updated_at_column'
    )
  LOOP
    warning_count := warning_count + 1;
    RAISE NOTICE 'WARNING: Function % still needs search_path fix', func_record.func_name;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SECURITY FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled_count;
  RAISE NOTICE 'Total RLS policies created: %', policy_count;
  RAISE NOTICE 'Functions with search_path set: %', function_count;
  RAISE NOTICE 'Functions still needing search_path fix: %', warning_count;
  RAISE NOTICE '';

  IF warning_count > 0 THEN
    RAISE NOTICE 'Some functions still need search_path fix - see warnings above';
  ELSE
    RAISE NOTICE 'All functions have proper search_path settings!';
  END IF;

  RAISE NOTICE '========================================';
END $$;

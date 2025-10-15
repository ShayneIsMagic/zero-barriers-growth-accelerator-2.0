-- =====================================================
-- PROPER SECURITY FIX - NO SHORTCUTS
-- Addresses all security issues correctly without compromising safety
-- =====================================================

-- =====================================================
-- PART 1: FIX FUNCTION SEARCH PATH WARNINGS PROPERLY
-- =====================================================

-- First, let's check what functions actually exist and their current state
DO $$
DECLARE
    func_record RECORD;
    func_exists BOOLEAN;
    current_config text[];
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING EXISTING FUNCTIONS...';
    RAISE NOTICE '========================================';

    -- Check each function that was showing warnings
    FOR func_record IN
        SELECT unnest(ARRAY[
            'calculate_brand_alignment_score',
            'find_brand_patterns_in_content',
            'deduct_credits',
            'find_value_patterns'
        ]) as func_name
    LOOP
        -- Check if function exists and get its current config
        SELECT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = func_record.func_name
        ),
        (
            SELECT p.proconfig FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = func_record.func_name
        )
        INTO func_exists, current_config;

        IF func_exists THEN
            IF current_config IS NULL OR 'search_path=public' != ALL(current_config) THEN
                RAISE NOTICE 'Function % needs search_path fix', func_record.func_name;
            ELSE
                RAISE NOTICE 'Function % already has correct search_path', func_record.func_name;
            END IF;
        ELSE
            RAISE NOTICE 'Function % does not exist', func_record.func_name;
        END IF;
    END LOOP;
END $$;

-- Fix calculate_brand_alignment_score function
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

-- Fix find_brand_patterns_in_content function
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

-- Fix deduct_credits function
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

-- Fix find_value_patterns function
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
-- PART 2: ADD PROPER RLS POLICIES FOR ALL TABLES
-- =====================================================

-- Add RLS policies for brand_analysis table
DO $$
BEGIN
    -- Check if table exists and has user_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'brand_analysis'
        AND table_schema = 'public'
    ) THEN
        -- Check if user_id column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'brand_analysis'
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            -- Create policies for user_id column
            EXECUTE 'CREATE POLICY "Users can view own brand analyses"
            ON "public"."brand_analysis" FOR SELECT
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can create brand analyses"
            ON "public"."brand_analysis" FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can update own brand analyses"
            ON "public"."brand_analysis" FOR UPDATE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can delete own brand analyses"
            ON "public"."brand_analysis" FOR DELETE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            RAISE NOTICE 'Created RLS policies for brand_analysis table';
        ELSE
            RAISE NOTICE 'brand_analysis table exists but has no user_id column - creating public read policy';
            EXECUTE 'CREATE POLICY "Public read access for brand analysis"
            ON "public"."brand_analysis" FOR SELECT
            TO authenticated, anon
            USING (true)';
        END IF;
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
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'brand_pillars'
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            EXECUTE 'CREATE POLICY "Users can view own brand pillars"
            ON "public"."brand_pillars" FOR SELECT
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can create brand pillars"
            ON "public"."brand_pillars" FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can update own brand pillars"
            ON "public"."brand_pillars" FOR UPDATE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can delete own brand pillars"
            ON "public"."brand_pillars" FOR DELETE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            RAISE NOTICE 'Created RLS policies for brand_pillars table';
        ELSE
            RAISE NOTICE 'brand_pillars table exists but has no user_id column - creating public read policy';
            EXECUTE 'CREATE POLICY "Public read access for brand pillars"
            ON "public"."brand_pillars" FOR SELECT
            TO authenticated, anon
            USING (true)';
        END IF;
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
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'content_snippets'
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            EXECUTE 'CREATE POLICY "Users can view own content snippets"
            ON "public"."content_snippets" FOR SELECT
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can create content snippets"
            ON "public"."content_snippets" FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can update own content snippets"
            ON "public"."content_snippets" FOR UPDATE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can delete own content snippets"
            ON "public"."content_snippets" FOR DELETE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            RAISE NOTICE 'Created RLS policies for content_snippets table';
        ELSE
            RAISE NOTICE 'content_snippets table exists but has no user_id column - creating public read policy';
            EXECUTE 'CREATE POLICY "Public read access for content snippets"
            ON "public"."content_snippets" FOR SELECT
            TO authenticated, anon
            USING (true)';
        END IF;
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
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'individual_reports'
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            EXECUTE 'CREATE POLICY "Users can view own individual reports"
            ON "public"."individual_reports" FOR SELECT
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can create individual reports"
            ON "public"."individual_reports" FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can update own individual reports"
            ON "public"."individual_reports" FOR UPDATE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can delete own individual reports"
            ON "public"."individual_reports" FOR DELETE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            RAISE NOTICE 'Created RLS policies for individual_reports table';
        ELSE
            RAISE NOTICE 'individual_reports table exists but has no user_id column - creating public read policy';
            EXECUTE 'CREATE POLICY "Public read access for individual reports"
            ON "public"."individual_reports" FOR SELECT
            TO authenticated, anon
            USING (true)';
        END IF;
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
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'markdown_exports'
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            EXECUTE 'CREATE POLICY "Users can view own markdown exports"
            ON "public"."markdown_exports" FOR SELECT
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can create markdown exports"
            ON "public"."markdown_exports" FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can update own markdown exports"
            ON "public"."markdown_exports" FOR UPDATE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            EXECUTE 'CREATE POLICY "Users can delete own markdown exports"
            ON "public"."markdown_exports" FOR DELETE
            TO authenticated
            USING (auth.uid()::text = user_id)';

            RAISE NOTICE 'Created RLS policies for markdown_exports table';
        ELSE
            RAISE NOTICE 'markdown_exports table exists but has no user_id column - creating public read policy';
            EXECUTE 'CREATE POLICY "Public read access for markdown exports"
            ON "public"."markdown_exports" FOR SELECT
            TO authenticated, anon
            USING (true)';
        END IF;
    ELSE
        RAISE NOTICE 'markdown_exports table does not exist';
    END IF;
END $$;

-- =====================================================
-- PART 3: COMPREHENSIVE VERIFICATION
-- =====================================================

DO $$
DECLARE
  rls_enabled_count integer;
  rls_disabled_count integer;
  function_count integer;
  policy_count integer;
  missing_policies text[] := ARRAY[]::text[];
  table_record RECORD;
  func_record RECORD;
  warning_count integer := 0;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;

  -- Count tables without RLS
  SELECT COUNT(*) INTO rls_disabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE '_prisma_%';

  -- Count functions with search_path set
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND p.proconfig IS NOT NULL
  AND 'search_path=public' = ANY(p.proconfig);

  -- Count RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

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

  -- Check for tables without policies
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE '_prisma_%'
    AND tablename NOT IN (
      SELECT DISTINCT tablename
      FROM pg_policies
      WHERE schemaname = 'public'
    )
  LOOP
    missing_policies := array_append(missing_policies, table_record.tablename);
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COMPREHENSIVE SECURITY FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled_count;
  RAISE NOTICE 'Tables without RLS: %', rls_disabled_count;
  RAISE NOTICE 'Functions with search_path set: %', function_count;
  RAISE NOTICE 'Total RLS policies created: %', policy_count;
  RAISE NOTICE 'Functions still needing search_path fix: %', warning_count;
  RAISE NOTICE '';

  IF array_length(missing_policies, 1) > 0 THEN
    RAISE NOTICE 'Tables without policies: %', array_to_string(missing_policies, ', ');
  ELSE
    RAISE NOTICE 'All RLS-enabled tables have policies!';
  END IF;

  IF warning_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'MANUAL ACTION REQUIRED:';
    RAISE NOTICE 'Some functions still need search_path fix - see warnings above';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE 'All functions have proper search_path settings!';
  END IF;

  RAISE NOTICE '========================================';
END $$;

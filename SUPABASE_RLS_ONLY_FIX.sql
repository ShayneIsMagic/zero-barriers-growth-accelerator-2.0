-- =====================================================
-- RLS-ONLY FIX (SAFE - NO FUNCTION CHANGES)
-- Fixes the 10 RLS errors without touching functions
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL MISSING TABLES
-- =====================================================

-- Enable RLS on User table
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on Analysis table
ALTER TABLE "public"."Analysis" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on individual_reports table
ALTER TABLE "public"."individual_reports" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on markdown_exports table
ALTER TABLE "public"."markdown_exports" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on b2b_value_element_reference table
ALTER TABLE "public"."b2b_value_element_reference" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on brand_pillars table
ALTER TABLE "public"."brand_pillars" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on content_snippets table
ALTER TABLE "public"."content_snippets" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on brand_analysis table
ALTER TABLE "public"."brand_analysis" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on brand_theme_reference table
ALTER TABLE "public"."brand_theme_reference" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on brand_patterns table
ALTER TABLE "public"."brand_patterns" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE BASIC RLS POLICIES
-- =====================================================

-- User table policies
CREATE POLICY "Users can view own data"
ON "public"."User" FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Analysis table policies
CREATE POLICY "Users can view own analyses"
ON "public"."Analysis" FOR SELECT
TO authenticated
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create analyses"
ON "public"."Analysis" FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

-- Reference tables (public read access)
CREATE POLICY "Public read access for B2B elements"
ON "public"."b2b_value_element_reference" FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Public read access for brand themes"
ON "public"."brand_theme_reference" FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Public read access for brand patterns"
ON "public"."brand_patterns" FOR SELECT
TO authenticated, anon
USING (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  rls_enabled_count integer;
  rls_disabled_count integer;
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

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled_count;
  RAISE NOTICE 'Tables without RLS: %', rls_disabled_count;
  RAISE NOTICE '';
  RAISE NOTICE 'This fixes the 10 RLS errors!';
  RAISE NOTICE 'Function warnings can be addressed separately.';
  RAISE NOTICE '========================================';
END $$;

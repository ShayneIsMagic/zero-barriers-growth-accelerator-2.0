-- Fix Supabase RLS Performance Issues
-- Replace auth.<function>() with (select auth.<function>()) to avoid re-evaluation per row

-- Fix User table RLS policy
DROP POLICY IF EXISTS "Users can view own data" ON "public"."User";

CREATE POLICY "Users can view own data" ON "public"."User"
FOR SELECT USING (
  "id" = (select auth.uid())::text
);

-- Fix Analysis table RLS policies
DROP POLICY IF EXISTS "Users can view own analyses" ON "public"."Analysis";
DROP POLICY IF EXISTS "Users can insert own analyses" ON "public"."Analysis";
DROP POLICY IF EXISTS "Users can update own analyses" ON "public"."Analysis";
DROP POLICY IF EXISTS "Users can delete own analyses" ON "public"."Analysis";

CREATE POLICY "Users can view own analyses" ON "public"."Analysis"
FOR SELECT USING (
  "userId" = (select auth.uid())::text
);

CREATE POLICY "Users can insert own analyses" ON "public"."Analysis"
FOR INSERT WITH CHECK (
  "userId" = (select auth.uid())::text
);

CREATE POLICY "Users can update own analyses" ON "public"."Analysis"
FOR UPDATE USING (
  "userId" = (select auth.uid())::text
);

CREATE POLICY "Users can delete own analyses" ON "public"."Analysis"
FOR DELETE USING (
  "userId" = (select auth.uid())::text
);

-- Fix any other tables that might have similar issues
-- Check for other RLS policies that use auth functions directly

-- Verify the changes
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
AND (qual LIKE '%auth.%' OR with_check LIKE '%auth.%')
ORDER BY tablename, policyname;

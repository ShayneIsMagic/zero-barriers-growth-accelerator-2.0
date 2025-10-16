-- Fix Supabase RLS Performance Issues
-- Replace auth.<function>() with (select auth.<function>()) to avoid re-evaluation per row

-- Fix User table RLS policy
DROP POLICY IF EXISTS "Users can view own data" ON "public"."User";

CREATE POLICY "Users can view own data" ON "public"."User"
FOR SELECT USING (
  "id" = (select auth.uid())
);

-- Fix Analysis table RLS policy
DROP POLICY IF EXISTS "Users can view own analyses" ON "public"."Analysis";

CREATE POLICY "Users can view own analyses" ON "public"."Analysis"
FOR SELECT USING (
  "userId" = (select auth.uid())
);

-- Add additional RLS policies for other operations if needed
CREATE POLICY "Users can insert own analyses" ON "public"."Analysis"
FOR INSERT WITH CHECK (
  "userId" = (select auth.uid())
);

CREATE POLICY "Users can update own analyses" ON "public"."Analysis"
FOR UPDATE USING (
  "userId" = (select auth.uid())
);

CREATE POLICY "Users can delete own analyses" ON "public"."Analysis"
FOR DELETE USING (
  "userId" = (select auth.uid())
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

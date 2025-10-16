-- Fix the remaining 3 Supabase Security Advisor warnings
-- 1. RLS performance issues with auth.uid() calls
-- 2. Multiple permissive policies for same role/action

-- First, let's see what policies currently exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Analysis')
ORDER BY tablename, cmd, policyname;

-- Fix 1: Optimize User table RLS policy for UPDATE
-- Replace auth.uid() with (select auth.uid()) for better performance
DROP POLICY IF EXISTS "Users can update own data" ON "public"."User";

CREATE POLICY "Users can update own data" ON "public"."User"
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid())::text = id);

-- Fix 2: Optimize Analysis table RLS policies for better performance
-- Replace auth.uid() with (select auth.uid()) for better performance

-- Update the SELECT policy
DROP POLICY IF EXISTS "Users can view own analyses" ON "public"."Analysis";
CREATE POLICY "Users can view own analyses" ON "public"."Analysis"
  FOR SELECT
  TO public
  USING (("userId" = ((select auth.uid())::text)));

-- Update the UPDATE policy  
DROP POLICY IF EXISTS "Users can update own analyses" ON "public"."Analysis";
CREATE POLICY "Users can update own analyses" ON "public"."Analysis"
  FOR UPDATE
  TO public
  USING (("userId" = ((select auth.uid())::text)));

-- Update the DELETE policy
DROP POLICY IF EXISTS "Users can delete own analyses" ON "public"."Analysis";
CREATE POLICY "Users can delete own analyses" ON "public"."Analysis"
  FOR DELETE
  TO public
  USING (("userId" = ((select auth.uid())::text)));

-- Fix 3: Remove duplicate INSERT policies
-- Keep only one INSERT policy to avoid multiple permissive policies
DROP POLICY IF EXISTS "Users can create analyses" ON "public"."Analysis";
DROP POLICY IF EXISTS "Users can insert own analyses" ON "public"."Analysis";

-- Create a single optimized INSERT policy
CREATE POLICY "Users can insert own analyses" ON "public"."Analysis"
  FOR INSERT
  TO public
  WITH CHECK (("userId" = ((select auth.uid())::text)));

-- Verify the fixes
SELECT 
  'After Fix' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual LIKE '%(select auth.uid())%' THEN '✅ Optimized'
    WHEN qual LIKE '%auth.uid()%' THEN '❌ Needs optimization'
    ELSE 'ℹ️ No auth calls'
  END as performance_status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Analysis')
ORDER BY tablename, cmd, policyname;

-- Count policies per table/action to verify no duplicates
SELECT 
  tablename,
  cmd,
  roles,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ Single policy'
    WHEN COUNT(*) > 1 THEN '❌ Multiple policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Analysis')
  AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')
GROUP BY tablename, cmd, roles
ORDER BY tablename, cmd;

-- =====================================================
-- CHECK CURRENT RLS STATUS
-- =====================================================
-- Run this in Supabase SQL Editor to see what RLS is actually enabled
-- =====================================================

-- Check which tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check existing RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count tables with and without RLS
SELECT
  CASE WHEN rowsecurity THEN 'RLS Enabled' ELSE 'RLS Disabled' END as status,
  COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY rowsecurity;

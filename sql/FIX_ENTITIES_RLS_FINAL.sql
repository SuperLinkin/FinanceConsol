-- FINAL FIX: Entities table RLS policy with WITH CHECK clause
-- This is the MINIMUM fix needed for entity creation to work
-- Run this in Supabase SQL Editor NOW

-- Drop and recreate the policy with BOTH USING and WITH CHECK
DROP POLICY IF EXISTS "users_manage_company_entities" ON entities;

CREATE POLICY "users_manage_company_entities" ON entities
  FOR ALL
  USING (company_id = public.get_company_id())
  WITH CHECK (company_id = public.get_company_id());

-- Verify the policy is created correctly
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL AND with_check IS NOT NULL THEN '✅ Both USING and WITH CHECK'
    WHEN qual IS NOT NULL THEN '⚠️  Only USING (INSERT will fail)'
    WHEN with_check IS NOT NULL THEN '⚠️  Only WITH CHECK'
    ELSE '❌ Neither clause'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'entities'
  AND policyname = 'users_manage_company_entities';

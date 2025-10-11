-- Fix RLS policy for entities table to allow inserts
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_company_entities" ON entities;
DROP POLICY IF EXISTS "users_manage_company_entities" ON entities;

-- Create new policies with WITH CHECK clause

-- Allow users to view entities in their company
CREATE POLICY "users_view_company_entities" ON entities
  FOR SELECT
  USING (company_id = public.get_company_id());

-- Allow users to manage entities in their company (with WITH CHECK for INSERT)
CREATE POLICY "users_manage_company_entities" ON entities
  FOR ALL
  USING (company_id = public.get_company_id())
  WITH CHECK (company_id = public.get_company_id());

-- Verify policies are created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'entities'
ORDER BY policyname;

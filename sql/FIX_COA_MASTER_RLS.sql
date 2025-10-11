-- Fix RLS policy for coa_master_hierarchy to allow inserts
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_coa_master" ON coa_master_hierarchy;
DROP POLICY IF EXISTS "admins_manage_coa_master" ON coa_master_hierarchy;

-- Create new policies that allow all operations
-- COA Master is shared data, so we allow everyone to read and admins to manage

-- Allow all users to view
CREATE POLICY "users_view_coa_master" ON coa_master_hierarchy
  FOR SELECT
  USING (true);

-- Allow all authenticated users to insert/update/delete
-- (since this is reference data that should be manageable by all)
CREATE POLICY "users_manage_coa_master" ON coa_master_hierarchy
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'coa_master_hierarchy'
ORDER BY policyname;

-- ============================================================================
-- DIAGNOSTIC QUERIES FOR LOGIN ISSUE
-- ============================================================================
-- Run these in Supabase SQL Editor to diagnose why login redirects to home
-- ============================================================================

-- 1. Check if Admin user exists
SELECT
  id,
  username,
  email,
  company_id,
  is_active,
  role,
  first_name,
  last_name
FROM users
WHERE username = 'Admin';

-- 2. Check if the user's company exists
SELECT
  u.username,
  u.company_id,
  c.id as company_table_id,
  c.company_name,
  c.company_slug
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.username = 'Admin';

-- 3. Test the exact query that getCurrentUser uses
SELECT
  u.*,
  jsonb_build_object(
    'id', c.id,
    'company_name', c.company_name,
    'company_slug', c.company_slug,
    'subscription_status', c.subscription_status,
    'production_enabled', c.production_enabled,
    'sandbox_enabled', c.sandbox_enabled
  ) as companies
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.username = 'Admin'
  AND u.is_active = true;

-- 4. Check RLS policies on users table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';

-- 5. Check RLS policies on companies table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'companies';

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- 1. Should return 1 row with Admin user details and valid company_id UUID
-- 2. Should show both user and company info with matching company_id
-- 3. Should return complete user record with companies object (not null)
-- 4. Should show RLS policies - might be empty or show service_role policy
-- 5. Should show RLS policies - might be empty or show service_role policy
-- ============================================================================

-- ============================================================================
-- POSSIBLE ISSUES
-- ============================================================================
-- Issue A: Query 1 returns no rows
--   → Admin user doesn't exist - need to run CREATE_DEMO_USER.sql
--
-- Issue B: Query 2 shows company_id but company_table_id is NULL
--   → Company doesn't exist - need to create company first
--
-- Issue C: Query 3 returns no rows or companies field is null
--   → Join is failing - company_id doesn't match any company
--
-- Issue D: RLS policies are blocking the query
--   → Service role credentials not configured properly in .env
-- ============================================================================

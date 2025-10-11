-- ============================================================================
-- CREATE DEMO USER - FINAL VERSION
-- ============================================================================
-- Run this AFTER running FIX_RLS_FOR_LOGIN.sql
-- ============================================================================

-- STEP 1: Clean up any existing demo data
DELETE FROM user_sessions WHERE user_id IN (
  SELECT id FROM users WHERE username = 'demo'
);
DELETE FROM users WHERE username = 'demo';
DELETE FROM companies WHERE company_slug = 'demo-company';

-- STEP 2: Create demo company
INSERT INTO companies (
  company_name,
  company_slug,
  subscription_tier,
  subscription_status,
  production_enabled,
  sandbox_enabled
) VALUES (
  'Demo Company',
  'demo-company',
  'professional',
  'active',
  true,
  true
);

-- STEP 3: Create demo user
-- Password: "Test"
-- Hash generated with bcryptjs, 10 salt rounds
INSERT INTO users (
  company_id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_primary,
  is_active,
  is_verified,
  email_verified_at,
  failed_login_attempts,
  locked_until
)
SELECT
  c.id,
  'demo',
  'demo@demo.com',
  '$2b$10$Elj9xhC7d.NU/UIf0MaQ4O58tu.Dk/wf1iotZ4FpGYdnoOz6qNcxW',
  'Demo',
  'User',
  'primary_admin',
  true,
  true,
  true,
  NOW(),
  0,
  NULL
FROM companies c
WHERE c.company_slug = 'demo-company';

-- STEP 4: Verify creation
SELECT '=' as divider;
SELECT 'DEMO USER CREATED SUCCESSFULLY' as status;
SELECT '=' as divider;

SELECT
  u.id,
  u.username,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.is_active,
  u.is_verified,
  c.company_name,
  c.company_slug,
  LENGTH(u.password_hash) as password_hash_length,
  u.failed_login_attempts,
  u.locked_until
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'demo';

-- STEP 5: Test that user can be found (simulates login query)
SELECT '=' as divider;
SELECT 'LOGIN QUERY TEST' as test;
SELECT '=' as divider;

SELECT
  u.id,
  u.username,
  u.company_id,
  u.is_active,
  u.password_hash,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'demo'
  AND u.is_active = true;

-- ============================================================================
-- LOGIN CREDENTIALS:
-- ============================================================================
-- Username: demo
-- Password: Test
-- ============================================================================
--
-- IMPORTANT: Make sure you have run FIX_RLS_FOR_LOGIN.sql first!
-- Otherwise the login query will still fail due to RLS restrictions.
-- ============================================================================

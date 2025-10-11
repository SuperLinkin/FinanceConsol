-- ============================================================================
-- CREATE FRESH DEMO USER (DELETES OLD ONE)
-- ============================================================================
-- This creates a completely fresh demo user
-- ============================================================================

-- Step 1: Delete any existing demo users and companies
DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE username = 'DemoAdmin');
DELETE FROM audit_log WHERE user_id IN (SELECT id FROM users WHERE username = 'DemoAdmin');
DELETE FROM users WHERE username = 'DemoAdmin';
DELETE FROM companies WHERE company_slug = 'demo-test-company';

-- Step 2: Create fresh demo company
INSERT INTO companies (
  company_name,
  company_slug,
  industry,
  country,
  subscription_tier,
  subscription_status,
  production_enabled,
  sandbox_enabled
)
VALUES (
  'Demo Test Company',
  'demo-test-company',
  'Technology',
  'United States',
  'professional',
  'active',
  true,
  true
)
RETURNING id, company_name;

-- Step 3: Create fresh demo user
-- IMPORTANT: Replace <COMPANY_ID> below with the ID from Step 2
INSERT INTO users (
  company_id,
  email,
  username,
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
VALUES (
  (SELECT id FROM companies WHERE company_slug = 'demo-test-company'),
  'demo@testcompany.com',
  'DemoAdmin',
  '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.', -- Password: Test
  'Demo',
  'User',
  'primary_admin',
  true,
  true,
  true,
  NOW(),
  0,
  NULL
)
RETURNING id, username, email, role;

-- Step 4: Verify
SELECT
  u.username,
  u.email,
  u.role,
  u.is_active,
  u.is_verified,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'DemoAdmin';

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- New user created!
--
-- Login Credentials:
-- Username: DemoAdmin
-- Password: Test
-- ============================================================================

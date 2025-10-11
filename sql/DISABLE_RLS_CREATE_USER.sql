-- ============================================================================
-- CREATE USER WITH RLS DISABLED (TEMPORARY)
-- ============================================================================
-- This temporarily disables RLS to create the user, then re-enables it
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Clean up
DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE username = 'demo');
DELETE FROM users WHERE username = 'demo';
DELETE FROM companies WHERE company_slug = 'demo-company-2024';

-- Create company
INSERT INTO companies (company_name, company_slug, subscription_tier, subscription_status)
VALUES ('Demo Company 2024', 'demo-company-2024', 'professional', 'active');

-- Create user
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
  failed_login_attempts
)
SELECT
  id,
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
  0
FROM companies
WHERE company_slug = 'demo-company-2024';

-- Re-enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify user was created
SELECT
  u.id,
  u.username,
  u.email,
  u.is_active,
  u.is_verified,
  c.company_name,
  LENGTH(u.password_hash) as password_hash_length
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'demo';

-- ============================================================================
-- LOGIN CREDENTIALS:
-- Username: demo
-- Password: Test
-- ============================================================================

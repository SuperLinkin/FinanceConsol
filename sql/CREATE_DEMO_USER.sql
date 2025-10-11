-- ============================================================================
-- CREATE DEMO USER FOR TESTING
-- ============================================================================
-- Run this in Supabase SQL Editor to create a demo account
-- ============================================================================

-- Step 1: Create a demo company (if not exists)
INSERT INTO companies (
  id,
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
  '00000000-0000-0000-0000-000000000001', -- Fixed UUID for demo company
  'Demo Company',
  'demo-company',
  'Financial Services',
  'United States',
  'professional',
  'active',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create demo admin user
INSERT INTO users (
  id,
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
  email_verified_at
)
VALUES (
  '00000000-0000-0000-0000-000000000002', -- Fixed UUID for demo user
  '00000000-0000-0000-0000-000000000001', -- Demo company ID
  'admin@democompany.com',
  'Admin',
  '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.', -- Password: Test
  'Demo',
  'Administrator',
  'primary_admin',
  true,
  true,
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  password_hash = '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.',
  is_active = true,
  username = 'Admin';

-- Step 3: Verify the user was created
SELECT
  u.id,
  u.username,
  u.email,
  u.role,
  u.is_active,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'Admin';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- Demo user created successfully!
--
-- Login Credentials:
-- Username: Admin
-- Password: Test
--
-- Company: Demo Company
-- ============================================================================

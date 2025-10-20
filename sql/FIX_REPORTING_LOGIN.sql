-- ============================================================================
-- FIX REPORTING MODULE LOGIN ISSUE
-- ============================================================================
-- This script ensures the reporting module (CLOE - Reporting) login works
-- by properly setting up the Admin user with company relationship
-- ============================================================================

-- Step 1: Ensure Demo Company exists
INSERT INTO companies (
  id,
  company_name,
  company_slug,
  industry,
  country,
  subscription_tier,
  subscription_status,
  production_enabled,
  sandbox_enabled,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Company',
  'demo-company',
  'Financial Services',
  'United States',
  'professional',
  'active',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_name = 'Demo Company',
  is_active = true;

-- Step 2: Ensure Admin user exists with proper company relationship
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
  email_verified_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001', -- Must match company ID
  'admin@democompany.com',
  'Admin',
  '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.', -- Password: Test
  'Demo',
  'Administrator',
  'primary_admin',
  true,
  true,
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_id = '00000000-0000-0000-0000-000000000001',
  password_hash = '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.',
  is_active = true,
  is_verified = true,
  username = 'Admin';

-- Step 3: Clean up any orphaned sessions for this user
DELETE FROM user_sessions
WHERE user_id = '00000000-0000-0000-0000-000000000002';

-- Step 4: Verify the fix by running the exact query that getCurrentUser uses
SELECT
  u.id,
  u.username,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.is_primary,
  u.is_active,
  u.company_id,
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

-- ============================================================================
-- SUCCESS VERIFICATION
-- ============================================================================
-- The query above should return:
-- ✓ id: 00000000-0000-0000-0000-000000000002
-- ✓ username: Admin
-- ✓ company_id: 00000000-0000-0000-0000-000000000001
-- ✓ companies: {...} (JSON object with company details, NOT null)
--
-- If companies is null, the issue is the LEFT JOIN failing
-- ============================================================================

-- ============================================================================
-- AFTER RUNNING THIS SCRIPT
-- ============================================================================
-- 1. Try logging in again with:
--    - Select: CLOE - Reporting
--    - Username: Admin
--    - Password: Test
--
-- 2. The login should now work and take you to the dashboard (/)
--
-- 3. If it still fails, check:
--    - .env file has SUPABASE_SERVICE_ROLE_KEY set correctly
--    - Supabase connection is working
--    - Check browser console for specific error messages
-- ============================================================================

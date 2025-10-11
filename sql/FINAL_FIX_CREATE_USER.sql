-- ============================================================================
-- FINAL FIX - Create Working Demo User
-- ============================================================================

-- STEP 1: Check what users currently exist
SELECT 'Current users:' as info;
SELECT id, username, email, is_active, company_id FROM users LIMIT 10;

-- STEP 2: Check what companies exist
SELECT 'Current companies:' as info;
SELECT id, company_name, company_slug FROM companies LIMIT 10;

-- STEP 3: Clean up any broken demo data
DELETE FROM user_sessions WHERE user_id IN (
  SELECT id FROM users WHERE username IN ('DemoAdmin', 'TestUser', 'test')
);
DELETE FROM users WHERE username IN ('DemoAdmin', 'TestUser', 'test');

-- STEP 4: Ensure demo company exists
INSERT INTO companies (company_name, company_slug, subscription_tier, subscription_status)
VALUES ('Test Company', 'test-company', 'professional', 'active')
ON CONFLICT (company_slug) DO UPDATE SET
  company_name = 'Test Company',
  subscription_status = 'active';

-- STEP 5: Create test user with EXACT password hash
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
  c.id,
  'test',
  'test@test.com',
  '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.',
  'Test',
  'User',
  'primary_admin',
  true,
  true,
  true,
  NOW(),
  0
FROM companies c
WHERE c.company_slug = 'test-company'
ON CONFLICT (company_id, username) DO UPDATE SET
  password_hash = '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.',
  is_active = true,
  is_verified = true,
  failed_login_attempts = 0,
  locked_until = NULL;

-- STEP 6: Verify the user was created correctly
SELECT 'Verification - User should appear below:' as info;
SELECT
  u.username,
  u.email,
  u.is_active,
  u.is_verified,
  c.company_name,
  LENGTH(u.password_hash) as password_hash_length
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'test';

-- ============================================================================
-- LOGIN CREDENTIALS
-- ============================================================================
-- Username: test
-- Password: Test
-- ============================================================================

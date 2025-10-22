-- ============================================================================
-- CREATE TEST USER FOR TESTING
-- ============================================================================
-- Run this in Supabase SQL Editor to create a test user
-- ============================================================================

-- Step 1: Create a test company (if not exists)
INSERT INTO companies (id, company_name, company_slug, subscription_status, production_enabled, sandbox_enabled)
VALUES (
  gen_random_uuid(),
  'Test Company',
  'test-company',
  'active',
  true,
  true
)
ON CONFLICT (company_slug) DO NOTHING
RETURNING id;

-- Step 2: Create a test user with password "test123"
-- Password hash for "test123" using bcrypt (10 rounds)
INSERT INTO users (
  company_id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_primary,
  is_active
)
SELECT
  c.id,
  'testuser',
  'test@test.com',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', -- "test123"
  'Test',
  'User',
  'primary_admin',
  true,
  true
FROM companies c
WHERE c.company_slug = 'test-company'
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash;

-- Step 3: Verify user was created
SELECT
  u.id,
  u.username,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'testuser';

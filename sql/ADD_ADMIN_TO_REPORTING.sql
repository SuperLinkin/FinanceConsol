-- ============================================================================
-- ADD ADMIN USER TO REPORTING MODULE (users table)
-- ============================================================================
-- This creates the Admin user in the users table so you can use the same
-- credentials (Admin/Test) for both CLOE - Reporting and Finance Close
-- ============================================================================

-- Insert Admin user into users table
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001', -- Demo Company ID
  'admin@democompany.com',
  'Admin',
  '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.', -- Password: Test
  'Admin',
  'User',
  'admin',
  false, -- Not primary (demo user is primary)
  true,
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (company_id, username) DO UPDATE SET
  password_hash = '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.',
  is_active = true;

-- Verify it was created
SELECT
  username,
  email,
  first_name,
  last_name,
  role,
  is_active
FROM users
WHERE username IN ('Admin', 'demo')
ORDER BY username;

-- ============================================================================
-- SUCCESS
-- ============================================================================
-- You should now see 2 users in the users table:
-- 1. Admin (admin@democompany.com) - Password: Test
-- 2. demo (demo@democo.com) - Password: Demo123!
--
-- Now you can log into CLOE - Reporting with EITHER:
-- - Username: Admin, Password: Test
-- - Username: demo, Password: Demo123!
-- ============================================================================

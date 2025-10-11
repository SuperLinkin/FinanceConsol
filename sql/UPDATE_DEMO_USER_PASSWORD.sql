-- ============================================================================
-- UPDATE DEMO USER PASSWORD
-- ============================================================================
-- This updates the existing Admin user's password to: Test
-- ============================================================================

UPDATE users
SET
  password_hash = '$2b$10$Nk5k164lP9iTidGbc/VC4.BAUOg/ja5gB6QwuJLpTGnfJJ.ea.SZ.',
  is_active = true,
  is_verified = true,
  email_verified_at = NOW(),
  failed_login_attempts = 0,
  locked_until = NULL
WHERE username = 'Admin';

-- Verify the update
SELECT
  u.id,
  u.username,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.is_active,
  u.is_verified,
  c.company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.username = 'Admin';

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Password updated successfully!
--
-- Login Credentials:
-- Username: Admin
-- Password: Test
-- ============================================================================

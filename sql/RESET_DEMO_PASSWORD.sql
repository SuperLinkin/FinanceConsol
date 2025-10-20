-- ============================================================================
-- RESET DEMO USER PASSWORD TO Test@123
-- ============================================================================
-- This resets the demo user password in the users table (Reporting module)
-- ============================================================================

-- Update demo user password
UPDATE users
SET
  password_hash = '$2b$10$wgSyl6s3yrnYiD4lTi2wROLKp54aqWZURz57h9c1Ptn9v7Rju.yyq',
  failed_login_attempts = 0,
  locked_until = NULL,
  updated_at = NOW()
WHERE username = 'demo';

-- Verify the update
SELECT
  username,
  email,
  is_active,
  failed_login_attempts,
  updated_at
FROM users
WHERE username = 'demo';

-- ============================================================================
-- SUCCESS
-- ============================================================================
-- Password has been reset to: Test@123
--
-- You can now log in to CLOE - Reporting with:
-- Username: demo
-- Password: Test@123
-- ============================================================================

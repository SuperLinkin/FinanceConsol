-- Update demo user password to Test@123
-- Run this in Supabase SQL Editor

UPDATE users
SET password_hash = '$2b$10$l5J.l8zhCXcWBsLvzAUX/eI7PQreBADaN5VWxX50o42fB66u3d72y'
WHERE username = 'demo';

-- Verify the update
SELECT
  id,
  username,
  email,
  role,
  is_active,
  company_id,
  LEFT(password_hash, 20) as password_hash_preview
FROM users
WHERE username = 'demo';

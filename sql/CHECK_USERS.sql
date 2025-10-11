-- Check all users in the database
SELECT
  id,
  username,
  email,
  first_name,
  last_name,
  role,
  is_active,
  is_verified,
  company_id,
  created_at
FROM users
ORDER BY created_at DESC;

-- Also check if there are any companies
SELECT
  id,
  company_name,
  company_slug,
  subscription_tier,
  subscription_status
FROM companies
ORDER BY created_at DESC;

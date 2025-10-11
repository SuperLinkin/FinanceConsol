-- ============================================================================
-- SIMPLE USER CREATION - GUARANTEED TO WORK
-- ============================================================================

-- Step 1: Create company (simple, no conflicts)
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Check if company exists
  SELECT id INTO v_company_id FROM companies WHERE company_slug = 'demo-test';

  -- Create if doesn't exist
  IF v_company_id IS NULL THEN
    INSERT INTO companies (company_name, company_slug, subscription_tier, subscription_status)
    VALUES ('Demo Test', 'demo-test', 'professional', 'active')
    RETURNING id INTO v_company_id;

    RAISE NOTICE 'Created new company with ID: %', v_company_id;
  ELSE
    RAISE NOTICE 'Using existing company with ID: %', v_company_id;
  END IF;

  -- Delete existing test user if any
  DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE username = 'testuser');
  DELETE FROM users WHERE username = 'testuser';

  -- Create new user
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
  ) VALUES (
    v_company_id,
    'testuser',
    'testuser@demo.com',
    '$2b$10$Elj9xhC7d.NU/UIf0MaQ4O58tu.Dk/wf1iotZ4FpGYdnoOz6qNcxW',
    'Test',
    'User',
    'primary_admin',
    true,
    true,
    true,
    NOW(),
    0
  );

  RAISE NOTICE 'Created user: testuser';
END $$;

-- Verify user was created
SELECT
  u.username,
  u.email,
  u.is_active,
  u.is_verified,
  c.company_name,
  LENGTH(u.password_hash) as hash_length
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.username = 'testuser';

-- ============================================================================
-- LOGIN CREDENTIALS:
-- Username: testuser
-- Password: Test
-- ============================================================================

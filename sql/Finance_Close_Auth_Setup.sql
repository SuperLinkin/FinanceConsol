-- =====================================================
-- FINANCE CLOSE MODULE - ISOLATED AUTHENTICATION SETUP
-- =====================================================
-- This file sets up authentication for the Finance Close module
-- This is completely separate from the Reporting module authentication
-- Run these commands in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Create the close_users table
-- =====================================================
-- This table stores user credentials for the Finance Close module only
-- It has NO foreign key relationships to any reporting module tables

CREATE TABLE IF NOT EXISTS public.close_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  full_name character varying NOT NULL,
  email character varying,
  company_name character varying NOT NULL,
  company_id uuid,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT close_users_pkey PRIMARY KEY (id)
);

-- =====================================================
-- STEP 2: Add indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_close_users_username ON public.close_users(username);
CREATE INDEX IF NOT EXISTS idx_close_users_is_active ON public.close_users(is_active);

-- =====================================================
-- STEP 3: Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.close_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create RLS Policies
-- =====================================================
-- Policy to allow service role to read all users (for authentication)
CREATE POLICY "Service role can read close_users"
  ON public.close_users
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Policy to allow service role to update users (for login tracking)
CREATE POLICY "Service role can update close_users"
  ON public.close_users
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- =====================================================
-- STEP 5: Insert Demo User
-- =====================================================
-- Demo credentials for Finance Close module
-- Username: close_demo
-- Password: Demo@2025
-- Company: Acme Corporation

INSERT INTO public.close_users (
  username,
  password_hash,
  full_name,
  email,
  company_name,
  company_id,
  is_active
)
VALUES (
  'close_demo',
  '$2b$10$Ff5ztFxWlasacnbPzApaWeklsSJ5X0wSro3D.0x3imRDj6O5Pqb6q',
  'Demo User',
  'demo@financeclose.com',
  'Acme Corporation',
  NULL,
  true
)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup worked correctly:

-- 1. Check if table was created
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'close_users'
);

-- 2. Check if demo user exists
SELECT username, full_name, email, company_name, is_active, created_at
FROM public.close_users
WHERE username = 'close_demo';

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'close_users';

-- =====================================================
-- ADDING ADDITIONAL USERS
-- =====================================================
-- To add more Finance Close users, use this template:

-- First, generate a password hash using bcrypt (in Node.js):
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('YourPasswordHere', 10).then(hash => console.log(hash));

-- Then insert the user:
-- INSERT INTO public.close_users (
--   username,
--   password_hash,
--   full_name,
--   email,
--   company_name,
--   is_active
-- )
-- VALUES (
--   'your_username',
--   'your_bcrypt_hash_here',
--   'Full Name',
--   'email@example.com',
--   'Company Name',
--   true
-- );

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- 1. This table is completely isolated from the reporting module (users table)
-- 2. Finance Close users cannot access reporting data
-- 3. Reporting users cannot access Finance Close
-- 4. Both modules use separate API endpoints:
--    - Reporting: /api/auth/login
--    - Finance Close: /api/auth/login-close
-- 5. Account lockout after 5 failed attempts (30 minutes)
-- 6. All passwords are hashed with bcrypt (10 rounds)
-- 7. RLS policies ensure only service role can access this table

-- =====================================================
-- CLEANUP (USE WITH CAUTION)
-- =====================================================
-- Only run these if you need to start over:

-- Drop all policies:
-- DROP POLICY IF EXISTS "Service role can read close_users" ON public.close_users;
-- DROP POLICY IF EXISTS "Service role can update close_users" ON public.close_users;

-- Drop the table (WARNING: This deletes all Finance Close users):
-- DROP TABLE IF EXISTS public.close_users CASCADE;

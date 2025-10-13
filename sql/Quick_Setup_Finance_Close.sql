-- =====================================================
-- QUICK SETUP FOR FINANCE CLOSE MODULE
-- =====================================================
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- Then click "Run" to set up the Finance Close authentication

-- Step 1: Create the table
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_close_users_username ON public.close_users(username);
CREATE INDEX IF NOT EXISTS idx_close_users_is_active ON public.close_users(is_active);

-- Step 3: Enable RLS
ALTER TABLE public.close_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can read close_users" ON public.close_users;
DROP POLICY IF EXISTS "Service role can update close_users" ON public.close_users;

-- Step 5: Create RLS Policies
CREATE POLICY "Service role can read close_users"
  ON public.close_users
  FOR SELECT
  USING (true);  -- Allow all reads for authentication

CREATE POLICY "Service role can update close_users"
  ON public.close_users
  FOR UPDATE
  USING (true);  -- Allow all updates for login tracking

-- Step 6: Insert demo user
-- Password: Demo@2025
INSERT INTO public.close_users (
  username,
  password_hash,
  full_name,
  email,
  company_name,
  is_active
)
VALUES (
  'close_demo',
  '$2b$10$Ff5ztFxWlasacnbPzApaWeklsSJ5X0wSro3D.0x3imRDj6O5Pqb6q',
  'Demo User',
  'demo@financeclose.com',
  'Acme Corporation',
  true
)
ON CONFLICT (username)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active;

-- Verification: Check if user was created
SELECT
  username,
  full_name,
  email,
  company_name,
  is_active,
  created_at
FROM public.close_users
WHERE username = 'close_demo';

-- You should see one row with username 'close_demo'
-- If you see this, the setup is complete!

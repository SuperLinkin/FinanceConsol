-- ============================================================================
-- MULTI-TENANT AUTHENTICATION & AUTHORIZATION SYSTEM
-- ============================================================================

-- Companies Table (Tenant Isolation)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL UNIQUE,
  company_slug VARCHAR(100) NOT NULL UNIQUE,
  industry VARCHAR(100),
  country VARCHAR(100),

  -- Subscription & Status
  subscription_tier VARCHAR(50) DEFAULT 'trial', -- 'trial', 'starter', 'professional', 'enterprise'
  subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  trial_ends_at TIMESTAMP WITH TIME ZONE,

  -- Environment Management
  production_enabled BOOLEAN DEFAULT true,
  sandbox_enabled BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb
);

-- Users Table (with Company Association)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Authentication
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,

  -- Role & Permissions
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'primary_admin', 'admin', 'manager', 'user', 'viewer'
  is_primary BOOLEAN DEFAULT false, -- Primary admin (at least 2 required)

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP WITH TIME ZONE,

  -- Security
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES users(id),

  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb,

  UNIQUE(company_id, email),
  UNIQUE(company_id, username)
);

-- User Invitations
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',

  -- Invitation Details
  invitation_token VARCHAR(255) NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES users(id),

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'cancelled'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(company_id, email)
);

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Session Details
  session_token TEXT NOT NULL UNIQUE,
  environment VARCHAR(50) DEFAULT 'production', -- 'production', 'sandbox'

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Tracking
  ip_address VARCHAR(50),
  user_agent TEXT,

  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions Table (Fine-grained access control)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50), -- 'entities', 'financials', 'reports', 'settings', 'users'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Audit Log (Track all actions for security)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Action Details
  action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'view'
  resource_type VARCHAR(100), -- 'entity', 'trial_balance', 'user', etc.
  resource_id UUID,

  -- Context
  environment VARCHAR(50),
  ip_address VARCHAR(50),
  user_agent TEXT,

  -- Changes
  old_values JSONB,
  new_values JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON user_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON user_invitations(status);

CREATE INDEX IF NOT EXISTS idx_audit_log_company_id ON audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default company
INSERT INTO companies (id, company_name, company_slug, subscription_tier, subscription_status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme Corporation', 'acme-corporation', 'enterprise', 'active')
ON CONFLICT DO NOTHING;

-- Insert default admin user (Username: Admin, Password: Test)
-- Password hash for 'Test' using bcrypt
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
  email_verified_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@acme.com',
  'Admin',
  '$2b$10$Wpk9hFF.T7ybVHV.syUqqetX4Lh.wWfFgduybjRgAkBem/eBxLWnq', -- Hash for 'Test'
  'Admin',
  'User',
  'primary_admin',
  true,
  true,
  true,
  NOW()
)
ON CONFLICT DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, category) VALUES
('view_dashboard', 'View dashboard', 'dashboard'),
('manage_entities', 'Create, edit, delete entities', 'entities'),
('view_entities', 'View entities', 'entities'),
('manage_chart_of_accounts', 'Manage chart of accounts', 'financials'),
('view_chart_of_accounts', 'View chart of accounts', 'financials'),
('upload_trial_balance', 'Upload trial balance data', 'financials'),
('view_trial_balance', 'View trial balance', 'financials'),
('manage_translations', 'Manage translation rules', 'financials'),
('view_translations', 'View translations', 'financials'),
('manage_eliminations', 'Manage elimination rules', 'financials'),
('view_eliminations', 'View eliminations', 'financials'),
('run_consolidation', 'Run consolidation process', 'consolidation'),
('view_consolidation', 'View consolidation results', 'consolidation'),
('generate_reports', 'Generate financial reports', 'reports'),
('view_reports', 'View reports', 'reports'),
('manage_users', 'Invite and manage users', 'users'),
('view_users', 'View users', 'users'),
('manage_company_settings', 'Manage company settings', 'settings'),
('view_company_settings', 'View company settings', 'settings')
ON CONFLICT DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id)
SELECT 'primary_admin', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions WHERE name NOT IN ('manage_company_settings')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'manager', id FROM permissions
WHERE category IN ('dashboard', 'financials', 'consolidation', 'reports')
  AND name NOT LIKE 'manage_%'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'user', id FROM permissions
WHERE name LIKE 'view_%'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'viewer', id FROM permissions
WHERE name IN ('view_dashboard', 'view_reports', 'view_trial_balance')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE companies IS 'Tenant companies using the platform';
COMMENT ON TABLE users IS 'Users with company association and role-based access';
COMMENT ON TABLE user_invitations IS 'Pending user invitations';
COMMENT ON TABLE user_sessions IS 'Active user sessions with environment context';
COMMENT ON TABLE permissions IS 'Fine-grained permissions';
COMMENT ON TABLE role_permissions IS 'Role to permission mappings';
COMMENT ON TABLE audit_log IS 'Audit trail for security and compliance';

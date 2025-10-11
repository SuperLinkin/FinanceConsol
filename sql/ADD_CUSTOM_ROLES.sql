-- ============================================================================
-- ADD CUSTOM ROLES AND PERMISSIONS SYSTEM
-- ============================================================================
-- This script adds support for custom roles with granular permissions
-- Run this after the main database setup
-- ============================================================================

-- Create custom_roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role_name VARCHAR(100) NOT NULL,
  role_slug VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, role_slug)
);

-- Create permission_categories table
CREATE TABLE IF NOT EXISTS permission_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table (master list of all possible permissions)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name VARCHAR(100) NOT NULL,
  permission_slug VARCHAR(100) NOT NULL,
  category_id UUID REFERENCES permission_categories(id) ON DELETE SET NULL,
  description TEXT,
  is_system_permission BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_permission_name UNIQUE(permission_name),
  CONSTRAINT unique_permission_slug UNIQUE(permission_slug)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_role_id UUID REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(custom_role_id, permission_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_custom_roles_company ON custom_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_slug ON custom_roles(role_slug);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(custom_role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON role_permissions(permission_id);

-- Enable RLS
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_roles
DROP POLICY IF EXISTS "Users can view custom roles in their company" ON custom_roles;
CREATE POLICY "Users can view custom roles in their company" ON custom_roles
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = (
        SELECT user_id FROM user_sessions
        WHERE session_token = current_setting('app.current_session_token', true)
        AND is_active = true
        AND expires_at > now()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage custom roles" ON custom_roles;
CREATE POLICY "Admins can manage custom roles" ON custom_roles
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = (
        SELECT user_id FROM user_sessions
        WHERE session_token = current_setting('app.current_session_token', true)
        AND is_active = true
        AND expires_at > now()
      )
      AND role IN ('primary_admin', 'admin')
    )
  );

-- RLS Policies for permissions (everyone can read, only system can write)
DROP POLICY IF EXISTS "Anyone can view permissions" ON permissions;
CREATE POLICY "Anyone can view permissions" ON permissions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can view permission categories" ON permission_categories;
CREATE POLICY "Anyone can view permission categories" ON permission_categories
  FOR SELECT
  USING (true);

-- RLS Policies for role_permissions
DROP POLICY IF EXISTS "Users can view role permissions" ON role_permissions;
CREATE POLICY "Users can view role permissions" ON role_permissions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;
CREATE POLICY "Admins can manage role permissions" ON role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM custom_roles cr
      JOIN users u ON cr.company_id = u.company_id
      WHERE cr.id = role_permissions.custom_role_id
      AND u.id = (
        SELECT user_id FROM user_sessions
        WHERE session_token = current_setting('app.current_session_token', true)
        AND is_active = true
        AND expires_at > now()
      )
      AND u.role IN ('primary_admin', 'admin')
    )
  );

-- Insert permission categories
INSERT INTO permission_categories (category_name, description, display_order) VALUES
  ('User Management', 'Permissions related to managing users and roles', 1),
  ('Financial Data', 'Permissions for viewing and managing financial data', 2),
  ('Reports', 'Permissions for generating and viewing reports', 3),
  ('Settings', 'Permissions for managing system settings', 4),
  ('Consolidation', 'Permissions for consolidation workflows', 5),
  ('Data Upload', 'Permissions for uploading data', 6)
ON CONFLICT (category_name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'View Users', 'view_users', id, 'Can view list of users in the company', true
FROM permission_categories WHERE category_name = 'User Management'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Manage Users', 'manage_users', id, 'Can create, edit, and delete users', true
FROM permission_categories WHERE category_name = 'User Management'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Manage Roles', 'manage_roles', id, 'Can create and manage custom roles', true
FROM permission_categories WHERE category_name = 'User Management'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'View Trial Balance', 'view_trial_balance', id, 'Can view trial balance data', true
FROM permission_categories WHERE category_name = 'Financial Data'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Edit Trial Balance', 'edit_trial_balance', id, 'Can edit trial balance data', true
FROM permission_categories WHERE category_name = 'Financial Data'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Upload Trial Balance', 'upload_trial_balance', id, 'Can upload trial balance files', true
FROM permission_categories WHERE category_name = 'Data Upload'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'View Chart of Accounts', 'view_coa', id, 'Can view chart of accounts', true
FROM permission_categories WHERE category_name = 'Financial Data'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Edit Chart of Accounts', 'edit_coa', id, 'Can edit chart of accounts', true
FROM permission_categories WHERE category_name = 'Financial Data'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'View Reports', 'view_reports', id, 'Can view financial reports', true
FROM permission_categories WHERE category_name = 'Reports'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Generate Reports', 'generate_reports', id, 'Can generate new financial reports', true
FROM permission_categories WHERE category_name = 'Reports'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Export Reports', 'export_reports', id, 'Can export reports to various formats', true
FROM permission_categories WHERE category_name = 'Reports'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'View Settings', 'view_settings', id, 'Can view system settings', true
FROM permission_categories WHERE category_name = 'Settings'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Edit Settings', 'edit_settings', id, 'Can modify system settings', true
FROM permission_categories WHERE category_name = 'Settings'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Perform Consolidation', 'perform_consolidation', id, 'Can run consolidation processes', true
FROM permission_categories WHERE category_name = 'Consolidation'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'View Consolidation', 'view_consolidation', id, 'Can view consolidation results', true
FROM permission_categories WHERE category_name = 'Consolidation'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'Manage Entities', 'manage_entities', id, 'Can create and manage entities', true
FROM permission_categories WHERE category_name = 'Settings'
ON CONFLICT (permission_slug) DO NOTHING;

INSERT INTO permissions (permission_name, permission_slug, category_id, description, is_system_permission)
SELECT
  'View Entities', 'view_entities', id, 'Can view entity information', true
FROM permission_categories WHERE category_name = 'Settings'
ON CONFLICT (permission_slug) DO NOTHING;

-- Insert system roles as custom_roles (for each company that exists)
-- This allows them to appear in the UI with their permissions
DO $$
DECLARE
  comp RECORD;
  role_id UUID;
  perm RECORD;
BEGIN
  FOR comp IN SELECT id FROM companies LOOP
    -- Primary Admin
    INSERT INTO custom_roles (company_id, role_name, role_slug, description, is_system_role)
    VALUES (comp.id, 'Primary Admin', 'primary_admin', 'Full system access, cannot be modified', true)
    ON CONFLICT (company_id, role_slug) DO NOTHING
    RETURNING id INTO role_id;

    IF role_id IS NOT NULL THEN
      -- Grant all permissions to primary admin
      INSERT INTO role_permissions (custom_role_id, permission_id)
      SELECT role_id, id FROM permissions
      ON CONFLICT (custom_role_id, permission_id) DO NOTHING;
    END IF;

    -- Admin
    INSERT INTO custom_roles (company_id, role_name, role_slug, description, is_system_role)
    VALUES (comp.id, 'Administrator', 'admin', 'Can manage users and settings', true)
    ON CONFLICT (company_id, role_slug) DO NOTHING
    RETURNING id INTO role_id;

    IF role_id IS NOT NULL THEN
      -- Grant most permissions to admin (all except some primary admin only)
      INSERT INTO role_permissions (custom_role_id, permission_id)
      SELECT role_id, id FROM permissions
      WHERE permission_slug != 'edit_settings' -- Example restriction
      ON CONFLICT (custom_role_id, permission_id) DO NOTHING;
    END IF;

    -- Manager
    INSERT INTO custom_roles (company_id, role_name, role_slug, description, is_system_role)
    VALUES (comp.id, 'Manager', 'manager', 'Can manage financial data and reports', true)
    ON CONFLICT (company_id, role_slug) DO NOTHING
    RETURNING id INTO role_id;

    IF role_id IS NOT NULL THEN
      INSERT INTO role_permissions (custom_role_id, permission_id)
      SELECT role_id, id FROM permissions
      WHERE permission_slug IN (
        'view_trial_balance', 'edit_trial_balance', 'upload_trial_balance',
        'view_coa', 'edit_coa', 'view_reports', 'generate_reports',
        'export_reports', 'perform_consolidation', 'view_consolidation',
        'view_entities', 'view_settings'
      )
      ON CONFLICT (custom_role_id, permission_id) DO NOTHING;
    END IF;

    -- User
    INSERT INTO custom_roles (company_id, role_name, role_slug, description, is_system_role)
    VALUES (comp.id, 'User', 'user', 'Can view and edit assigned data', true)
    ON CONFLICT (company_id, role_slug) DO NOTHING
    RETURNING id INTO role_id;

    IF role_id IS NOT NULL THEN
      INSERT INTO role_permissions (custom_role_id, permission_id)
      SELECT role_id, id FROM permissions
      WHERE permission_slug IN (
        'view_trial_balance', 'view_coa', 'view_reports',
        'view_consolidation', 'view_entities'
      )
      ON CONFLICT (custom_role_id, permission_id) DO NOTHING;
    END IF;

    -- Viewer
    INSERT INTO custom_roles (company_id, role_name, role_slug, description, is_system_role)
    VALUES (comp.id, 'Viewer', 'viewer', 'Read-only access', true)
    ON CONFLICT (company_id, role_slug) DO NOTHING
    RETURNING id INTO role_id;

    IF role_id IS NOT NULL THEN
      INSERT INTO role_permissions (custom_role_id, permission_id)
      SELECT role_id, id FROM permissions
      WHERE permission_slug IN ('view_trial_balance', 'view_coa', 'view_reports', 'view_entities')
      ON CONFLICT (custom_role_id, permission_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Add comments
COMMENT ON TABLE custom_roles IS 'Custom and system roles defined per company';
COMMENT ON TABLE permissions IS 'Master list of all available permissions';
COMMENT ON TABLE permission_categories IS 'Categorization of permissions for UI organization';
COMMENT ON TABLE role_permissions IS 'Junction table mapping roles to permissions';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Custom roles and permissions system created successfully!';
  RAISE NOTICE 'Created permission categories, permissions, and migrated system roles.';
END $$;

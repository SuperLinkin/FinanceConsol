-- ============================================================================
-- COMPLETE DATABASE SETUP FOR FINANCIAL CONSOLIDATION APPLICATION
-- ============================================================================
-- This script drops all existing tables and recreates them with the correct
-- structure based on the application requirements.
--
-- IMPORTANT: This will DELETE ALL DATA. Use with caution.
-- ============================================================================

-- Drop all custom types first (this will cascade drop dependent tables)
DROP TYPE IF EXISTS entry_status CASCADE;
DROP TYPE IF EXISTS period_status CASCADE;
DROP TYPE IF EXISTS statement_type CASCADE;
DROP TYPE IF EXISTS entity_type CASCADE;
DROP TYPE IF EXISTS ownership_type CASCADE;
DROP TYPE IF EXISTS consolidation_method CASCADE;

-- Drop all tables in correct order (respecting foreign key constraints)
-- Use CASCADE to automatically drop dependent objects
DROP TABLE IF EXISTS consolidation_changes CASCADE;
DROP TABLE IF EXISTS report_changes CASCADE;
DROP TABLE IF EXISTS report_versions CASCADE;
DROP TABLE IF EXISTS report_notes CASCADE;
DROP TABLE IF EXISTS financial_reports CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS validation_results CASCADE;
DROP TABLE IF EXISTS validation_checks CASCADE;
DROP TABLE IF EXISTS entity_logic_assignments CASCADE;
DROP TABLE IF EXISTS entity_logic CASCADE;
DROP TABLE IF EXISTS entity_gl_mapping CASCADE;
DROP TABLE IF EXISTS intercompany_transactions CASCADE;
DROP TABLE IF EXISTS translation_adjustments CASCADE;
DROP TABLE IF EXISTS translation_rules CASCADE;
DROP TABLE IF EXISTS elimination_entries CASCADE;
DROP TABLE IF EXISTS elimination_templates CASCADE;
DROP TABLE IF EXISTS eliminations CASCADE;
DROP TABLE IF EXISTS adjustment_entries CASCADE;
DROP TABLE IF EXISTS builder_entries CASCADE;
DROP TABLE IF EXISTS consolidation_workings CASCADE;
DROP TABLE IF EXISTS trial_balance CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS coa_master_hierarchy CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS accounting_policies CASCADE;
DROP TABLE IF EXISTS financial_notes CASCADE;
DROP TABLE IF EXISTS reporting_periods CASCADE;
DROP TABLE IF EXISTS system_parameters CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_invitations CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS custom_roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS permission_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS entity_controllers CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
DROP TABLE IF EXISTS world_currencies CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- CREATE CUSTOM TYPES
-- ============================================================================

CREATE TYPE entry_status AS ENUM ('Draft', 'Approved', 'Posted', 'Cancelled');
CREATE TYPE period_status AS ENUM ('Open', 'Closed', 'Locked');
CREATE TYPE statement_type AS ENUM ('Balance Sheet', 'Income Statement', 'Cash Flow');
CREATE TYPE entity_type AS ENUM ('Ultimate Parent', 'Parent', 'Subsidiary', 'Joint Venture', 'Associate', 'Branch');
CREATE TYPE ownership_type AS ENUM ('Direct', 'Indirect');
CREATE TYPE consolidation_method AS ENUM ('Full Consolidation', 'Equity Method', 'Proportionate Consolidation', 'Cost Method');

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Companies table (multi-tenant support)
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name varchar NOT NULL UNIQUE,
  company_slug varchar NOT NULL UNIQUE,
  industry varchar,
  country varchar,
  subscription_tier varchar DEFAULT 'trial',
  subscription_status varchar DEFAULT 'active',
  trial_ends_at timestamptz,
  production_enabled boolean DEFAULT true,
  sandbox_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  settings jsonb DEFAULT '{}'::jsonb
);

-- World Currencies (static reference data)
CREATE TABLE world_currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code text NOT NULL UNIQUE,
  currency_name text NOT NULL,
  symbol text,
  decimal_places integer DEFAULT 2,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Currencies (active currencies for consolidation)
CREATE TABLE currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code text NOT NULL UNIQUE,
  currency_name text NOT NULL,
  symbol text,
  is_presentation_currency boolean DEFAULT false,
  is_functional_currency boolean DEFAULT false,
  is_group_reporting_currency boolean DEFAULT false,
  exchange_rate numeric DEFAULT 1.0,
  rate_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Entity Controllers
CREATE TABLE entity_controllers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT 'Entity Controller',
  email text UNIQUE,
  reporting_to uuid REFERENCES entity_controllers(id),
  is_ultimate_owner boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES companies(id)
);

-- Regions
CREATE TABLE regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code text NOT NULL UNIQUE,
  region_name text NOT NULL,
  description text,
  associated_currency text,
  parent_region_id uuid REFERENCES regions(id),
  controller_id uuid REFERENCES entity_controllers(id),
  reporting_calendar text DEFAULT 'Jan-Dec',
  regulatory_framework text DEFAULT 'IFRS',
  intra_region_netting boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  company_id uuid REFERENCES companies(id),
  is_active boolean DEFAULT true
);

-- Entities
CREATE TABLE entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_code text NOT NULL UNIQUE,
  entity_name text NOT NULL,
  entity_type entity_type NOT NULL,
  parent_entity_id uuid REFERENCES entities(id),
  region_id uuid REFERENCES regions(id),
  controller_id uuid REFERENCES entity_controllers(id),
  ownership_percentage numeric CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  ownership_type ownership_type DEFAULT 'Direct',
  consolidation_method consolidation_method DEFAULT 'Full Consolidation',
  split_ownership jsonb,
  functional_currency text,
  presentation_currency text,
  acquisition_date date,
  reporting_start_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tax_jurisdiction text,
  financial_year_end text,
  status text DEFAULT 'Active',
  notes text,
  include_in_consolidation boolean DEFAULT true,
  company_id uuid REFERENCES companies(id)
);

-- Users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  email varchar NOT NULL,
  username varchar NOT NULL,
  password_hash varchar NOT NULL,
  first_name varchar,
  last_name varchar,
  phone varchar,
  avatar_url text,
  role varchar NOT NULL DEFAULT 'user',
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  email_verified_at timestamptz,
  last_login_at timestamptz,
  password_reset_token varchar,
  password_reset_expires timestamptz,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES users(id),
  preferences jsonb DEFAULT '{}'::jsonb,
  UNIQUE(company_id, email),
  UNIQUE(company_id, username)
);

-- Permission Categories
CREATE TABLE permission_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name varchar NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Permissions
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name varchar NOT NULL UNIQUE,
  permission_slug varchar NOT NULL UNIQUE,
  category_id uuid REFERENCES permission_categories(id),
  description text,
  is_system_permission boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Custom Roles
CREATE TABLE custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  role_name varchar NOT NULL,
  role_slug varchar NOT NULL,
  description text,
  is_system_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, role_slug)
);

-- Role Permissions
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_role_id uuid REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(custom_role_id, permission_id)
);

-- User Invitations
CREATE TABLE user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  email varchar NOT NULL,
  role varchar NOT NULL DEFAULT 'user',
  invitation_token varchar NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES users(id),
  status varchar DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User Sessions
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id),
  session_token text NOT NULL UNIQUE,
  environment varchar DEFAULT 'production',
  is_active boolean DEFAULT true,
  ip_address varchar,
  user_agent text,
  expires_at timestamptz NOT NULL,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- System Parameters
CREATE TABLE system_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_category text NOT NULL,
  parameter_key text NOT NULL,
  parameter_value text,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by text,
  UNIQUE(parameter_category, parameter_key)
);

-- Reporting Periods
CREATE TABLE reporting_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  fiscal_year integer,
  fiscal_quarter integer,
  fiscal_month integer,
  status period_status DEFAULT 'Open',
  is_year_end boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  locked_by uuid REFERENCES entity_controllers(id),
  locked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Financial Notes
CREATE TABLE financial_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_number varchar NOT NULL,
  note_title varchar NOT NULL,
  note_type varchar NOT NULL DEFAULT 'Text',
  note_content text NOT NULL,
  note_order integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting Policies
CREATE TABLE accounting_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_title varchar NOT NULL,
  policy_category varchar NOT NULL,
  policy_content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exchange Rates
CREATE TABLE exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate numeric NOT NULL CHECK (rate > 0),
  rate_date date NOT NULL,
  rate_type text DEFAULT 'Spot',
  source text,
  created_at timestamptz DEFAULT now()
);

-- COA Master Hierarchy
CREATE TABLE coa_master_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name text NOT NULL,
  class_code text,
  subclass_name text NOT NULL,
  subclass_code text,
  note_name text,
  note_code text,
  note_number integer,
  subnote_name text,
  subnote_code text,
  statement_type statement_type NOT NULL,
  normal_balance text CHECK (normal_balance IN ('Debit', 'Credit')),
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chart of Accounts
CREATE TABLE chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES entities(id),
  account_code text NOT NULL,
  account_name text NOT NULL,
  class_name text,
  subclass_name text,
  note_name text,
  subnote_name text,
  account_type text,
  normal_balance text CHECK (normal_balance IN ('Debit', 'Credit')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  to_be_eliminated boolean DEFAULT false
);

-- Trial Balance
CREATE TABLE trial_balance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id),
  account_code text NOT NULL,
  account_name text NOT NULL,
  debit numeric DEFAULT 0,
  credit numeric DEFAULT 0,
  currency text,
  period date NOT NULL,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now()
);

-- Consolidation Workings
CREATE TABLE consolidation_workings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period date NOT NULL,
  statement_type statement_type NOT NULL,
  account_code text NOT NULL,
  account_name text,
  class_name text,
  subclass_name text,
  note_name text,
  subnote_name text,
  entity_amounts jsonb,
  elimination_amount numeric DEFAULT 0,
  adjustment_amount numeric DEFAULT 0,
  translation_amount numeric DEFAULT 0,
  consolidated_amount numeric,
  calculated_at timestamptz DEFAULT now()
);

-- Builder Entries (Adjustment Journal)
CREATE TABLE builder_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_name varchar NOT NULL,
  entry_type varchar NOT NULL,
  description text,
  entries jsonb DEFAULT '[]'::jsonb,
  total_debit numeric DEFAULT 0,
  total_credit numeric DEFAULT 0,
  period date,
  status varchar DEFAULT 'Draft',
  is_active boolean DEFAULT true,
  created_by varchar,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Adjustment Entries
CREATE TABLE adjustment_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text UNIQUE,
  description text NOT NULL,
  adjustment_type text,
  period date NOT NULL,
  status entry_status DEFAULT 'Draft',
  debit_account text NOT NULL,
  credit_account text NOT NULL,
  amount numeric NOT NULL,
  currency text,
  entity_id uuid REFERENCES entities(id),
  created_by text,
  created_at timestamptz DEFAULT now(),
  approved_by text,
  approved_at timestamptz,
  notes text
);

-- Eliminations
CREATE TABLE eliminations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elimination_name varchar NOT NULL,
  entity_1_id uuid REFERENCES entities(id),
  entity_2_id uuid REFERENCES entities(id),
  template_id varchar,
  entries jsonb DEFAULT '[]'::jsonb,
  description text,
  total_amount numeric DEFAULT 0,
  period date,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Elimination Templates
CREATE TABLE elimination_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name varchar NOT NULL,
  template_description text,
  template_entries jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Elimination Entries
CREATE TABLE elimination_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text UNIQUE,
  description text NOT NULL,
  elimination_type text,
  period date NOT NULL,
  status entry_status DEFAULT 'Draft',
  debit_account text NOT NULL,
  credit_account text NOT NULL,
  amount numeric NOT NULL,
  currency text,
  entity_from uuid REFERENCES entities(id),
  entity_to uuid REFERENCES entities(id),
  created_by text,
  created_at timestamptz DEFAULT now(),
  approved_by text,
  approved_at timestamptz,
  notes text
);

-- Translation Rules
CREATE TABLE translation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES entities(id),
  rule_name varchar NOT NULL,
  from_currency varchar NOT NULL,
  to_currency varchar NOT NULL,
  applies_to varchar DEFAULT 'All',
  class_name varchar,
  gl_account_code varchar,
  rate_type varchar NOT NULL CHECK (rate_type IN ('Closing Rate', 'Average Rate', 'Historical Rate', 'Opening Rate')),
  rate_value numeric,
  fctr_account varchar,
  description text,
  accounting_standard varchar DEFAULT 'IFRS',
  priority integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Translation Adjustments
CREATE TABLE translation_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id),
  account_code text NOT NULL,
  period date NOT NULL,
  functional_amount numeric,
  functional_currency text,
  translated_amount numeric,
  translated_currency text,
  exchange_rate numeric,
  translation_method text,
  adjustment_amount numeric,
  cumulative_adjustment numeric,
  created_at timestamptz DEFAULT now()
);

-- Intercompany Transactions
CREATE TABLE intercompany_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number text,
  transaction_date date NOT NULL,
  from_entity_id uuid NOT NULL REFERENCES entities(id),
  to_entity_id uuid NOT NULL REFERENCES entities(id),
  transaction_type text,
  amount numeric NOT NULL,
  currency text,
  from_account text,
  to_account text,
  is_eliminated boolean DEFAULT false,
  elimination_entry_id uuid REFERENCES elimination_entries(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Entity GL Mapping
CREATE TABLE entity_gl_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id),
  entity_gl_code varchar NOT NULL,
  entity_gl_name varchar,
  master_gl_code varchar NOT NULL,
  mapped_by varchar,
  mapped_at timestamp DEFAULT now(),
  is_active boolean DEFAULT true,
  notes text
);

-- Entity Logic
CREATE TABLE entity_logic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logic_key varchar NOT NULL UNIQUE,
  logic_name varchar NOT NULL,
  logic_type varchar NOT NULL,
  description text,
  configuration jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Entity Logic Assignments
CREATE TABLE entity_logic_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logic_id uuid NOT NULL REFERENCES entity_logic(id),
  entity_id uuid NOT NULL REFERENCES entities(id),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Validation Checks
CREATE TABLE validation_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name varchar NOT NULL,
  check_type varchar NOT NULL,
  category varchar,
  description text,
  formula text,
  severity varchar DEFAULT 'error',
  is_active boolean DEFAULT true,
  applies_to varchar,
  created_by varchar,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Validation Results
CREATE TABLE validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id uuid REFERENCES validation_checks(id),
  working_id uuid,
  period varchar NOT NULL,
  check_name varchar NOT NULL,
  status varchar NOT NULL,
  expected_value text,
  actual_value text,
  variance text,
  message text,
  checked_at timestamp DEFAULT now()
);

-- Report Templates
CREATE TABLE report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name varchar NOT NULL,
  template_type varchar DEFAULT 'standard',
  description text,
  structure jsonb,
  styles jsonb,
  is_default boolean DEFAULT false,
  created_by varchar,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Financial Reports
CREATE TABLE financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name varchar NOT NULL,
  period varchar NOT NULL,
  template_id uuid REFERENCES report_templates(id),
  working_id uuid,
  content jsonb NOT NULL,
  status varchar DEFAULT 'draft',
  version integer DEFAULT 1,
  header text,
  footer text,
  custom_styles jsonb,
  created_by varchar,
  created_at timestamp DEFAULT now(),
  updated_by varchar,
  updated_at timestamp DEFAULT now()
);

-- Report Notes
CREATE TABLE report_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES financial_reports(id) ON DELETE CASCADE,
  note_number integer NOT NULL,
  note_title varchar NOT NULL,
  note_content text NOT NULL,
  linked_accounts jsonb,
  working_reference varchar,
  display_order integer DEFAULT 0,
  created_by varchar,
  created_at timestamp DEFAULT now(),
  updated_by varchar,
  updated_at timestamp DEFAULT now()
);

-- Report Versions
CREATE TABLE report_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES financial_reports(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  snapshot_type varchar DEFAULT 'auto',
  comment text,
  created_by varchar,
  created_at timestamp DEFAULT now()
);

-- Report Changes
CREATE TABLE report_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES financial_reports(id) ON DELETE CASCADE,
  version integer NOT NULL,
  section varchar,
  change_type varchar,
  field_changed varchar,
  old_value text,
  new_value text,
  description text,
  changed_by varchar,
  changed_at timestamp DEFAULT now(),
  ip_address varchar
);

-- Consolidation Changes
CREATE TABLE consolidation_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  working_id uuid,
  period varchar NOT NULL,
  statement_type varchar NOT NULL,
  line_item_id varchar NOT NULL,
  account_code varchar,
  account_name varchar,
  field_changed varchar,
  old_value text,
  new_value text,
  change_type varchar,
  changed_by varchar,
  changed_at timestamp DEFAULT now(),
  ip_address varchar,
  user_agent text
);

-- Audit Log
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  user_id uuid REFERENCES users(id),
  action varchar NOT NULL,
  resource_type varchar,
  resource_id uuid,
  environment varchar,
  ip_address varchar,
  user_agent text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_entities_company ON entities(company_id);
CREATE INDEX idx_entities_parent ON entities(parent_entity_id);
CREATE INDEX idx_entities_code ON entities(entity_code);
CREATE INDEX idx_trial_balance_entity_period ON trial_balance(entity_id, period);
CREATE INDEX idx_trial_balance_period ON trial_balance(period);
CREATE INDEX idx_trial_balance_account ON trial_balance(account_code);
CREATE INDEX idx_coa_entity ON chart_of_accounts(entity_id);
CREATE INDEX idx_coa_account ON chart_of_accounts(account_code);
CREATE INDEX idx_coa_class ON chart_of_accounts(class_name);
CREATE INDEX idx_consolidation_period ON consolidation_workings(period);
CREATE INDEX idx_translation_rules_entity ON translation_rules(entity_id);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_elimination_entries_period ON elimination_entries(period);
CREATE INDEX idx_adjustment_entries_period ON adjustment_entries(period);
CREATE INDEX idx_regions_company ON regions(company_id);
CREATE INDEX idx_entity_controllers_company ON entity_controllers(company_id);

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert Demo Company
INSERT INTO companies (id, company_name, company_slug, industry, country, subscription_tier, subscription_status, production_enabled, sandbox_enabled, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Corporation', 'demo-corp', 'Financial Services', 'United States', 'professional', 'active', true, true, now());

-- Insert World Currencies (Top 20 most used)
INSERT INTO world_currencies (currency_code, currency_name, symbol, decimal_places, is_active) VALUES
  ('USD', 'US Dollar', '$', 2, true),
  ('EUR', 'Euro', '€', 2, true),
  ('GBP', 'British Pound', '£', 2, true),
  ('JPY', 'Japanese Yen', '¥', 0, true),
  ('CHF', 'Swiss Franc', 'CHF', 2, true),
  ('CAD', 'Canadian Dollar', 'C$', 2, true),
  ('AUD', 'Australian Dollar', 'A$', 2, true),
  ('NZD', 'New Zealand Dollar', 'NZ$', 2, true),
  ('CNY', 'Chinese Yuan', '¥', 2, true),
  ('INR', 'Indian Rupee', '₹', 2, true),
  ('SGD', 'Singapore Dollar', 'S$', 2, true),
  ('HKD', 'Hong Kong Dollar', 'HK$', 2, true),
  ('SEK', 'Swedish Krona', 'kr', 2, true),
  ('NOK', 'Norwegian Krone', 'kr', 2, true),
  ('DKK', 'Danish Krone', 'kr', 2, true),
  ('AED', 'UAE Dirham', 'د.إ', 2, true),
  ('SAR', 'Saudi Riyal', '﷼', 2, true),
  ('ZAR', 'South African Rand', 'R', 2, true),
  ('MXN', 'Mexican Peso', 'Mex$', 2, true),
  ('BRL', 'Brazilian Real', 'R$', 2, true);

-- Insert Active Currencies for Demo Company
INSERT INTO currencies (currency_code, currency_name, symbol, is_group_reporting_currency, is_active) VALUES
  ('USD', 'US Dollar', '$', true, true),
  ('EUR', 'Euro', '€', false, true),
  ('GBP', 'British Pound', '£', false, true);

-- Insert Demo User (password: Demo123!)
-- Password hash for 'Demo123!' using bcrypt
-- Generated hash: $2b$10$NQ0.SEIn1UVSv2siR5fTI.e69ZL1Zpl2B2L80wSST5rDb3O6BfBp.
INSERT INTO users (
  id, company_id, email, username, password_hash, first_name, last_name,
  role, is_primary, is_active, is_verified, email_verified_at, created_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'demo@democo.com',
  'demo',
  '$2b$10$NQ0.SEIn1UVSv2siR5fTI.e69ZL1Zpl2B2L80wSST5rDb3O6BfBp.',
  'Demo',
  'User',
  'admin',
  true,
  true,
  true,
  now(),
  now()
);

-- Insert Demo Entity Controller
INSERT INTO entity_controllers (id, name, role, email, is_ultimate_owner, is_active, company_id) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Demo Controller', 'Group Controller', 'controller@democo.com', true, true, '00000000-0000-0000-0000-000000000001');

-- Insert Demo Region
INSERT INTO regions (id, region_code, region_name, description, associated_currency, regulatory_framework, is_active, company_id) VALUES
  ('00000000-0000-0000-0000-000000000004', 'NA', 'North America', 'North American entities', 'USD', 'US GAAP', true, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000005', 'EU', 'Europe', 'European entities', 'EUR', 'IFRS', true, '00000000-0000-0000-0000-000000000001');

-- Insert Demo Entities
INSERT INTO entities (
  id, entity_code, entity_name, entity_type, parent_entity_id, region_id,
  controller_id, ownership_percentage, functional_currency, presentation_currency,
  status, include_in_consolidation, company_id, is_active
) VALUES
  (
    '00000000-0000-0000-0000-000000000006',
    'PARENT',
    'Demo Parent Corporation',
    'Ultimate Parent',
    NULL,
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    0,
    'USD',
    'USD',
    'Active',
    true,
    '00000000-0000-0000-0000-000000000001',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'SUB-US',
    'Demo US Subsidiary Inc',
    'Subsidiary',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    100,
    'USD',
    'USD',
    'Active',
    true,
    '00000000-0000-0000-0000-000000000001',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'SUB-EU',
    'Demo Europe Subsidiary BV',
    'Subsidiary',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    100,
    'EUR',
    'USD',
    'Active',
    true,
    '00000000-0000-0000-0000-000000000001',
    true
  );

-- Insert COA Master Hierarchy (IFRS Standard Classes)
INSERT INTO coa_master_hierarchy (class_name, subclass_name, statement_type, normal_balance, display_order) VALUES
  ('Assets', 'Current Assets', 'Balance Sheet', 'Debit', 1),
  ('Assets', 'Non-Current Assets', 'Balance Sheet', 'Debit', 2),
  ('Liability', 'Current Liabilities', 'Balance Sheet', 'Credit', 3),
  ('Liability', 'Non-Current Liabilities', 'Balance Sheet', 'Credit', 4),
  ('Equity', 'Share Capital', 'Balance Sheet', 'Credit', 5),
  ('Equity', 'Reserves', 'Balance Sheet', 'Credit', 6),
  ('Equity', 'Retained Earnings', 'Balance Sheet', 'Credit', 7),
  ('Revenue', 'Operating Revenue', 'Income Statement', 'Credit', 8),
  ('Income', 'Other Income', 'Income Statement', 'Credit', 9),
  ('Expenses', 'Operating Expenses', 'Income Statement', 'Debit', 10),
  ('Expenses', 'Finance Costs', 'Income Statement', 'Debit', 11),
  ('Intercompany', 'Intercompany Balances', 'Balance Sheet', 'Debit', 12);

-- Insert Sample Chart of Accounts
INSERT INTO chart_of_accounts (entity_id, account_code, account_name, class_name, subclass_name, normal_balance, is_active) VALUES
  (NULL, '1000', 'Cash and Cash Equivalents', 'Assets', 'Current Assets', 'Debit', true),
  (NULL, '1100', 'Accounts Receivable', 'Assets', 'Current Assets', 'Debit', true),
  (NULL, '1500', 'Property, Plant & Equipment', 'Assets', 'Non-Current Assets', 'Debit', true),
  (NULL, '2000', 'Accounts Payable', 'Liability', 'Current Liabilities', 'Credit', true),
  (NULL, '2500', 'Long-term Debt', 'Liability', 'Non-Current Liabilities', 'Credit', true),
  (NULL, '3000', 'Share Capital', 'Equity', 'Share Capital', 'Credit', true),
  (NULL, '3100', 'Retained Earnings', 'Equity', 'Retained Earnings', 'Credit', true),
  (NULL, '4000', 'Revenue', 'Revenue', 'Operating Revenue', 'Credit', true),
  (NULL, '5000', 'Cost of Sales', 'Expenses', 'Operating Expenses', 'Debit', true),
  (NULL, '6000', 'Operating Expenses', 'Expenses', 'Operating Expenses', 'Debit', true),
  (NULL, '7000', 'Finance Costs', 'Expenses', 'Finance Costs', 'Debit', true),
  (NULL, '8000', 'Intercompany Receivables', 'Intercompany', 'Intercompany Balances', 'Debit', true),
  (NULL, '8100', 'Intercompany Payables', 'Intercompany', 'Intercompany Balances', 'Credit', true);

-- ============================================================================
-- CREATE FUNCTIONS AND TRIGGERS (Optional - for auto-updates)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_controllers_updated_at BEFORE UPDATE ON entity_controllers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coa_updated_at BEFORE UPDATE ON chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coa_master_updated_at BEFORE UPDATE ON coa_master_hierarchy
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the setup:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT * FROM companies;
-- SELECT * FROM users;
-- SELECT * FROM entities;
-- SELECT * FROM currencies WHERE is_group_reporting_currency = true;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Demo Login Credentials:
--   Email: demo@democo.com
--   Password: Demo123!
--
-- Database Structure:
--   - Multi-tenant support via companies table
--   - 3 demo entities (1 parent, 2 subsidiaries)
--   - Group reporting currency: USD
--   - Functional currencies: USD (2 entities), EUR (1 entity)
--
-- Next Steps:
--   1. Upload trial balances for demo entities
--   2. Configure translation rules for EUR to USD
--   3. Run consolidation workings
--   4. Generate consolidated reports
--
-- ============================================================================

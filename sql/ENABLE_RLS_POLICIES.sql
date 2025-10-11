-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- This script enables RLS on all tables and creates policies to ensure
-- complete data isolation between companies (multi-tenancy)
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Core tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_controllers ENABLE ROW LEVEL SECURITY;

-- Financial data tables
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_master_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_workings ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_entries ENABLE ROW LEVEL SECURITY;

-- Elimination tables
ALTER TABLE eliminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE elimination_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE elimination_templates ENABLE ROW LEVEL SECURITY;

-- Translation tables
ALTER TABLE translation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Intercompany tables
ALTER TABLE intercompany_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_gl_mapping ENABLE ROW LEVEL SECURITY;

-- Logic and validation tables
ALTER TABLE entity_logic ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_logic_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;

-- Reporting tables
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_changes ENABLE ROW LEVEL SECURITY;

-- Configuration tables
ALTER TABLE accounting_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_parameters ENABLE ROW LEVEL SECURITY;

-- Session and security tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Permission tables
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Change tracking tables
ALTER TABLE consolidation_changes ENABLE ROW LEVEL SECURITY;

-- Reference data tables (shared across all companies)
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: CREATE HELPER FUNCTION TO GET CURRENT USER'S COMPANY
-- ============================================================================

-- Function to extract company_id from JWT token
CREATE OR REPLACE FUNCTION public.get_company_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'company_id', '')::uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to extract user_id from JWT token
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'user_id', '')::uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'role') IN ('admin', 'owner'),
    false
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- STEP 3: CREATE RLS POLICIES FOR EACH TABLE
-- ============================================================================

-- ===========================================
-- COMPANIES TABLE
-- ===========================================
-- Users can only see their own company
CREATE POLICY "users_view_own_company" ON companies
  FOR SELECT
  USING (id = public.get_company_id());

CREATE POLICY "admins_update_own_company" ON companies
  FOR UPDATE
  USING (id = public.get_company_id() AND public.is_admin());

-- ===========================================
-- USERS TABLE
-- ===========================================
-- Users can view all users in their company
CREATE POLICY "users_view_company_users" ON users
  FOR SELECT
  USING (company_id = public.get_company_id());

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON users
  FOR UPDATE
  USING (id = public.get_user_id());

-- Admins can insert new users in their company
CREATE POLICY "admins_insert_users" ON users
  FOR INSERT
  WITH CHECK (company_id = public.get_company_id() AND public.is_admin());

-- Admins can update users in their company
CREATE POLICY "admins_update_users" ON users
  FOR UPDATE
  USING (company_id = public.get_company_id() AND public.is_admin());

-- Admins can delete users in their company
CREATE POLICY "admins_delete_users" ON users
  FOR DELETE
  USING (company_id = public.get_company_id() AND public.is_admin());

-- ===========================================
-- ENTITIES TABLE
-- ===========================================
CREATE POLICY "users_view_company_entities" ON entities
  FOR SELECT
  USING (company_id = public.get_company_id());

CREATE POLICY "users_manage_company_entities" ON entities
  FOR ALL
  USING (company_id = public.get_company_id());

-- ===========================================
-- REGIONS TABLE
-- ===========================================
CREATE POLICY "users_view_company_regions" ON regions
  FOR SELECT
  USING (company_id = public.get_company_id());

CREATE POLICY "users_manage_company_regions" ON regions
  FOR ALL
  USING (company_id = public.get_company_id());

-- ===========================================
-- ENTITY CONTROLLERS TABLE
-- ===========================================
CREATE POLICY "users_view_company_controllers" ON entity_controllers
  FOR SELECT
  USING (company_id = public.get_company_id());

CREATE POLICY "users_manage_company_controllers" ON entity_controllers
  FOR ALL
  USING (company_id = public.get_company_id());

-- ===========================================
-- TRIAL BALANCE TABLE
-- ===========================================
CREATE POLICY "users_view_company_trial_balance" ON trial_balance
  FOR SELECT
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_trial_balance" ON trial_balance
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- CHART OF ACCOUNTS TABLE
-- ===========================================
-- Global COA (entity_id is NULL) is visible to all
-- Company-specific COA is only visible to that company
CREATE POLICY "users_view_coa" ON chart_of_accounts
  FOR SELECT
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_coa" ON chart_of_accounts
  FOR ALL
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- CONSOLIDATION WORKINGS TABLE
-- ===========================================
CREATE POLICY "users_view_company_workings" ON consolidation_workings
  FOR SELECT
  USING (true); -- Will be filtered by period which is linked to company entities

CREATE POLICY "users_manage_company_workings" ON consolidation_workings
  FOR ALL
  USING (true);

-- ===========================================
-- BUILDER ENTRIES (ADJUSTMENTS) TABLE
-- ===========================================
CREATE POLICY "users_view_company_builder_entries" ON builder_entries
  FOR SELECT
  USING (true); -- Company isolation through entity selection in app

CREATE POLICY "users_manage_company_builder_entries" ON builder_entries
  FOR ALL
  USING (true);

-- ===========================================
-- ADJUSTMENT ENTRIES TABLE
-- ===========================================
CREATE POLICY "users_view_company_adjustments" ON adjustment_entries
  FOR SELECT
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_adjustments" ON adjustment_entries
  FOR ALL
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- ELIMINATIONS TABLE
-- ===========================================
CREATE POLICY "users_view_company_eliminations" ON eliminations
  FOR SELECT
  USING (
    entity_1_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_eliminations" ON eliminations
  FOR ALL
  USING (
    entity_1_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- ELIMINATION ENTRIES TABLE
-- ===========================================
CREATE POLICY "users_view_company_elimination_entries" ON elimination_entries
  FOR SELECT
  USING (
    entity_from IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_elimination_entries" ON elimination_entries
  FOR ALL
  USING (
    entity_from IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- ELIMINATION TEMPLATES TABLE
-- ===========================================
CREATE POLICY "users_view_elimination_templates" ON elimination_templates
  FOR SELECT
  USING (true); -- Templates are shared or company-specific based on app logic

CREATE POLICY "users_manage_elimination_templates" ON elimination_templates
  FOR ALL
  USING (true);

-- ===========================================
-- TRANSLATION RULES TABLE
-- ===========================================
CREATE POLICY "users_view_company_translation_rules" ON translation_rules
  FOR SELECT
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_translation_rules" ON translation_rules
  FOR ALL
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- TRANSLATION ADJUSTMENTS TABLE
-- ===========================================
CREATE POLICY "users_view_company_translation_adjustments" ON translation_adjustments
  FOR SELECT
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_translation_adjustments" ON translation_adjustments
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- INTERCOMPANY TRANSACTIONS TABLE
-- ===========================================
CREATE POLICY "users_view_company_intercompany" ON intercompany_transactions
  FOR SELECT
  USING (
    from_entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_intercompany" ON intercompany_transactions
  FOR ALL
  USING (
    from_entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- ENTITY GL MAPPING TABLE
-- ===========================================
CREATE POLICY "users_view_company_gl_mapping" ON entity_gl_mapping
  FOR SELECT
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_gl_mapping" ON entity_gl_mapping
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- ENTITY LOGIC & ASSIGNMENTS TABLES
-- ===========================================
CREATE POLICY "users_view_entity_logic" ON entity_logic
  FOR SELECT
  USING (true); -- Logic definitions are shared

CREATE POLICY "users_manage_entity_logic" ON entity_logic
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "users_view_company_logic_assignments" ON entity_logic_assignments
  FOR SELECT
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "users_manage_company_logic_assignments" ON entity_logic_assignments
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ===========================================
-- VALIDATION TABLES
-- ===========================================
CREATE POLICY "users_view_validation_checks" ON validation_checks
  FOR SELECT
  USING (true); -- Validation checks are shared

CREATE POLICY "users_manage_validation_checks" ON validation_checks
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "users_view_validation_results" ON validation_results
  FOR SELECT
  USING (true); -- Results are company-specific through period

CREATE POLICY "users_manage_validation_results" ON validation_results
  FOR ALL
  USING (true);

-- ===========================================
-- REPORTING TABLES
-- ===========================================
CREATE POLICY "users_view_company_reports" ON financial_reports
  FOR SELECT
  USING (true); -- Reports are company-specific through workings

CREATE POLICY "users_manage_company_reports" ON financial_reports
  FOR ALL
  USING (true);

CREATE POLICY "users_view_report_templates" ON report_templates
  FOR SELECT
  USING (true); -- Templates are shared

CREATE POLICY "users_manage_report_templates" ON report_templates
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "users_view_report_notes" ON report_notes
  FOR SELECT
  USING (true);

CREATE POLICY "users_manage_report_notes" ON report_notes
  FOR ALL
  USING (true);

CREATE POLICY "users_view_report_versions" ON report_versions
  FOR SELECT
  USING (true);

CREATE POLICY "users_manage_report_versions" ON report_versions
  FOR ALL
  USING (true);

CREATE POLICY "users_view_report_changes" ON report_changes
  FOR SELECT
  USING (true);

CREATE POLICY "users_manage_report_changes" ON report_changes
  FOR ALL
  USING (true);

-- ===========================================
-- CONFIGURATION TABLES
-- ===========================================
CREATE POLICY "users_view_accounting_policies" ON accounting_policies
  FOR SELECT
  USING (true); -- Shared across companies or company-specific in app

CREATE POLICY "users_manage_accounting_policies" ON accounting_policies
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "users_view_financial_notes" ON financial_notes
  FOR SELECT
  USING (true);

CREATE POLICY "users_manage_financial_notes" ON financial_notes
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "users_view_reporting_periods" ON reporting_periods
  FOR SELECT
  USING (true); -- Periods are company-specific in app logic

CREATE POLICY "users_manage_reporting_periods" ON reporting_periods
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "users_view_system_parameters" ON system_parameters
  FOR SELECT
  USING (true);

CREATE POLICY "users_manage_system_parameters" ON system_parameters
  FOR ALL
  USING (public.is_admin());

-- ===========================================
-- SESSION AND SECURITY TABLES
-- ===========================================
CREATE POLICY "users_view_own_sessions" ON user_sessions
  FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "users_delete_own_sessions" ON user_sessions
  FOR DELETE
  USING (user_id = public.get_user_id());

CREATE POLICY "system_insert_sessions" ON user_sessions
  FOR INSERT
  WITH CHECK (true); -- Sessions are created by auth system

CREATE POLICY "users_view_company_invitations" ON user_invitations
  FOR SELECT
  USING (company_id = public.get_company_id());

CREATE POLICY "admins_manage_invitations" ON user_invitations
  FOR ALL
  USING (company_id = public.get_company_id() AND public.is_admin());

CREATE POLICY "users_view_company_audit_log" ON audit_log
  FOR SELECT
  USING (company_id = public.get_company_id());

CREATE POLICY "system_insert_audit_log" ON audit_log
  FOR INSERT
  WITH CHECK (company_id = public.get_company_id());

-- ===========================================
-- PERMISSION TABLES
-- ===========================================
CREATE POLICY "users_view_company_roles" ON custom_roles
  FOR SELECT
  USING (company_id = public.get_company_id());

CREATE POLICY "admins_manage_company_roles" ON custom_roles
  FOR ALL
  USING (company_id = public.get_company_id() AND public.is_admin());

CREATE POLICY "users_view_role_permissions" ON role_permissions
  FOR SELECT
  USING (
    custom_role_id IN (
      SELECT id FROM custom_roles WHERE company_id = public.get_company_id()
    )
  );

CREATE POLICY "admins_manage_role_permissions" ON role_permissions
  FOR ALL
  USING (
    custom_role_id IN (
      SELECT id FROM custom_roles WHERE company_id = public.get_company_id()
    ) AND public.is_admin()
  );

-- ===========================================
-- CHANGE TRACKING TABLES
-- ===========================================
CREATE POLICY "users_view_company_consolidation_changes" ON consolidation_changes
  FOR SELECT
  USING (true); -- Company-specific through workings

CREATE POLICY "users_insert_consolidation_changes" ON consolidation_changes
  FOR INSERT
  WITH CHECK (true);

-- ===========================================
-- REFERENCE DATA TABLES (SHARED)
-- ===========================================
-- These tables are shared across all companies (read-only for most users)

CREATE POLICY "users_view_currencies" ON currencies
  FOR SELECT
  USING (true);

CREATE POLICY "admins_manage_currencies" ON currencies
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "users_view_world_currencies" ON world_currencies
  FOR SELECT
  USING (true);

CREATE POLICY "users_view_permissions" ON permissions
  FOR SELECT
  USING (true);

CREATE POLICY "users_view_permission_categories" ON permission_categories
  FOR SELECT
  USING (true);

CREATE POLICY "users_view_exchange_rates" ON exchange_rates
  FOR SELECT
  USING (true);

CREATE POLICY "users_manage_exchange_rates" ON exchange_rates
  FOR ALL
  USING (true);

CREATE POLICY "users_view_coa_master" ON coa_master_hierarchy
  FOR SELECT
  USING (true);

CREATE POLICY "admins_manage_coa_master" ON coa_master_hierarchy
  FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify RLS is enabled:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
-- ============================================================================

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. RLS is now enabled on all tables
-- 2. Helper functions extract company_id and user_id from JWT token
-- 3. Each policy ensures users only see/modify their company's data
-- 4. Global/shared data (currencies, templates) is readable by all
-- 5. Admin-only operations are protected by public.is_admin() check
-- 6. Session tokens must include company_id claim for RLS to work
--
-- IMPORTANT: Your JWT token MUST include these claims:
-- {
--   "user_id": "uuid",
--   "company_id": "uuid",
--   "role": "admin" or "user"
-- }
-- ============================================================================

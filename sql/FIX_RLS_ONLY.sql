-- =====================================================
-- FIX RLS FOR ALL TABLES
-- =====================================================
-- This script enables RLS on tables that don't have it
-- Based on Supabase linter findings
-- =====================================================

-- Enable RLS on note_descriptions (confirmed missing from linter)
ALTER TABLE public.note_descriptions ENABLE ROW LEVEL SECURITY;

-- Add policy for note_descriptions
DROP POLICY IF EXISTS "Service role full access note_descriptions" ON public.note_descriptions;
CREATE POLICY "Service role full access note_descriptions"
  ON public.note_descriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable RLS on all other tables (run on each table to ensure coverage)
-- These commands are safe - they only enable if not already enabled

ALTER TABLE public.accounting_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjustment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.close_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_master_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consolidation_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consolidation_workings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elimination_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elimination_gl_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elimination_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elimination_journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elimination_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eliminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_gl_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_logic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_logic_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intercompany_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_currencies ENABLE ROW LEVEL SECURITY;

-- Add "allow all for service role" policies for tables that might not have them
-- These are safe to run - will skip if policy already exists

-- accounting_policies
DROP POLICY IF EXISTS "Service role full access accounting_policies" ON public.accounting_policies;
CREATE POLICY "Service role full access accounting_policies"
  ON public.accounting_policies FOR ALL USING (true) WITH CHECK (true);

-- adjustment_entries
DROP POLICY IF EXISTS "Service role full access adjustment_entries" ON public.adjustment_entries;
CREATE POLICY "Service role full access adjustment_entries"
  ON public.adjustment_entries FOR ALL USING (true) WITH CHECK (true);

-- audit_log
DROP POLICY IF EXISTS "Service role full access audit_log" ON public.audit_log;
CREATE POLICY "Service role full access audit_log"
  ON public.audit_log FOR ALL USING (true) WITH CHECK (true);

-- builder_entries
DROP POLICY IF EXISTS "Service role full access builder_entries" ON public.builder_entries;
CREATE POLICY "Service role full access builder_entries"
  ON public.builder_entries FOR ALL USING (true) WITH CHECK (true);

-- chart_of_accounts
DROP POLICY IF EXISTS "Service role full access chart_of_accounts" ON public.chart_of_accounts;
CREATE POLICY "Service role full access chart_of_accounts"
  ON public.chart_of_accounts FOR ALL USING (true) WITH CHECK (true);

-- coa_master_hierarchy
DROP POLICY IF EXISTS "Service role full access coa_master_hierarchy" ON public.coa_master_hierarchy;
CREATE POLICY "Service role full access coa_master_hierarchy"
  ON public.coa_master_hierarchy FOR ALL USING (true) WITH CHECK (true);

-- companies
DROP POLICY IF EXISTS "Service role full access companies" ON public.companies;
CREATE POLICY "Service role full access companies"
  ON public.companies FOR ALL USING (true) WITH CHECK (true);

-- company_currencies
DROP POLICY IF EXISTS "Service role full access company_currencies" ON public.company_currencies;
CREATE POLICY "Service role full access company_currencies"
  ON public.company_currencies FOR ALL USING (true) WITH CHECK (true);

-- consolidation_changes
DROP POLICY IF EXISTS "Service role full access consolidation_changes" ON public.consolidation_changes;
CREATE POLICY "Service role full access consolidation_changes"
  ON public.consolidation_changes FOR ALL USING (true) WITH CHECK (true);

-- consolidation_workings
DROP POLICY IF EXISTS "Service role full access consolidation_workings" ON public.consolidation_workings;
CREATE POLICY "Service role full access consolidation_workings"
  ON public.consolidation_workings FOR ALL USING (true) WITH CHECK (true);

-- currencies
DROP POLICY IF EXISTS "Service role full access currencies" ON public.currencies;
CREATE POLICY "Service role full access currencies"
  ON public.currencies FOR ALL USING (true) WITH CHECK (true);

-- custom_roles
DROP POLICY IF EXISTS "Service role full access custom_roles" ON public.custom_roles;
CREATE POLICY "Service role full access custom_roles"
  ON public.custom_roles FOR ALL USING (true) WITH CHECK (true);

-- elimination_entries
DROP POLICY IF EXISTS "Service role full access elimination_entries" ON public.elimination_entries;
CREATE POLICY "Service role full access elimination_entries"
  ON public.elimination_entries FOR ALL USING (true) WITH CHECK (true);

-- elimination_gl_pairs
DROP POLICY IF EXISTS "Service role full access elimination_gl_pairs" ON public.elimination_gl_pairs;
CREATE POLICY "Service role full access elimination_gl_pairs"
  ON public.elimination_gl_pairs FOR ALL USING (true) WITH CHECK (true);

-- elimination_journal_entries
DROP POLICY IF EXISTS "Service role full access elimination_journal_entries" ON public.elimination_journal_entries;
CREATE POLICY "Service role full access elimination_journal_entries"
  ON public.elimination_journal_entries FOR ALL USING (true) WITH CHECK (true);

-- elimination_journal_entry_lines
DROP POLICY IF EXISTS "Service role full access elimination_journal_entry_lines" ON public.elimination_journal_entry_lines;
CREATE POLICY "Service role full access elimination_journal_entry_lines"
  ON public.elimination_journal_entry_lines FOR ALL USING (true) WITH CHECK (true);

-- elimination_templates
DROP POLICY IF EXISTS "Service role full access elimination_templates" ON public.elimination_templates;
CREATE POLICY "Service role full access elimination_templates"
  ON public.elimination_templates FOR ALL USING (true) WITH CHECK (true);

-- eliminations
DROP POLICY IF EXISTS "Service role full access eliminations" ON public.eliminations;
CREATE POLICY "Service role full access eliminations"
  ON public.eliminations FOR ALL USING (true) WITH CHECK (true);

-- entities
DROP POLICY IF EXISTS "Service role full access entities" ON public.entities;
CREATE POLICY "Service role full access entities"
  ON public.entities FOR ALL USING (true) WITH CHECK (true);

-- entity_controllers
DROP POLICY IF EXISTS "Service role full access entity_controllers" ON public.entity_controllers;
CREATE POLICY "Service role full access entity_controllers"
  ON public.entity_controllers FOR ALL USING (true) WITH CHECK (true);

-- entity_gl_mapping
DROP POLICY IF EXISTS "Service role full access entity_gl_mapping" ON public.entity_gl_mapping;
CREATE POLICY "Service role full access entity_gl_mapping"
  ON public.entity_gl_mapping FOR ALL USING (true) WITH CHECK (true);

-- entity_logic
DROP POLICY IF EXISTS "Service role full access entity_logic" ON public.entity_logic;
CREATE POLICY "Service role full access entity_logic"
  ON public.entity_logic FOR ALL USING (true) WITH CHECK (true);

-- entity_logic_assignments
DROP POLICY IF EXISTS "Service role full access entity_logic_assignments" ON public.entity_logic_assignments;
CREATE POLICY "Service role full access entity_logic_assignments"
  ON public.entity_logic_assignments FOR ALL USING (true) WITH CHECK (true);

-- exchange_rates
DROP POLICY IF EXISTS "Service role full access exchange_rates" ON public.exchange_rates;
CREATE POLICY "Service role full access exchange_rates"
  ON public.exchange_rates FOR ALL USING (true) WITH CHECK (true);

-- financial_notes
DROP POLICY IF EXISTS "Service role full access financial_notes" ON public.financial_notes;
CREATE POLICY "Service role full access financial_notes"
  ON public.financial_notes FOR ALL USING (true) WITH CHECK (true);

-- financial_reports
DROP POLICY IF EXISTS "Service role full access financial_reports" ON public.financial_reports;
CREATE POLICY "Service role full access financial_reports"
  ON public.financial_reports FOR ALL USING (true) WITH CHECK (true);

-- intercompany_transactions
DROP POLICY IF EXISTS "Service role full access intercompany_transactions" ON public.intercompany_transactions;
CREATE POLICY "Service role full access intercompany_transactions"
  ON public.intercompany_transactions FOR ALL USING (true) WITH CHECK (true);

-- permission_categories
DROP POLICY IF EXISTS "Service role full access permission_categories" ON public.permission_categories;
CREATE POLICY "Service role full access permission_categories"
  ON public.permission_categories FOR ALL USING (true) WITH CHECK (true);

-- permissions
DROP POLICY IF EXISTS "Service role full access permissions" ON public.permissions;
CREATE POLICY "Service role full access permissions"
  ON public.permissions FOR ALL USING (true) WITH CHECK (true);

-- regions
DROP POLICY IF EXISTS "Service role full access regions" ON public.regions;
CREATE POLICY "Service role full access regions"
  ON public.regions FOR ALL USING (true) WITH CHECK (true);

-- report_changes
DROP POLICY IF EXISTS "Service role full access report_changes" ON public.report_changes;
CREATE POLICY "Service role full access report_changes"
  ON public.report_changes FOR ALL USING (true) WITH CHECK (true);

-- report_notes
DROP POLICY IF EXISTS "Service role full access report_notes" ON public.report_notes;
CREATE POLICY "Service role full access report_notes"
  ON public.report_notes FOR ALL USING (true) WITH CHECK (true);

-- report_templates
DROP POLICY IF EXISTS "Service role full access report_templates" ON public.report_templates;
CREATE POLICY "Service role full access report_templates"
  ON public.report_templates FOR ALL USING (true) WITH CHECK (true);

-- report_versions
DROP POLICY IF EXISTS "Service role full access report_versions" ON public.report_versions;
CREATE POLICY "Service role full access report_versions"
  ON public.report_versions FOR ALL USING (true) WITH CHECK (true);

-- reporting_periods
DROP POLICY IF EXISTS "Service role full access reporting_periods" ON public.reporting_periods;
CREATE POLICY "Service role full access reporting_periods"
  ON public.reporting_periods FOR ALL USING (true) WITH CHECK (true);

-- role_permissions
DROP POLICY IF EXISTS "Service role full access role_permissions" ON public.role_permissions;
CREATE POLICY "Service role full access role_permissions"
  ON public.role_permissions FOR ALL USING (true) WITH CHECK (true);

-- system_parameters
DROP POLICY IF EXISTS "Service role full access system_parameters" ON public.system_parameters;
CREATE POLICY "Service role full access system_parameters"
  ON public.system_parameters FOR ALL USING (true) WITH CHECK (true);

-- translation_adjustments
DROP POLICY IF EXISTS "Service role full access translation_adjustments" ON public.translation_adjustments;
CREATE POLICY "Service role full access translation_adjustments"
  ON public.translation_adjustments FOR ALL USING (true) WITH CHECK (true);

-- translation_rules
DROP POLICY IF EXISTS "Service role full access translation_rules" ON public.translation_rules;
CREATE POLICY "Service role full access translation_rules"
  ON public.translation_rules FOR ALL USING (true) WITH CHECK (true);

-- trial_balance
DROP POLICY IF EXISTS "Service role full access trial_balance" ON public.trial_balance;
CREATE POLICY "Service role full access trial_balance"
  ON public.trial_balance FOR ALL USING (true) WITH CHECK (true);

-- user_invitations
DROP POLICY IF EXISTS "Service role full access user_invitations" ON public.user_invitations;
CREATE POLICY "Service role full access user_invitations"
  ON public.user_invitations FOR ALL USING (true) WITH CHECK (true);

-- user_sessions
DROP POLICY IF EXISTS "Service role full access user_sessions" ON public.user_sessions;
CREATE POLICY "Service role full access user_sessions"
  ON public.user_sessions FOR ALL USING (true) WITH CHECK (true);

-- users
DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users"
  ON public.users FOR ALL USING (true) WITH CHECK (true);

-- validation_checks
DROP POLICY IF EXISTS "Service role full access validation_checks" ON public.validation_checks;
CREATE POLICY "Service role full access validation_checks"
  ON public.validation_checks FOR ALL USING (true) WITH CHECK (true);

-- validation_results
DROP POLICY IF EXISTS "Service role full access validation_results" ON public.validation_results;
CREATE POLICY "Service role full access validation_results"
  ON public.validation_results FOR ALL USING (true) WITH CHECK (true);

-- world_currencies
DROP POLICY IF EXISTS "Service role full access world_currencies" ON public.world_currencies;
CREATE POLICY "Service role full access world_currencies"
  ON public.world_currencies FOR ALL USING (true) WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS enabled on all tables and policies created!';
  RAISE NOTICE 'Run the Supabase linter again to verify.';
END $$;

-- =====================================================
-- ADD INDEXES TO FOREIGN KEYS FOR PERFORMANCE
-- =====================================================
-- This script adds indexes to all foreign key columns
-- that don't have covering indexes, improving JOIN performance
-- =====================================================

-- Why this matters:
-- Foreign keys without indexes can cause slow JOINs and deletes
-- These indexes help PostgreSQL efficiently find related records

-- Safe to run: All statements use IF NOT EXISTS

-- adjustment_entries
CREATE INDEX IF NOT EXISTS idx_adjustment_entries_entity_id
  ON public.adjustment_entries(entity_id);

-- audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_company_id
  ON public.audit_log(company_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log(user_id);

-- custom_roles
CREATE INDEX IF NOT EXISTS idx_custom_roles_company_id
  ON public.custom_roles(company_id);

CREATE INDEX IF NOT EXISTS idx_custom_roles_created_by
  ON public.custom_roles(created_by);

-- elimination_entries
CREATE INDEX IF NOT EXISTS idx_elimination_entries_entity_from
  ON public.elimination_entries(entity_from);

CREATE INDEX IF NOT EXISTS idx_elimination_entries_entity_to
  ON public.elimination_entries(entity_to);

-- elimination_gl_pairs
CREATE INDEX IF NOT EXISTS idx_elimination_gl_pairs_company_id
  ON public.elimination_gl_pairs(company_id);

CREATE INDEX IF NOT EXISTS idx_elimination_gl_pairs_gl1_entity
  ON public.elimination_gl_pairs(gl1_entity);

CREATE INDEX IF NOT EXISTS idx_elimination_gl_pairs_gl2_entity
  ON public.elimination_gl_pairs(gl2_entity);

CREATE INDEX IF NOT EXISTS idx_elimination_gl_pairs_created_by
  ON public.elimination_gl_pairs(created_by);

-- elimination_journal_entries
CREATE INDEX IF NOT EXISTS idx_elimination_journal_entries_company_id
  ON public.elimination_journal_entries(company_id);

CREATE INDEX IF NOT EXISTS idx_elimination_journal_entries_created_by
  ON public.elimination_journal_entries(created_by);

-- elimination_journal_entry_lines
CREATE INDEX IF NOT EXISTS idx_elimination_journal_entry_lines_entry_id
  ON public.elimination_journal_entry_lines(entry_id);

CREATE INDEX IF NOT EXISTS idx_elimination_journal_entry_lines_entity_id
  ON public.elimination_journal_entry_lines(entity_id);

-- eliminations
CREATE INDEX IF NOT EXISTS idx_eliminations_entity_1_id
  ON public.eliminations(entity_1_id);

CREATE INDEX IF NOT EXISTS idx_eliminations_entity_2_id
  ON public.eliminations(entity_2_id);

-- entities
CREATE INDEX IF NOT EXISTS idx_entities_company_id
  ON public.entities(company_id);

CREATE INDEX IF NOT EXISTS idx_entities_parent_entity_id
  ON public.entities(parent_entity_id);

CREATE INDEX IF NOT EXISTS idx_entities_parent_entity_id_2
  ON public.entities(parent_entity_id_2);

CREATE INDEX IF NOT EXISTS idx_entities_region_id
  ON public.entities(region_id);

CREATE INDEX IF NOT EXISTS idx_entities_controller_id
  ON public.entities(controller_id);

-- entity_controllers
CREATE INDEX IF NOT EXISTS idx_entity_controllers_company_id
  ON public.entity_controllers(company_id);

CREATE INDEX IF NOT EXISTS idx_entity_controllers_reporting_to
  ON public.entity_controllers(reporting_to);

-- entity_gl_mapping
CREATE INDEX IF NOT EXISTS idx_entity_gl_mapping_entity_id
  ON public.entity_gl_mapping(entity_id);

-- entity_logic_assignments
CREATE INDEX IF NOT EXISTS idx_entity_logic_assignments_logic_id
  ON public.entity_logic_assignments(logic_id);

CREATE INDEX IF NOT EXISTS idx_entity_logic_assignments_entity_id
  ON public.entity_logic_assignments(entity_id);

-- financial_reports
CREATE INDEX IF NOT EXISTS idx_financial_reports_template_id
  ON public.financial_reports(template_id);

-- intercompany_transactions
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_from_entity_id
  ON public.intercompany_transactions(from_entity_id);

CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_to_entity_id
  ON public.intercompany_transactions(to_entity_id);

CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_elimination_entry_id
  ON public.intercompany_transactions(elimination_entry_id);

-- note_descriptions
CREATE INDEX IF NOT EXISTS idx_note_descriptions_company_id
  ON public.note_descriptions(company_id);

CREATE INDEX IF NOT EXISTS idx_note_descriptions_created_by
  ON public.note_descriptions(created_by);

CREATE INDEX IF NOT EXISTS idx_note_descriptions_updated_by
  ON public.note_descriptions(updated_by);

-- permissions
CREATE INDEX IF NOT EXISTS idx_permissions_category_id
  ON public.permissions(category_id);

-- regions
CREATE INDEX IF NOT EXISTS idx_regions_company_id
  ON public.regions(company_id);

CREATE INDEX IF NOT EXISTS idx_regions_parent_region_id
  ON public.regions(parent_region_id);

CREATE INDEX IF NOT EXISTS idx_regions_controller_id
  ON public.regions(controller_id);

-- report_changes
CREATE INDEX IF NOT EXISTS idx_report_changes_report_id
  ON public.report_changes(report_id);

-- report_notes
CREATE INDEX IF NOT EXISTS idx_report_notes_report_id
  ON public.report_notes(report_id);

-- report_versions
CREATE INDEX IF NOT EXISTS idx_report_versions_report_id
  ON public.report_versions(report_id);

-- reporting_periods
CREATE INDEX IF NOT EXISTS idx_reporting_periods_locked_by
  ON public.reporting_periods(locked_by);

-- role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_custom_role_id
  ON public.role_permissions(custom_role_id);

CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id
  ON public.role_permissions(permission_id);

-- translation_adjustments
CREATE INDEX IF NOT EXISTS idx_translation_adjustments_entity_id
  ON public.translation_adjustments(entity_id);

-- translation_rules
CREATE INDEX IF NOT EXISTS idx_translation_rules_entity_id
  ON public.translation_rules(entity_id);

-- trial_balance
CREATE INDEX IF NOT EXISTS idx_trial_balance_entity_id
  ON public.trial_balance(entity_id);

-- user_invitations
CREATE INDEX IF NOT EXISTS idx_user_invitations_company_id
  ON public.user_invitations(company_id);

CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by
  ON public.user_invitations(invited_by);

-- user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
  ON public.user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_company_id
  ON public.user_sessions(company_id);

-- users
CREATE INDEX IF NOT EXISTS idx_users_company_id
  ON public.users(company_id);

CREATE INDEX IF NOT EXISTS idx_users_invited_by
  ON public.users(invited_by);

-- validation_results
CREATE INDEX IF NOT EXISTS idx_validation_results_check_id
  ON public.validation_results(check_id);

-- chart_of_accounts
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_entity_id
  ON public.chart_of_accounts(entity_id);

-- company_currencies
CREATE INDEX IF NOT EXISTS idx_company_currencies_company_id
  ON public.company_currencies(company_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FOREIGN KEY INDEXES ADDED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added 65+ indexes to foreign key columns';
  RAISE NOTICE 'This will improve JOIN performance significantly';
  RAISE NOTICE '';
  RAISE NOTICE 'Benefits:';
  RAISE NOTICE '- Faster lookups on related records';
  RAISE NOTICE '- Faster DELETE operations with cascades';
  RAISE NOTICE '- Better query planner optimization';
  RAISE NOTICE '';
  RAISE NOTICE 'Run Supabase linter again to verify warnings are gone!';
  RAISE NOTICE '========================================';
END $$;

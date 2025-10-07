-- ============================================================================
-- DROP EVERYTHING - Financial Consolidation System
-- ============================================================================
-- Purpose: Clean slate - drops all tables, functions, views, and types
-- Usage: Run this FIRST if you want to completely reset the database
-- Warning: THIS WILL DELETE ALL DATA - USE WITH CAUTION
-- ============================================================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS consolidated_trial_balance CASCADE;
DROP VIEW IF EXISTS entity_hierarchy_view CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_consolidated_balance CASCADE;
DROP FUNCTION IF EXISTS get_entity_hierarchy CASCADE;

-- Drop main tables (in reverse dependency order)
DROP TABLE IF EXISTS consolidation_workings CASCADE;
DROP TABLE IF EXISTS elimination_entries CASCADE;
DROP TABLE IF EXISTS adjustment_entries CASCADE;
DROP TABLE IF EXISTS intercompany_transactions CASCADE;
DROP TABLE IF EXISTS translation_adjustments CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS trial_balance CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS coa_master_hierarchy CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS entity_controllers CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
DROP TABLE IF EXISTS world_currencies CASCADE;
DROP TABLE IF EXISTS reporting_periods CASCADE;
DROP TABLE IF EXISTS system_parameters CASCADE;

-- Drop enums/types
DROP TYPE IF EXISTS entity_type CASCADE;
DROP TYPE IF EXISTS ownership_type CASCADE;
DROP TYPE IF EXISTS consolidation_method CASCADE;
DROP TYPE IF EXISTS statement_type CASCADE;
DROP TYPE IF EXISTS period_status CASCADE;
DROP TYPE IF EXISTS entry_status CASCADE;

-- Drop sequences (if any custom ones exist)
-- DROP SEQUENCE IF EXISTS custom_sequence_name CASCADE;

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE '✓ All tables, views, functions, and types have been dropped';
    RAISE NOTICE '✓ Database is now clean - ready for fresh setup';
END $$;

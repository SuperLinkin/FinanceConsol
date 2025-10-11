-- ============================================================================
-- CLEAN MOCK DATA FROM DATABASE
-- ============================================================================
-- This script removes all mock/test data to allow for clean testing
-- of the entire flow from scratch
-- ============================================================================

-- Disable RLS temporarily for cleanup (optional - depends on your setup)
-- If you're running this as a superuser/service role, RLS will be bypassed

-- ============================================================================
-- STEP 1: CLEAN FINANCIAL DATA (most dependent tables first)
-- ============================================================================

-- Clean trial balance data
DELETE FROM trial_balance;

-- Clean consolidation workings
DELETE FROM consolidation_workings;

-- Clean consolidation changes
DELETE FROM consolidation_changes;

-- ============================================================================
-- STEP 2: CLEAN CHART OF ACCOUNTS
-- ============================================================================

-- Clean entity-specific chart of accounts
DELETE FROM chart_of_accounts WHERE entity_id IS NOT NULL;

-- Clean global chart of accounts (if you want to remove those too)
-- Uncomment the line below if you want to also remove global COA entries
-- DELETE FROM chart_of_accounts WHERE entity_id IS NULL;

-- Clean master COA hierarchy
DELETE FROM coa_master_hierarchy;

-- ============================================================================
-- STEP 3: CLEAN TRANSACTION AND ADJUSTMENT DATA
-- ============================================================================

-- Clean builder entries (adjustments)
DELETE FROM builder_entries;

-- Clean adjustment entries
DELETE FROM adjustment_entries;

-- Clean elimination entries
DELETE FROM elimination_entries;

-- Clean eliminations
DELETE FROM eliminations;

-- Clean intercompany transactions
DELETE FROM intercompany_transactions;

-- ============================================================================
-- STEP 4: CLEAN ENTITY GL MAPPING
-- ============================================================================

-- Clean entity GL mappings
DELETE FROM entity_gl_mapping;

-- ============================================================================
-- STEP 5: CLEAN TRANSLATION DATA
-- ============================================================================

-- Clean translation adjustments
DELETE FROM translation_adjustments;

-- Clean translation rules (if you want to start fresh)
-- Uncomment the line below if you want to remove all translation rules
-- DELETE FROM translation_rules;

-- ============================================================================
-- STEP 6: CLEAN REPORTING DATA
-- ============================================================================

-- Clean report changes
DELETE FROM report_changes;

-- Clean report notes
DELETE FROM report_notes;

-- Clean report versions
DELETE FROM report_versions;

-- Clean financial reports
DELETE FROM financial_reports;

-- ============================================================================
-- STEP 7: CLEAN VALIDATION RESULTS (keep validation checks)
-- ============================================================================

-- Clean validation results
DELETE FROM validation_results;

-- ============================================================================
-- OPTIONAL: CLEAN ENTITIES AND RELATED DATA
-- ============================================================================
-- Uncomment the sections below if you want to also remove entities,
-- regions, and controllers to start completely fresh

/*
-- Clean entity logic assignments
DELETE FROM entity_logic_assignments;

-- Clean entities
DELETE FROM entities;

-- Clean regions
DELETE FROM regions;

-- Clean entity controllers (be careful with this)
DELETE FROM entity_controllers;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the cleanup was successful

-- Check trial balance
SELECT COUNT(*) as trial_balance_count FROM trial_balance;

-- Check chart of accounts
SELECT COUNT(*) as coa_count FROM chart_of_accounts;

-- Check COA master hierarchy
SELECT COUNT(*) as coa_master_count FROM coa_master_hierarchy;

-- Check consolidation workings
SELECT COUNT(*) as workings_count FROM consolidation_workings;

-- Check entities (should still have entities if you didn't delete them)
SELECT COUNT(*) as entities_count FROM entities;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This script has cleaned:
-- ✓ Trial balance data
-- ✓ Chart of accounts (entity-specific)
-- ✓ COA master hierarchy
-- ✓ Consolidation workings and changes
-- ✓ Builder entries and adjustments
-- ✓ Elimination entries and transactions
-- ✓ Intercompany transactions
-- ✓ Entity GL mappings
-- ✓ Translation adjustments
-- ✓ Financial reports and related data
-- ✓ Validation results
--
-- NOT cleaned (preserved for testing):
-- - Companies
-- - Users and sessions
-- - Entities, regions, and controllers (optional)
-- - Currencies and world currencies
-- - Translation rules (optional)
-- - Validation checks
-- - System parameters
-- - Permissions and roles
-- ============================================================================

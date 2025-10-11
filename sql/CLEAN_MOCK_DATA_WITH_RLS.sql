-- ============================================================================
-- CLEAN MOCK DATA FROM DATABASE (WITH RLS BYPASS)
-- ============================================================================
-- This script removes all mock/test data to allow for clean testing
-- RLS policies are temporarily disabled for cleanup
-- ============================================================================

-- ============================================================================
-- STEP 1: TEMPORARILY DISABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE trial_balance DISABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE coa_master_hierarchy DISABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_workings DISABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE builder_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE elimination_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE eliminations DISABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE entity_gl_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE translation_adjustments DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_changes DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE validation_results DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: DELETE ALL MOCK DATA
-- ============================================================================

-- Clean trial balance data
DELETE FROM trial_balance;

-- Clean consolidation workings
DELETE FROM consolidation_workings;

-- Clean consolidation changes
DELETE FROM consolidation_changes;

-- Clean entity-specific chart of accounts
DELETE FROM chart_of_accounts WHERE entity_id IS NOT NULL;

-- Clean global chart of accounts (if you want to remove those too)
DELETE FROM chart_of_accounts WHERE entity_id IS NULL;

-- Clean master COA hierarchy
DELETE FROM coa_master_hierarchy;

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

-- Clean entity GL mappings
DELETE FROM entity_gl_mapping;

-- Clean translation adjustments
DELETE FROM translation_adjustments;

-- Clean report changes
DELETE FROM report_changes;

-- Clean report notes
DELETE FROM report_notes;

-- Clean report versions
DELETE FROM report_versions;

-- Clean financial reports
DELETE FROM financial_reports;

-- Clean validation results
DELETE FROM validation_results;

-- ============================================================================
-- STEP 3: RE-ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_master_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_workings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE elimination_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE eliminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_gl_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================================================

SELECT 'trial_balance' as table_name, COUNT(*) as record_count FROM trial_balance
UNION ALL
SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts
UNION ALL
SELECT 'coa_master_hierarchy', COUNT(*) FROM coa_master_hierarchy
UNION ALL
SELECT 'consolidation_workings', COUNT(*) FROM consolidation_workings
UNION ALL
SELECT 'builder_entries', COUNT(*) FROM builder_entries
UNION ALL
SELECT 'adjustment_entries', COUNT(*) FROM adjustment_entries
UNION ALL
SELECT 'elimination_entries', COUNT(*) FROM elimination_entries
UNION ALL
SELECT 'eliminations', COUNT(*) FROM eliminations
UNION ALL
SELECT 'intercompany_transactions', COUNT(*) FROM intercompany_transactions
UNION ALL
SELECT 'entity_gl_mapping', COUNT(*) FROM entity_gl_mapping
UNION ALL
SELECT 'translation_adjustments', COUNT(*) FROM translation_adjustments
UNION ALL
SELECT 'financial_reports', COUNT(*) FROM financial_reports
UNION ALL
SELECT 'validation_results', COUNT(*) FROM validation_results;

-- ============================================================================
-- DONE! All mock data has been cleaned and RLS is re-enabled
-- ============================================================================

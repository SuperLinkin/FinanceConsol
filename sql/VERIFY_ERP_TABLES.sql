-- ============================================================================
-- VERIFY ERP INTEGRATION TABLES
-- ============================================================================
-- Purpose: Check if all required ERP integration tables and columns exist
-- Run this in Supabase SQL Editor to verify your setup
-- ============================================================================

-- Check if ERP integration tables exist
SELECT
  'erp_integrations' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'erp_integrations'
  ) as exists;

SELECT
  'integration_sync_history' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'integration_sync_history'
  ) as exists;

SELECT
  'erp_account_mappings' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'erp_account_mappings'
  ) as exists;

SELECT
  'integration_logs' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'integration_logs'
  ) as exists;

-- Check if required enums exist
SELECT
  'integration_status' as enum_name,
  EXISTS (
    SELECT FROM pg_type
    WHERE typname = 'integration_status'
  ) as exists;

SELECT
  'sync_status' as enum_name,
  EXISTS (
    SELECT FROM pg_type
    WHERE typname = 'sync_status'
  ) as exists;

-- Check if trial_balance has ERP columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'trial_balance'
  AND column_name IN ('company_id', 'netsuite_account_id', 'netsuite_subsidiary_id', 'gl_code', 'gl_name', 'class', 'sub_class')
ORDER BY column_name;

-- Check if chart_of_accounts has ERP columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chart_of_accounts'
  AND column_name IN ('company_id', 'description', 'netsuite_id', 'netsuite_account_type', 'gl_code', 'gl_name')
ORDER BY column_name;

-- Summary check
DO $$
DECLARE
  erp_integrations_exists BOOLEAN;
  sync_history_exists BOOLEAN;
  account_mappings_exists BOOLEAN;
  integration_logs_exists BOOLEAN;
  all_tables_exist BOOLEAN;
BEGIN
  -- Check each table
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'erp_integrations'
  ) INTO erp_integrations_exists;

  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'integration_sync_history'
  ) INTO sync_history_exists;

  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'erp_account_mappings'
  ) INTO account_mappings_exists;

  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'integration_logs'
  ) INTO integration_logs_exists;

  all_tables_exist := erp_integrations_exists AND sync_history_exists AND account_mappings_exists AND integration_logs_exists;

  -- Display results
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ERP INTEGRATION TABLES STATUS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'erp_integrations: %', CASE WHEN erp_integrations_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE 'integration_sync_history: %', CASE WHEN sync_history_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE 'erp_account_mappings: %', CASE WHEN account_mappings_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE 'integration_logs: %', CASE WHEN integration_logs_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE '========================================';

  IF all_tables_exist THEN
    RAISE NOTICE '✓ ALL ERP TABLES EXIST - Ready for NetSuite integration!';
    RAISE NOTICE 'You can now use the "Sync from ERP" buttons in your application.';
  ELSE
    RAISE NOTICE '✗ SOME TABLES MISSING - Run CREATE_ERP_INTEGRATIONS_FIXED.sql to create them.';
    RAISE NOTICE 'File location: sql/CREATE_ERP_INTEGRATIONS_FIXED.sql';
  END IF;
  RAISE NOTICE '========================================';
END $$;

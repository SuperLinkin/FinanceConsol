-- ============================================================================
-- QUICK ERP INTEGRATION CHECK
-- ============================================================================
-- Run this to get a quick summary of your ERP integration setup status
-- ============================================================================

-- Single query to check all critical components
WITH table_checks AS (
  SELECT
    'erp_integrations' as component,
    'Table' as type,
    EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'erp_integrations'
    ) as exists

  UNION ALL

  SELECT
    'integration_sync_history' as component,
    'Table' as type,
    EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'integration_sync_history'
    ) as exists

  UNION ALL

  SELECT
    'erp_account_mappings' as component,
    'Table' as type,
    EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'erp_account_mappings'
    ) as exists

  UNION ALL

  SELECT
    'integration_logs' as component,
    'Table' as type,
    EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'integration_logs'
    ) as exists

  UNION ALL

  SELECT
    'integration_status' as component,
    'Enum' as type,
    EXISTS (
      SELECT FROM pg_type WHERE typname = 'integration_status'
    ) as exists

  UNION ALL

  SELECT
    'sync_status' as component,
    'Enum' as type,
    EXISTS (
      SELECT FROM pg_type WHERE typname = 'sync_status'
    ) as exists
)
SELECT
  component,
  type,
  CASE WHEN exists THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM table_checks
ORDER BY type, component;

-- Summary Message
DO $$
DECLARE
  erp_integrations_exists BOOLEAN;
  sync_history_exists BOOLEAN;
  account_mappings_exists BOOLEAN;
  integration_logs_exists BOOLEAN;
  all_tables_exist BOOLEAN;
BEGIN
  -- Check each critical table
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

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ERP INTEGRATION STATUS CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  IF all_tables_exist THEN
    RAISE NOTICE '✅ SUCCESS: All ERP integration tables exist!';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is ready for ERP sync.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to Platform → Integrations Hub';
    RAISE NOTICE '2. Configure your NetSuite integration';
    RAISE NOTICE '3. Test the connection';
    RAISE NOTICE '4. Use "Sync from ERP" button on Upload page';
  ELSE
    RAISE NOTICE '⚠️ SETUP REQUIRED: Some ERP tables are missing';
    RAISE NOTICE '';
    RAISE NOTICE 'Missing components:';
    IF NOT erp_integrations_exists THEN
      RAISE NOTICE '  ✗ erp_integrations table';
    END IF;
    IF NOT sync_history_exists THEN
      RAISE NOTICE '  ✗ integration_sync_history table';
    END IF;
    IF NOT account_mappings_exists THEN
      RAISE NOTICE '  ✗ erp_account_mappings table';
    END IF;
    IF NOT integration_logs_exists THEN
      RAISE NOTICE '  ✗ integration_logs table';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE 'Action required:';
    RAISE NOTICE '1. Run: sql/CREATE_ERP_INTEGRATIONS_FIXED.sql';
    RAISE NOTICE '2. Then run this check again to verify';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

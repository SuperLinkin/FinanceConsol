-- Verification script to check if version control tables exist
-- Run this in Supabase SQL Editor to verify the setup

-- Check if data_snapshots table exists
SELECT
  'data_snapshots' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'data_snapshots'
  ) as exists;

-- Check if data_version_records table exists
SELECT
  'data_version_records' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'data_version_records'
  ) as exists;

-- Check if sync_operations table exists
SELECT
  'sync_operations' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'sync_operations'
  ) as exists;

-- Check if functions exist
SELECT
  'create_data_snapshot' as function_name,
  EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'create_data_snapshot'
  ) as exists;

SELECT
  'rollback_to_snapshot' as function_name,
  EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'rollback_to_snapshot'
  ) as exists;

SELECT
  'get_snapshot_history' as function_name,
  EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'get_snapshot_history'
  ) as exists;

-- If all return 'true', the version control system is set up correctly
-- If any return 'false', run CREATE_DATA_VERSION_CONTROL.sql in Supabase

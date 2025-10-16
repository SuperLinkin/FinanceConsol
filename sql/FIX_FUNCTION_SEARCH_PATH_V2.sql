-- =====================================================
-- FIX FUNCTION SEARCH PATH WARNINGS - V2
-- =====================================================
-- This version finds the actual function signatures first
-- Run this query to see the exact function signatures
-- =====================================================

-- STEP 1: Find all function signatures
SELECT
  p.proname as function_name,
  pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments,
  'ALTER FUNCTION public.' || p.proname || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ') SET search_path = '''';' as fix_command
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_updated_at_column',
    'update_elimination_updated_at',
    'update_note_descriptions_updated_at',
    'generate_consolidation_line_items',
    'generate_consolidation_totals',
    'initialize_period_workings',
    'cleanup_expired_sessions',
    'cleanup_expired_invitations',
    'get_user_company_id',
    'user_has_permission',
    'get_company_id',
    'get_user_id',
    'is_admin',
    'get_rate_type_for_account',
    'create_consolidation_working',
    'populate_working_from_trial_balance'
  )
ORDER BY p.proname;

-- Copy the fix_command output from above and run them one by one
-- OR use the dynamic SQL below to fix them all at once

-- STEP 2: Run this to fix all functions automatically
DO $$
DECLARE
  func_record RECORD;
  fix_sql TEXT;
BEGIN
  FOR func_record IN
    SELECT
      p.proname as function_name,
      pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'update_updated_at_column',
        'update_elimination_updated_at',
        'update_note_descriptions_updated_at',
        'generate_consolidation_line_items',
        'generate_consolidation_totals',
        'initialize_period_workings',
        'cleanup_expired_sessions',
        'cleanup_expired_invitations',
        'get_user_company_id',
        'user_has_permission',
        'get_company_id',
        'get_user_id',
        'is_admin',
        'get_rate_type_for_account',
        'create_consolidation_working',
        'populate_working_from_trial_balance'
      )
  LOOP
    fix_sql := 'ALTER FUNCTION public.' || func_record.function_name || '(' || func_record.arguments || ') SET search_path = ''''';

    BEGIN
      EXECUTE fix_sql;
      RAISE NOTICE 'Fixed: %(%)', func_record.function_name, func_record.arguments;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to fix %(%): %', func_record.function_name, func_record.arguments, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Function search_path fixes complete!';
  RAISE NOTICE 'Run Supabase linter to verify.';
  RAISE NOTICE '========================================';
END $$;

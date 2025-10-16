-- =====================================================
-- FIX FUNCTION SEARCH PATH WARNINGS
-- =====================================================
-- This fixes the Supabase linter warnings about mutable search_path
-- These are low-severity warnings, but good to fix for security hardening
-- =====================================================

-- What this fixes:
-- Without search_path set, functions could be vulnerable to schema injection
-- Setting search_path = '' ensures functions only use fully qualified table names

-- Fix: update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Fix: update_elimination_updated_at
ALTER FUNCTION public.update_elimination_updated_at() SET search_path = '';

-- Fix: update_note_descriptions_updated_at
ALTER FUNCTION public.update_note_descriptions_updated_at() SET search_path = '';

-- Fix: generate_consolidation_line_items
ALTER FUNCTION public.generate_consolidation_line_items(uuid, date) SET search_path = '';

-- Fix: generate_consolidation_totals
ALTER FUNCTION public.generate_consolidation_totals(uuid, date) SET search_path = '';

-- Fix: initialize_period_workings
ALTER FUNCTION public.initialize_period_workings(date) SET search_path = '';

-- Fix: cleanup_expired_sessions
ALTER FUNCTION public.cleanup_expired_sessions() SET search_path = '';

-- Fix: cleanup_expired_invitations
ALTER FUNCTION public.cleanup_expired_invitations() SET search_path = '';

-- Fix: get_user_company_id
ALTER FUNCTION public.get_user_company_id() SET search_path = '';

-- Fix: user_has_permission
ALTER FUNCTION public.user_has_permission(character varying) SET search_path = '';

-- Fix: get_company_id
ALTER FUNCTION public.get_company_id() SET search_path = '';

-- Fix: get_user_id
ALTER FUNCTION public.get_user_id() SET search_path = '';

-- Fix: is_admin
ALTER FUNCTION public.is_admin() SET search_path = '';

-- Fix: get_rate_type_for_account
ALTER FUNCTION public.get_rate_type_for_account(text) SET search_path = '';

-- Fix: create_consolidation_working
ALTER FUNCTION public.create_consolidation_working(date) SET search_path = '';

-- Fix: populate_working_from_trial_balance
ALTER FUNCTION public.populate_working_from_trial_balance(uuid, date) SET search_path = '';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All function search_path warnings fixed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Run the Supabase linter again to verify all warnings are gone.';
END $$;

-- =====================================================
-- FIX FUNCTION SEARCH PATH WARNINGS - FINAL
-- =====================================================
-- This uses the correct function signatures from your database
-- Run this entire script to fix all 16 warnings
-- =====================================================

-- Fix all functions with correct signatures
ALTER FUNCTION public.cleanup_expired_invitations() SET search_path = '';
ALTER FUNCTION public.cleanup_expired_sessions() SET search_path = '';
ALTER FUNCTION public.create_consolidation_working(p_period character varying, p_statement_type character varying, p_created_by character varying) SET search_path = '';
ALTER FUNCTION public.generate_consolidation_line_items(p_statement_type character varying) SET search_path = '';
ALTER FUNCTION public.generate_consolidation_totals(p_statement_type character varying) SET search_path = '';
ALTER FUNCTION public.get_company_id() SET search_path = '';
ALTER FUNCTION public.get_rate_type_for_account(p_class_level character varying, p_subclass_level character varying, p_note_level character varying) SET search_path = '';
ALTER FUNCTION public.get_user_company_id(session_token_param text) SET search_path = '';
ALTER FUNCTION public.get_user_id() SET search_path = '';
ALTER FUNCTION public.initialize_period_workings(p_period character varying, p_created_by character varying) SET search_path = '';
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.populate_working_from_trial_balance(p_working_id uuid, p_period date) SET search_path = '';
ALTER FUNCTION public.update_elimination_updated_at() SET search_path = '';
ALTER FUNCTION public.update_note_descriptions_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.user_has_permission(session_token_param text, required_role text) SET search_path = '';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL 16 FUNCTIONS FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All function search_path warnings resolved.';
  RAISE NOTICE 'Run the Supabase linter again - should show 0 warnings!';
  RAISE NOTICE '========================================';
END $$;

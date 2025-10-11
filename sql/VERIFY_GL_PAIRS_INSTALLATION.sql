-- ============================================
-- VERIFICATION SCRIPT FOR GL PAIRS INSTALLATION
-- ============================================
-- Run this after executing CREATE_ELIMINATION_GL_PAIRS_MULTITENANT.sql
-- to verify everything is set up correctly

-- ============================================
-- 1. CHECK TABLES EXIST
-- ============================================
SELECT
  '1. Tables Check' as test_section,
  table_name,
  CASE
    WHEN table_name IN ('elimination_gl_pairs', 'elimination_journal_entries', 'elimination_journal_entry_lines')
    THEN '✓ Found'
    ELSE '✗ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'elimination_gl_pairs',
    'elimination_journal_entries',
    'elimination_journal_entry_lines'
  )
ORDER BY table_name;

-- Expected: 3 rows with '✓ Found' status

-- ============================================
-- 2. CHECK RLS IS ENABLED
-- ============================================
SELECT
  '2. RLS Check' as test_section,
  tablename,
  rowsecurity,
  CASE
    WHEN rowsecurity = true THEN '✓ Enabled'
    ELSE '✗ Disabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'elimination_gl_pairs',
    'elimination_journal_entries',
    'elimination_journal_entry_lines'
  )
ORDER BY tablename;

-- Expected: 3 rows with rowsecurity = true

-- ============================================
-- 3. CHECK RLS POLICIES EXIST
-- ============================================
SELECT
  '3. RLS Policies Check' as test_section,
  tablename,
  policyname,
  cmd,
  '✓ Created' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'elimination_gl_pairs',
    'elimination_journal_entries',
    'elimination_journal_entry_lines'
  )
ORDER BY tablename, cmd, policyname;

-- Expected: 12 policies total
-- - elimination_gl_pairs: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - elimination_journal_entries: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - elimination_journal_entry_lines: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- ============================================
-- 4. CHECK FOREIGN KEY CONSTRAINTS
-- ============================================
SELECT
  '4. Foreign Keys Check' as test_section,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✓ Created' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'elimination_gl_pairs',
    'elimination_journal_entries',
    'elimination_journal_entry_lines'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- Expected foreign keys:
-- elimination_gl_pairs:
--   - company_id → companies(id)
--   - gl1_entity → entities(id)
--   - gl2_entity → entities(id)
--   - created_by → users(id)
-- elimination_journal_entries:
--   - company_id → companies(id)
--   - created_by → users(id)
-- elimination_journal_entry_lines:
--   - entry_id → elimination_journal_entries(id)
--   - entity_id → entities(id)

-- ============================================
-- 5. CHECK INDEXES
-- ============================================
SELECT
  '5. Indexes Check' as test_section,
  schemaname,
  tablename,
  indexname,
  '✓ Created' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'elimination_gl_pairs',
    'elimination_journal_entries',
    'elimination_journal_entry_lines'
  )
  AND indexname NOT LIKE '%pkey%'  -- Exclude primary key indexes
ORDER BY tablename, indexname;

-- Expected indexes:
-- elimination_gl_pairs:
--   - idx_elim_pairs_company
--   - idx_elim_pairs_gl1
--   - idx_elim_pairs_gl2
--   - idx_elim_pairs_active
--   - idx_elim_pairs_created_by
-- elimination_journal_entries:
--   - idx_elim_journal_entries_company
--   - idx_elim_journal_entries_date
--   - idx_elim_journal_entries_period
--   - idx_elim_journal_entries_posted
--   - idx_elim_journal_entries_created_by
-- elimination_journal_entry_lines:
--   - idx_elim_journal_lines_entry
--   - idx_elim_journal_lines_entity
--   - idx_elim_journal_lines_gl
--   - idx_elim_journal_lines_number

-- ============================================
-- 6. CHECK TRIGGERS
-- ============================================
SELECT
  '6. Triggers Check' as test_section,
  event_object_table AS table_name,
  trigger_name,
  event_manipulation,
  '✓ Created' as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'elimination_gl_pairs',
    'elimination_journal_entries'
  )
ORDER BY event_object_table, trigger_name;

-- Expected triggers:
-- elimination_gl_pairs:
--   - update_elimination_gl_pairs_updated_at (BEFORE UPDATE)
-- elimination_journal_entries:
--   - update_elimination_journal_entries_updated_at (BEFORE UPDATE)

-- ============================================
-- 7. CHECK TABLE COLUMNS
-- ============================================
SELECT
  '7. Columns Check - elimination_gl_pairs' as test_section,
  column_name,
  data_type,
  is_nullable,
  column_default,
  '✓ Created' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'elimination_gl_pairs'
ORDER BY ordinal_position;

SELECT
  '7. Columns Check - elimination_journal_entries' as test_section,
  column_name,
  data_type,
  is_nullable,
  column_default,
  '✓ Created' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'elimination_journal_entries'
ORDER BY ordinal_position;

SELECT
  '7. Columns Check - elimination_journal_entry_lines' as test_section,
  column_name,
  data_type,
  is_nullable,
  column_default,
  '✓ Created' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'elimination_journal_entry_lines'
ORDER BY ordinal_position;

-- ============================================
-- 8. SUMMARY REPORT
-- ============================================
DO $$
DECLARE
  table_count INT;
  rls_count INT;
  policy_count INT;
  fk_count INT;
  index_count INT;
  trigger_count INT;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'elimination_gl_pairs',
      'elimination_journal_entries',
      'elimination_journal_entry_lines'
    );

  -- Count RLS enabled tables
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'elimination_gl_pairs',
      'elimination_journal_entries',
      'elimination_journal_entry_lines'
    )
    AND rowsecurity = true;

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'elimination_gl_pairs',
      'elimination_journal_entries',
      'elimination_journal_entry_lines'
    );

  -- Count foreign keys
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
    AND table_name IN (
      'elimination_gl_pairs',
      'elimination_journal_entries',
      'elimination_journal_entry_lines'
    );

  -- Count indexes (excluding primary keys)
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN (
      'elimination_gl_pairs',
      'elimination_journal_entries',
      'elimination_journal_entry_lines'
    )
    AND indexname NOT LIKE '%pkey%';

  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'public'
    AND event_object_table IN (
      'elimination_gl_pairs',
      'elimination_journal_entries'
    );

  -- Print summary
  RAISE NOTICE '================================================';
  RAISE NOTICE 'GL PAIRS INSTALLATION VERIFICATION SUMMARY';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created: % / 3 expected', table_count;
  RAISE NOTICE 'RLS Enabled: % / 3 expected', rls_count;
  RAISE NOTICE 'RLS Policies: % / 12 expected', policy_count;
  RAISE NOTICE 'Foreign Keys: % / 8 expected', fk_count;
  RAISE NOTICE 'Performance Indexes: % / 14 expected', index_count;
  RAISE NOTICE 'Auto-Update Triggers: % / 2 expected', trigger_count;
  RAISE NOTICE '';

  IF table_count = 3 AND rls_count = 3 AND policy_count = 12 AND fk_count = 8 AND index_count = 14 AND trigger_count = 2 THEN
    RAISE NOTICE '✓✓✓ ALL CHECKS PASSED! GL Pairs feature is ready to use! ✓✓✓';
  ELSE
    RAISE NOTICE '✗✗✗ SOME CHECKS FAILED! Review the output above for details. ✗✗✗';
  END IF;

  RAISE NOTICE '================================================';
END $$;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 1. Copy this entire script
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run"
-- 4. Review all output sections
-- 5. Check final summary report
-- 6. All counts should match expected values
-- 7. Look for ✓ symbols indicating success

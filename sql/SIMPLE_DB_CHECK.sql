-- =====================================================
-- SIMPLE DATABASE CHECK - Alternative Method
-- =====================================================
-- If the RLS check fails, try these simpler queries one at a time
-- =====================================================

-- QUERY 1: List all tables in your database
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- QUERY 2: Check if specific critical tables exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes_builder' AND table_schema = 'public')
    THEN 'EXISTS' ELSE 'MISSING'
  END as notes_builder,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'close_tasks' AND table_schema = 'public')
    THEN 'EXISTS' ELSE 'MISSING'
  END as close_tasks,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'close_reconciliations' AND table_schema = 'public')
    THEN 'EXISTS' ELSE 'MISSING'
  END as close_reconciliations,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'close_milestones' AND table_schema = 'public')
    THEN 'EXISTS' ELSE 'MISSING'
  END as close_milestones,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mda_content' AND table_schema = 'public')
    THEN 'EXISTS' ELSE 'MISSING'
  END as mda_content,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_sections' AND table_schema = 'public')
    THEN 'EXISTS' ELSE 'MISSING'
  END as report_sections;

-- QUERY 3: Count total tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- QUERY 4: Count total indexes
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';

-- QUERY 5: Check if close_users table has data
SELECT COUNT(*) as close_users_count
FROM close_users;

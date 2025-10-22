-- ============================================================================
-- CONSOLIDATION LOGS TABLE - SUPABASE SETUP SCRIPT
-- ============================================================================
-- Run this entire script in Supabase SQL Editor to create the consolidation_logs table
-- This script is idempotent - safe to run multiple times
-- ============================================================================

-- Step 1: Check if statement_type ENUM exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statement_type') THEN
    CREATE TYPE statement_type AS ENUM (
      'balance_sheet',
      'income_statement',
      'cash_flow',
      'equity_statement'
    );
    RAISE NOTICE 'Created statement_type ENUM';
  ELSE
    RAISE NOTICE 'statement_type ENUM already exists';
  END IF;
END$$;

-- Step 2: Create consolidation_logs table
CREATE TABLE IF NOT EXISTS consolidation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  statement_type statement_type NOT NULL,
  action TEXT NOT NULL DEFAULT 'save',
  records_count INTEGER NOT NULL DEFAULT 0,
  saved_by TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_company_id
  ON consolidation_logs(company_id);

CREATE INDEX IF NOT EXISTS idx_consolidation_logs_period
  ON consolidation_logs(period);

CREATE INDEX IF NOT EXISTS idx_consolidation_logs_statement_type
  ON consolidation_logs(statement_type);

CREATE INDEX IF NOT EXISTS idx_consolidation_logs_saved_at
  ON consolidation_logs(saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_consolidation_logs_saved_by
  ON consolidation_logs(saved_by);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE consolidation_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view consolidation logs" ON consolidation_logs;
DROP POLICY IF EXISTS "Users can insert consolidation logs" ON consolidation_logs;

-- Step 6: Create RLS policies for multi-tenant security

-- Policy 1: Users can only view logs from their own company
CREATE POLICY "Users can view consolidation logs"
ON consolidation_logs
FOR SELECT
USING (
  company_id IN (
    SELECT company_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Policy 2: Users can only insert logs for their own company
CREATE POLICY "Users can insert consolidation logs"
ON consolidation_logs
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Step 7: Add table and column comments for documentation
COMMENT ON TABLE consolidation_logs IS 'Audit log for consolidation workings saves - tracks who saved what and when';

COMMENT ON COLUMN consolidation_logs.id IS 'Unique identifier for the log entry';
COMMENT ON COLUMN consolidation_logs.company_id IS 'Company that owns this log entry (multi-tenancy)';
COMMENT ON COLUMN consolidation_logs.period IS 'Accounting period for which consolidation was saved (e.g., 2024-12-31)';
COMMENT ON COLUMN consolidation_logs.statement_type IS 'Type of financial statement (balance_sheet, income_statement, etc.)';
COMMENT ON COLUMN consolidation_logs.action IS 'Action performed (save, delete, update)';
COMMENT ON COLUMN consolidation_logs.records_count IS 'Number of consolidation working records saved';
COMMENT ON COLUMN consolidation_logs.saved_by IS 'Email address of user who performed the action';
COMMENT ON COLUMN consolidation_logs.saved_at IS 'Timestamp when action was performed';
COMMENT ON COLUMN consolidation_logs.notes IS 'Optional notes about the save operation';
COMMENT ON COLUMN consolidation_logs.created_at IS 'Record creation timestamp';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the table was created successfully

-- Check if table exists
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'consolidation_logs';

-- Check table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'consolidation_logs'
ORDER BY ordinal_position;

-- Check indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'consolidation_logs';

-- Check RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'consolidation_logs';

-- Check RLS policies
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'consolidation_logs';

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Uncomment and modify to insert sample data for testing

/*
INSERT INTO consolidation_logs (
  company_id,
  period,
  statement_type,
  action,
  records_count,
  saved_by,
  notes
) VALUES (
  (SELECT id FROM companies LIMIT 1), -- Use your actual company_id
  '2024-12-31',
  'balance_sheet',
  'save',
  150,
  'test@example.com',
  'Test log entry'
);
*/

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ consolidation_logs table created successfully!';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Ready to use!';
END$$;

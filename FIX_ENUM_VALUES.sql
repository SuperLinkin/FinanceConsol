-- ============================================================================
-- FIX: statement_type ENUM Values Mismatch
-- ============================================================================
-- The error indicates the enum expects different values than what we're using
-- Current code uses: 'balance_sheet', 'income_statement', 'cash_flow'
-- We need to check and update the enum to match
-- ============================================================================

-- Step 1: Check current enum values
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'statement_type'
ORDER BY e.enumsortorder;

-- Step 2: If the values don't match, we need to recreate the enum
-- First, drop the consolidation_logs table temporarily
DROP TABLE IF EXISTS consolidation_logs CASCADE;

-- Step 3: Drop and recreate the enum with correct values
DROP TYPE IF EXISTS statement_type CASCADE;

CREATE TYPE statement_type AS ENUM (
  'balance_sheet',
  'income_statement',
  'cash_flow',
  'equity_statement'
);

-- Step 4: Recreate the consolidation_logs table
CREATE TABLE consolidation_logs (
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

-- Step 5: Recreate indexes
CREATE INDEX idx_consolidation_logs_company_id ON consolidation_logs(company_id);
CREATE INDEX idx_consolidation_logs_period ON consolidation_logs(period);
CREATE INDEX idx_consolidation_logs_statement_type ON consolidation_logs(statement_type);
CREATE INDEX idx_consolidation_logs_saved_at ON consolidation_logs(saved_at DESC);
CREATE INDEX idx_consolidation_logs_saved_by ON consolidation_logs(saved_by);

-- Step 6: Enable RLS
ALTER TABLE consolidation_logs ENABLE ROW LEVEL SECURITY;

-- Step 7: Recreate RLS policies
CREATE POLICY "Users can view consolidation logs"
ON consolidation_logs
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert consolidation logs"
ON consolidation_logs
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- Step 8: Add comments
COMMENT ON TABLE consolidation_logs IS 'Audit log for consolidation workings saves';
COMMENT ON COLUMN consolidation_logs.company_id IS 'Company that owns this log entry';
COMMENT ON COLUMN consolidation_logs.period IS 'Accounting period';
COMMENT ON COLUMN consolidation_logs.statement_type IS 'Type of financial statement';
COMMENT ON COLUMN consolidation_logs.action IS 'Action performed (save, delete, update)';
COMMENT ON COLUMN consolidation_logs.records_count IS 'Number of records saved';
COMMENT ON COLUMN consolidation_logs.saved_by IS 'Email of user who performed the action';
COMMENT ON COLUMN consolidation_logs.saved_at IS 'Timestamp when action was performed';

-- Step 9: Verify the enum values
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'statement_type'
ORDER BY e.enumsortorder;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ statement_type enum recreated with correct values';
  RAISE NOTICE '✅ consolidation_logs table recreated';
  RAISE NOTICE '✅ All indexes and policies applied';
END$$;

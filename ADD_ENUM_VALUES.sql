-- ============================================================================
-- ADD MISSING ENUM VALUES TO statement_type
-- ============================================================================
-- This script adds snake_case values to the existing statement_type enum
-- without breaking existing data that uses Title Case values
-- ============================================================================

-- Step 1: Check current enum values
SELECT 'Current enum values:' as message;
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'statement_type'
ORDER BY e.enumsortorder;

-- Step 2: Add new snake_case values if they don't exist
DO $$
BEGIN
  -- Add 'balance_sheet' if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'statement_type' AND e.enumlabel = 'balance_sheet'
  ) THEN
    ALTER TYPE statement_type ADD VALUE 'balance_sheet';
    RAISE NOTICE 'Added enum value: balance_sheet';
  END IF;

  -- Add 'income_statement' if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'statement_type' AND e.enumlabel = 'income_statement'
  ) THEN
    ALTER TYPE statement_type ADD VALUE 'income_statement';
    RAISE NOTICE 'Added enum value: income_statement';
  END IF;

  -- Add 'cash_flow' if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'statement_type' AND e.enumlabel = 'cash_flow'
  ) THEN
    ALTER TYPE statement_type ADD VALUE 'cash_flow';
    RAISE NOTICE 'Added enum value: cash_flow';
  END IF;

  -- Add 'equity_statement' if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'statement_type' AND e.enumlabel = 'equity_statement'
  ) THEN
    ALTER TYPE statement_type ADD VALUE 'equity_statement';
    RAISE NOTICE 'Added enum value: equity_statement';
  END IF;
END$$;

-- Step 3: Verify all values now exist
SELECT 'Updated enum values:' as message;
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'statement_type'
ORDER BY e.enumsortorder;

-- Step 4: Now create consolidation_logs table (if not exists)
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

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_company_id ON consolidation_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_period ON consolidation_logs(period);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_statement_type ON consolidation_logs(statement_type);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_saved_at ON consolidation_logs(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_saved_by ON consolidation_logs(saved_by);

-- Step 6: Enable RLS
ALTER TABLE consolidation_logs ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop and recreate RLS policies
DROP POLICY IF EXISTS "Users can view consolidation logs" ON consolidation_logs;
DROP POLICY IF EXISTS "Users can insert consolidation logs" ON consolidation_logs;

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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Enum values added successfully';
  RAISE NOTICE '✅ consolidation_logs table ready';
  RAISE NOTICE '✅ Both Title Case and snake_case values supported';
  RAISE NOTICE '✅ Your app can now use: balance_sheet, income_statement, cash_flow, equity_statement';
END$$;

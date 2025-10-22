-- ============================================================================
-- CONSOLIDATION LOGS TABLE
-- ============================================================================
-- Tracks when consolidation workings were saved, by whom, and when

CREATE TABLE IF NOT EXISTS consolidation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  statement_type statement_type NOT NULL,
  action TEXT NOT NULL DEFAULT 'save', -- 'save', 'delete', 'update'
  records_count INTEGER NOT NULL DEFAULT 0,
  saved_by TEXT NOT NULL, -- Email of user who saved
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_company_id ON consolidation_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_period ON consolidation_logs(period);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_statement_type ON consolidation_logs(statement_type);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_saved_at ON consolidation_logs(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_consolidation_logs_saved_by ON consolidation_logs(saved_by);

-- Enable RLS
ALTER TABLE consolidation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view consolidation logs" ON consolidation_logs;
CREATE POLICY "Users can view consolidation logs" ON consolidation_logs
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert consolidation logs" ON consolidation_logs;
CREATE POLICY "Users can insert consolidation logs" ON consolidation_logs
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE consolidation_logs IS 'Audit log for consolidation workings saves';
COMMENT ON COLUMN consolidation_logs.period IS 'Period for which consolidation was saved';
COMMENT ON COLUMN consolidation_logs.statement_type IS 'Type of statement (balance_sheet, income_statement, etc.)';
COMMENT ON COLUMN consolidation_logs.action IS 'Action performed (save, delete, update)';
COMMENT ON COLUMN consolidation_logs.records_count IS 'Number of records saved';
COMMENT ON COLUMN consolidation_logs.saved_by IS 'Email of user who performed the action';
COMMENT ON COLUMN consolidation_logs.saved_at IS 'Timestamp when action was performed';

-- ============================================
-- GL PAIRS FOR ELIMINATION ENTRIES
-- ============================================
-- This script creates new tables for the GL Pairs feature
-- Note: elimination_entries table already exists in the schema,
-- so we create new tables with different names

-- Create elimination_gl_pairs table for storing GL pair configurations
CREATE TABLE IF NOT EXISTS elimination_gl_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pair_name TEXT NOT NULL,
  description TEXT,
  gl1_entity UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  gl1_code TEXT NOT NULL,
  gl2_entity UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  gl2_code TEXT NOT NULL,
  difference_gl_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create elimination_journal_entries table for storing posted elimination journal entries
-- (different from existing elimination_entries which uses a different schema)
CREATE TABLE IF NOT EXISTS elimination_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_name TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  total_debit DECIMAL(15, 2) DEFAULT 0,
  total_credit DECIMAL(15, 2) DEFAULT 0,
  is_posted BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create elimination_journal_entry_lines table for storing individual JE lines
CREATE TABLE IF NOT EXISTS elimination_journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES elimination_journal_entries(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  gl_code TEXT NOT NULL,
  gl_name TEXT,
  debit DECIMAL(15, 2) DEFAULT 0,
  credit DECIMAL(15, 2) DEFAULT 0,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_elim_pairs_gl1 ON elimination_gl_pairs(gl1_entity, gl1_code);
CREATE INDEX IF NOT EXISTS idx_elim_pairs_gl2 ON elimination_gl_pairs(gl2_entity, gl2_code);
CREATE INDEX IF NOT EXISTS idx_elim_pairs_active ON elimination_gl_pairs(is_active);

CREATE INDEX IF NOT EXISTS idx_elim_journal_entries_date ON elimination_journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_elim_journal_entries_posted ON elimination_journal_entries(is_posted);

CREATE INDEX IF NOT EXISTS idx_elim_journal_lines_entry ON elimination_journal_entry_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_elim_journal_lines_entity ON elimination_journal_entry_lines(entity_id);
CREATE INDEX IF NOT EXISTS idx_elim_journal_lines_gl ON elimination_journal_entry_lines(gl_code);

-- Add RLS policies for elimination_gl_pairs
ALTER TABLE elimination_gl_pairs ENABLE ROW LEVEL SECURITY;

-- Users can view all pairs (no company_id column, so we allow all authenticated users)
-- In production, you may want to add company_id column and filter by it
CREATE POLICY "Users can view all GL pairs" ON elimination_gl_pairs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert GL pairs" ON elimination_gl_pairs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update GL pairs" ON elimination_gl_pairs
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete GL pairs" ON elimination_gl_pairs
  FOR DELETE USING (true);

-- Add RLS policies for elimination_journal_entries
ALTER TABLE elimination_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all journal entries" ON elimination_journal_entries
  FOR SELECT USING (true);

CREATE POLICY "Users can insert journal entries" ON elimination_journal_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update journal entries" ON elimination_journal_entries
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete journal entries" ON elimination_journal_entries
  FOR DELETE USING (true);

-- Add RLS policies for elimination_journal_entry_lines
ALTER TABLE elimination_journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all journal entry lines" ON elimination_journal_entry_lines
  FOR SELECT USING (true);

CREATE POLICY "Users can insert journal entry lines" ON elimination_journal_entry_lines
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update journal entry lines" ON elimination_journal_entry_lines
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete journal entry lines" ON elimination_journal_entry_lines
  FOR DELETE USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'GL Pairs tables created successfully!';
  RAISE NOTICE 'Tables: elimination_gl_pairs, elimination_journal_entries, elimination_journal_entry_lines';
END $$;

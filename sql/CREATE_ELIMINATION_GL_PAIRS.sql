-- Create elimination_gl_pairs table for storing GL pair configurations
CREATE TABLE IF NOT EXISTS elimination_gl_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
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

-- Create elimination_entries table for storing posted elimination journal entries
CREATE TABLE IF NOT EXISTS elimination_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  entry_name TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  total_debit DECIMAL(15, 2) DEFAULT 0,
  total_credit DECIMAL(15, 2) DEFAULT 0,
  is_posted BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create elimination_entry_lines table for storing individual JE lines
CREATE TABLE IF NOT EXISTS elimination_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES elimination_entries(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  gl_code TEXT NOT NULL,
  gl_name TEXT,
  debit DECIMAL(15, 2) DEFAULT 0,
  credit DECIMAL(15, 2) DEFAULT 0,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_elim_pairs_company ON elimination_gl_pairs(company_id);
CREATE INDEX IF NOT EXISTS idx_elim_pairs_gl1 ON elimination_gl_pairs(gl1_entity, gl1_code);
CREATE INDEX IF NOT EXISTS idx_elim_pairs_gl2 ON elimination_gl_pairs(gl2_entity, gl2_code);
CREATE INDEX IF NOT EXISTS idx_elim_pairs_active ON elimination_gl_pairs(is_active);

CREATE INDEX IF NOT EXISTS idx_elim_entries_company ON elimination_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_elim_entries_date ON elimination_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_elim_entries_posted ON elimination_entries(is_posted);

CREATE INDEX IF NOT EXISTS idx_elim_lines_entry ON elimination_entry_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_elim_lines_entity ON elimination_entry_lines(entity_id);
CREATE INDEX IF NOT EXISTS idx_elim_lines_gl ON elimination_entry_lines(gl_code);

-- Add RLS policies for elimination_gl_pairs
ALTER TABLE elimination_gl_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pairs for their company" ON elimination_gl_pairs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pairs for their company" ON elimination_gl_pairs
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update pairs for their company" ON elimination_gl_pairs
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pairs for their company" ON elimination_gl_pairs
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Add RLS policies for elimination_entries
ALTER TABLE elimination_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries for their company" ON elimination_entries
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert entries for their company" ON elimination_entries
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries for their company" ON elimination_entries
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries for their company" ON elimination_entries
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Add RLS policies for elimination_entry_lines
ALTER TABLE elimination_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lines for their company entries" ON elimination_entry_lines
  FOR SELECT USING (
    entry_id IN (
      SELECT id FROM elimination_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert lines for their company entries" ON elimination_entry_lines
  FOR INSERT WITH CHECK (
    entry_id IN (
      SELECT id FROM elimination_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update lines for their company entries" ON elimination_entry_lines
  FOR UPDATE USING (
    entry_id IN (
      SELECT id FROM elimination_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete lines for their company entries" ON elimination_entry_lines
  FOR DELETE USING (
    entry_id IN (
      SELECT id FROM elimination_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

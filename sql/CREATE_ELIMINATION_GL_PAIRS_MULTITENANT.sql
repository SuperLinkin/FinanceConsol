-- ============================================
-- GL PAIRS FOR ELIMINATION ENTRIES
-- WITH MULTI-TENANT ISOLATION
-- ============================================
-- This script creates new tables for the GL Pairs feature
-- with proper company-level isolation for multi-tenancy

-- Drop existing tables if they exist (for clean install)
DROP TABLE IF EXISTS public.elimination_journal_entry_lines CASCADE;
DROP TABLE IF EXISTS public.elimination_journal_entries CASCADE;
DROP TABLE IF EXISTS public.elimination_gl_pairs CASCADE;

-- ============================================
-- 1. ELIMINATION GL PAIRS TABLE
-- ============================================
CREATE TABLE public.elimination_gl_pairs (
  id UUID DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  pair_name TEXT NOT NULL,
  description TEXT,
  gl1_entity UUID NOT NULL,
  gl1_code TEXT NOT NULL,
  gl2_entity UUID NOT NULL,
  gl2_code TEXT NOT NULL,
  difference_gl_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT elimination_gl_pairs_pkey PRIMARY KEY (id),
  CONSTRAINT elimination_gl_pairs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
  CONSTRAINT elimination_gl_pairs_gl1_entity_fkey FOREIGN KEY (gl1_entity) REFERENCES public.entities(id) ON DELETE CASCADE,
  CONSTRAINT elimination_gl_pairs_gl2_entity_fkey FOREIGN KEY (gl2_entity) REFERENCES public.entities(id) ON DELETE CASCADE,
  CONSTRAINT elimination_gl_pairs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- ============================================
-- 2. ELIMINATION JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE public.elimination_journal_entries (
  id UUID DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  entry_name TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  total_debit NUMERIC(15, 2) DEFAULT 0,
  total_credit NUMERIC(15, 2) DEFAULT 0,
  is_posted BOOLEAN DEFAULT true,
  period DATE NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT elimination_journal_entries_pkey PRIMARY KEY (id),
  CONSTRAINT elimination_journal_entries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
  CONSTRAINT elimination_journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- ============================================
-- 3. ELIMINATION JOURNAL ENTRY LINES TABLE
-- ============================================
CREATE TABLE public.elimination_journal_entry_lines (
  id UUID DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL,
  entity_id UUID NOT NULL,
  gl_code TEXT NOT NULL,
  gl_name TEXT,
  debit NUMERIC(15, 2) DEFAULT 0,
  credit NUMERIC(15, 2) DEFAULT 0,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT elimination_journal_entry_lines_pkey PRIMARY KEY (id),
  CONSTRAINT elimination_journal_entry_lines_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.elimination_journal_entries(id) ON DELETE CASCADE,
  CONSTRAINT elimination_journal_entry_lines_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON DELETE CASCADE
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for elimination_gl_pairs
CREATE INDEX idx_elim_pairs_company ON elimination_gl_pairs(company_id);
CREATE INDEX idx_elim_pairs_gl1 ON elimination_gl_pairs(gl1_entity, gl1_code);
CREATE INDEX idx_elim_pairs_gl2 ON elimination_gl_pairs(gl2_entity, gl2_code);
CREATE INDEX idx_elim_pairs_active ON elimination_gl_pairs(is_active);
CREATE INDEX idx_elim_pairs_created_by ON elimination_gl_pairs(created_by);

-- Indexes for elimination_journal_entries
CREATE INDEX idx_elim_journal_entries_company ON elimination_journal_entries(company_id);
CREATE INDEX idx_elim_journal_entries_date ON elimination_journal_entries(entry_date);
CREATE INDEX idx_elim_journal_entries_period ON elimination_journal_entries(period);
CREATE INDEX idx_elim_journal_entries_posted ON elimination_journal_entries(is_posted);
CREATE INDEX idx_elim_journal_entries_created_by ON elimination_journal_entries(created_by);

-- Indexes for elimination_journal_entry_lines
CREATE INDEX idx_elim_journal_lines_entry ON elimination_journal_entry_lines(entry_id);
CREATE INDEX idx_elim_journal_lines_entity ON elimination_journal_entry_lines(entity_id);
CREATE INDEX idx_elim_journal_lines_gl ON elimination_journal_entry_lines(gl_code);
CREATE INDEX idx_elim_journal_lines_number ON elimination_journal_entry_lines(entry_id, line_number);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE elimination_gl_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE elimination_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE elimination_journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR elimination_gl_pairs
-- ============================================

-- Users can only view GL pairs for their own company
CREATE POLICY "Users can view their company GL pairs" ON elimination_gl_pairs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can only create GL pairs for their own company
CREATE POLICY "Users can create GL pairs for their company" ON elimination_gl_pairs
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can only update GL pairs for their own company
CREATE POLICY "Users can update their company GL pairs" ON elimination_gl_pairs
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can only delete GL pairs for their own company
CREATE POLICY "Users can delete their company GL pairs" ON elimination_gl_pairs
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES FOR elimination_journal_entries
-- ============================================

-- Users can only view journal entries for their own company
CREATE POLICY "Users can view their company journal entries" ON elimination_journal_entries
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can only create journal entries for their own company
CREATE POLICY "Users can create journal entries for their company" ON elimination_journal_entries
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can only update journal entries for their own company
CREATE POLICY "Users can update their company journal entries" ON elimination_journal_entries
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can only delete journal entries for their own company
CREATE POLICY "Users can delete their company journal entries" ON elimination_journal_entries
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES FOR elimination_journal_entry_lines
-- ============================================

-- Users can only view lines for entries that belong to their company
CREATE POLICY "Users can view lines for their company entries" ON elimination_journal_entry_lines
  FOR SELECT USING (
    entry_id IN (
      SELECT id FROM elimination_journal_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can only create lines for entries that belong to their company
CREATE POLICY "Users can create lines for their company entries" ON elimination_journal_entry_lines
  FOR INSERT WITH CHECK (
    entry_id IN (
      SELECT id FROM elimination_journal_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can only update lines for entries that belong to their company
CREATE POLICY "Users can update lines for their company entries" ON elimination_journal_entry_lines
  FOR UPDATE USING (
    entry_id IN (
      SELECT id FROM elimination_journal_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can only delete lines for entries that belong to their company
CREATE POLICY "Users can delete lines for their company entries" ON elimination_journal_entry_lines
  FOR DELETE USING (
    entry_id IN (
      SELECT id FROM elimination_journal_entries
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- ============================================
-- 6. TRIGGER FUNCTIONS FOR AUTO-UPDATE
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_elimination_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for elimination_gl_pairs
CREATE TRIGGER update_elimination_gl_pairs_updated_at
  BEFORE UPDATE ON elimination_gl_pairs
  FOR EACH ROW
  EXECUTE FUNCTION update_elimination_updated_at();

-- Trigger for elimination_journal_entries
CREATE TRIGGER update_elimination_journal_entries_updated_at
  BEFORE UPDATE ON elimination_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_elimination_updated_at();

-- ============================================
-- 7. SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'GL Pairs tables created successfully with multi-tenant isolation!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - elimination_gl_pairs';
  RAISE NOTICE '  - elimination_journal_entries';
  RAISE NOTICE '  - elimination_journal_entry_lines';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ Multi-tenant isolation via company_id';
  RAISE NOTICE '  ✓ Row-Level Security (RLS) policies';
  RAISE NOTICE '  ✓ Foreign key constraints';
  RAISE NOTICE '  ✓ Performance indexes';
  RAISE NOTICE '  ✓ Auto-updating timestamps';
  RAISE NOTICE '  ✓ CASCADE delete protection';
  RAISE NOTICE '================================================';
END $$;

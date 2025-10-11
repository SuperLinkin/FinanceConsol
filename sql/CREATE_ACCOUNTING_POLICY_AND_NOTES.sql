-- Create accounting_policies table
CREATE TABLE IF NOT EXISTS accounting_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_title VARCHAR(500) NOT NULL,
  policy_category VARCHAR(200) NOT NULL,
  policy_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_notes table
CREATE TABLE IF NOT EXISTS financial_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_number VARCHAR(50) NOT NULL,
  note_title VARCHAR(500) NOT NULL,
  note_type VARCHAR(50) NOT NULL DEFAULT 'Text',
  note_content TEXT NOT NULL,
  note_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_accounting_policies_category ON accounting_policies(policy_category);
CREATE INDEX IF NOT EXISTS idx_accounting_policies_active ON accounting_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_financial_notes_order ON financial_notes(note_order);
CREATE INDEX IF NOT EXISTS idx_financial_notes_active ON financial_notes(is_active);
CREATE INDEX IF NOT EXISTS idx_financial_notes_type ON financial_notes(note_type);

-- Add comments for documentation
COMMENT ON TABLE accounting_policies IS 'Stores accounting policies for financial reporting';
COMMENT ON TABLE financial_notes IS 'Stores custom financial notes that can be included in reports';

COMMENT ON COLUMN accounting_policies.policy_title IS 'Title of the accounting policy';
COMMENT ON COLUMN accounting_policies.policy_category IS 'Category such as Revenue Recognition, Inventory, etc.';
COMMENT ON COLUMN accounting_policies.policy_content IS 'Full policy content in markdown or HTML format';
COMMENT ON COLUMN accounting_policies.is_active IS 'Whether the policy is currently active';

COMMENT ON COLUMN financial_notes.note_number IS 'Note number for display (e.g., 1, 2.1, 3a)';
COMMENT ON COLUMN financial_notes.note_title IS 'Title of the financial note';
COMMENT ON COLUMN financial_notes.note_type IS 'Type of note: Text, Table, Chart, or Mixed';
COMMENT ON COLUMN financial_notes.note_content IS 'Note content with text and tables';
COMMENT ON COLUMN financial_notes.note_order IS 'Display order for notes';
COMMENT ON COLUMN financial_notes.is_active IS 'Whether the note is currently active';

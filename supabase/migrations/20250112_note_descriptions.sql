-- Create note_descriptions table for storing note content that users can edit
CREATE TABLE IF NOT EXISTS note_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  note_ref INTEGER NOT NULL, -- Sequential note number (1, 2, 3, etc.)
  note_title TEXT NOT NULL, -- e.g., "Property, Plant and Equipment"
  note_content TEXT, -- User-editable note description/wording
  statement_type TEXT NOT NULL CHECK (statement_type IN ('balance_sheet', 'income_statement')),

  -- COA hierarchy references for context
  class_name TEXT,
  subclass_name TEXT,
  note_name TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Ensure unique note_ref per company
  UNIQUE(company_id, note_ref)
);

-- Create index for faster lookups
CREATE INDEX idx_note_descriptions_company ON note_descriptions(company_id);
CREATE INDEX idx_note_descriptions_note_ref ON note_descriptions(note_ref);
CREATE INDEX idx_note_descriptions_statement ON note_descriptions(statement_type);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_note_descriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER note_descriptions_updated_at
BEFORE UPDATE ON note_descriptions
FOR EACH ROW
EXECUTE FUNCTION update_note_descriptions_updated_at();

-- Add comment
COMMENT ON TABLE note_descriptions IS 'Stores note descriptions/content for financial statements that users can edit in the Note Builder';

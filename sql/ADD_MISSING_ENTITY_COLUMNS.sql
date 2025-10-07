-- Add missing columns to entities table
-- Run this in Supabase SQL Editor

ALTER TABLE entities
ADD COLUMN IF NOT EXISTS tax_jurisdiction TEXT,
ADD COLUMN IF NOT EXISTS financial_year_end TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS include_in_consolidation BOOLEAN DEFAULT TRUE;

-- Add comments
COMMENT ON COLUMN entities.tax_jurisdiction IS 'Tax jurisdiction where entity is registered';
COMMENT ON COLUMN entities.financial_year_end IS 'Financial year end date (e.g., 31-Dec)';
COMMENT ON COLUMN entities.status IS 'Entity status (Active, Inactive, etc.)';
COMMENT ON COLUMN entities.notes IS 'Additional notes about the entity';
COMMENT ON COLUMN entities.include_in_consolidation IS 'Whether to include this entity in consolidation';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Entity columns added successfully!';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '  - tax_jurisdiction';
    RAISE NOTICE '  - financial_year_end';
    RAISE NOTICE '  - status';
    RAISE NOTICE '  - notes';
    RAISE NOTICE '  - include_in_consolidation';
END $$;

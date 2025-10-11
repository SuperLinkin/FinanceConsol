-- Fix ownership_percentage column to allow 100.00
-- The issue: NUMERIC(5,2) only allows up to 999.99 but with 2 decimal places,
-- the max is actually 999.99, however for percentages we need to store 100.00
-- which requires at least NUMERIC(5,2) to be changed to NUMERIC without precision
-- or use a larger precision like NUMERIC(6,3) or better yet, just numeric

-- Drop the old constraint if it exists (from old schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_ownership_percentage'
  ) THEN
    ALTER TABLE entities DROP CONSTRAINT check_ownership_percentage;
  END IF;
END $$;

-- Alter the column to remove precision constraint
-- This allows any numeric value while still maintaining decimal precision
ALTER TABLE entities
ALTER COLUMN ownership_percentage TYPE NUMERIC USING ownership_percentage::NUMERIC;

-- Add back the check constraint to ensure values are between 0 and 100
ALTER TABLE entities
ADD CONSTRAINT check_ownership_percentage
CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100);

-- Note: ownership_percentage_2 will be added in a future migration when split ownership feature is implemented

-- Verify the changes
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name = 'entities'
  AND column_name = 'ownership_percentage';

-- Test: This should now work without issues
-- UPDATE entities SET ownership_percentage = 100.00 WHERE entity_code = 'YOUR_ENTITY_CODE';

-- ============================================================================
-- ADD created_by COLUMN TO consolidation_workings
-- ============================================================================
-- The save API is trying to insert 'created_by' but the column doesn't exist
-- This script adds the column as a foreign key reference to users table
-- ============================================================================

-- Step 1: Check if column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'consolidation_workings'
      AND column_name = 'created_by'
  ) THEN
    -- Add the column as UUID foreign key
    ALTER TABLE consolidation_workings
    ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

    RAISE NOTICE '✅ Added created_by column to consolidation_workings';
  ELSE
    RAISE NOTICE 'ℹ️  created_by column already exists';
  END IF;
END$$;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN consolidation_workings.created_by IS 'User ID (foreign key to users table) who created/saved this consolidation working';

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_consolidation_workings_created_by ON consolidation_workings(created_by);

-- Step 4: Verify the column was added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'consolidation_workings'
  AND column_name IN ('created_by', 'calculated_at')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ consolidation_workings.created_by column ready';
  RAISE NOTICE '✅ It is now a foreign key to users(id)';
  RAISE NOTICE '✅ Save functionality will now work!';
END$$;

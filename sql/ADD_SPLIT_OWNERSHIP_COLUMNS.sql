-- Add split ownership columns to entities table
-- These columns support entities with multiple parent entities (e.g., Joint Ventures)

-- Add split_ownership boolean column
ALTER TABLE entities
ADD COLUMN IF NOT EXISTS split_ownership BOOLEAN DEFAULT FALSE;

-- Add second parent entity reference
ALTER TABLE entities
ADD COLUMN IF NOT EXISTS parent_entity_id_2 UUID REFERENCES entities(id);

-- Add second ownership percentage with same constraints as first
ALTER TABLE entities
ADD COLUMN IF NOT EXISTS ownership_percentage_2 NUMERIC
CHECK (ownership_percentage_2 IS NULL OR (ownership_percentage_2 >= 0 AND ownership_percentage_2 <= 100));

-- Add comment to explain the columns
COMMENT ON COLUMN entities.split_ownership IS 'Indicates if this entity has multiple parent entities (e.g., Joint Venture)';
COMMENT ON COLUMN entities.parent_entity_id_2 IS 'Second parent entity for split ownership scenarios';
COMMENT ON COLUMN entities.ownership_percentage_2 IS 'Ownership percentage by second parent entity (0-100)';

-- Verify the new columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'entities'
  AND column_name IN ('split_ownership', 'parent_entity_id_2', 'ownership_percentage_2')
ORDER BY column_name;

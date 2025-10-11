-- Clean up entities for company (safely handles foreign key constraints)
-- Run this in Supabase SQL Editor to clean up test entities

-- Step 1: Find all entities for your company
SELECT id, entity_code, entity_name, parent_entity_id, company_id
FROM entities
WHERE company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY parent_entity_id NULLS FIRST;

-- Step 2: Delete child entities first (entities with parent_entity_id set)
DELETE FROM entities
WHERE company_id = '00000000-0000-0000-0000-000000000001'
  AND parent_entity_id IS NOT NULL;

-- Step 3: Delete parent entities (entities with parent_entity_id NULL)
DELETE FROM entities
WHERE company_id = '00000000-0000-0000-0000-000000000001'
  AND parent_entity_id IS NULL;

-- Verify all entities are deleted
SELECT COUNT(*) as remaining_entities
FROM entities
WHERE company_id = '00000000-0000-0000-0000-000000000001';

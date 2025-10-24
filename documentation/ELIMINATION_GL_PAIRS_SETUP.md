# GL Pairs Setup - FIXED VERSION

## Problem

The initial SQL script (`CREATE_ELIMINATION_GL_PAIRS.sql`) failed because:
1. The `elimination_entries` table already exists with a different schema
2. The script tried to reference `company_id` column which doesn't exist in some tables
3. RLS policies were trying to filter by `company_id` on tables that don't have it

## Solution

Created a **FIXED SQL script** that uses different table names and works with the current schema.

## Setup Instructions

### Step 1: Run the FIXED SQL Script

Execute this SQL in Supabase SQL Editor:

```sql
Location: sql/CREATE_ELIMINATION_GL_PAIRS_FIXED.sql
```

This will create three new tables:

1. **elimination_gl_pairs** - Stores GL pair configurations
2. **elimination_journal_entries** - Stores elimination JE headers (different from existing `elimination_entries`)
3. **elimination_journal_entry_lines** - Stores individual JE lines

### Step 2: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('elimination_gl_pairs', 'elimination_journal_entries', 'elimination_journal_entry_lines');
```

You should see all 3 tables listed.

### Step 3: Test the Feature

1. Navigate to the **Eliminations** page in the application
2. Click on the **GL Pairs** tab
3. Click **"Create GL Pair"**
4. Fill in the form:
   - Pair Name: "Test Pair"
   - GL1: Select an entity and GL
   - GL2: Select another entity and GL
   - (Optional) Difference GL
5. Click **"Create Pair"**

## What Changed

### Database Tables

**New Table Names** (to avoid conflicts):
- `elimination_journal_entries` (instead of `elimination_entries`)
- `elimination_journal_entry_lines` (instead of `elimination_entry_lines`)

**Simplified Security**:
- Removed `company_id` references since the tables don't have that column
- Set RLS policies to allow all authenticated users (simple for now)
- **Note**: In production, you should add `company_id` column and update policies

### API Endpoints Updated

Both API files have been updated to use the correct table names:
- `/api/elimination-pairs` - Uses `elimination_gl_pairs`
- `/api/elimination-entries` - Uses `elimination_journal_entries` and `elimination_journal_entry_lines`

### Schema Structure

```
elimination_gl_pairs
├── id (UUID, PK)
├── pair_name (TEXT)
├── description (TEXT)
├── gl1_entity (UUID → entities.id)
├── gl1_code (TEXT)
├── gl2_entity (UUID → entities.id)
├── gl2_code (TEXT)
├── difference_gl_code (TEXT)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

elimination_journal_entries
├── id (UUID, PK)
├── entry_name (TEXT)
├── entry_date (DATE)
├── description (TEXT)
├── total_debit (DECIMAL)
├── total_credit (DECIMAL)
├── is_posted (BOOLEAN)
├── created_by (UUID)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

elimination_journal_entry_lines
├── id (UUID, PK)
├── entry_id (UUID → elimination_journal_entries.id)
├── entity_id (UUID → entities.id)
├── gl_code (TEXT)
├── gl_name (TEXT)
├── debit (DECIMAL)
├── credit (DECIMAL)
├── line_number (INTEGER)
└── created_at (TIMESTAMP)
```

## Security Notes

### Current Setup (Development)
- RLS is enabled on all tables
- Policies allow all authenticated users
- No company-level isolation

### Production Recommendations

1. **Add `company_id` column** to `elimination_gl_pairs` and `elimination_journal_entries`:
   ```sql
   ALTER TABLE elimination_gl_pairs ADD COLUMN company_id UUID REFERENCES companies(id);
   ALTER TABLE elimination_journal_entries ADD COLUMN company_id UUID REFERENCES companies(id);
   ```

2. **Update RLS policies** to filter by company:
   ```sql
   DROP POLICY "Users can view all GL pairs" ON elimination_gl_pairs;
   CREATE POLICY "Users can view company GL pairs" ON elimination_gl_pairs
     FOR SELECT USING (
       company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
     );
   ```

3. **Update API endpoints** to set and filter by `company_id`

## Troubleshooting

### Tables Not Created
- Check for syntax errors in SQL
- Verify user has CREATE TABLE permissions
- Check that referenced tables (entities) exist

### RLS Blocking Access
- Verify user is authenticated
- Check RLS policies are correct
- Temporarily disable RLS for debugging: `ALTER TABLE elimination_gl_pairs DISABLE ROW LEVEL SECURITY;`

### API Errors
- Check browser console for specific error messages
- Check terminal (npm run dev) for server-side errors
- Verify table names in API match database

## Success Verification

After running the SQL, you should be able to:

✓ Navigate to Eliminations page
✓ Switch to GL Pairs tab
✓ Create a new GL pair
✓ See the pair card with current balances
✓ Click "Create Elimination Entry" to generate JE
✓ Post the JE successfully
✓ See the posted entry in Elimination Entries tab

## Summary

The fixed version:
- Uses unique table names to avoid conflicts
- Works with current schema (no company_id)
- Properly configured RLS (simple mode for now)
- All API endpoints updated
- Ready for testing immediately after SQL execution

Execute `sql/CREATE_ELIMINATION_GL_PAIRS_FIXED.sql` and you're ready to go!

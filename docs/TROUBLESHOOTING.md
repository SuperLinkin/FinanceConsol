# Consolidation Workings Troubleshooting Guide

## Issue: Blank Page / No Data Showing

### Step 1: Check Browser Console

Open browser DevTools (F12) and check the Console tab for errors:

```
Look for:
- "Error loading consolidation data"
- "API response data"
- "Saved workings response"
- "Type of line_items"
```

### Step 2: Test API Endpoint

Open in browser: `http://localhost:3000/api/consolidation/test`

This will run diagnostic tests and show:
- ✅ COA Master Hierarchy count
- ✅ Function availability
- ✅ Chart of Accounts count
- ✅ Ability to create workings

Expected result:
```json
{
  "success": true,
  "summary": {
    "total": 5,
    "passed": 5,
    "failed": 0
  }
}
```

### Step 3: Check Database Tables

Run in Supabase SQL Editor:

```sql
-- Check if coa_master_hierarchy has data
SELECT COUNT(*) FROM coa_master_hierarchy WHERE is_active = true;
-- Should return > 0

-- Check if functions exist
SELECT proname FROM pg_proc WHERE proname LIKE 'generate%consolidation%';
-- Should return: generate_consolidation_line_items, generate_consolidation_totals

-- Check if chart_of_accounts has data
SELECT COUNT(*) FROM chart_of_accounts WHERE is_active = true;
-- Should return > 0

-- Check consolidation_workings
SELECT * FROM consolidation_workings ORDER BY created_at DESC LIMIT 5;
```

### Step 4: Run Test Script

In Supabase SQL Editor, run:
```sql
sql/TEST_GENERATOR.sql
```

This will:
1. Test all functions
2. Create test workings
3. Verify data
4. Clean up

### Step 5: Common Issues & Fixes

#### Issue: "Function does not exist"
**Fix:** Run `sql/07_CONSOLIDATION_WORKINGS_GENERATOR.sql` in Supabase

#### Issue: "No data in coa_master_hierarchy"
**Fix:** Run `sql/02_SEED_DATA.sql` (PART 5: COA MASTER HIERARCHY)

```sql
-- Quick check
SELECT DISTINCT class_name FROM coa_master_hierarchy;
-- Should return: Assets, Liabilities, Equity, Income, Expenses
```

#### Issue: "Line items is empty array"
**Cause:** No chart_of_accounts records linked to hierarchy

**Fix:**
```sql
-- Check if accounts reference the hierarchy
SELECT
  coa.account_code,
  coa.class_level,
  coa.subclass_level,
  coa.note_level,
  CASE
    WHEN h.id IS NOT NULL THEN 'Linked'
    ELSE 'NOT LINKED'
  END as status
FROM chart_of_accounts coa
LEFT JOIN coa_master_hierarchy h ON
  h.class_name = coa.class_level AND
  h.subclass_name = coa.subclass_level AND
  h.note_name = coa.note_level
LIMIT 10;
```

If accounts are NOT LINKED, update them:
```sql
UPDATE chart_of_accounts
SET
  class_level = 'Assets',
  subclass_level = 'Current Assets',
  note_level = 'Cash & Cash Equivalents',
  subnote_level = 'Bank Accounts'
WHERE account_code = '1010';
```

#### Issue: "API returns [object Object]"
**Cause:** JSONB data not being parsed correctly

**Fix:** Already implemented in latest code - reload page

#### Issue: "Workings created but page still blank"
**Cause:** Data format mismatch

**Debug:**
```javascript
// In browser console while on Consolidation Workings page:
// Check what's in localStorage
console.log(localStorage);

// Check if data is loading
// Look for console logs showing:
// - "Saved workings response"
// - "Loading saved working"
// - "Type of line_items"
```

### Step 6: Manual Working Creation

If auto-generate fails, create manually:

```sql
-- Create a simple test working
INSERT INTO consolidation_workings (period, statement_type, line_items, totals, status)
VALUES (
  '2024',
  'balance_sheet',
  '[{"id":"1","name":"Assets","level":"class","indent":0}]'::jsonb,
  '{"total_assets":0}'::jsonb,
  'draft'
);
```

Then refresh the page and check if it loads.

### Step 7: Check Supabase Connection

```javascript
// In browser console:
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.from('consolidation_workings').select('*');
console.log('Data:', data);
console.log('Error:', error);
```

### Step 8: Enable Detailed Logging

The code now includes console.log statements. Check:
1. **Network tab**: Look for `/api/consolidation/generate` call
2. **Console tab**: Look for logged data
3. **Response**: Check the API response body

### Step 9: Database Reset (Last Resort)

If nothing works, reset the database:

```sql
-- 1. Drop and recreate
sql/my_new_tables.sql

-- 2. Seed data
sql/03_WORLD_CURRENCIES.sql
sql/02_SEED_DATA.sql

-- 3. Create functions
sql/07_CONSOLIDATION_WORKINGS_GENERATOR.sql

-- 4. Test
sql/TEST_GENERATOR.sql
```

---

## Quick Diagnostic Checklist

- [ ] Browser console shows no errors
- [ ] `/api/consolidation/test` returns success
- [ ] `coa_master_hierarchy` has > 0 records
- [ ] `chart_of_accounts` has > 0 records
- [ ] Functions exist in database
- [ ] Can create test working via SQL
- [ ] Auto-generate button calls API
- [ ] API returns workings array
- [ ] Page reloads after generation

---

## Still Having Issues?

1. Check the exact error message in console
2. Run `sql/TEST_GENERATOR.sql`
3. Visit `/api/consolidation/test` in browser
4. Check Supabase logs for database errors
5. Verify all SQL scripts ran successfully

**Most Common Fix:** Run all SQL scripts in order:
1. `my_new_tables.sql`
2. `03_WORLD_CURRENCIES.sql`
3. `02_SEED_DATA.sql`
4. `07_CONSOLIDATION_WORKINGS_GENERATOR.sql`

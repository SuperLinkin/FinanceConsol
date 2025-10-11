# Database Update Required

## ⚠️ Important Notice

The application now includes **Group Reporting Currency** features that require a database update.

## What's New?

- **Group Reporting Currency**: Mark ONE currency as the base currency for consolidated reports
- **Currency Validation**: Upload page validates currency consistency
- **Currency Tracking**: Trial balance records include currency information

## How to Update Your Database

### Option 1: Fresh Database Setup (Recommended for new projects)

If you haven't set up your database yet or want to start fresh:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy the contents of `sql/01_CREATE_EVERYTHING.sql`
4. Paste and click **Run**
5. Wait for success message
6. Done! ✅

### Option 2: Add Column to Existing Database

If you already have data and want to keep it:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy and paste this SQL:

```sql
-- Add group reporting currency column
ALTER TABLE currencies
ADD COLUMN IF NOT EXISTS is_group_reporting_currency BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN currencies.is_group_reporting_currency IS 'Base currency for consolidated reports - ONLY ONE should be TRUE';

-- Create unique constraint (ensures only ONE currency is base)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_group_reporting_currency
ON currencies (is_group_reporting_currency)
WHERE is_group_reporting_currency = TRUE;

-- Add currency column to trial_balance (if not exists)
ALTER TABLE trial_balance
ADD COLUMN IF NOT EXISTS currency TEXT;

COMMENT ON COLUMN trial_balance.currency IS 'Currency in which amounts are denominated';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Database updated successfully!';
    RAISE NOTICE '✓ Group reporting currency feature is now available';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Go to Consolidation Config → Currencies';
    RAISE NOTICE '  2. Add your currencies (USD, EUR, etc.)';
    RAISE NOTICE '  3. Click "Set as Group Reporting Currency" on ONE currency';
END $$;
```

4. Click **Run**
5. Done! ✅

### Option 3: Complete Reset (Nuclear option)

⚠️ **WARNING: This will DELETE ALL DATA**

If you want to start completely fresh:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy contents of `sql/00_DROP_EVERYTHING.sql`
3. Run it (drops all tables)
4. Copy contents of `sql/01_CREATE_EVERYTHING.sql`
5. Run it (creates everything fresh with seed data)
6. Done! ✅

## How to Verify the Update Worked

### Check 1: Currency Table

Run this query in Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'currencies'
AND column_name = 'is_group_reporting_currency';
```

**Expected Result**: Should return one row showing the column exists.

### Check 2: Trial Balance Table

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'trial_balance'
AND column_name = 'currency';
```

**Expected Result**: Should return one row showing the currency column exists.

### Check 3: Unique Constraint

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname = 'idx_unique_group_reporting_currency';
```

**Expected Result**: Should show the unique partial index.

## Features After Update

### 1. In Consolidation Config (Settings)

You'll see:
- ⭐ **New checkbox**: "Group Reporting Currency (Base)"
- **Button on currencies**: "Set as Group Reporting Currency"
- **Visual indicator**: Amber border on the selected base currency
- **Badge**: "★ BASE / GROUP REPORTING" on the selected currency

### 2. In Bulk Upload

You'll see:
- **Read-only display** of group reporting currency
- **Warning**: All amounts must be in base currency
- **Clear indication** of which currency to use

### 3. In Single Entity Upload

You'll see:
- **Currency dropdown**: Select upload currency
- **Entity currency display**: Shows entity's functional currency
- **Mismatch warning**: Alerts if upload currency ≠ entity currency
- **Helpful guidance**: Explains potential consolidation issues

## Common Issues

### Issue 1: "Column already exists" error

**Cause**: You've run the migration before.

**Solution**: No action needed. The `IF NOT EXISTS` clause prevents errors.

### Issue 2: "Permission denied" error

**Cause**: Insufficient database privileges.

**Solution**: Use the Supabase SQL Editor which has admin access, not the REST API.

### Issue 3: Still seeing console errors

**Cause**: Browser cache or Next.js cache.

**Solution**:
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Restart Next.js dev server
3. Clear browser cache

### Issue 4: Features not showing in UI

**Cause**: Database not updated or browser cache.

**Solution**:
1. Verify database update using Check 1, 2, 3 above
2. Hard refresh browser
3. Check browser console for errors

## What Happens If You Don't Update?

The application will continue to work, but:

❌ Group reporting currency features will be **disabled**
❌ You'll see console warnings about missing columns
❌ Currency validation will not work
❌ Some features may show errors

**Recommendation**: Update the database to unlock all features!

## Migration Safety

✅ **Option 2 (Add Column)** is **safe** - preserves all existing data
✅ Uses `IF NOT EXISTS` - safe to run multiple times
✅ Only adds columns, doesn't modify existing data
✅ No downtime required

## Need Help?

If you encounter issues:

1. **Check Console**: Look for specific error messages
2. **Verify SQL Syntax**: Ensure you copied the entire query
3. **Check Permissions**: Make sure you're using Supabase SQL Editor
4. **Review Logs**: Check Supabase logs for database errors

## Files Reference

- `sql/00_DROP_EVERYTHING.sql` - Drops all tables (nuclear option)
- `sql/01_CREATE_EVERYTHING.sql` - Complete fresh setup
- `sql/README.md` - Detailed SQL documentation

## Summary

**Recommended Path**:
1. Use **Option 2** (Add Column) if you have existing data
2. Use **Option 1** (Fresh Setup) if starting new
3. Verify with the checks above
4. Hard refresh browser
5. Enjoy the new features! 🎉

---

**Ready to update?** Just copy-paste the SQL from **Option 2** above into Supabase SQL Editor and click Run!

# Consolidation Workings - Setup Instructions

## Current Status
Your consolidation workings feature needs some database migrations to work properly. Here are the SQL scripts you need to run in Supabase SQL Editor.

---

## Required SQL Scripts (Run in Order)

### 1️⃣ **ADD_ENUM_VALUES.sql** - Fix Enum Mismatch
**Problem:** Database has Title Case enum values ('Balance Sheet') but code uses snake_case ('balance_sheet')

**Solution:** Adds both formats to the enum without breaking existing data

**Run this in Supabase SQL Editor:**
```bash
Open: ADD_ENUM_VALUES.sql
```

**Expected Output:**
```
Added enum value: balance_sheet
Added enum value: income_statement
Added enum value: cash_flow
Added enum value: equity_statement
✅ Enum values added successfully
```

---

### 2️⃣ **ADD_CREATED_BY_COLUMN.sql** - Add User Tracking
**Problem:** The `consolidation_workings` table is missing the `created_by` column

**Solution:** Adds `created_by` as a UUID foreign key to the `users` table

**Run this in Supabase SQL Editor:**
```bash
Open: ADD_CREATED_BY_COLUMN.sql
```

**Expected Output:**
```
✅ Added created_by column to consolidation_workings
✅ It is now a foreign key to users(id)
✅ Save functionality will now work!
```

---

## What Changed in the Code

### 1. **app/api/consolidation/save/route.js**
- Changed `created_by` from email text to user ID (UUID)
- Before: `created_by: payload.email || 'Unknown'`
- After: `created_by: payload.userId`

### 2. **Database Schema**
Now properly tracks the relationship:
```
consolidation_workings.created_by (UUID)
  ↓
users.id (UUID)
  ↓
companies.id (UUID)
```

This enables:
- ✅ Proper multi-tenancy tracking
- ✅ Join to get full user details (name, email, role)
- ✅ Better data consistency
- ✅ Future features like "show all my saves"

---

## Testing Steps

After running both SQL scripts:

1. **Login to your app** with test credentials:
   - Username: `testuser`
   - Password: `test123`
   - (Or run `CREATE_TEST_USER.sql` if you haven't already)

2. **Navigate to Consolidation Workings page**

3. **Test Save Button:**
   - Select a period (e.g., 2024-12-31)
   - Select a statement type (e.g., Balance Sheet)
   - Click "Populate" to load data
   - Click "Save" button
   - Should see success toast: "Successfully saved X records"

4. **Test View Logs Button:**
   - Click "View Logs" button
   - Should see your save history with timestamps and user info

---

## Troubleshooting

### Error: "invalid input value for enum statement_type"
→ Run `ADD_ENUM_VALUES.sql`

### Error: "Could not find the 'created_by' column"
→ Run `ADD_CREATED_BY_COLUMN.sql`

### Error: "Unauthorized" or "Invalid session"
→ Make sure you're logged in (create test user with `CREATE_TEST_USER.sql`)

### Error: "Company ID missing from session"
→ Check that your user has a valid `company_id` in the users table

---

## SQL Scripts Summary

| Script | Purpose | Status |
|--------|---------|--------|
| `ADD_ENUM_VALUES.sql` | Add snake_case enum values | ⏳ Need to run |
| `ADD_CREATED_BY_COLUMN.sql` | Add user tracking column | ⏳ Need to run |
| `CREATE_TEST_USER.sql` | Create test account (optional) | ⏳ Optional |

---

## Next Steps After Setup

Once both scripts are run successfully:

1. ✅ Save functionality will work
2. ✅ View Logs functionality will work
3. ✅ Export CSV already working
4. ✅ All buttons operational

Optional future enhancements:
- Implement "Sync to Reports" functionality
- Add "Add Notes" modal
- Filter logs by date range
- Show user name in logs (join with users table)

---

## Questions?

If you encounter any errors after running the scripts, check:
1. Did both SQL scripts complete successfully?
2. Are you logged in with a valid session?
3. Does your user have a `company_id` set?
4. Check browser console for detailed error messages

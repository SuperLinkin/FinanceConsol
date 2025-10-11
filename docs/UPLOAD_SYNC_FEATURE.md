# Upload Sync Feature - Chart of Accounts & Master Hierarchy

## Overview
Enhanced upload functionality for GL Codes and Master Hierarchy with intelligent sync, deduplication, and detailed change tracking.

## What's New

### Previous Behavior (Before)
- **GL Codes Upload**: Simple insert - would fail on duplicates
- **Master Hierarchy Upload**: Upsert - would update existing records
- **No Change Tracking**: Users didn't know what was added, updated, or deleted
- **No Deletion**: Records not in upload file stayed in database
- **Basic Feedback**: Simple "X records uploaded" message

### New Behavior (After)
✅ **Intelligent Sync**: Compares upload file with existing database records
✅ **Deduplication**: Removes duplicates within upload file automatically
✅ **Change Tracking**: Tracks exactly what was Added, Updated, Deleted, and Unchanged
✅ **Automatic Deletion**: Removes records from DB that are NOT in upload file
✅ **Visual Results Modal**: Detailed breakdown with color-coded sections
✅ **Console Logging**: Debug information for troubleshooting

## Features

### 1. **Deduplication Within Upload File**

**GL Codes**: Based on `account_code`
- If the same GL code appears multiple times in your Excel file, only the first occurrence is kept
- Duplicates are counted and reported

**Master Hierarchy**: Based on unique combination of:
- `Class` + `Sub-Class` + `Note` + `Sub-Note`
- Prevents duplicate hierarchy levels in one upload

### 2. **Database Sync Logic**

When you upload a file, the system:

#### Step 1: Load Your File
- Parses Excel file
- Removes duplicates within the file
- Creates list of unique records to upload

#### Step 2: Fetch Existing Data
- Loads all current records from database
- Creates comparison sets

#### Step 3: Categorize Changes
Compares file vs database to determine:

**✅ To ADD**: Records in file but NOT in database
- New GL codes or hierarchy levels
- Inserted into database

**🔄 To UPDATE**: Records in BOTH file and database, but with changes
- For GL Codes: Checks if name, class, subclass, note, subnote, to_be_eliminated, or is_active changed
- For Master Hierarchy: Checks if statement_type, normal_balance, or is_active changed
- Updates existing database records

**❌ To DELETE**: Records in database but NOT in file
- **IMPORTANT**: This removes GLs/hierarchy from database that you didn't include in your upload
- Useful for keeping database in sync with your master file

**⏸️ UNCHANGED**: Records identical in both file and database
- No action taken
- Counted for reporting

#### Step 4: Execute Database Operations
1. Insert new records (Added)
2. Update existing records (Updated)
3. Delete missing records (Deleted)

#### Step 5: Show Results
- Opens visual modal with summary
- Displays detailed lists
- Provides console logs

### 3. **Upload Results Modal**

Beautiful visual feedback showing:

#### Summary Cards (Top Row)
- 🟢 **Added** - Green card with count
- 🔵 **Updated** - Blue card with count
- 🔴 **Deleted** - Red card with count
- ⚪ **Unchanged** - Gray card with count

#### Detailed Lists (Scrollable)
Each section shows affected items with:
- **GL Codes**: Code + Name
- **Master Hierarchy**: Full path (Class > Sub-Class > Note > Sub-Note)

#### Expandable Details
- Click to see all added items
- Click to see all updated items
- Click to see all deleted items
- Warning if duplicates were found in file

### 4. **Console Logging**

Detailed logs for debugging:

```
📁 File contains 150 records, 145 unique, 5 duplicates
📊 Sync Analysis:
  ✅ To Add: 23
  🔄 To Update: 67
  ❌ To Delete: 8
  ⏸️  Unchanged: 47
```

## How to Use

### Uploading GL Codes

1. Go to **Chart of Accounts** page
2. Click **Upload GL Codes** button
3. Select your Excel file with columns:
   - GL Code
   - GL Name
   - Class
   - Sub-Class
   - Note
   - Sub-Note
   - To Be Eliminated (Y/N)
   - Active (Yes/No)

4. System processes the file:
   - Removes duplicates within file
   - Compares with existing database
   - Adds new GLs
   - Updates changed GLs
   - **Deletes GLs not in your file**

5. Results modal appears showing:
   - How many were added
   - How many were updated
   - How many were deleted
   - How many were unchanged

6. Review the details and close modal

### Uploading Master Hierarchy

1. Go to **Chart of Accounts** page
2. Switch to **"Master Hierarchy"** tab
3. Click **Upload Master Hierarchy** button
4. Select your Excel file with columns:
   - Class
   - Sub-Class
   - Note
   - Sub-Note
   - Statement Type (optional)
   - Normal Balance (optional)
   - Active (Yes/No)

5. Same sync process as GL Codes
6. Results modal shows hierarchy paths

## Important Notes

### ⚠️ Deletion Behavior

**This is a TRUE SYNC operation!**

If a GL code or hierarchy level exists in your database but is NOT in your upload file, it will be **DELETED**.

**Example**:
- Database has GL codes: 1000, 1100, 1200, 1300
- You upload file with: 1000, 1100, 1200, 1400
- Result:
  - ✅ 1400 will be ADDED
  - ❌ 1300 will be DELETED (because it's not in file)
  - 🔄 1000, 1100, 1200 may be UPDATED if any fields changed

**Best Practice**: Always upload your COMPLETE master file, not just changes.

### 🔍 Deduplication

**Within Upload File**:
- Duplicates are automatically removed
- First occurrence is kept
- Count is shown in results modal

**Example**:
```
Row 5: GL Code 1000 - Cash
Row 12: GL Code 1000 - Cash and Equivalents (DUPLICATE - will be ignored)
```

### 📊 Change Detection

**For GL Codes**, update is triggered if ANY of these change:
- account_name
- class_name
- subclass_name
- note_name
- subnote_name
- to_be_eliminated
- is_active

**For Master Hierarchy**, update is triggered if ANY of these change:
- statement_type
- normal_balance
- is_active

## Benefits

### For Users:
1. **Confidence**: See exactly what changed before and after
2. **Control**: Upload becomes a sync operation - what you upload is what you get
3. **Visibility**: No more guessing - clear breakdown of all changes
4. **Audit Trail**: Console logs provide evidence of what happened
5. **Error Prevention**: Duplicate detection prevents data issues

### For Data Quality:
1. **No Orphaned Records**: Deletes records not in master file
2. **No Duplicates**: Automatic deduplication
3. **Always In Sync**: Database matches your master Excel file
4. **Change Tracking**: Know exactly what was modified

### For Consolidation:
1. **Clean Hierarchy**: No leftover test or invalid hierarchy levels
2. **Accurate Mapping**: GL codes in system match your source file
3. **Reliable Tagging**: All accounts have proper classification
4. **Audit Ready**: Clear record of what exists and what changed

## Troubleshooting

### Problem: Too many items deleted
**Cause**: Your upload file is missing records that should exist

**Solution**:
1. Close the results modal without refreshing
2. Go back to your Excel file
3. Add the missing records
4. Re-upload the complete file

### Problem: Unexpected updates
**Cause**: Fields in upload don't match database (e.g., extra spaces, different casing)

**Solution**:
1. Check the Updated Items list in results modal
2. Compare your Excel with database
3. Fix any inconsistencies
4. Re-upload

### Problem: Duplicates reported
**Cause**: Same GL code or hierarchy level appears multiple times in Excel

**Solution**:
1. Open your Excel file
2. Use Excel's "Remove Duplicates" feature
3. Or manually review and remove duplicate rows
4. Re-upload clean file

## Technical Details

### Database Operations

**Insert (Add)**:
```sql
INSERT INTO chart_of_accounts (account_code, account_name, ...)
VALUES (?, ?, ...);
```

**Update**:
```sql
UPDATE chart_of_accounts
SET account_name = ?, class_name = ?, ...
WHERE id = ?;
```

**Delete**:
```sql
DELETE FROM chart_of_accounts
WHERE id IN (?);
```

### Performance
- Batch operations for efficiency
- Updates done one-by-one to avoid conflicts
- Deletes done in batch
- Inserts done in batch

### Safety
- All operations wrapped in try-catch
- Errors rollback automatically (Supabase default)
- Toast notifications for success/failure
- Detailed error logging

## Examples

### Example 1: First Upload (Empty Database)

**Upload File**: 100 GL codes

**Result**:
- ✅ Added: 100
- 🔄 Updated: 0
- ❌ Deleted: 0
- ⏸️ Unchanged: 0

### Example 2: Re-upload Same File

**Upload File**: Same 100 GL codes

**Result**:
- ✅ Added: 0
- 🔄 Updated: 0
- ❌ Deleted: 0
- ⏸️ Unchanged: 100

### Example 3: Adding New GLs

**Database**: 100 GL codes
**Upload File**: 120 GL codes (100 existing + 20 new)

**Result**:
- ✅ Added: 20
- 🔄 Updated: 0 (assuming no changes)
- ❌ Deleted: 0
- ⏸️ Unchanged: 100

### Example 4: Removing GLs

**Database**: 100 GL codes
**Upload File**: 90 GL codes (removed 10)

**Result**:
- ✅ Added: 0
- 🔄 Updated: 0 (assuming no changes)
- ❌ Deleted: 10
- ⏸️ Unchanged: 90

### Example 5: Mixed Changes

**Database**: 100 GL codes
**Upload File**: 110 GL codes
- 85 unchanged
- 10 with name changes (updates)
- 15 new (adds)
- 5 removed (not in file)

**Result**:
- ✅ Added: 15
- 🔄 Updated: 10
- ❌ Deleted: 5
- ⏸️ Unchanged: 85

## Best Practices

1. **Always Upload Complete Files**: Don't upload partial lists
2. **Review Results**: Always check the results modal before closing
3. **Keep Backups**: Maintain a master Excel file as source of truth
4. **Check Console**: If something seems wrong, check browser console logs
5. **Test First**: Try with a small file first to understand behavior
6. **Use Templates**: Download template from the page to ensure correct format
7. **Clean Data**: Remove duplicates in Excel before uploading
8. **Consistent Format**: Use same casing, spacing, and format each time

## Future Enhancements

Potential future features:
1. **Dry Run Mode**: Preview changes without applying them
2. **Undo Feature**: Revert last upload
3. **Upload History**: Track all uploads with timestamps
4. **Conflict Resolution**: Manual approval for deletions
5. **Export Before Upload**: Auto-export current state before sync
6. **Incremental Upload**: Option to add-only without deleting

---

**Note**: This is a powerful feature - it keeps your database in perfect sync with your upload file. Always review the results modal carefully, especially the "Deleted" section!

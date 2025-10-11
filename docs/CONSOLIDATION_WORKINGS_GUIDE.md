# Consolidation Workings - User Guide

## Overview
The Consolidation Workings page displays a multi-entity consolidated view with trial balance data, eliminations, and adjustments across all entities in a hierarchical Chart of Accounts structure.

## Prerequisites

Before using the Consolidation Workings page, ensure you have completed these steps:

### 1. Upload Chart of Accounts
- Go to **Chart of Accounts** page
- Upload your GL master data with full 4-level hierarchy:
  - Class (e.g., Assets, Liability, Equity, Revenue, Expenses)
  - Sub-Class
  - Note
  - Sub-Note
- Ensure each GL account has all tagging fields completed

### 2. Set Up Entities
- Go to **Entity Setup** page
- Create all entities that will be consolidated
- Mark entities as active

### 3. Upload Trial Balance Data
- Go to **Upload** page
- Select "Trial Balance" upload type
- Upload Excel file with columns:
  - Entity (entity code or name)
  - Period (date format: YYYY-MM-DD, e.g., 2024-12-31)
  - GL Code
  - GL Name
  - Debit
  - Credit
- **Important**: The period field must be filled for all records

### 4. Set Up Eliminations (Optional)
- Go to **Eliminations** page
- Mark GLs as "To Be Eliminated" in Chart of Accounts
- Create elimination mappings between entities
- Create custom elimination entries as needed

### 5. Set Up Adjustments (Optional)
- Go to **Builder** or **Adjustments** page
- Create consolidation adjustment entries

## How to Use Consolidation Workings Page

### Step 1: Navigate to Consolidation Workings
Click "Consolidation Workings" in the sidebar navigation.

### Step 2: Select Period
The period dropdown will automatically populate with all available periods from your uploaded trial balance data.

- If you see **"No periods available - Upload TB first"**:
  - You need to upload trial balance data first
  - Go to Upload page and upload TB with period field filled

- If periods are available:
  - The most recent period will be selected by default
  - Click the dropdown to change periods

### Step 3: Select Statement Type
Choose which financial statement view you want:
- **Balance Sheet**: Shows Assets, Liabilities, Equity classes
- **Income Statement**: Shows Income and Expenses classes
- **Statement of Equity**: Shows Equity class only
- **Cash Flow**: Shows Assets class (cash-related accounts)

### Step 4: Click Populate Button
Click the green **"Populate"** button to fetch and display data:

1. Click the button
2. Wait for the loading spinner
3. A success message will show the count of records fetched:
   - Trial Balance entries
   - Elimination entries
   - Adjustment entries

### Step 5: View Consolidated Data

The table displays:

#### Columns:
1. **Chart of Accounts** (left column, sticky):
   - Hierarchical tree structure
   - Expand/collapse with arrows
   - Shows account counts in parentheses

2. **Entity Columns** (one column per entity):
   - Shows each entity's trial balance amounts
   - Calculated based on GL account class:
     - Assets/Expenses: Debit - Credit
     - Liabilities/Equity/Revenue: Credit - Debit

3. **Eliminations Column** (red background):
   - Shows elimination amounts from:
     - Custom elimination entries
     - Intercompany transaction mappings
   - Click amount to see details

4. **Adjustments Column** (blue background):
   - Shows adjustment amounts
   - Click amount to see details

5. **Consolidated Column** (indigo background, right, sticky):
   - Sum of all entity columns + eliminations + adjustments
   - This is your final consolidated number

#### Row Levels:
- **Class** (dark navy background): Top level (Assets, Liability, etc.)
- **Sub-Class** (gray background): Second level
- **Note** (white background): Third level
- **Sub-Note** (light gray background): Fourth level with actual GL accounts

### Step 6: Export Data (Optional)
Click the **"Export"** button to download the consolidated workings to Excel.

## Data Flow

```
Trial Balance (by entity/period)
    +
Eliminations (inter-entity)
    +
Adjustments (consolidation entries)
    =
Consolidated Financial Data
```

## Troubleshooting

### Problem: Period dropdown shows "No periods available"
**Solution**: Upload trial balance data first with the period field filled.

### Problem: Numbers not showing after clicking Populate
**Causes**:
1. Check browser console for error messages
2. Verify trial balance data exists for selected period
3. Ensure GL accounts in trial balance match Chart of Accounts
4. Check that GL accounts have proper class tagging

**Debug Steps**:
1. Open browser console (F12)
2. Look for console logs showing:
   - "📅 Unique periods found: [...]"
   - "📊 Data loaded: ..."
   - "✅ Populated data: ..."
3. Check the counts - if they're 0, data is missing

### Problem: Hierarchy not showing accounts
**Cause**: GL accounts in Chart of Accounts must have matching class_name, subclass_name, note_name, subnote_name fields.

**Solution**:
1. Go to Chart of Accounts page
2. Look for the "GLs with Incomplete Tagging" warning section
3. Complete missing tagging for all GLs

### Problem: Numbers seem wrong
**Check**:
1. Trial balance debit/credit values are correct
2. Entity assignment in trial balance matches entities in system
3. Elimination amounts are correct
4. Class-based calculation logic:
   - Assets/Expenses use Debit - Credit
   - Liabilities/Equity/Revenue use Credit - Debit

## Technical Details

### Database Tables Used:
- `trial_balance`: Entity-level GL data
- `chart_of_accounts`: GL master with hierarchy tagging
- `coa_master_hierarchy`: 4-level hierarchy structure
- `entities`: Entity master data
- `elimination_entries`: Custom elimination journal entries
- `intercompany_transactions`: GL-to-GL elimination mappings
- `adjustment_entries`: Consolidation adjustments

### Field Matching:
Trial balance GL accounts are matched to the hierarchy based on:
- `account_code` matches between trial_balance and chart_of_accounts
- `class_name`, `subclass_name`, `note_name`, `subnote_name` in chart_of_accounts

### Period Format:
- Stored as DATE in database
- Format: YYYY-MM-DD (e.g., 2024-12-31)
- Upload TB with period in this format

## Best Practices

1. **Complete COA Setup First**: Ensure all GL accounts have complete 4-level tagging before uploading trial balance
2. **Use Consistent Period Format**: Always use YYYY-MM-DD format for periods
3. **Validate Eliminations**: Check that elimination mappings are balanced before consolidating
4. **Review Adjustments**: Ensure all consolidation adjustments are properly recorded
5. **Export Regularly**: Export consolidated data for audit trails and reporting

## Next Steps

After viewing consolidated data:
1. Export to Excel for further analysis
2. Go to **Reporting** page to generate formatted financial statements
3. Review elimination details by clicking amounts
4. Adjust eliminations or adjustments as needed
5. Re-populate to see updated numbers

---

For additional help, check the console logs or contact support.

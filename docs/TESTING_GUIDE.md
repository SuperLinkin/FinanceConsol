# Application Testing Guide

## ✅ Mock Data Status

**All mock data has been removed!**

The application now loads ALL data from Supabase database. There is NO hardcoded sample/mock data in any pages.

## 🗄️ Database Setup (REQUIRED FIRST STEP)

Before testing, you MUST set up the database:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**

### Step 2: Run Database Setup Scripts (In Order)

```sql
-- Option 1: Fresh Setup (First Time)
-- Run these in order:
\i 01_COMPLETE_DATABASE_SCHEMA.sql  -- Creates all 21 tables
\i 02_SEED_DATA.sql                 -- Loads currencies & COA hierarchy

-- Option 2: Clean & Rebuild (If tables already exist)
-- Run these in order:
\i 00_CLEAN_DATABASE.sql            -- Cleans everything
\i 01_COMPLETE_DATABASE_SCHEMA.sql  -- Creates all 21 tables
\i 02_SEED_DATA.sql                 -- Loads currencies & COA hierarchy
```

### What Gets Loaded:
- ✅ 20 world currencies (USD, EUR, GBP, etc.)
- ✅ 100+ IFRS COA hierarchy items
- ❌ NO sample entities
- ❌ NO sample transactions
- ❌ NO mock data

## 🧪 Testing Workflow

### 1. Entity Setup Page

**Test: Add Entity Manually**
1. Click "Add Entity" button
2. Fill in the form:
   - Entity Code: TEST001
   - Entity Name: Test Company Inc.
   - Functional Currency: USD
   - Region: North America
   - Status: Active
3. Save and verify entity appears in table

**Test: Bulk Upload**
1. Click "Download Template"
2. Open Excel file, add test entities
3. Click "Upload Template" and select your file
4. Verify entities are imported

**Expected Result:** Entities saved to `entities` table

---

### 2. Upload Page

**Test: Upload Trial Balance**
1. Download TB template
2. Add sample data for your test entity (Entity Code: TEST001)
3. Upload the file
4. Verify success message

**Expected Result:** Data saved to `trial_balance` table

**Test: Upload COA**
1. Download COA template
2. Add chart of accounts with IFRS hierarchy
3. Upload the file
4. Verify success message

**Expected Result:** Data saved to `chart_of_accounts` table

---

### 3. Chart of Accounts Page

**Test: View COA**
1. Navigate to Chart of Accounts
2. Verify the IFRS 4-level hierarchy loads
3. Filter by Class/Subclass
4. Search for specific accounts

**Expected Result:** Shows accounts from `chart_of_accounts` table with hierarchy

**Test: Add Account**
1. Click "Add GL Account"
2. Fill in all 4 levels (Class, Subclass, Note, Subnote)
3. Save

**Expected Result:** New account saved to `chart_of_accounts`

---

### 4. Entity Logic Page

**Test: Create Logic Rule**
1. Click "Add Logic"
2. Create a consolidation logic
3. Configure settings
4. Save

**Expected Result:** Saved to `entity_logic` table

---

### 5. Eliminations Page

**Test: Create Elimination**
1. Click "Add Elimination"
2. Select two entities
3. Add elimination entries
4. Save

**Expected Result:** Saved to `eliminations` table

---

### 6. Builder Page

**Test: Create Manual Entry**
1. Click "Create New Build"
2. Add manual journal entries
3. Save

**Expected Result:** Saved to `builder_entries` table

---

### 7. Consolidation Workings Page

**Test: Generate Workings**
1. Select period (e.g., 2024)
2. Page auto-loads and generates statements from COA
3. Review Balance Sheet, Income Statement, Equity, Cash Flow
4. Click "Save Workings"

**Expected Result:**
- Loads data from:
  - `entities`
  - `trial_balance`
  - `eliminations`
  - `builder_entries`
  - `chart_of_accounts`
- Generates consolidated statements
- Saves to `consolidation_workings` table

**Test: Edit Values**
1. Click on any amount
2. Edit the value
3. Save
4. Check "Recent Changes" sidebar

**Expected Result:** Changes saved to `consolidation_changes` table

**Test: Validation Checks**
1. Scroll to Validation Checks section
2. Review system checks (Balance Sheet balance, etc.)
3. Add custom validation check
4. Run checks

**Expected Result:**
- System checks run automatically
- Custom checks saved to `validation_checks`
- Results saved to `validation_results`

---

### 8. Reporting Builder Page

**Test: Generate Report**
1. Select period
2. Report auto-generates from consolidation workings
3. Review all sections (Cover, BS, IS, Equity, CF, Notes)

**Expected Result:** Loads from `consolidation_workings` table

**Test: Edit Report**
1. Click "Edit" mode
2. Use formatting toolbar (Bold, Italic, Colors, etc.)
3. Add a note
4. Save

**Expected Result:** Saved to `financial_reports` table

**Test: Templates**
1. Click "Templates"
2. Save current report as template
3. Apply a template

**Expected Result:** Templates in `report_templates` table

**Test: Export**
1. Click "Export" dropdown
2. Export as PDF
3. Export as Word

**Expected Result:** Downloaded files with proper formatting

---

### 9. Settings Page

**Test: Configuration**
1. Update consolidation settings
2. Save

**Expected Result:** Settings persist on page reload

---

## 🔍 Verification Checklist

### Database Verification

Check these tables have data:

```sql
-- Check currencies
SELECT * FROM currencies LIMIT 5;

-- Check COA hierarchy
SELECT * FROM coa_master_hierarchy LIMIT 10;

-- Check your test entity
SELECT * FROM entities WHERE entity_code = 'TEST001';

-- Check trial balance
SELECT * FROM trial_balance WHERE entity_id = (SELECT id FROM entities WHERE entity_code = 'TEST001');

-- Check chart of accounts
SELECT * FROM chart_of_accounts LIMIT 10;
```

### UI Verification

- [ ] All pages load without errors
- [ ] No "undefined" or "null" displayed
- [ ] All forms submit successfully
- [ ] Data persists after page reload
- [ ] Search and filters work
- [ ] Modals open and close properly
- [ ] Export functions work

### Data Flow Verification

1. **Entity Setup → Trial Balance → Consolidation Workings**
   - Add entity → Upload TB → View in workings

2. **COA → Consolidation Workings → Reporting**
   - Upload COA → Generate workings → Create report

3. **Workings → Reporting → Export**
   - Save workings → Generate report → Export PDF/Word

## 🐛 Common Issues & Solutions

### Issue: "No data found"
**Solution:** Make sure you've run the database setup scripts first

### Issue: "Table does not exist"
**Solution:** Run `01_COMPLETE_DATABASE_SCHEMA.sql`

### Issue: "Foreign key violation"
**Solution:** Make sure parent records exist (e.g., entity before trial balance)

### Issue: "Upload fails"
**Solution:** Check Excel template format matches expected columns

### Issue: "Workings page is blank"
**Solution:**
1. Upload Chart of Accounts first
2. Add at least one entity
3. Upload trial balance for that entity

### Issue: "Report builder shows no data"
**Solution:** Save consolidation workings first, then generate report

## 📊 Sample Test Data

### Minimal Test Setup:
1. **1 Entity** (TEST001)
2. **10 COA Accounts** (from each statement type)
3. **10 Trial Balance lines** (for TEST001)
4. **1 Period** (2024)

### Complete Test Setup:
1. **3-5 Entities** (Parent + Subsidiaries)
2. **50+ COA Accounts** (covering all IFRS categories)
3. **Trial Balances** for all entities
4. **2-3 Eliminations** (intercompany)
5. **2-3 Manual Entries** (adjustments)
6. **Multiple Periods** (2023, 2024)

## 🎯 Success Criteria

✅ **Application is working correctly when:**

1. All pages load without console errors
2. You can create entities and upload trial balances
3. Consolidation workings generate automatically from COA
4. You can save and retrieve workings
5. Reports generate from saved workings
6. You can export to PDF and Word
7. All data persists after page reload
8. Audit trails show in change history
9. Validation checks run and display results
10. Templates can be saved and applied

## 🚀 Ready to Test!

Your application is now **100% database-driven** with **zero mock data**.

Start with the database setup, then follow the testing workflow above.

Good luck! 🎉

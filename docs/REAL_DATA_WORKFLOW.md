# Real Data Workflow Guide

## ✅ System is NOW Ready for Real Data!

The system has been updated to automatically populate values from uploaded Trial Balance data into the consolidation workings.

---

## Complete Workflow: From Setup to Consolidation

### Step 1: Setup Chart of Accounts (One-Time)

**Two Options:**

#### Option A: Use Seed Data (Quick Start)
```sql
-- In Supabase SQL Editor:
-- Run the complete setup script
\i sql/00_COMPLETE_SETUP.sql

-- This creates:
-- ✅ 21 master hierarchy records
-- ✅ 24 chart of accounts with proper classifications
-- ✅ Proper linkage between COA and hierarchy
```

#### Option B: Enter Your Own COA
1. Go to **Chart of Accounts** page in the app
2. Add accounts with:
   - Account Code (e.g., "1000")
   - Account Name (e.g., "Cash on Hand")
   - Class Level (e.g., "Assets")
   - Subclass Level (e.g., "Current Assets")
   - Note Level (e.g., "Cash & Cash Equivalents")
   - Subnote Level (e.g., "Cash on Hand")

**Critical:** These levels MUST match entries in `coa_master_hierarchy` table.

---

### Step 2: Setup Entities

1. Go to **Entity Setup** page
2. Add each entity in your group:
   ```
   Entity Name: ABC Corp
   Entity Type: Subsidiary
   Ownership %: 100
   Functional Currency: USD
   Presentation Currency: USD
   Include in Consolidation: ✓
   ```

3. Repeat for all entities (Parent, Subsidiaries, Associates, JVs)

---

### Step 3: Upload Trial Balance Data

**For EACH Entity, for EACH Period:**

1. Go to **Upload** page
2. Select Entity from dropdown
3. Prepare Excel file with this structure:

```excel
| Account Code | Account Name      | Debit    | Credit   |
|--------------|-------------------|----------|----------|
| 1000         | Cash on Hand      | 50000.00 | 0.00     |
| 1010         | Bank - Main       | 100000   | 0        |
| 1100         | Trade Receivables | 75000    | 0        |
| 1200         | Inventory         | 120000   | 0        |
| 2000         | Trade Payables    | 0        | 85000    |
| 3000         | Share Capital     | 0        | 100000   |
| 4000         | Sales Revenue     | 0        | 500000   |
| 5000         | Cost of Sales     | 300000   | 0        |
| 6000         | Salaries          | 80000    | 0        |
```

**Requirements:**
- Column headers: `Account Code`, `Account Name`, `Debit`, `Credit`
- Account Codes MUST match your Chart of Accounts
- Debit + Credit columns should balance (validated automatically)
- Save as `.xlsx` file

4. Upload file
5. System validates:
   - ✅ File format
   - ✅ Debit = Credit (trial balance check)
   - ✅ Shows total debit, credit, difference

6. Click **Upload**
7. Data is inserted into `trial_balance` table

8. **Repeat for each entity**

---

### Step 4: Generate Consolidation Workings

1. Go to **Consolidation Workings** page
2. Select Period (e.g., "FY 2024")
3. Click **Auto-Generate** button

**What Happens:**
```sql
-- SQL Function is called:
initialize_period_workings('2024', 'your-email@company.com')

-- Creates 4 records in consolidation_workings:
-- ✅ balance_sheet
-- ✅ income_statement
-- ✅ equity
-- ✅ cash_flow

-- Each record contains:
-- ✅ Hierarchical structure from COA
-- ✅ Empty line items (templates)
-- ✅ Ready to receive values
```

4. Page automatically reloads
5. System performs magic ✨:
   ```javascript
   // For each line item in structure:
   // 1. Find all accounts linked to this item
   // 2. Find trial balance entries for those accounts
   // 3. Calculate value:
   //    - Assets/Expenses: Debit - Credit
   //    - Liabilities/Equity/Income: Credit - Debit
   // 4. Display with proper formatting
   ```

6. **You now see actual values!**

---

### Step 5: Review Statements

**Navigate between tabs:**
- **Balance Sheet**: Assets, Liabilities, Equity
- **Income Statement**: Income, Expenses
- **Equity**: Equity movements
- **Cash Flow**: Cash activities

**Each line shows:**
- Account hierarchy
- Current period values (populated from TB)
- Note references
- Drill-down capability

**Totals automatically calculated:**
- Total Assets
- Total Liabilities
- Total Equity
- Net Income
- Balance checks

---

## Data Linking Logic

### How Trial Balance Links to Consolidation

```mermaid
Trial Balance Record                Chart of Accounts
  account_code: "1000"    ─────►      account_code: "1000"
  debit: 50000                        class_level: "Assets"
  credit: 0                           subclass_level: "Current Assets"
                                      note_level: "Cash & Cash Equivalents"
                                            │
                                            │ Used to build hierarchy
                                            ▼
                                  Consolidation Working
                                    line_item:
                                      name: "Cash & Cash Equivalents"
                                      accountClass: "Assets"
                                      accounts: [{ account_code: "1000", ... }]
                                      value: 50000 ◄─── Calculated from TB
```

### Calculation Rules

**1. Assets & Expenses (Normal Debit Balance):**
```javascript
value = TB.debit - TB.credit
```
Example:
- Cash: Debit 50,000 - Credit 0 = 50,000 (Asset)
- Salaries: Debit 80,000 - Credit 0 = 80,000 (Expense)

**2. Liabilities, Equity, Income (Normal Credit Balance):**
```javascript
value = TB.credit - TB.debit
```
Example:
- Trade Payables: Credit 85,000 - Debit 0 = 85,000 (Liability)
- Sales Revenue: Credit 500,000 - Debit 0 = 500,000 (Income)

**3. Multi-Entity Consolidation:**
```javascript
// If Entity A and Entity B both have account 1000:
// Entity A: Cash Debit 50,000
// Entity B: Cash Debit 30,000
// Consolidated value = 50,000 + 30,000 = 80,000
```

---

## Testing with Sample Data

### Quick Test Procedure

**1. Run seed data:**
```sql
\i sql/00_COMPLETE_SETUP.sql
```

**2. Create test trial balance:**
```sql
-- Insert sample TB for an entity
INSERT INTO trial_balance (entity_id, account_code, account_name, debit, credit, period)
SELECT
  (SELECT id FROM entities LIMIT 1),
  '1000', 'Cash on Hand', 50000, 0, '2024-12-31'
UNION ALL SELECT
  (SELECT id FROM entities LIMIT 1),
  '1010', 'Bank - Main Account', 100000, 0, '2024-12-31'
UNION ALL SELECT
  (SELECT id FROM entities LIMIT 1),
  '2000', 'Trade Payables', 0, 85000, '2024-12-31'
UNION ALL SELECT
  (SELECT id FROM entities LIMIT 1),
  '3000', 'Share Capital', 0, 100000, '2024-12-31'
UNION ALL SELECT
  (SELECT id FROM entities LIMIT 1),
  '4000', 'Sales Revenue - Products', 0, 500000, '2024-12-31'
UNION ALL SELECT
  (SELECT id FROM entities LIMIT 1),
  '5000', 'Cost of Goods Sold', 300000, 0, '2024-12-31';
```

**3. Generate workings:**
```sql
SELECT * FROM initialize_period_workings('2024', 'test@example.com');
```

**4. View in app:**
- Consolidation Workings page
- Should show values: Cash 150,000, Payables 85,000, etc.

---

## Multi-Currency Scenarios

### When Entities Use Different Currencies

**Setup:**
1. Set functional currency per entity
2. Upload exchange rates for the period
3. Trial balance stored in entity's functional currency
4. System translates to presentation currency

**Example:**
```
Parent (USA): USD functional currency
  └─ TB: Cash $100,000

Subsidiary (UK): GBP functional currency
  └─ TB: Cash £50,000
  └─ Exchange rate: 1 GBP = 1.25 USD
  └─ Translated: £50,000 × 1.25 = $62,500

Consolidated: $100,000 + $62,500 = $162,500
```

**Translation happens automatically using:**
- Exchange rates table
- Translation rules (IAS 21)
- Rate types: Closing, Average, Historical

---

## Troubleshooting Real Data

### Issue: Values showing as 0

**Check:**
1. Trial balance uploaded for the period?
   ```sql
   SELECT * FROM trial_balance WHERE period = '2024-12-31';
   ```

2. Account codes match COA?
   ```sql
   SELECT tb.account_code, tb.account_name, coa.account_code
   FROM trial_balance tb
   LEFT JOIN chart_of_accounts coa ON coa.account_code = tb.account_code
   WHERE coa.account_code IS NULL;
   -- Should return 0 rows
   ```

3. Workings generated for period?
   ```sql
   SELECT period, statement_type FROM consolidation_workings;
   ```

### Issue: Some accounts missing

**Check hierarchy linkage:**
```sql
SELECT
  coa.account_code,
  coa.account_name,
  coa.class_level,
  coa.subclass_level,
  coa.note_level,
  CASE
    WHEN h.id IS NOT NULL THEN '✓ Linked'
    ELSE '✗ NOT LINKED'
  END as status
FROM chart_of_accounts coa
LEFT JOIN coa_master_hierarchy h ON
  h.class_name = coa.class_level AND
  h.subclass_name = coa.subclass_level AND
  h.note_name = coa.note_level;
```

**Fix:** Update COA to match hierarchy levels exactly.

### Issue: Totals don't balance

**Check debit/credit totals:**
```sql
SELECT
  entity_id,
  SUM(debit) as total_debit,
  SUM(credit) as total_credit,
  SUM(debit) - SUM(credit) as difference
FROM trial_balance
WHERE period = '2024-12-31'
GROUP BY entity_id;
-- Difference should be close to 0
```

---

## Data Validation Checklist

Before going live:

- [ ] COA Master Hierarchy populated (21+ records)
- [ ] Chart of Accounts linked to hierarchy
- [ ] All entities created with correct currencies
- [ ] Trial balance uploaded for all entities
- [ ] Account codes match between TB and COA
- [ ] Trial balance balanced (debit = credit)
- [ ] Exchange rates entered for all currencies
- [ ] Consolidation workings generated
- [ ] Values displaying correctly
- [ ] Totals calculating correctly
- [ ] Multi-currency translation working

---

## Next Steps After Basic Consolidation

Once basic consolidation is working:

1. **Add Eliminations**
   - Intercompany transactions
   - Intercompany balances
   - Investment eliminations

2. **Add Adjustments**
   - Fair value adjustments
   - Alignment adjustments
   - Consolidation adjustments

3. **Configure NCI (Non-controlling Interest)**
   - For subsidiaries with <100% ownership
   - Calculate NCI share of profit/equity

4. **Add Notes**
   - Detailed note disclosures
   - Breakdown by entity/region
   - Segment reporting

5. **Generate Reports**
   - PDF export
   - Excel export
   - Comparative reports

---

## Summary: Will It Work?

**✅ YES - System is fully ready for real uploaded data!**

**What's working:**
- ✓ Upload Excel trial balance
- ✓ Validate debit = credit
- ✓ Store in database
- ✓ Auto-generate consolidation structure
- ✓ Match account codes
- ✓ Calculate values from TB
- ✓ Display in hierarchical format
- ✓ Calculate totals automatically
- ✓ Support multiple entities
- ✓ Support multiple periods

**What you need to provide:**
1. Chart of Accounts with proper hierarchy
2. Trial Balance Excel files per entity
3. Account codes must match between TB and COA

**That's it! The system handles the rest.**

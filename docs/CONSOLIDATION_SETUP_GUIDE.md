# Consolidation Workings Auto-Generation Guide

## Overview
The system automatically generates consolidation workings based on your Chart of Accounts (COA) master hierarchy, following IFRS standards.

---

## How It Works

### 1. **Chart of Accounts Master Hierarchy**
The `coa_master_hierarchy` table defines the IFRS 4-level structure:
- **Level 1 (Class):** Assets, Liabilities, Equity, Income, Expenses
- **Level 2 (Subclass):** Current Assets, Non-current Assets, etc.
- **Level 3 (Note):** Cash & Cash Equivalents, Trade Receivables, etc.
- **Level 4 (Subnote):** Cash on Hand, Bank Accounts, etc.

### 2. **Auto-Generation Process**

When you click **"Auto-Generate"** in Consolidation Workings:

1. System reads `coa_master_hierarchy` to understand your account structure
2. Generates hierarchical line items for:
   - Balance Sheet (Assets, Liabilities, Equity)
   - Income Statement (Income, Expenses)
   - Cash Flow (All classes)
3. Creates empty consolidation workings with proper structure
4. Saves to `consolidation_workings` table

---

## Setup Steps

### **Step 1: Run SQL Scripts in Order**

```sql
-- 1. Create all tables (clean slate)
sql/my_new_tables.sql

-- 2. Populate world currencies
sql/03_WORLD_CURRENCIES.sql

-- 3. Add missing currency columns (if upgrading)
sql/04_ADD_CURRENCY_COLUMNS.sql

-- 4. Seed demo data
sql/02_SEED_DATA.sql

-- 5. Create consolidation generator functions
sql/07_CONSOLIDATION_WORKINGS_GENERATOR.sql
```

### **Step 2: Verify COA Master Hierarchy**

Check that your IFRS hierarchy is populated:

```sql
SELECT class_name, subclass_name, note_name, subnote_name, is_active
FROM coa_master_hierarchy
WHERE is_active = true
ORDER BY class_name, subclass_name, note_name;
```

You should see entries like:
- Assets → Current Assets → Cash & Cash Equivalents → Bank Accounts
- Liabilities → Current Liabilities → Trade & Other Payables → Trade Payables
- Income → Revenue → Sales Revenue → Product Sales
- Expenses → Operating Expenses → Administrative Expenses → Salaries & Wages

### **Step 3: Add Your Chart of Accounts**

Populate `chart_of_accounts` with your actual accounts:

```sql
INSERT INTO chart_of_accounts
  (account_code, account_name, class_level, subclass_level, note_level, subnote_level, is_active)
VALUES
  ('1010', 'Bank - Main Account', 'Assets', 'Current Assets', 'Cash & Cash Equivalents', 'Bank Accounts', true),
  ('1100', 'Trade Receivables', 'Assets', 'Current Assets', 'Trade & Other Receivables', 'Trade Receivables', true),
  ('4000', 'Sales Revenue', 'Income', 'Revenue', 'Sales Revenue', 'Product Sales', true),
  ('6000', 'Salaries Expense', 'Expenses', 'Operating Expenses', 'Administrative Expenses', 'Salaries & Wages', true);
```

### **Step 4: Setup Exchange Rates**

For each period and currency, add exchange rates:

```sql
INSERT INTO exchange_rates
  (currency_code, base_currency, period_code, period_start, period_end,
   closing_rate, average_rate, opening_rate, historical_rate, rate_source)
VALUES
  ('EUR', 'USD', '2024-01', '2024-01-01', '2024-01-31',
   1.0850, 1.0820, 1.0790, 1.0800, 'Manual');
```

### **Step 5: Load Trial Balance Data**

Upload trial balances for your entities:

```sql
INSERT INTO trial_balance
  (entity_id, account_code, account_name, debit, credit, period)
SELECT
  (SELECT id FROM entities WHERE entity_code = 'GC-EU'),
  '1010', 'Bank Account', 150000, 0, '2024-01-31'
UNION ALL SELECT
  (SELECT id FROM entities WHERE entity_code = 'GC-EU'),
  '4000', 'Sales Revenue', 0, 500000, '2024-01-31';
```

---

## Using Auto-Generate Feature

### **From the UI:**

1. Go to **Consolidation Workings** page
2. Select a **Period** (e.g., "FY 2024")
3. Click **"Auto-Generate"** button (purple gradient button with wand icon)
4. Confirm the action
5. System generates 3 workings:
   - Balance Sheet
   - Income Statement
   - Cash Flow

### **From SQL:**

```sql
-- Generate all workings for a period
SELECT * FROM initialize_period_workings('2024-01');

-- Generate specific working
SELECT create_consolidation_working('2024-01', 'balance_sheet', 'admin@company.com');

-- Preview structure only (doesn't save)
SELECT generate_consolidation_line_items('balance_sheet');
```

### **From API:**

```javascript
// Generate all workings
const response = await fetch('/api/consolidation/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    period: '2024-01',
    created_by: 'admin@company.com'
  })
});

// Preview structure
const preview = await fetch('/api/consolidation/generate?statement_type=balance_sheet');
```

---

## Generated Structure

The auto-generated workings include:

### **Line Items (JSONB Structure):**
```json
[
  {
    "id": "uuid",
    "level": "class",
    "code": "",
    "name": "Assets",
    "class_level": "Assets",
    "subclass_level": "",
    "is_total": true,
    "is_subtotal": false,
    "indent": 0,
    "accounts": [],
    "children": [
      {
        "id": "uuid",
        "level": "subclass",
        "name": "Current Assets",
        "subclass_level": "Current Assets",
        "is_subtotal": true,
        "indent": 1,
        "accounts": [
          {
            "account_code": "1010",
            "account_name": "Bank Account",
            "class_level": "Assets",
            "subclass_level": "Current Assets",
            "note_level": "Cash & Cash Equivalents",
            "subnote_level": "Bank Accounts"
          }
        ],
        "children": [...]
      }
    ]
  }
]
```

### **Totals (JSONB Structure):**

**Balance Sheet:**
```json
{
  "total_assets": 0,
  "total_current_assets": 0,
  "total_non_current_assets": 0,
  "total_liabilities": 0,
  "total_current_liabilities": 0,
  "total_non_current_liabilities": 0,
  "total_equity": 0,
  "net_assets": 0,
  "balance_check": 0
}
```

**Income Statement:**
```json
{
  "total_revenue": 0,
  "gross_profit": 0,
  "operating_profit": 0,
  "profit_before_tax": 0,
  "profit_after_tax": 0,
  "total_expenses": 0,
  "net_income": 0
}
```

---

## Populating with Actual Data

After auto-generation, populate with trial balance data:

```sql
-- Populate working from trial balance (future enhancement)
SELECT populate_working_from_trial_balance(
  working_id, -- UUID of the working
  '2024-01-31'::DATE -- Period date
);
```

This will:
1. Loop through all entities
2. Get their trial balance data
3. Determine appropriate exchange rate type (closing/average/historical)
4. Translate amounts to presentation currency
5. Populate the line items with actual data

---

## Customization

### **Add Custom Account Hierarchies:**

```sql
-- Add your own hierarchy structure
INSERT INTO coa_master_hierarchy
  (class_name, subclass_name, note_name, subnote_level, is_active)
VALUES
  ('Assets', 'Investments', 'Joint Ventures', 'Listed Joint Ventures', true);
```

### **Modify Translation Rules:**

```sql
-- Add custom translation rule
INSERT INTO translation_rules
  (class_level, subclass_level, rate_type, description, priority)
VALUES
  ('Assets', 'Investments', 'historical', 'Investments at historical cost', 3);
```

---

## Troubleshooting

### **"No workings generated"**
- Check `coa_master_hierarchy` has data
- Verify `is_active = true` on hierarchy records
- Check browser console for API errors

### **"Empty line items"**
- Ensure `chart_of_accounts` table has accounts
- Verify account classifications match hierarchy
- Run: `SELECT generate_consolidation_line_items('balance_sheet')` to test

### **"Exchange rate errors"**
- Populate `exchange_rates` table for the period
- Ensure all entity currencies have rates
- Check `translation_rules` table has default rules

---

## Next Steps

1. **Manual Adjustments:** After auto-generation, edit workings in UI
2. **Eliminations:** Add inter-company eliminations
3. **Builder Entries:** Add manual journal entries
4. **Validation:** Run validation checks
5. **Reporting:** Generate final reports

For more details, see:
- `EXCHANGE_RATE_TRANSLATION_GUIDE.md` - Currency translation
- `sql/07_CONSOLIDATION_WORKINGS_GENERATOR.sql` - SQL functions
- `app/api/consolidation/generate/route.js` - API endpoints

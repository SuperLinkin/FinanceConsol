# Exchange Rate Translation Guide

## Overview
This system implements **IAS 21 - The Effects of Changes in Foreign Exchange Rates** for proper currency translation in financial consolidation.

---

## How It Works

### 1. **Exchange Rates Table** (`exchange_rates`)
Stores multiple rate types per currency per period:

| Rate Type | Used For | IAS 21 Reference |
|-----------|----------|------------------|
| **Closing Rate** | Balance Sheet items (Assets, Liabilities) | IAS 21.23 |
| **Average Rate** | P&L items (Revenue, Expenses) | IAS 21.40 |
| **Historical Rate** | Equity items (Share Capital, Reserves) | IAS 21.32 |
| **Opening Rate** | Opening balances | - |

**Example Data:**
```sql
INSERT INTO exchange_rates
  (currency_code, base_currency, period_code, period_start, period_end,
   closing_rate, average_rate, opening_rate, historical_rate)
VALUES
  ('EUR', 'USD', '2024-01', '2024-01-01', '2024-01-31',
   1.0850, 1.0820, 1.0790, 1.0800);
```

This means:
- 1 USD = 1.0850 EUR (closing rate on Jan 31)
- 1 USD = 1.0820 EUR (average for January)
- 1 USD = 1.0790 EUR (opening rate on Jan 1)

---

### 2. **Translation Rules Table** (`translation_rules`)
Maps account classes to the appropriate rate type:

| Account Class | Rate Type | Example |
|--------------|-----------|---------|
| Assets | `closing` | Cash, Inventory, PPE |
| Liabilities | `closing` | Payables, Loans |
| Revenue | `average` | Sales Revenue |
| Expenses | `average` | Salaries, Rent |
| Equity | `historical` | Share Capital, Reserves |

**Pre-loaded Rules:**
```sql
SELECT * FROM translation_rules WHERE is_active = true;
```

---

### 3. **Helper Function** (`get_rate_type_for_account`)
Automatically determines which rate to use:

```sql
-- Get rate type for an account
SELECT get_rate_type_for_account('Revenue', 'Sales', NULL);
-- Returns: 'average'

SELECT get_rate_type_for_account('Assets', 'Cash', NULL);
-- Returns: 'closing'

SELECT get_rate_type_for_account('Equity', 'Share Capital', NULL);
-- Returns: 'historical'
```

---

## Currency Translation Example

### Scenario:
- Entity: ABC Ltd (Germany)
- Functional Currency: EUR
- Presentation Currency: USD
- Period: January 2024

### Trial Balance (in EUR):
| Account | Class | Amount (EUR) |
|---------|-------|--------------|
| Cash | Assets | 100,000 |
| Revenue | Revenue | 500,000 |
| Salaries | Expenses | 200,000 |
| Share Capital | Equity | 50,000 |

### Exchange Rates (from `exchange_rates` table):
- Closing: 1.0850
- Average: 1.0820
- Historical: 1.0800

### Translated to USD:
| Account | Class | EUR | Rate Type | Rate | USD |
|---------|-------|-----|-----------|------|-----|
| Cash | Assets | 100,000 | Closing | 1.0850 | 108,500 |
| Revenue | Revenue | 500,000 | Average | 1.0820 | 541,000 |
| Salaries | Expenses | 200,000 | Average | 1.0820 | 216,400 |
| Share Capital | Equity | 50,000 | Historical | 1.0800 | 54,000 |

---

## SQL Query for Translation

```sql
-- Get translated amounts for consolidation
WITH account_translations AS (
  SELECT
    tb.account_code,
    tb.account_name,
    coa.class_level,
    coa.subclass_level,
    tb.debit,
    tb.credit,

    -- Determine rate type
    get_rate_type_for_account(coa.class_level, coa.subclass_level) as rate_type,

    -- Get appropriate exchange rate
    CASE
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'closing'
        THEN er.closing_rate
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'average'
        THEN er.average_rate
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'historical'
        THEN er.historical_rate
      ELSE er.closing_rate
    END as exchange_rate,

    -- Calculate translated amounts
    tb.debit * CASE
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'closing'
        THEN er.closing_rate
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'average'
        THEN er.average_rate
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'historical'
        THEN er.historical_rate
      ELSE er.closing_rate
    END as translated_debit,

    tb.credit * CASE
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'closing'
        THEN er.closing_rate
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'average'
        THEN er.average_rate
      WHEN get_rate_type_for_account(coa.class_level, coa.subclass_level) = 'historical'
        THEN er.historical_rate
      ELSE er.closing_rate
    END as translated_credit

  FROM trial_balance tb
  JOIN entities e ON e.id = tb.entity_id
  JOIN chart_of_accounts coa ON coa.account_code = tb.account_code
  JOIN exchange_rates er ON
    er.currency_code = e.functional_currency
    AND er.period_code = '2024-01'
  WHERE tb.period = '2024-01-31'
)
SELECT * FROM account_translations;
```

---

## Workflow

### Step 1: Setup Currencies
Add currencies in Settings → Currencies tab with base exchange rates

### Step 2: Load Period Rates
For each period, populate `exchange_rates`:
```sql
INSERT INTO exchange_rates
  (currency_code, base_currency, period_code, period_start, period_end,
   closing_rate, average_rate, opening_rate, rate_source)
VALUES
  ('EUR', 'USD', '2024-01', '2024-01-01', '2024-01-31',
   1.0850, 1.0820, 1.0790, 'API');
```

### Step 3: Translation Happens Automatically
When consolidating:
1. System looks up entity's functional currency
2. Gets period exchange rates from `exchange_rates`
3. Uses `translation_rules` to determine rate type per account
4. Applies appropriate rate (closing/average/historical)
5. Calculates currency translation adjustment (CTA)

---

## Currency Translation Adjustment (CTA)

The difference between:
- Net assets at closing rate
- Net assets at historical rate + P&L at average rate

Goes to: **Equity → Currency Translation Reserve**

```sql
-- Calculate CTA
CTA = (Assets - Liabilities) @ Closing Rate
    - [Opening Equity @ Historical + P&L @ Average]
```

---

## IAS 21 Compliance Summary

| Requirement | Implementation |
|-------------|----------------|
| BS items @ closing rate | `translation_rules` → Assets/Liabilities → `closing` |
| P&L items @ average rate | `translation_rules` → Revenue/Expenses → `average` |
| Equity @ historical rate | `translation_rules` → Equity → `historical` |
| CTA in Equity | Automatic calculation during consolidation |

---

## Next Steps

1. **Run the SQL scripts:**
   - `sql/my_new_tables.sql` - Creates all tables including exchange rates
   - `sql/04_ADD_CURRENCY_COLUMNS.sql` - Adds columns to existing currencies table
   - `sql/03_WORLD_CURRENCIES.sql` - Populates world currencies

2. **Add UI for Exchange Rate Management:**
   - Create page to input/manage period rates
   - Auto-fetch rates from API
   - Bulk upload from Excel

3. **Consolidation Engine:**
   - Use the SQL query above in your consolidation process
   - Calculate CTA automatically
   - Display translation details in workings

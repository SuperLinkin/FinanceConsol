# Database Setup - Financial Consolidation System

## Quick Start

This folder contains **TWO** clean SQL files for database setup:

1. **`00_DROP_EVERYTHING.sql`** - Drops all tables, views, functions, and types
2. **`01_CREATE_EVERYTHING.sql`** - Creates complete database schema with seed data

## Usage Instructions

### Fresh Installation

If setting up the database for the first time:

```sql
-- Run ONLY this file
\i 01_CREATE_EVERYTHING.sql
```

### Complete Reset

If you want to completely reset the database and start fresh:

```sql
-- Step 1: Drop everything
\i 00_DROP_EVERYTHING.sql

-- Step 2: Create everything
\i 01_CREATE_EVERYTHING.sql
```

### In Supabase SQL Editor

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy contents of `01_CREATE_EVERYTHING.sql` (for fresh install) OR both files (for reset)
4. Click "Run"
5. Wait for success message

## What Gets Created

### Tables (19 total)

**Master Data (8 tables)**:
- `world_currencies` - ISO 4217 currency codes
- `currencies` - Active currencies in system
- `exchange_rates` - Historical exchange rates
- `entity_controllers` - People responsible for entities
- `regions` - Geographic/organizational regions
- `reporting_periods` - Financial periods with lock status
- `system_parameters` - System configuration

**Entity & COA (5 tables)**:
- `entities` - Legal entities in consolidation group
- `coa_master_hierarchy` - IFRS 4-level chart of accounts
- `chart_of_accounts` - Entity-specific GL accounts
- `trial_balance` - Trial balance uploads with currency

**Consolidation (6 tables)**:
- `elimination_entries` - Intercompany eliminations
- `adjustment_entries` - Consolidation adjustments
- `translation_adjustments` - Currency translation (CTA/OCI)
- `intercompany_transactions` - IC transaction register
- `consolidation_workings` - Calculated consolidated results

### Enums/Types (6)

- `entity_type` - Parent, Subsidiary, Associate, etc.
- `ownership_type` - Direct, Indirect, Split
- `consolidation_method` - Full, Proportionate, Equity
- `statement_type` - balance_sheet, income_statement, etc.
- `period_status` - Open, Pre-Close, Locked, Closed
- `entry_status` - Draft, Pending, Approved, Posted

### Seed Data Included

✅ **30 World Currencies** (USD, EUR, GBP, JPY, etc.)
✅ **70+ IFRS COA Items** (4-level hierarchy)
✅ **12 System Parameters** (default settings)

## Key Features

### 1. Group Reporting Currency

- One currency can be marked as `is_group_reporting_currency = TRUE`
- Database constraint ensures only ONE currency is marked as base
- Used throughout consolidation for consistency

### 2. IFRS-Compliant COA

4-level hierarchy:
1. **Class** - Assets, Liabilities, Equity, Income, Expenses
2. **Subclass** - Current Assets, Non-Current Assets, etc.
3. **Note** - Cash & Cash Equivalents, PPE, etc.
4. **Subnote** - Cash on Hand, Cash at Bank, etc.

### 3. Multi-Currency Support

- Trial balance includes `currency` field
- Exchange rates table for historical rates
- Translation adjustments tracking

### 4. Complex Ownership

- Direct, indirect, and split ownership
- JSON field for complex ownership structures
- Parent-child entity relationships

## Post-Setup Steps

After running the SQL scripts:

1. **Add Currencies** (Consolidation Config → Currencies)
   - Add USD, EUR, GBP, or your currencies
   - Mark ONE as "Group Reporting Currency"

2. **Create Entities** (Entity Setup)
   - Add parent company
   - Add subsidiaries with ownership %
   - Set functional currencies

3. **Upload Trial Balances** (Upload Data)
   - Use single or bulk upload
   - System validates currency consistency

4. **View Consolidation** (Consolidation Workings)
   - See consolidated results
   - Entity columns + Eliminations + Adjustments

## Database Schema Diagram

```
world_currencies (ISO reference)
    ↓
currencies (Active in system)
    ↓
entities ← regions ← entity_controllers
    ↓
trial_balance → consolidation_workings
    ↓                    ↑
chart_of_accounts       |
    ↓                    |
coa_master_hierarchy    |
                        |
elimination_entries ────┤
adjustment_entries ─────┤
translation_adjustments─┘
```

## Important Notes

### Currency Constraint

The unique partial index ensures only ONE currency has `is_group_reporting_currency = TRUE`:

```sql
CREATE UNIQUE INDEX idx_unique_group_reporting_currency
ON currencies (is_group_reporting_currency)
WHERE is_group_reporting_currency = TRUE;
```

### Trial Balance Currency

Each trial balance record includes the currency it was uploaded in:

```sql
currency TEXT, -- Currency of uploaded amounts
```

This enables:
- Currency mismatch detection
- Automatic translation
- Audit trail

### Entity Ownership

Complex ownership structures supported via JSON:

```sql
split_ownership JSONB -- [{parent_id: UUID, percentage: NUMERIC}]
```

Example:
```json
[
  {"parent_id": "uuid-1", "percentage": 60.00},
  {"parent_id": "uuid-2", "percentage": 40.00}
]
```

## Troubleshooting

### "Table already exists" error

Run `00_DROP_EVERYTHING.sql` first to clean the database.

### "Permission denied"

Ensure you have `CREATE` privileges on the database. In Supabase, use the SQL Editor with admin access.

### Seed data not inserted

Check for constraint violations. The scripts use `ON CONFLICT DO NOTHING` to allow re-running safely.

### Currency constraint violation

If you try to mark multiple currencies as group reporting currency manually:

```sql
-- This will FAIL (good - prevents mistakes)
UPDATE currencies SET is_group_reporting_currency = TRUE WHERE currency_code IN ('USD', 'EUR');
```

Error: `duplicate key value violates unique constraint`

**Solution**: Only set ONE currency at a time via the UI or:

```sql
-- Correct way: Unset all, then set one
UPDATE currencies SET is_group_reporting_currency = FALSE;
UPDATE currencies SET is_group_reporting_currency = TRUE WHERE currency_code = 'USD';
```

## Version History

- **v2.0** (Current) - Clean two-file setup with group reporting currency
- **v1.0** - Original multi-file setup (deprecated)

## Support

For issues or questions:
1. Check the app's documentation markdown files
2. Review error messages in Supabase SQL Editor
3. Verify table structure matches expected schema

## Files

### Core Database Files
- `00_DROP_EVERYTHING.sql` - Clean slate (2.2 KB)
- `01_CREATE_EVERYTHING.sql` - Complete setup (28.7 KB)
- `Current_SQL_SUPABASE.sql` - Reference schema for all Reporting module tables

### Finance Close Module (NEW)
- **`Finance_Close_Auth_Setup.sql`** - Separate authentication setup for Finance Close module

---

## Finance Close Module Setup

### NEW: Dual Authentication System

The application now supports TWO completely isolated modules:

1. **CLOE - Reporting** (Consolidation) - Uses `users` table
2. **CLOE - Finance Close** (Period-End Close) - Uses `close_users` table

### Setup Finance Close Authentication

After setting up the Reporting module, run this separate file:

```sql
-- Run in Supabase SQL Editor
\i Finance_Close_Auth_Setup.sql
```

**What it creates:**
- ✅ `close_users` table (isolated from Reporting)
- ✅ Indexes and RLS policies
- ✅ Demo user (username: `close_demo`, password: `Demo@2025`)

**Important:**
- This table has NO foreign keys to any Reporting tables
- Completely separate authentication flow
- Different API endpoint: `/api/auth/login-close`
- Different base route: `/close`

### Demo Credentials

| Module | Username | Password | Route |
|--------|----------|----------|-------|
| Reporting | `Admin` | `Test` | `/` |
| Finance Close | `close_demo` | `Demo@2025` | `/close` |

For complete documentation, see:
- `FINANCE_CLOSE_AUTH_README.md` - Full technical docs
- `DUAL_AUTH_SUMMARY.md` - Quick reference

---

**Ready to set up your database!** 🚀

1. Run `01_CREATE_EVERYTHING.sql` for Reporting module
2. Run `Finance_Close_Auth_Setup.sql` for Finance Close module

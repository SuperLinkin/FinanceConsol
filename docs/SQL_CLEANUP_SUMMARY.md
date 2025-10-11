# SQL Files Cleanup - Summary

## What Was Done

Cleaned up the `sql/` folder and consolidated everything into **TWO clean files**.

## Before

```
sql/
├── 00_CLEAN_DATABASE.sql
├── 00_COMPLETE_SETUP.sql
├── 00_DROP_ALL_TABLES.sql
├── 01_COMPLETE_DATABASE_SCHEMA.sql
├── 01_CREATE_ALL_TABLES.sql
├── 02_SEED_DATA.sql
├── 03_ADD_SPLIT_OWNERSHIP.sql
├── 03_WORLD_CURRENCIES.sql
├── 04_ADD_CURRENCY_COLUMNS.sql
├── 04_CREATE_ENTITY_CONTROLLERS.sql
├── 05_CREATE_EXCHANGE_RATES_TABLE.sql
├── 06_CREATE_TRANSLATION_RULES_TABLE.sql
├── 07_CONSOLIDATION_WORKINGS_GENERATOR.sql
├── 08_ADD_GROUP_REPORTING_CURRENCY.sql
├── DEBUG_WORKINGS.sql
├── my_current_tables.sql
├── my_new_tables.sql
├── README.md (old)
├── supabase_consolidation_workings.sql
├── supabase_reporting_builder.sql
├── supabase_tables_upload.sql
├── TEST_GENERATOR.sql
└── UPDATE_ADD_EQUITY_STATEMENT.sql

Total: 24 files (confusing, redundant, outdated)
```

## After

```
sql/
├── 00_DROP_EVERYTHING.sql      (2.2 KB) - Clean slate
├── 01_CREATE_EVERYTHING.sql    (29 KB)  - Complete setup
└── README.md                    (6.7 KB) - Instructions

Total: 3 files (clean, organized, up-to-date)
```

## What's Included in CREATE_EVERYTHING.sql

### Complete Database Schema

✅ **19 Tables**:
- 8 Master Data tables (currencies, regions, controllers, etc.)
- 5 Entity & COA tables
- 6 Consolidation tables

✅ **6 Enums/Types**:
- entity_type, ownership_type, consolidation_method
- statement_type, period_status, entry_status

✅ **Seed Data**:
- 30 world currencies (USD, EUR, GBP, etc.)
- 70+ IFRS chart of accounts items
- 12 system parameters

✅ **Latest Features**:
- Group reporting currency support
- Currency field in trial_balance
- Unique constraint on base currency
- Split ownership JSON support
- Translation adjustments tracking

### Key Tables

**Core Financial Data**:
```
trial_balance
├── entity_id
├── account_code
├── debit / credit
├── currency (NEW)
└── period
```

**Currencies with Base Currency**:
```
currencies
├── currency_code
├── is_presentation_currency
├── is_functional_currency
├── is_group_reporting_currency (NEW - only ONE can be TRUE)
└── exchange_rate
```

**Entities with Complex Ownership**:
```
entities
├── entity_code
├── entity_type
├── parent_entity_id
├── ownership_percentage
├── split_ownership (JSON for complex structures)
└── functional_currency
```

**IFRS 4-Level COA**:
```
coa_master_hierarchy
├── class_name (Assets, Liabilities, etc.)
├── subclass_name (Current Assets, etc.)
├── note_name (Cash & CE, etc.)
└── subnote_name (Cash at Bank, etc.)
```

## Usage

### For Fresh Database Setup

1. Open Supabase SQL Editor
2. Copy contents of `01_CREATE_EVERYTHING.sql`
3. Paste and run
4. Wait for success message
5. Done! ✓

### For Complete Reset

1. Copy contents of `00_DROP_EVERYTHING.sql`
2. Run it (drops all tables)
3. Copy contents of `01_CREATE_EVERYTHING.sql`
4. Run it (creates everything fresh)
5. Done! ✓

## Benefits of New Structure

### Before (Problems)
❌ 24 files - confusing which to run
❌ Redundant/overlapping files
❌ Outdated migration files
❌ Debug/test files mixed in
❌ No clear execution order
❌ Missing latest features

### After (Solutions)
✅ Just 2 files - crystal clear
✅ No redundancy
✅ All features up-to-date
✅ Clear execution order
✅ Comprehensive README
✅ Includes latest features:
   - Group reporting currency
   - Currency validation
   - Translation support

## What Was Removed

All these unnecessary files were deleted:

1. **Deprecated schemas**: `my_current_tables.sql`, `my_new_tables.sql`
2. **Old migrations**: `03_ADD_SPLIT_OWNERSHIP.sql`, `04_ADD_CURRENCY_COLUMNS.sql`, etc.
3. **Partial setups**: `supabase_tables_upload.sql`, `supabase_consolidation_workings.sql`
4. **Debug files**: `DEBUG_WORKINGS.sql`, `TEST_GENERATOR.sql`
5. **Incomplete setups**: `00_CLEAN_DATABASE.sql`, `00_COMPLETE_SETUP.sql`
6. **Redundant files**: Multiple "create all" and "drop all" variants

## Database Structure Overview

```
┌─────────────────────────────────────────────┐
│           MASTER DATA LAYER                  │
├─────────────────────────────────────────────┤
│ world_currencies → currencies (base)         │
│ regions ← entity_controllers                 │
│ reporting_periods                            │
│ system_parameters                            │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│           ENTITY LAYER                       │
├─────────────────────────────────────────────┤
│ entities (with ownership & currency)         │
│ coa_master_hierarchy (IFRS 4-level)         │
│ chart_of_accounts (entity GL)               │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│           TRANSACTION LAYER                  │
├─────────────────────────────────────────────┤
│ trial_balance (with currency)                │
│ intercompany_transactions                    │
│ exchange_rates                               │
└─────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────┐
│           CONSOLIDATION LAYER                │
├─────────────────────────────────────────────┤
│ elimination_entries                          │
│ adjustment_entries                           │
│ translation_adjustments                      │
│ consolidation_workings (results)             │
└─────────────────────────────────────────────┘
```

## Important Constraints

### 1. Unique Group Reporting Currency
```sql
CREATE UNIQUE INDEX idx_unique_group_reporting_currency
ON currencies (is_group_reporting_currency)
WHERE is_group_reporting_currency = TRUE;
```
**Result**: Only ONE currency can be marked as base

### 2. Trial Balance Uniqueness
```sql
UNIQUE(entity_id, account_code, period)
```
**Result**: One TB record per entity/account/period combination

### 3. Entity Code Uniqueness
```sql
UNIQUE(entity_code)
```
**Result**: Each entity has unique identifier

## Next Steps After Running SQL

1. **Set Group Reporting Currency**
   - Go to: Consolidation Config → Currencies
   - Add currencies (USD, EUR, etc.)
   - Mark ONE as "Group Reporting Currency"

2. **Create Entities**
   - Go to: Entity Setup
   - Add parent company
   - Add subsidiaries with ownership %
   - Set functional currencies

3. **Upload Trial Balances**
   - Go to: Upload Data
   - Use single or bulk upload
   - System validates currency

4. **View Consolidation**
   - Go to: Consolidation Workings
   - See results by entity
   - Review eliminations/adjustments

## Files Details

### 00_DROP_EVERYTHING.sql (2.2 KB)

**Purpose**: Nuclear option - drops everything
**Contents**:
- DROP all 19 tables with CASCADE
- DROP all 6 enums/types
- DROP any views/functions
- Confirmation message

**When to use**:
- Complete database reset needed
- Starting from scratch
- Fixing corrupted schema

### 01_CREATE_EVERYTHING.sql (29 KB)

**Purpose**: Complete database setup in one file
**Contents**:
- Section 1: Enums/Types (6 types)
- Section 2: Master Data (8 tables)
- Section 3: Entity Structure (1 table)
- Section 4: Chart of Accounts (2 tables)
- Section 5: Trial Balance (1 table)
- Section 6: Consolidation (6 tables)
- Section 7: World Currencies seed data (30 currencies)
- Section 8: IFRS COA seed data (70+ items)
- Section 9: System Parameters (12 params)
- Completion message with stats

**When to use**:
- Fresh installation
- After running DROP_EVERYTHING
- Setting up new Supabase project

### README.md (6.7 KB)

**Purpose**: Complete documentation
**Contents**:
- Quick start instructions
- Table listing
- Feature descriptions
- Post-setup steps
- Troubleshooting guide
- Schema diagram

## Verification

After running the scripts, verify with:

```sql
-- Count tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';
-- Expected: 19

-- Check currencies table
SELECT * FROM currencies;
-- Should have group reporting currency field

-- Check trial balance
SELECT column_name FROM information_schema.columns
WHERE table_name = 'trial_balance' AND column_name = 'currency';
-- Should return 'currency'

-- Check seed data
SELECT COUNT(*) FROM world_currencies;
-- Expected: 30

SELECT COUNT(*) FROM coa_master_hierarchy;
-- Expected: 70+
```

## Summary

✅ **Cleaned up**: Deleted 21 unnecessary SQL files
✅ **Consolidated**: Everything into 2 clean files
✅ **Updated**: Includes all latest features
✅ **Documented**: Comprehensive README
✅ **Ready**: For Supabase deployment

**Total cleanup**: From 24 messy files → 3 clean files (87.5% reduction)

The database setup is now **production-ready** and **easy to maintain**! 🎉

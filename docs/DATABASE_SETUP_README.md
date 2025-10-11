# Database Setup Guide

This guide explains how to set up the complete database schema for the Financial Consolidation application.

## 📁 SQL Files Overview

### 1. `00_CLEAN_DATABASE.sql`
**Purpose:** Completely wipes the database clean
- Drops all tables with CASCADE
- Removes all indexes
- ⚠️ **WARNING:** This permanently deletes ALL data!

### 2. `01_COMPLETE_DATABASE_SCHEMA.sql`
**Purpose:** Creates all 21 tables required for the entire application
- Master data tables (currencies, controllers, regions, entities)
- Chart of Accounts tables
- Transaction tables (trial balance, mappings)
- Consolidation logic tables
- Consolidation workings tables
- Reporting builder tables
- All indexes for performance
- Row Level Security (RLS) policies
- Complete documentation

### 3. `02_SEED_DATA.sql`
**Purpose:** Populates essential reference data
- 20 common world currencies
- Complete IFRS 4-level COA hierarchy (100+ master items)
- **NO mock entities or transactions** - clean start for production

## 🚀 Setup Instructions

### Option A: Fresh Database Setup (First Time)

```sql
-- Step 1: Create all tables
\i 01_COMPLETE_DATABASE_SCHEMA.sql

-- Step 2: Load reference data
\i 02_SEED_DATA.sql
```

### Option B: Clean Database & Rebuild (Reset Everything)

```sql
-- Step 1: Clean everything
\i 00_CLEAN_DATABASE.sql

-- Step 2: Create all tables
\i 01_COMPLETE_DATABASE_SCHEMA.sql

-- Step 3: Load reference data
\i 02_SEED_DATA.sql
```

### Using Supabase SQL Editor

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of each file in order
5. Run each query

## 📊 Database Structure

### Total Tables: 21

#### Master Data (4 tables)
- `currencies` - Currency codes and symbols
- `controllers` - Financial controllers
- `regions` - Geographic/business regions
- `entities` - Legal entities in consolidation group

#### Chart of Accounts (2 tables)
- `coa_master_hierarchy` - IFRS 4-level hierarchy master
- `chart_of_accounts` - Master GL account codes

#### Transaction Data (2 tables)
- `trial_balance` - Entity trial balance data
- `entity_gl_mapping` - Maps entity GL to master COA

#### Consolidation Logic (4 tables)
- `entity_logic` - Consolidation rules and logic
- `elimination_templates` - Reusable elimination templates
- `eliminations` - Intercompany eliminations
- `builder_entries` - Manual consolidation entries

#### Consolidation Workings (4 tables)
- `consolidation_workings` - Saved working papers
- `consolidation_changes` - Audit trail of changes
- `validation_checks` - Validation check definitions
- `validation_results` - Validation check results

#### Reporting (5 tables)
- `report_templates` - Report templates
- `financial_reports` - Generated reports
- `report_notes` - Report notes
- `report_changes` - Report change audit trail
- `report_versions` - Report version history

## 🎯 What's Included vs What's Not

### ✅ Included (Reference Data)
- 20 common world currencies (USD, EUR, GBP, etc.)
- Complete IFRS COA hierarchy structure (100+ items)
  - Assets (Current, Non-current)
  - Liabilities (Current, Non-current)
  - Equity (Share Capital, Reserves, NCI)
  - Income (Revenue, Other Income)
  - Expenses (Cost of Sales, Operating, Finance)

### ❌ NOT Included (User Data)
- No sample entities
- No sample transactions
- No sample trial balances
- No sample eliminations
- No sample reports

This gives you a clean production-ready database!

## 🔐 Security

- Row Level Security (RLS) is enabled on all tables
- Default policy allows all operations (can be restricted later)
- All foreign keys have proper CASCADE/SET NULL rules
- Indexes created for all frequently queried columns

## 📝 Notes

- All tables use UUID primary keys
- Timestamps automatically set on create/update
- JSONB columns used for flexible data storage
- Soft deletes via `is_active` flags on most tables
- Audit trails included for workings and reports

## 🆘 Troubleshooting

### If tables already exist:
Run `00_CLEAN_DATABASE.sql` first to drop everything, then rebuild.

### If foreign key errors occur:
Make sure you run the scripts in order:
1. Clean (if needed)
2. Schema
3. Seed data

### If RLS errors occur:
Make sure you're using a Supabase service role key or have proper authentication set up.

## 📞 Support

For issues or questions, check the application logs or Supabase dashboard.

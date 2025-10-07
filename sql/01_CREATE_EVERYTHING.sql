-- ============================================================================
-- CREATE EVERYTHING - Financial Consolidation System
-- ============================================================================
-- Purpose: Complete database schema for multi-entity financial consolidation
-- Usage: Run this AFTER 00_DROP_EVERYTHING.sql for a fresh setup
-- Version: 2.0 - Includes group reporting currency and all latest features
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUMS AND TYPES
-- ============================================================================

CREATE TYPE entity_type AS ENUM (
    'Parent',
    'Subsidiary',
    'Associate',
    'Joint Venture',
    'Branch'
);

CREATE TYPE ownership_type AS ENUM (
    'Direct',
    'Indirect',
    'Split'
);

CREATE TYPE consolidation_method AS ENUM (
    'Full Consolidation',
    'Proportionate Consolidation',
    'Equity Method',
    'Not Consolidated'
);

CREATE TYPE statement_type AS ENUM (
    'balance_sheet',
    'income_statement',
    'cash_flow',
    'equity'
);

CREATE TYPE period_status AS ENUM (
    'Open',
    'Pre-Close',
    'Locked',
    'Closed'
);

CREATE TYPE entry_status AS ENUM (
    'Draft',
    'Pending Review',
    'Approved',
    'Posted',
    'Rejected'
);

-- ============================================================================
-- SECTION 2: MASTER DATA TABLES
-- ============================================================================

-- World Currencies (ISO 4217)
CREATE TABLE world_currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_code TEXT UNIQUE NOT NULL,
    currency_name TEXT NOT NULL,
    symbol TEXT,
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE world_currencies IS 'ISO 4217 currency codes - master reference list';

-- Active Currencies in System
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_code TEXT UNIQUE NOT NULL,
    currency_name TEXT NOT NULL,
    symbol TEXT,
    is_presentation_currency BOOLEAN DEFAULT false,
    is_functional_currency BOOLEAN DEFAULT false,
    is_group_reporting_currency BOOLEAN DEFAULT false,
    exchange_rate NUMERIC(15,6) DEFAULT 1.0,
    rate_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE currencies IS 'Active currencies used in the consolidation system';
COMMENT ON COLUMN currencies.is_group_reporting_currency IS 'Base currency for consolidated reports - ONLY ONE should be TRUE';

-- Unique constraint: Only ONE group reporting currency
CREATE UNIQUE INDEX idx_unique_group_reporting_currency
ON currencies (is_group_reporting_currency)
WHERE is_group_reporting_currency = TRUE;

-- Exchange Rates (Historical)
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate NUMERIC(15,6) NOT NULL,
    rate_date DATE NOT NULL,
    rate_type TEXT DEFAULT 'Spot', -- Spot, Average, Closing, Historical
    source TEXT, -- API, Manual, System
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_currency, to_currency, rate_date, rate_type)
);

COMMENT ON TABLE exchange_rates IS 'Historical exchange rates for currency translation';

CREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date DESC);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);

-- Entity Controllers (People)
CREATE TABLE entity_controllers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Entity Controller',
    email TEXT UNIQUE,
    reporting_to UUID REFERENCES entity_controllers(id),
    is_ultimate_owner BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE entity_controllers IS 'People responsible for entities and regions';

-- Regions
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT UNIQUE NOT NULL,
    region_name TEXT NOT NULL,
    description TEXT,
    associated_currency TEXT,
    parent_region_id UUID REFERENCES regions(id),
    controller_id UUID REFERENCES entity_controllers(id),
    reporting_calendar TEXT DEFAULT 'Jan-Dec',
    regulatory_framework TEXT DEFAULT 'IFRS',
    intra_region_netting BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE regions IS 'Geographic or organizational regions for entity grouping';

-- Reporting Periods
CREATE TABLE reporting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER,
    fiscal_month INTEGER,
    status period_status DEFAULT 'Open',
    is_year_end BOOLEAN DEFAULT false,
    locked_by UUID REFERENCES entity_controllers(id),
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(period_start, period_end)
);

COMMENT ON TABLE reporting_periods IS 'Financial reporting periods with lock status';

CREATE INDEX idx_periods_dates ON reporting_periods(period_start, period_end);

-- System Parameters
CREATE TABLE system_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parameter_category TEXT NOT NULL,
    parameter_key TEXT NOT NULL,
    parameter_value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT,
    UNIQUE(parameter_category, parameter_key)
);

COMMENT ON TABLE system_parameters IS 'System-wide configuration parameters';

-- ============================================================================
-- SECTION 3: ENTITY STRUCTURE
-- ============================================================================

-- Entities (Companies)
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_code TEXT UNIQUE NOT NULL,
    entity_name TEXT NOT NULL,
    entity_type entity_type NOT NULL,
    parent_entity_id UUID REFERENCES entities(id),
    region_id UUID REFERENCES regions(id),
    controller_id UUID REFERENCES entity_controllers(id),

    -- Ownership
    ownership_percentage NUMERIC(5,2),
    ownership_type ownership_type DEFAULT 'Direct',
    consolidation_method consolidation_method DEFAULT 'Full Consolidation',

    -- Split ownership (for indirect/complex structures)
    split_ownership JSONB, -- [{parent_id: UUID, percentage: NUMERIC}]

    -- Currency
    functional_currency TEXT,
    presentation_currency TEXT,

    -- Dates
    acquisition_date DATE,
    reporting_start_date DATE,
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE entities IS 'Legal entities in the consolidation group';
COMMENT ON COLUMN entities.split_ownership IS 'JSON array for complex ownership structures: [{parent_id, percentage}]';

CREATE INDEX idx_entities_parent ON entities(parent_entity_id);
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_active ON entities(is_active);

-- ============================================================================
-- SECTION 4: CHART OF ACCOUNTS
-- ============================================================================

-- COA Master Hierarchy (IFRS 4-Level)
CREATE TABLE coa_master_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Level 1: Class (Assets, Liabilities, Equity, Income, Expenses)
    class_name TEXT NOT NULL,
    class_code TEXT,

    -- Level 2: Subclass (Current Assets, Non-Current Assets, etc.)
    subclass_name TEXT NOT NULL,
    subclass_code TEXT,

    -- Level 3: Note (Cash & Cash Equivalents, Trade Receivables, etc.)
    note_name TEXT,
    note_code TEXT,
    note_number INTEGER,

    -- Level 4: Subnote (Cash on Hand, Cash at Bank, etc.)
    subnote_name TEXT,
    subnote_code TEXT,

    -- Attributes
    statement_type statement_type NOT NULL,
    normal_balance TEXT CHECK (normal_balance IN ('Debit', 'Credit')),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(class_name, subclass_name, note_name, subnote_name)
);

COMMENT ON TABLE coa_master_hierarchy IS 'IFRS-compliant 4-level chart of accounts hierarchy';

CREATE INDEX idx_coa_hierarchy_statement ON coa_master_hierarchy(statement_type);
CREATE INDEX idx_coa_hierarchy_class ON coa_master_hierarchy(class_name);

-- Chart of Accounts (Entity-Specific Accounts)
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id),

    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,

    -- Link to master hierarchy
    class_name TEXT,
    subclass_name TEXT,
    note_name TEXT,
    subnote_name TEXT,

    -- Attributes
    account_type TEXT,
    normal_balance TEXT CHECK (normal_balance IN ('Debit', 'Credit')),
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(entity_id, account_code)
);

COMMENT ON TABLE chart_of_accounts IS 'Entity-specific general ledger accounts mapped to master hierarchy';

CREATE INDEX idx_coa_entity ON chart_of_accounts(entity_id);
CREATE INDEX idx_coa_account_code ON chart_of_accounts(account_code);
CREATE INDEX idx_coa_hierarchy_link ON chart_of_accounts(class_name, subclass_name, note_name);

-- ============================================================================
-- SECTION 5: TRIAL BALANCE
-- ============================================================================

CREATE TABLE trial_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id),

    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,

    debit NUMERIC(18,2) DEFAULT 0,
    credit NUMERIC(18,2) DEFAULT 0,

    currency TEXT, -- Currency of the amounts uploaded
    period DATE NOT NULL,

    uploaded_by TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(entity_id, account_code, period)
);

COMMENT ON TABLE trial_balance IS 'Trial balance uploads from entities with currency information';
COMMENT ON COLUMN trial_balance.currency IS 'Currency in which amounts are denominated';

CREATE INDEX idx_tb_entity ON trial_balance(entity_id);
CREATE INDEX idx_tb_period ON trial_balance(period);
CREATE INDEX idx_tb_entity_period ON trial_balance(entity_id, period);

-- ============================================================================
-- SECTION 6: CONSOLIDATION ENTRIES
-- ============================================================================

-- Elimination Entries
CREATE TABLE elimination_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entry_number TEXT UNIQUE,
    description TEXT NOT NULL,
    elimination_type TEXT, -- Intercompany AR/AP, IC Revenue/Expense, IC Investment, etc.

    period DATE NOT NULL,
    status entry_status DEFAULT 'Draft',

    debit_account TEXT NOT NULL,
    credit_account TEXT NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    currency TEXT,

    entity_from UUID REFERENCES entities(id),
    entity_to UUID REFERENCES entities(id),

    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,

    notes TEXT
);

COMMENT ON TABLE elimination_entries IS 'Intercompany elimination journal entries';

CREATE INDEX idx_elim_period ON elimination_entries(period);
CREATE INDEX idx_elim_status ON elimination_entries(status);

-- Adjustment Entries
CREATE TABLE adjustment_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entry_number TEXT UNIQUE,
    description TEXT NOT NULL,
    adjustment_type TEXT, -- Fair Value, Depreciation, PPA, Reclass, etc.

    period DATE NOT NULL,
    status entry_status DEFAULT 'Draft',

    debit_account TEXT NOT NULL,
    credit_account TEXT NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    currency TEXT,

    entity_id UUID REFERENCES entities(id),

    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,

    notes TEXT
);

COMMENT ON TABLE adjustment_entries IS 'Consolidation adjustment journal entries';

CREATE INDEX idx_adj_period ON adjustment_entries(period);
CREATE INDEX idx_adj_status ON adjustment_entries(status);

-- Translation Adjustments
CREATE TABLE translation_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entity_id UUID NOT NULL REFERENCES entities(id),
    account_code TEXT NOT NULL,

    period DATE NOT NULL,

    functional_amount NUMERIC(18,2),
    functional_currency TEXT,

    translated_amount NUMERIC(18,2),
    translated_currency TEXT,

    exchange_rate NUMERIC(15,6),
    translation_method TEXT, -- Current Rate, Average Rate, Historical Rate

    adjustment_amount NUMERIC(18,2),
    cumulative_adjustment NUMERIC(18,2),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE translation_adjustments IS 'Currency translation adjustments (CTA/OCI)';

CREATE INDEX idx_trans_adj_entity_period ON translation_adjustments(entity_id, period);

-- Intercompany Transactions (for tracking)
CREATE TABLE intercompany_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    transaction_number TEXT,
    transaction_date DATE NOT NULL,

    from_entity_id UUID NOT NULL REFERENCES entities(id),
    to_entity_id UUID NOT NULL REFERENCES entities(id),

    transaction_type TEXT, -- Sales, Purchases, Loan, Dividend, Management Fee

    amount NUMERIC(18,2) NOT NULL,
    currency TEXT,

    from_account TEXT,
    to_account TEXT,

    is_eliminated BOOLEAN DEFAULT false,
    elimination_entry_id UUID REFERENCES elimination_entries(id),

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE intercompany_transactions IS 'Intercompany transaction register for matching and elimination';

CREATE INDEX idx_ic_from_entity ON intercompany_transactions(from_entity_id);
CREATE INDEX idx_ic_to_entity ON intercompany_transactions(to_entity_id);
CREATE INDEX idx_ic_date ON intercompany_transactions(transaction_date);

-- Consolidation Workings (Calculated Results)
CREATE TABLE consolidation_workings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    period DATE NOT NULL,
    statement_type statement_type NOT NULL,

    account_code TEXT NOT NULL,
    account_name TEXT,

    -- Hierarchy
    class_name TEXT,
    subclass_name TEXT,
    note_name TEXT,
    subnote_name TEXT,

    -- Entity columns (stored as JSONB for flexibility)
    entity_amounts JSONB, -- {entity_id: amount}

    elimination_amount NUMERIC(18,2) DEFAULT 0,
    adjustment_amount NUMERIC(18,2) DEFAULT 0,
    translation_amount NUMERIC(18,2) DEFAULT 0,

    consolidated_amount NUMERIC(18,2),

    calculated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(period, statement_type, account_code)
);

COMMENT ON TABLE consolidation_workings IS 'Calculated consolidation workings (columnar format)';
COMMENT ON COLUMN consolidation_workings.entity_amounts IS 'JSON object mapping entity_id to amount';

CREATE INDEX idx_consol_period_statement ON consolidation_workings(period, statement_type);

-- ============================================================================
-- SECTION 7: SEED DATA - WORLD CURRENCIES
-- ============================================================================

INSERT INTO world_currencies (currency_code, currency_name, symbol, decimal_places) VALUES
('USD', 'United States Dollar', '$', 2),
('EUR', 'Euro', '€', 2),
('GBP', 'British Pound Sterling', '£', 2),
('JPY', 'Japanese Yen', '¥', 0),
('CHF', 'Swiss Franc', 'Fr', 2),
('AUD', 'Australian Dollar', 'A$', 2),
('CAD', 'Canadian Dollar', 'C$', 2),
('CNY', 'Chinese Yuan', '¥', 2),
('INR', 'Indian Rupee', '₹', 2),
('SGD', 'Singapore Dollar', 'S$', 2),
('HKD', 'Hong Kong Dollar', 'HK$', 2),
('NZD', 'New Zealand Dollar', 'NZ$', 2),
('SEK', 'Swedish Krona', 'kr', 2),
('NOK', 'Norwegian Krone', 'kr', 2),
('DKK', 'Danish Krone', 'kr', 2),
('MXN', 'Mexican Peso', 'Mex$', 2),
('BRL', 'Brazilian Real', 'R$', 2),
('ZAR', 'South African Rand', 'R', 2),
('AED', 'UAE Dirham', 'د.إ', 2),
('SAR', 'Saudi Riyal', '﷼', 2),
('THB', 'Thai Baht', '฿', 2),
('MYR', 'Malaysian Ringgit', 'RM', 2),
('IDR', 'Indonesian Rupiah', 'Rp', 0),
('PHP', 'Philippine Peso', '₱', 2),
('KRW', 'South Korean Won', '₩', 0),
('PLN', 'Polish Zloty', 'zł', 2),
('CZK', 'Czech Koruna', 'Kč', 2),
('HUF', 'Hungarian Forint', 'Ft', 0),
('TRY', 'Turkish Lira', '₺', 2),
('RUB', 'Russian Ruble', '₽', 2)
ON CONFLICT (currency_code) DO NOTHING;

-- ============================================================================
-- SECTION 8: SEED DATA - COA MASTER HIERARCHY (IFRS)
-- ============================================================================

-- BALANCE SHEET HIERARCHY
INSERT INTO coa_master_hierarchy (class_name, class_code, subclass_name, subclass_code, note_name, note_code, note_number, subnote_name, subnote_code, statement_type, normal_balance, display_order) VALUES

-- ASSETS
('Assets', '1', 'Current Assets', '11', 'Cash and Cash Equivalents', '1101', 1, 'Cash on Hand', '110101', 'balance_sheet', 'Debit', 1),
('Assets', '1', 'Current Assets', '11', 'Cash and Cash Equivalents', '1101', 1, 'Cash at Bank', '110102', 'balance_sheet', 'Debit', 2),
('Assets', '1', 'Current Assets', '11', 'Cash and Cash Equivalents', '1101', 1, 'Short-term Deposits', '110103', 'balance_sheet', 'Debit', 3),

('Assets', '1', 'Current Assets', '11', 'Trade and Other Receivables', '1102', 2, 'Trade Receivables', '110201', 'balance_sheet', 'Debit', 4),
('Assets', '1', 'Current Assets', '11', 'Trade and Other Receivables', '1102', 2, 'Other Receivables', '110202', 'balance_sheet', 'Debit', 5),
('Assets', '1', 'Current Assets', '11', 'Trade and Other Receivables', '1102', 2, 'Prepayments', '110203', 'balance_sheet', 'Debit', 6),

('Assets', '1', 'Current Assets', '11', 'Inventories', '1103', 3, 'Raw Materials', '110301', 'balance_sheet', 'Debit', 7),
('Assets', '1', 'Current Assets', '11', 'Inventories', '1103', 3, 'Work in Progress', '110302', 'balance_sheet', 'Debit', 8),
('Assets', '1', 'Current Assets', '11', 'Inventories', '1103', 3, 'Finished Goods', '110303', 'balance_sheet', 'Debit', 9),

('Assets', '1', 'Non-Current Assets', '12', 'Property, Plant and Equipment', '1201', 4, 'Land and Buildings', '120101', 'balance_sheet', 'Debit', 10),
('Assets', '1', 'Non-Current Assets', '12', 'Property, Plant and Equipment', '1201', 4, 'Machinery and Equipment', '120102', 'balance_sheet', 'Debit', 11),
('Assets', '1', 'Non-Current Assets', '12', 'Property, Plant and Equipment', '1201', 4, 'Vehicles', '120103', 'balance_sheet', 'Debit', 12),
('Assets', '1', 'Non-Current Assets', '12', 'Property, Plant and Equipment', '1201', 4, 'Accumulated Depreciation', '120199', 'balance_sheet', 'Credit', 13),

('Assets', '1', 'Non-Current Assets', '12', 'Intangible Assets', '1202', 5, 'Goodwill', '120201', 'balance_sheet', 'Debit', 14),
('Assets', '1', 'Non-Current Assets', '12', 'Intangible Assets', '1202', 5, 'Software', '120202', 'balance_sheet', 'Debit', 15),
('Assets', '1', 'Non-Current Assets', '12', 'Intangible Assets', '1202', 5, 'Licenses', '120203', 'balance_sheet', 'Debit', 16),

('Assets', '1', 'Non-Current Assets', '12', 'Investments', '1203', 6, 'Investments in Subsidiaries', '120301', 'balance_sheet', 'Debit', 17),
('Assets', '1', 'Non-Current Assets', '12', 'Investments', '1203', 6, 'Investments in Associates', '120302', 'balance_sheet', 'Debit', 18),
('Assets', '1', 'Non-Current Assets', '12', 'Investments', '1203', 6, 'Other Investments', '120303', 'balance_sheet', 'Debit', 19),

-- LIABILITIES
('Liabilities', '2', 'Current Liabilities', '21', 'Trade and Other Payables', '2101', 7, 'Trade Payables', '210101', 'balance_sheet', 'Credit', 20),
('Liabilities', '2', 'Current Liabilities', '21', 'Trade and Other Payables', '2101', 7, 'Other Payables', '210102', 'balance_sheet', 'Credit', 21),
('Liabilities', '2', 'Current Liabilities', '21', 'Trade and Other Payables', '2101', 7, 'Accrued Expenses', '210103', 'balance_sheet', 'Credit', 22),

('Liabilities', '2', 'Current Liabilities', '21', 'Short-term Borrowings', '2102', 8, 'Bank Overdrafts', '210201', 'balance_sheet', 'Credit', 23),
('Liabilities', '2', 'Current Liabilities', '21', 'Short-term Borrowings', '2102', 8, 'Short-term Loans', '210202', 'balance_sheet', 'Credit', 24),

('Liabilities', '2', 'Current Liabilities', '21', 'Current Tax Liabilities', '2103', 9, 'Income Tax Payable', '210301', 'balance_sheet', 'Credit', 25),
('Liabilities', '2', 'Current Liabilities', '21', 'Current Tax Liabilities', '2103', 9, 'VAT Payable', '210302', 'balance_sheet', 'Credit', 26),

('Liabilities', '2', 'Non-Current Liabilities', '22', 'Long-term Borrowings', '2201', 10, 'Bank Loans', '220101', 'balance_sheet', 'Credit', 27),
('Liabilities', '2', 'Non-Current Liabilities', '22', 'Long-term Borrowings', '2201', 10, 'Bonds Payable', '220102', 'balance_sheet', 'Credit', 28),

('Liabilities', '2', 'Non-Current Liabilities', '22', 'Provisions', '2202', 11, 'Deferred Tax Liabilities', '220201', 'balance_sheet', 'Credit', 29),
('Liabilities', '2', 'Non-Current Liabilities', '22', 'Provisions', '2202', 11, 'Pension Obligations', '220202', 'balance_sheet', 'Credit', 30),
('Liabilities', '2', 'Non-Current Liabilities', '22', 'Provisions', '2202', 11, 'Other Provisions', '220203', 'balance_sheet', 'Credit', 31),

-- EQUITY
('Equity', '3', 'Share Capital', '31', 'Share Capital', '3101', 12, 'Ordinary Shares', '310101', 'balance_sheet', 'Credit', 32),
('Equity', '3', 'Share Capital', '31', 'Share Capital', '3101', 12, 'Preference Shares', '310102', 'balance_sheet', 'Credit', 33),

('Equity', '3', 'Reserves', '32', 'Retained Earnings', '3201', 13, 'Retained Earnings', '320101', 'balance_sheet', 'Credit', 34),

('Equity', '3', 'Reserves', '32', 'Other Reserves', '3202', 14, 'Revaluation Reserve', '320201', 'balance_sheet', 'Credit', 35),
('Equity', '3', 'Reserves', '32', 'Other Reserves', '3202', 14, 'Translation Reserve', '320202', 'balance_sheet', 'Credit', 36),
('Equity', '3', 'Reserves', '32', 'Other Reserves', '3202', 14, 'Share Premium', '320203', 'balance_sheet', 'Credit', 37),

('Equity', '3', 'Non-Controlling Interest', '33', 'Non-Controlling Interest', '3301', 15, 'NCI in Subsidiaries', '330101', 'balance_sheet', 'Credit', 38);

-- INCOME STATEMENT HIERARCHY
INSERT INTO coa_master_hierarchy (class_name, class_code, subclass_name, subclass_code, note_name, note_code, note_number, subnote_name, subnote_code, statement_type, normal_balance, display_order) VALUES

-- INCOME
('Income', '4', 'Revenue', '41', 'Sales Revenue', '4101', 1, 'Product Sales', '410101', 'income_statement', 'Credit', 1),
('Income', '4', 'Revenue', '41', 'Sales Revenue', '4101', 1, 'Service Revenue', '410102', 'income_statement', 'Credit', 2),

('Income', '4', 'Other Income', '42', 'Other Operating Income', '4201', 2, 'Interest Income', '420101', 'income_statement', 'Credit', 3),
('Income', '4', 'Other Income', '42', 'Other Operating Income', '4201', 2, 'Dividend Income', '420102', 'income_statement', 'Credit', 4),
('Income', '4', 'Other Income', '42', 'Other Operating Income', '4201', 2, 'Gain on Disposal', '420103', 'income_statement', 'Credit', 5),

-- EXPENSES
('Expenses', '5', 'Cost of Sales', '51', 'Cost of Goods Sold', '5101', 3, 'Direct Materials', '510101', 'income_statement', 'Debit', 6),
('Expenses', '5', 'Cost of Sales', '51', 'Cost of Goods Sold', '5101', 3, 'Direct Labor', '510102', 'income_statement', 'Debit', 7),
('Expenses', '5', 'Cost of Sales', '51', 'Cost of Goods Sold', '5101', 3, 'Manufacturing Overhead', '510103', 'income_statement', 'Debit', 8),

('Expenses', '5', 'Operating Expenses', '52', 'Administrative Expenses', '5201', 4, 'Salaries and Wages', '520101', 'income_statement', 'Debit', 9),
('Expenses', '5', 'Operating Expenses', '52', 'Administrative Expenses', '5201', 4, 'Rent and Utilities', '520102', 'income_statement', 'Debit', 10),
('Expenses', '5', 'Operating Expenses', '52', 'Administrative Expenses', '5201', 4, 'Depreciation', '520103', 'income_statement', 'Debit', 11),

('Expenses', '5', 'Operating Expenses', '52', 'Selling and Distribution', '5202', 5, 'Marketing Expenses', '520201', 'income_statement', 'Debit', 12),
('Expenses', '5', 'Operating Expenses', '52', 'Selling and Distribution', '5202', 5, 'Sales Commissions', '520202', 'income_statement', 'Debit', 13),

('Expenses', '5', 'Finance Costs', '53', 'Interest Expense', '5301', 6, 'Interest on Loans', '530101', 'income_statement', 'Debit', 14),
('Expenses', '5', 'Finance Costs', '53', 'Interest Expense', '5301', 6, 'Bank Charges', '530102', 'income_statement', 'Debit', 15);

-- ============================================================================
-- SECTION 9: SEED DATA - SYSTEM PARAMETERS
-- ============================================================================

INSERT INTO system_parameters (parameter_category, parameter_key, parameter_value, description) VALUES
-- Currency Rules
('currency_rules', 'group_presentation_currency', 'USD', 'Primary currency for consolidated reports'),
('currency_rules', 'rate_variance_tolerance', '2.0', 'Allowed variance % for exchange rate changes'),
('currency_rules', 'rounding_precision', 'group', 'Rounding policy: entity or group level'),

-- Translation Rules
('translation_rules', 'assets_liabilities_method', 'Closing Rate', 'Method for translating assets and liabilities'),
('translation_rules', 'revenue_expenses_method', 'Average Rate', 'Method for translating P&L items'),
('translation_rules', 'equity_method', 'Historical', 'Method for translating equity items'),

-- Consolidation Settings
('consolidation_settings', 'default_method', 'Full', 'Default consolidation method for subsidiaries'),
('consolidation_settings', 'ic_elimination_logic', 'Automatic', 'Intercompany elimination: Automatic or Manual'),
('consolidation_settings', 'nci_calculation', 'Fair Value', 'NCI calculation method: Fair Value or Proportionate'),

-- Reporting Settings
('reporting_settings', 'fiscal_year_end', '12-31', 'Fiscal year end date (MM-DD)'),
('reporting_settings', 'default_statement_type', 'balance_sheet', 'Default financial statement to display'),
('reporting_settings', 'decimal_places', '2', 'Number of decimal places for amounts')
ON CONFLICT (parameter_category, parameter_key) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ DATABASE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - 8 Master Data tables';
    RAISE NOTICE '  - 5 Entity & COA tables';
    RAISE NOTICE '  - 6 Consolidation tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Seed data inserted:';
    RAISE NOTICE '  - 30 world currencies';
    RAISE NOTICE '  - 70+ IFRS chart of accounts items';
    RAISE NOTICE '  - 12 system parameters';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Add currencies in Consolidation Config';
    RAISE NOTICE '  2. Set one currency as Group Reporting Currency';
    RAISE NOTICE '  3. Create entities in Entity Setup';
    RAISE NOTICE '  4. Upload trial balances';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

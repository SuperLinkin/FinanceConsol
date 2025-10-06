-- Chart of Accounts table (IFRS-aligned with 4-level hierarchy)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50), -- Class / Sub-Class / Note / Sub-Note
  parent_account VARCHAR(50),
  parent_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  ifrs_category VARCHAR(50), -- Asset / Liability / Equity / Income / Expense
  ifrs_reference VARCHAR(100), -- e.g., IAS 7.45, IAS 16, IFRS 10
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(account_code)
);

-- Trial Balance table
CREATE TABLE IF NOT EXISTS trial_balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_code VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  debit DECIMAL(18, 2) DEFAULT 0,
  credit DECIMAL(18, 2) DEFAULT 0,
  period DATE,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by VARCHAR(255),
  FOREIGN KEY (account_code) REFERENCES chart_of_accounts(account_code) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trial_balance_entity ON trial_balance(entity_id);
CREATE INDEX IF NOT EXISTS idx_trial_balance_account ON trial_balance(account_code);
CREATE INDEX IF NOT EXISTS idx_trial_balance_period ON trial_balance(period);
CREATE INDEX IF NOT EXISTS idx_coa_account_code ON chart_of_accounts(account_code);

-- Add RLS policies
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on chart_of_accounts" ON chart_of_accounts;
DROP POLICY IF EXISTS "Allow all operations on trial_balance" ON trial_balance;

-- Allow all operations for now (you can restrict based on your auth setup)
CREATE POLICY "Allow all operations on chart_of_accounts" ON chart_of_accounts FOR ALL USING (true);
CREATE POLICY "Allow all operations on trial_balance" ON trial_balance FOR ALL USING (true);

-- Create company_currencies table for company-specific currency configurations
-- This replaces the global 'currencies' table usage

-- Drop existing currencies table if you want to start fresh (OPTIONAL - skip if you want to keep existing data)
-- DROP TABLE IF EXISTS currencies CASCADE;

-- Create new company_currencies table
CREATE TABLE IF NOT EXISTS company_currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  currency_code VARCHAR(3) NOT NULL,
  currency_name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  is_base_currency BOOLEAN DEFAULT false,
  is_presentation_currency BOOLEAN DEFAULT false,
  is_functional_currency BOOLEAN DEFAULT false,
  exchange_rate DECIMAL(18, 6) DEFAULT 1.0,
  rate_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure each company can only have one entry per currency
  UNIQUE(company_id, currency_code),

  -- Ensure only one base currency per company
  CONSTRAINT one_base_currency_per_company
    EXCLUDE USING btree (company_id WITH =)
    WHERE (is_base_currency = true)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_company_currencies_company_id ON company_currencies(company_id);
CREATE INDEX IF NOT EXISTS idx_company_currencies_currency_code ON company_currencies(currency_code);
CREATE INDEX IF NOT EXISTS idx_company_currencies_base ON company_currencies(company_id, is_base_currency) WHERE is_base_currency = true;

-- Enable RLS
ALTER TABLE company_currencies ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their company's currencies
CREATE POLICY "users_view_company_currencies" ON company_currencies
  FOR SELECT
  USING (company_id = public.get_company_id());

-- RLS Policy: Users can manage their company's currencies (admin client will bypass this)
CREATE POLICY "users_manage_company_currencies" ON company_currencies
  FOR ALL
  USING (company_id = public.get_company_id())
  WITH CHECK (company_id = public.get_company_id());

-- Comments
COMMENT ON TABLE company_currencies IS 'Company-specific currency configurations';
COMMENT ON COLUMN company_currencies.is_base_currency IS 'The base/group reporting currency for this company (only one per company)';
COMMENT ON COLUMN company_currencies.is_presentation_currency IS 'Used for presentation purposes';
COMMENT ON COLUMN company_currencies.is_functional_currency IS 'Used as functional currency for entities';

-- Migrate existing data from currencies table (if needed)
-- INSERT INTO company_currencies (company_id, currency_code, currency_name, symbol, is_base_currency, is_presentation_currency, is_functional_currency, exchange_rate, rate_date, is_active)
-- SELECT
--   '00000000-0000-0000-0000-000000000001' as company_id,  -- Your company ID
--   currency_code,
--   currency_name,
--   symbol,
--   is_group_reporting_currency as is_base_currency,
--   is_presentation_currency,
--   is_functional_currency,
--   exchange_rate,
--   rate_date,
--   is_active
-- FROM currencies;

-- Verify
SELECT * FROM company_currencies;

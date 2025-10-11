-- Add base_currency column to companies table to make it company-specific
-- Run this in Supabase SQL Editor

-- Option 1: Add to companies table (recommended)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'USD';

-- Add comment
COMMENT ON COLUMN companies.base_currency IS 'The base/group reporting currency for this company';

-- Set existing companies to USD as default
UPDATE companies
SET base_currency = 'USD'
WHERE base_currency IS NULL;

-- Verify the change
SELECT id, company_name, base_currency
FROM companies;

-- Now we can query like this:
-- SELECT base_currency FROM companies WHERE id = 'company-id';

-- Migration script to populate company_currencies from existing currencies table
-- Run this AFTER creating the company_currencies table

-- Step 1: First, run the CREATE_COMPANY_CURRENCIES.sql script to create the table

-- Step 2: Check your company ID
SELECT id, company_name FROM companies;

-- Step 3: Migrate existing currencies to company_currencies
-- Replace 'YOUR_COMPANY_ID_HERE' with your actual company UUID from Step 2

-- Example for a specific company:
INSERT INTO company_currencies (
  company_id,
  currency_code,
  currency_name,
  symbol,
  is_base_currency,
  is_presentation_currency,
  is_functional_currency,
  exchange_rate,
  rate_date,
  is_active
)
SELECT
  '00000000-0000-0000-0000-000000000001' as company_id,  -- Replace with your company ID
  currency_code,
  currency_name,
  symbol,
  false as is_base_currency,  -- We'll set this separately based on companies.base_currency
  is_presentation_currency,
  is_functional_currency,
  exchange_rate,
  rate_date,
  is_active
FROM currencies
WHERE is_active = true
ON CONFLICT (company_id, currency_code) DO NOTHING;

-- Step 4: Set the base currency flag based on companies.base_currency
UPDATE company_currencies cc
SET is_base_currency = true
FROM companies c
WHERE cc.company_id = c.id
  AND cc.currency_code = c.base_currency;

-- Step 5: Verify the migration
SELECT
  cc.*,
  c.company_name
FROM company_currencies cc
JOIN companies c ON cc.company_id = c.id
ORDER BY c.company_name, cc.currency_code;

-- Step 6: Check that base currency is set correctly
SELECT
  c.company_name,
  c.base_currency,
  cc.currency_code,
  cc.is_base_currency
FROM companies c
LEFT JOIN company_currencies cc ON c.id = cc.company_id AND cc.is_base_currency = true;

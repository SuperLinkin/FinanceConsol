-- Check which currency is set as group reporting currency (base)
SELECT
  currency_code,
  currency_name,
  symbol,
  is_group_reporting_currency,
  is_presentation_currency,
  is_functional_currency,
  is_active
FROM currencies
ORDER BY is_group_reporting_currency DESC, currency_code;

-- If you need to manually set EUR as base:
-- UPDATE currencies SET is_group_reporting_currency = false WHERE currency_code != 'EUR';
-- UPDATE currencies SET is_group_reporting_currency = true WHERE currency_code = 'EUR';

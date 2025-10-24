-- ============================================================================
-- MIGRATION V2: Update Exchange Rates Table for Entity/Period Rate Management
-- ============================================================================
-- This script updates the existing exchange_rates table to support our use case
-- ============================================================================

-- Step 1: Backup existing data (optional - uncomment if you need to preserve data)
-- CREATE TABLE exchange_rates_backup AS SELECT * FROM exchange_rates;

-- Step 2: Drop the old exchange_rates table
DROP TABLE IF EXISTS exchange_rates CASCADE;

-- Step 3: Create new exchange_rates table with correct structure
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  closing_rate NUMERIC,
  average_rate NUMERIC,
  historical_rates JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, period)
);

-- Step 4: Add comments for documentation
COMMENT ON TABLE exchange_rates IS 'Stores exchange rates per entity per period for currency translation';
COMMENT ON COLUMN exchange_rates.entity_id IS 'Foreign key to entities table';
COMMENT ON COLUMN exchange_rates.period IS 'Period identifier (e.g., 2024-12, Q4-2024)';
COMMENT ON COLUMN exchange_rates.from_currency IS 'Source currency (entity functional currency)';
COMMENT ON COLUMN exchange_rates.to_currency IS 'Target currency (usually group reporting currency)';
COMMENT ON COLUMN exchange_rates.closing_rate IS 'Closing rate at period end (for Balance Sheet items)';
COMMENT ON COLUMN exchange_rates.average_rate IS 'Average rate for the period (for P&L items)';
COMMENT ON COLUMN exchange_rates.historical_rates IS 'Array of historical rates: [{rate_name, rate_value, applies_to_class}]';
COMMENT ON COLUMN exchange_rates.is_active IS 'Whether this rate set is active';

-- Step 5: Create indexes for better query performance
CREATE INDEX idx_exchange_rates_entity_period ON exchange_rates(entity_id, period);
CREATE INDEX idx_exchange_rates_from_currency ON exchange_rates(from_currency);
CREATE INDEX idx_exchange_rates_to_currency ON exchange_rates(to_currency);

-- Step 6: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_exchange_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_exchange_rates_updated_at
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_rates_updated_at();

-- Step 7: Verify table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'exchange_rates'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Exchange rates table recreated successfully';
  RAISE NOTICE '✅ Old table structure removed';
  RAISE NOTICE '✅ New structure ready for entity/period rate management';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Table Structure:';
  RAISE NOTICE '  - entity_id: Links to entities table';
  RAISE NOTICE '  - period: Period identifier';
  RAISE NOTICE '  - from_currency: Source currency';
  RAISE NOTICE '  - to_currency: Target currency';
  RAISE NOTICE '  - closing_rate: Rate at period end (for BS items)';
  RAISE NOTICE '  - average_rate: Average rate for period (for P&L items)';
  RAISE NOTICE '  - historical_rates: JSONB array of custom rates';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  UNIQUE constraint on (entity_id, period)';
  RAISE NOTICE '⚠️  Old exchange_rates data has been removed';
END$$;

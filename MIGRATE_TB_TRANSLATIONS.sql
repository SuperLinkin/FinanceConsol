-- ============================================================================
-- MIGRATION: Add Translation Columns to Trial Balance
-- ============================================================================
-- This script adds columns to trial_balance table to store translated amounts
-- and FCTR (Foreign Currency Translation Reserve) directly in TB records
-- ============================================================================

-- Step 1: Add translation-related columns to trial_balance
ALTER TABLE trial_balance
ADD COLUMN IF NOT EXISTS translated_debit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS translated_credit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_currency TEXT,
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC,
ADD COLUMN IF NOT EXISTS translation_method TEXT,
ADD COLUMN IF NOT EXISTS fctr_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS translation_date TIMESTAMPTZ;

-- Step 2: Add comments for documentation
COMMENT ON COLUMN trial_balance.translated_debit IS 'Debit amount translated to target currency';
COMMENT ON COLUMN trial_balance.translated_credit IS 'Credit amount translated to target currency';
COMMENT ON COLUMN trial_balance.target_currency IS 'Currency code for translated amounts (e.g., USD, EUR)';
COMMENT ON COLUMN trial_balance.exchange_rate IS 'Exchange rate used for translation';
COMMENT ON COLUMN trial_balance.translation_method IS 'Translation method: Closing Rate, Average Rate, Historical Rate, Opening Rate';
COMMENT ON COLUMN trial_balance.fctr_amount IS 'Foreign Currency Translation Reserve adjustment amount';
COMMENT ON COLUMN trial_balance.translation_date IS 'When translation was last applied';

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trial_balance_target_currency ON trial_balance(target_currency);
CREATE INDEX IF NOT EXISTS idx_trial_balance_translation_date ON trial_balance(translation_date);
CREATE INDEX IF NOT EXISTS idx_trial_balance_entity_period_currency ON trial_balance(entity_id, period, target_currency);

-- Step 4: Verify columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'trial_balance'
  AND column_name IN (
    'translated_debit',
    'translated_credit',
    'target_currency',
    'exchange_rate',
    'translation_method',
    'fctr_amount',
    'translation_date'
  )
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Translation columns added to trial_balance table';
  RAISE NOTICE '✅ Indexes created for optimized queries';
  RAISE NOTICE '✅ Trial balance is now ready to store translated amounts and FCTR';
  RAISE NOTICE '';
  RAISE NOTICE '📊 New columns available:';
  RAISE NOTICE '  - translated_debit: Translated debit amount';
  RAISE NOTICE '  - translated_credit: Translated credit amount';
  RAISE NOTICE '  - target_currency: Target currency code';
  RAISE NOTICE '  - exchange_rate: Rate used';
  RAISE NOTICE '  - translation_method: Closing/Average/Historical/Opening';
  RAISE NOTICE '  - fctr_amount: FCTR adjustment';
  RAISE NOTICE '  - translation_date: When translated';
END$$;

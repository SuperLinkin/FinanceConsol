-- Add to_be_eliminated column to chart_of_accounts table
ALTER TABLE public.chart_of_accounts
ADD COLUMN IF NOT EXISTS to_be_eliminated boolean DEFAULT false;

-- Create index for faster filtering of elimination accounts
CREATE INDEX IF NOT EXISTS idx_coa_to_be_eliminated
ON public.chart_of_accounts(to_be_eliminated)
WHERE to_be_eliminated = true;

COMMENT ON COLUMN public.chart_of_accounts.to_be_eliminated IS 'Flag to indicate if this GL account should be eliminated in consolidation';

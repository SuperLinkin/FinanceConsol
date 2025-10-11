-- Fix statement_type enum to accept both formats
-- Run this in Supabase SQL Editor

-- First, check current enum values
SELECT enum_range(NULL::statement_type);

-- Option 1: Add the missing values to the existing enum
ALTER TYPE statement_type ADD VALUE IF NOT EXISTS 'balance_sheet';
ALTER TYPE statement_type ADD VALUE IF NOT EXISTS 'income_statement';
ALTER TYPE statement_type ADD VALUE IF NOT EXISTS 'cash_flow';
ALTER TYPE statement_type ADD VALUE IF NOT EXISTS 'equity';

-- Verify the updated enum
SELECT enum_range(NULL::statement_type);

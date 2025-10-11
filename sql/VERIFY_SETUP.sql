-- ============================================================================
-- VERIFICATION QUERIES FOR DATABASE SETUP
-- ============================================================================
-- Run these queries to verify your database setup is correct
-- ============================================================================

-- 1. Check if demo company exists
SELECT * FROM companies WHERE company_slug = 'demo-corp';

-- 2. Check if demo user exists
SELECT id, username, email, first_name, last_name, role, is_active, company_id
FROM users
WHERE username = 'demo';

-- 3. Check demo user's password hash (should match bcrypt hash)
SELECT username, password_hash
FROM users
WHERE username = 'demo';

-- 4. Check demo entities
SELECT entity_code, entity_name, entity_type, functional_currency
FROM entities
ORDER BY entity_code;

-- 5. Check active currencies
SELECT currency_code, currency_name, is_group_reporting_currency
FROM currencies
WHERE is_active = true;

-- 6. Check COA records
SELECT COUNT(*) as coa_count FROM chart_of_accounts;

-- 7. Check all tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 8. Check if custom types exist
SELECT typname
FROM pg_type
WHERE typname IN ('entry_status', 'period_status', 'statement_type', 'entity_type', 'ownership_type', 'consolidation_method');

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- 1. Should return 1 row: Demo Corporation
-- 2. Should return 1 row: demo user with admin role
-- 3. Should show bcrypt hash starting with $2b$10$
-- 4. Should return 3 entities: PARENT, SUB-US, SUB-EU
-- 5. Should return 3 currencies with USD as group reporting
-- 6. Should return count of 13 COA records
-- 7. Should return ~40 tables
-- 8. Should return 6 type names
-- ============================================================================

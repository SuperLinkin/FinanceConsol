-- Quick verification queries - Run these one by one

-- Query 1: Check demo company
SELECT * FROM companies WHERE company_slug = 'demo-corp';

-- Query 2: Check demo user
SELECT username, email, role, is_active FROM users WHERE username = 'demo';

-- Query 3: Check password hash
SELECT username, LEFT(password_hash, 20) as hash_preview FROM users WHERE username = 'demo';

-- Query 4: Count all users
SELECT COUNT(*) as total_users FROM users;

-- Query 5: Check entities
SELECT entity_code, entity_name FROM entities;

-- Query 6: Check currencies
SELECT currency_code, is_group_reporting_currency FROM currencies;

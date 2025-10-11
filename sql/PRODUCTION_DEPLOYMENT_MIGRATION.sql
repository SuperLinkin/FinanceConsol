-- ============================================================================
-- PRODUCTION DEPLOYMENT MIGRATION
-- ============================================================================
-- This script safely adds missing constraints, indexes, and RLS policies
-- without impacting existing data. Run this AFTER your current schema.
--
-- SAFETY: All operations use IF NOT EXISTS or CREATE INDEX IF NOT EXISTS
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================================

-- Trial Balance indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_trial_balance_entity_period
  ON trial_balance(entity_id, period);

CREATE INDEX IF NOT EXISTS idx_trial_balance_period
  ON trial_balance(period);

CREATE INDEX IF NOT EXISTS idx_trial_balance_account_code
  ON trial_balance(account_code);

-- Chart of Accounts indexes
CREATE INDEX IF NOT EXISTS idx_coa_entity_id
  ON chart_of_accounts(entity_id);

CREATE INDEX IF NOT EXISTS idx_coa_account_code
  ON chart_of_accounts(account_code);

CREATE INDEX IF NOT EXISTS idx_coa_class_name
  ON chart_of_accounts(class_name);

-- Entity indexes
CREATE INDEX IF NOT EXISTS idx_entities_parent_entity
  ON entities(parent_entity_id);

CREATE INDEX IF NOT EXISTS idx_entities_region
  ON entities(region_id);

CREATE INDEX IF NOT EXISTS idx_entities_controller
  ON entities(controller_id);

CREATE INDEX IF NOT EXISTS idx_entities_entity_type
  ON entities(entity_type);

-- Consolidation workings indexes
CREATE INDEX IF NOT EXISTS idx_consolidation_workings_period
  ON consolidation_workings(period);

CREATE INDEX IF NOT EXISTS idx_consolidation_workings_statement_type
  ON consolidation_workings(statement_type);

CREATE INDEX IF NOT EXISTS idx_consolidation_workings_account_code
  ON consolidation_workings(account_code);

-- Elimination entries indexes
CREATE INDEX IF NOT EXISTS idx_elimination_entries_period
  ON elimination_entries(period);

CREATE INDEX IF NOT EXISTS idx_elimination_entries_entity_from
  ON elimination_entries(entity_from);

CREATE INDEX IF NOT EXISTS idx_elimination_entries_entity_to
  ON elimination_entries(entity_to);

-- User sessions indexes for faster auth lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
  ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_company_id
  ON user_sessions(company_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token
  ON user_sessions(session_token);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
  ON user_sessions(expires_at);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_company_id
  ON users(company_id);

CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_username
  ON users(username);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_company_id
  ON audit_log(company_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON audit_log(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_resource
  ON audit_log(resource_type, resource_id);

-- Exchange rates indexes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies
  ON exchange_rates(from_currency, to_currency);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date
  ON exchange_rates(rate_date);

-- Entity GL Mapping indexes
CREATE INDEX IF NOT EXISTS idx_entity_gl_mapping_entity
  ON entity_gl_mapping(entity_id);

CREATE INDEX IF NOT EXISTS idx_entity_gl_mapping_entity_gl
  ON entity_gl_mapping(entity_gl_code);

CREATE INDEX IF NOT EXISTS idx_entity_gl_mapping_master_gl
  ON entity_gl_mapping(master_gl_code);

-- Translation adjustments indexes
CREATE INDEX IF NOT EXISTS idx_translation_adj_entity_period
  ON translation_adjustments(entity_id, period);

-- Intercompany transactions indexes
CREATE INDEX IF NOT EXISTS idx_interco_from_entity
  ON intercompany_transactions(from_entity_id);

CREATE INDEX IF NOT EXISTS idx_interco_to_entity
  ON intercompany_transactions(to_entity_id);

CREATE INDEX IF NOT EXISTS idx_interco_date
  ON intercompany_transactions(transaction_date);

-- ============================================================================
-- SECTION 2: ADD UNIQUE CONSTRAINTS TO PREVENT DUPLICATES
-- ============================================================================

-- Prevent duplicate trial balance entries for same entity/account/period
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_trial_balance_entry'
  ) THEN
    -- Check if there are duplicates first
    IF NOT EXISTS (
      SELECT entity_id, account_code, period, COUNT(*)
      FROM trial_balance
      GROUP BY entity_id, account_code, period
      HAVING COUNT(*) > 1
    ) THEN
      ALTER TABLE trial_balance
        ADD CONSTRAINT unique_trial_balance_entry
        UNIQUE (entity_id, account_code, period);
    ELSE
      RAISE NOTICE 'WARNING: Duplicate trial balance entries exist. Clean data before adding constraint.';
    END IF;
  END IF;
END $$;

-- Prevent duplicate COA entries for same entity/account
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_coa_entity_account'
  ) THEN
    IF NOT EXISTS (
      SELECT entity_id, account_code, COUNT(*)
      FROM chart_of_accounts
      WHERE entity_id IS NOT NULL
      GROUP BY entity_id, account_code
      HAVING COUNT(*) > 1
    ) THEN
      ALTER TABLE chart_of_accounts
        ADD CONSTRAINT unique_coa_entity_account
        UNIQUE (entity_id, account_code);
    ELSE
      RAISE NOTICE 'WARNING: Duplicate COA entries exist. Clean data before adding constraint.';
    END IF;
  END IF;
END $$;

-- Ensure company email uniqueness per company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_user_email_per_company'
  ) THEN
    IF NOT EXISTS (
      SELECT company_id, email, COUNT(*)
      FROM users
      GROUP BY company_id, email
      HAVING COUNT(*) > 1
    ) THEN
      ALTER TABLE users
        ADD CONSTRAINT unique_user_email_per_company
        UNIQUE (company_id, email);
    ELSE
      RAISE NOTICE 'WARNING: Duplicate user emails exist. Clean data before adding constraint.';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 3: ADD CHECK CONSTRAINTS FOR DATA INTEGRITY
-- ============================================================================

-- Ensure trial balance amounts are reasonable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_trial_balance_non_negative'
  ) THEN
    ALTER TABLE trial_balance
      ADD CONSTRAINT check_trial_balance_non_negative
      CHECK (debit >= 0 AND credit >= 0);
  END IF;
END $$;

-- Ensure ownership percentage is valid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_ownership_percentage'
  ) THEN
    ALTER TABLE entities
      ADD CONSTRAINT check_ownership_percentage
      CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100);
  END IF;
END $$;

-- Ensure exchange rates are positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_exchange_rate_positive'
  ) THEN
    ALTER TABLE exchange_rates
      ADD CONSTRAINT check_exchange_rate_positive
      CHECK (rate > 0);
  END IF;
END $$;

-- Ensure session expiry is in future
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_session_expires_future'
  ) THEN
    ALTER TABLE user_sessions
      ADD CONSTRAINT check_session_expires_future
      CHECK (expires_at > created_at);
  END IF;
END $$;

-- ============================================================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================

-- Enable RLS on all multi-tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_workings ENABLE ROW LEVEL SECURITY;
ALTER TABLE elimination_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE eliminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercompany_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_gl_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_logic ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_logic_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidation_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies need to be created based on your business logic
-- Example policy structure (customize based on your needs):

-- ============================================================================
-- SECTION 5: CREATE BASIC RLS POLICIES (EXAMPLES - CUSTOMIZE AS NEEDED)
-- ============================================================================

-- Drop existing policies if they exist (to make script idempotent)
DROP POLICY IF EXISTS "Users can view their own company data" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their company entities" ON entities;
DROP POLICY IF EXISTS "Users can manage entities in their company" ON entities;
DROP POLICY IF EXISTS "Users can view trial balance for their entities" ON trial_balance;
DROP POLICY IF EXISTS "Users can manage trial balance for their entities" ON trial_balance;

-- Users table policies
CREATE POLICY "Users can view their own company data" ON users
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM user_sessions
      WHERE session_token = current_setting('app.current_session_token', true)
      AND is_active = true
      AND expires_at > now()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (
    id = (
      SELECT user_id FROM user_sessions
      WHERE session_token = current_setting('app.current_session_token', true)
      AND is_active = true
      AND expires_at > now()
    )
  );

-- Entities table policies
CREATE POLICY "Users can view their company entities" ON entities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = current_setting('app.current_session_token', true)
      AND us.is_active = true
      AND us.expires_at > now()
    )
  );

CREATE POLICY "Users can manage entities in their company" ON entities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = current_setting('app.current_session_token', true)
      AND us.is_active = true
      AND us.expires_at > now()
      AND u.role IN ('primary_admin', 'admin')
    )
  );

-- Trial balance policies
CREATE POLICY "Users can view trial balance for their entities" ON trial_balance
  FOR SELECT
  USING (
    entity_id IN (
      SELECT e.id FROM entities e
      JOIN user_sessions us ON true
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = current_setting('app.current_session_token', true)
      AND us.is_active = true
      AND us.expires_at > now()
    )
  );

CREATE POLICY "Users can manage trial balance for their entities" ON trial_balance
  FOR ALL
  USING (
    entity_id IN (
      SELECT e.id FROM entities e
      JOIN user_sessions us ON true
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = current_setting('app.current_session_token', true)
      AND us.is_active = true
      AND us.expires_at > now()
      AND u.role IN ('primary_admin', 'admin', 'manager')
    )
  );

-- ============================================================================
-- SECTION 6: CREATE FUNCTIONS FOR AUTOMATED CLEANUP
-- ============================================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false
  WHERE expires_at < now() AND is_active = true;

  DELETE FROM user_sessions
  WHERE expires_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM user_invitations
  WHERE expires_at < now() AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 7: ADD TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Add triggers to all tables with updated_at column
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'companies', 'users', 'entities', 'entity_controllers', 'regions',
      'chart_of_accounts', 'accounting_policies', 'financial_notes',
      'entity_logic', 'entity_logic_assignments', 'builder_entries',
      'elimination_templates', 'eliminations', 'report_templates',
      'financial_reports', 'report_notes', 'translation_rules',
      'validation_checks', 'coa_master_hierarchy', 'currencies'
    )
  LOOP
    -- Drop trigger if exists
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t.tablename, t.tablename);

    -- Create trigger
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()',
      t.tablename, t.tablename
    );
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 8: ADD MISSING COLUMNS (SAFE - ONLY IF NOT EXISTS)
-- ============================================================================

-- Add company_id to financial tables for multi-tenancy (if not exists)
DO $$
BEGIN
  -- Add company_id to entities if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entities' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE entities ADD COLUMN company_id UUID REFERENCES companies(id);
    RAISE NOTICE 'Added company_id to entities table';
  END IF;

  -- Add company_id to regions if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'regions' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE regions ADD COLUMN company_id UUID REFERENCES companies(id);
    RAISE NOTICE 'Added company_id to regions table';
  END IF;

  -- Add company_id to entity_controllers if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entity_controllers' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE entity_controllers ADD COLUMN company_id UUID REFERENCES companies(id);
    RAISE NOTICE 'Added company_id to entity_controllers table';
  END IF;
END $$;

-- ============================================================================
-- SECTION 9: CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Drop views if they exist
DROP VIEW IF EXISTS v_entity_hierarchy CASCADE;
DROP VIEW IF EXISTS v_trial_balance_enriched CASCADE;
DROP VIEW IF EXISTS v_active_users CASCADE;

-- View for entity hierarchy with all parent relationships
CREATE OR REPLACE VIEW v_entity_hierarchy AS
WITH RECURSIVE entity_tree AS (
  -- Base case: top-level entities
  SELECT
    id,
    entity_code,
    entity_name,
    entity_type,
    parent_entity_id,
    1 as level,
    entity_code::text as path,
    ARRAY[id] as id_path
  FROM entities
  WHERE parent_entity_id IS NULL AND is_active = true

  UNION ALL

  -- Recursive case: child entities
  SELECT
    e.id,
    e.entity_code,
    e.entity_name,
    e.entity_type,
    e.parent_entity_id,
    et.level + 1,
    et.path || ' > ' || e.entity_code,
    et.id_path || e.id
  FROM entities e
  INNER JOIN entity_tree et ON e.parent_entity_id = et.id
  WHERE e.is_active = true
)
SELECT * FROM entity_tree;

-- View for trial balance with COA enrichment
CREATE OR REPLACE VIEW v_trial_balance_enriched AS
SELECT
  tb.id,
  tb.entity_id,
  e.entity_code,
  e.entity_name,
  tb.account_code,
  tb.account_name,
  tb.debit,
  tb.credit,
  (tb.debit - tb.credit) as net_amount,
  tb.currency,
  tb.period,
  coa.class_name,
  coa.subclass_name,
  coa.note_name,
  coa.subnote_name,
  coa.normal_balance,
  tb.uploaded_by,
  tb.uploaded_at
FROM trial_balance tb
LEFT JOIN entities e ON tb.entity_id = e.id
LEFT JOIN chart_of_accounts coa ON tb.entity_id = coa.entity_id
  AND tb.account_code = coa.account_code
WHERE e.is_active = true;

-- View for active users with company info
CREATE OR REPLACE VIEW v_active_users AS
SELECT
  u.id,
  u.email,
  u.username,
  u.first_name,
  u.last_name,
  u.role,
  u.is_primary,
  u.is_active,
  u.is_verified,
  u.last_login_at,
  c.company_name,
  c.company_slug,
  c.subscription_tier,
  c.subscription_status
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.is_active = true;

-- ============================================================================
-- SECTION 10: CREATE HELPER FUNCTIONS FOR APPLICATION
-- ============================================================================

-- Function to get user's company_id from session token
CREATE OR REPLACE FUNCTION get_user_company_id(session_token_param TEXT)
RETURNS UUID AS $$
DECLARE
  company_id_result UUID;
BEGIN
  SELECT u.company_id INTO company_id_result
  FROM user_sessions us
  JOIN users u ON us.user_id = u.id
  WHERE us.session_token = session_token_param
    AND us.is_active = true
    AND us.expires_at > now();

  RETURN company_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  session_token_param TEXT,
  required_role TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_result TEXT;
BEGIN
  SELECT u.role INTO user_role_result
  FROM user_sessions us
  JOIN users u ON us.user_id = u.id
  WHERE us.session_token = session_token_param
    AND us.is_active = true
    AND us.expires_at > now();

  -- Role hierarchy: primary_admin > admin > manager > user > viewer
  RETURN CASE
    WHEN user_role_result = 'primary_admin' THEN true
    WHEN user_role_result = 'admin' AND required_role IN ('admin', 'manager', 'user', 'viewer') THEN true
    WHEN user_role_result = 'manager' AND required_role IN ('manager', 'user', 'viewer') THEN true
    WHEN user_role_result = 'user' AND required_role IN ('user', 'viewer') THEN true
    WHEN user_role_result = 'viewer' AND required_role = 'viewer' THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 11: GRANT APPROPRIATE PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users (adjust based on your Supabase setup)
-- Note: In Supabase, you typically use the 'authenticated' role

GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT on reference tables to all authenticated users
GRANT SELECT ON world_currencies TO authenticated;
GRANT SELECT ON currencies TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON system_parameters TO authenticated;
GRANT SELECT ON coa_master_hierarchy TO authenticated;
GRANT SELECT ON translation_rules TO authenticated;

-- Grant access to views
GRANT SELECT ON v_entity_hierarchy TO authenticated;
GRANT SELECT ON v_trial_balance_enriched TO authenticated;
GRANT SELECT ON v_active_users TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_user_company_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(TEXT, TEXT) TO authenticated;

-- ============================================================================
-- SECTION 12: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE companies IS 'Multi-tenant company/organization records';
COMMENT ON TABLE users IS 'User accounts with company association';
COMMENT ON TABLE user_sessions IS 'Active user sessions for authentication';
COMMENT ON TABLE entities IS 'Legal entities in the consolidation structure';
COMMENT ON TABLE trial_balance IS 'Trial balance data uploaded per entity/period';
COMMENT ON TABLE chart_of_accounts IS 'Chart of accounts mapping per entity';
COMMENT ON TABLE consolidation_workings IS 'Consolidated financial data with adjustments';
COMMENT ON TABLE elimination_entries IS 'Intercompany elimination journal entries';
COMMENT ON TABLE audit_log IS 'Audit trail for all user actions';

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Removes expired session records';
COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Removes expired invitation records';
COMMENT ON FUNCTION get_user_company_id(TEXT) IS 'Returns company_id for a given session token';
COMMENT ON FUNCTION user_has_permission(TEXT, TEXT) IS 'Checks if user has required role permission';

-- ============================================================================
-- SECTION 13: CREATE SCHEDULED JOB FOR CLEANUP (SUPABASE pg_cron)
-- ============================================================================

-- Note: Uncomment if you have pg_cron extension enabled in Supabase
-- This requires enabling the pg_cron extension in Supabase dashboard

/*
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule session cleanup daily at 2 AM
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 2 * * *',
  'SELECT cleanup_expired_sessions();'
);

-- Schedule invitation cleanup daily at 3 AM
SELECT cron.schedule(
  'cleanup-expired-invitations',
  '0 3 * * *',
  'SELECT cleanup_expired_invitations();'
);
*/

-- ============================================================================
-- DEPLOYMENT VERIFICATION QUERIES
-- ============================================================================

-- Run these queries after deployment to verify everything is working:

-- Check all indexes are created
-- SELECT schemaname, tablename, indexname
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- Check all RLS policies
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- Check all constraints
-- SELECT conname, contype, conrelid::regclass AS table_name
-- FROM pg_constraint
-- WHERE connamespace = 'public'::regnamespace;

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Production deployment migration completed successfully!';
  RAISE NOTICE 'Please review RLS policies and customize based on your security requirements.';
  RAISE NOTICE 'Run verification queries to ensure all objects were created correctly.';
END $$;

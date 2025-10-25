-- ============================================================================
-- ERP INTEGRATIONS SCHEMA
-- ============================================================================
-- Purpose: Manage ERP system integrations and data synchronization
-- Version: 1.0
-- ============================================================================

-- Integration status enum
CREATE TYPE integration_status AS ENUM (
    'not_configured',
    'configured',
    'connected',
    'disconnected',
    'error'
);

-- Sync status enum
CREATE TYPE sync_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'failed',
    'partial'
);

-- ERP Integration Configurations
CREATE TABLE erp_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Integration Details
    erp_system TEXT NOT NULL, -- 'tally', 'sap', 'netsuite', 'quickbooks', 'oracle', 'dynamics', 'sage'
    integration_name TEXT NOT NULL,
    description TEXT,

    -- Connection Settings (stored as JSONB for flexibility)
    connection_config JSONB DEFAULT '{}',
    -- Example for Tally: {"host": "localhost", "port": 9000, "company_name": "ABC Ltd"}
    -- Example for SAP: {"system_id": "PRD", "client": "100", "host": "sap.company.com"}
    -- Example for NetSuite: {"account_id": "12345", "realm": "production"}

    -- Authentication (encrypted)
    auth_type TEXT, -- 'api_key', 'oauth2', 'basic', 'certificate', 'none'
    credentials JSONB DEFAULT '{}', -- Encrypted credentials storage

    -- Status
    status integration_status DEFAULT 'not_configured',
    last_connection_test TIMESTAMPTZ,
    last_successful_sync TIMESTAMPTZ,

    -- Sync Configuration
    auto_sync_enabled BOOLEAN DEFAULT false,
    sync_frequency TEXT, -- 'hourly', 'daily', 'weekly', 'monthly', 'manual'
    sync_schedule JSONB DEFAULT '{}', -- Cron-like schedule: {"hour": 2, "minute": 0, "days": [1,2,3,4,5]}

    -- Data Mapping Settings
    entity_mapping JSONB DEFAULT '{}', -- Maps ERP entities/companies to our entities
    -- Example: {"ERP_ENTITY_1": "uuid-of-entity-1", "ERP_ENTITY_2": "uuid-of-entity-2"}

    account_mapping_strategy TEXT DEFAULT 'auto', -- 'auto', 'manual', 'mixed'
    period_mapping JSONB DEFAULT '{}', -- Maps ERP fiscal periods to our periods

    -- Feature Flags
    sync_trial_balance BOOLEAN DEFAULT true,
    sync_chart_of_accounts BOOLEAN DEFAULT true,
    sync_exchange_rates BOOLEAN DEFAULT false,
    sync_entities BOOLEAN DEFAULT false,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,

    UNIQUE(company_id, integration_name)
);

COMMENT ON TABLE erp_integrations IS 'ERP system integration configurations';
COMMENT ON COLUMN erp_integrations.connection_config IS 'ERP-specific connection settings (JSONB for flexibility)';
COMMENT ON COLUMN erp_integrations.credentials IS 'Encrypted authentication credentials';
COMMENT ON COLUMN erp_integrations.entity_mapping IS 'Maps ERP entities to system entities';

CREATE INDEX idx_erp_integrations_company ON erp_integrations(company_id);
CREATE INDEX idx_erp_integrations_status ON erp_integrations(status);
CREATE INDEX idx_erp_integrations_erp_system ON erp_integrations(erp_system);

-- Sync History Log
CREATE TABLE integration_sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES erp_integrations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Sync Details
    sync_type TEXT NOT NULL, -- 'trial_balance', 'chart_of_accounts', 'exchange_rates', 'full'
    sync_status sync_status DEFAULT 'pending',

    -- Trigger
    triggered_by TEXT, -- 'manual', 'scheduled', 'automatic', user_id
    triggered_at TIMESTAMPTZ DEFAULT NOW(),

    -- Execution
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Results
    records_fetched INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,

    -- Error Handling
    error_message TEXT,
    error_details JSONB,

    -- Data Summary
    sync_summary JSONB DEFAULT '{}',
    -- Example: {"entities": ["Entity1", "Entity2"], "period": "2024-01", "total_debit": 1000000}

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE integration_sync_history IS 'History of all integration sync operations';

CREATE INDEX idx_sync_history_integration ON integration_sync_history(integration_id);
CREATE INDEX idx_sync_history_company ON integration_sync_history(company_id);
CREATE INDEX idx_sync_history_status ON integration_sync_history(sync_status);
CREATE INDEX idx_sync_history_date ON integration_sync_history(triggered_at DESC);

-- Account Mapping Table (for manual ERP account mapping)
CREATE TABLE erp_account_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES erp_integrations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- ERP Side
    erp_account_code TEXT NOT NULL,
    erp_account_name TEXT,
    erp_entity_code TEXT,

    -- System Side
    coa_master_id UUID REFERENCES chart_of_accounts_master(id),
    entity_id UUID REFERENCES entities(id),

    -- Mapping Details
    mapping_confidence NUMERIC(3,2) DEFAULT 0.00, -- 0.00 to 1.00 (for auto-mapped accounts)
    is_manual BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,

    UNIQUE(integration_id, erp_account_code, erp_entity_code)
);

COMMENT ON TABLE erp_account_mappings IS 'Maps ERP GL accounts to system chart of accounts';
COMMENT ON COLUMN erp_account_mappings.mapping_confidence IS 'AI/auto-mapping confidence score (0-1)';

CREATE INDEX idx_account_mappings_integration ON erp_account_mappings(integration_id);
CREATE INDEX idx_account_mappings_erp_account ON erp_account_mappings(erp_account_code);
CREATE INDEX idx_account_mappings_coa ON erp_account_mappings(coa_master_id);

-- Integration Logs (detailed debugging logs)
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES erp_integrations(id) ON DELETE CASCADE,
    sync_history_id UUID REFERENCES integration_sync_history(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Log Details
    log_level TEXT NOT NULL, -- 'debug', 'info', 'warning', 'error', 'critical'
    log_message TEXT NOT NULL,
    log_data JSONB,

    -- Context
    operation TEXT, -- 'connect', 'fetch', 'transform', 'import', 'validate'
    entity_code TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE integration_logs IS 'Detailed logs for integration debugging';

CREATE INDEX idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX idx_integration_logs_sync ON integration_logs(sync_history_id);
CREATE INDEX idx_integration_logs_level ON integration_logs(log_level);
CREATE INDEX idx_integration_logs_date ON integration_logs(created_at DESC);

-- RLS Policies (Row Level Security)
ALTER TABLE erp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access integrations from their company
CREATE POLICY erp_integrations_company_policy ON erp_integrations
    USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE POLICY integration_sync_history_company_policy ON integration_sync_history
    USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE POLICY erp_account_mappings_company_policy ON erp_account_mappings
    USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE POLICY integration_logs_company_policy ON integration_logs
    USING (company_id = current_setting('app.current_company_id', true)::uuid);

-- Functions for integration management
CREATE OR REPLACE FUNCTION update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER erp_integrations_updated_at
    BEFORE UPDATE ON erp_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER erp_account_mappings_updated_at
    BEFORE UPDATE ON erp_account_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_timestamp();

-- Helper function to get integration status summary
CREATE OR REPLACE FUNCTION get_integration_status_summary(p_integration_id UUID)
RETURNS TABLE (
    total_syncs BIGINT,
    successful_syncs BIGINT,
    failed_syncs BIGINT,
    last_sync_date TIMESTAMPTZ,
    last_sync_status sync_status,
    avg_duration_seconds NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_syncs,
        COUNT(*) FILTER (WHERE sync_status = 'completed') as successful_syncs,
        COUNT(*) FILTER (WHERE sync_status = 'failed') as failed_syncs,
        MAX(triggered_at) as last_sync_date,
        (SELECT sync_status FROM integration_sync_history
         WHERE integration_id = p_integration_id
         ORDER BY triggered_at DESC LIMIT 1) as last_sync_status,
        AVG(duration_seconds) as avg_duration_seconds
    FROM integration_sync_history
    WHERE integration_id = p_integration_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_integration_status_summary IS 'Returns summary statistics for an integration';

-- Insert default ERP system templates (for reference)
INSERT INTO system_parameters (parameter_category, parameter_key, parameter_value, description) VALUES
('erp_templates', 'tally', '{"name": "Tally ERP", "connection_fields": ["host", "port", "company_name"], "auth_type": "none"}', 'Tally ERP connection template'),
('erp_templates', 'sap', '{"name": "SAP", "connection_fields": ["system_id", "client", "host", "language"], "auth_type": "basic"}', 'SAP ERP connection template'),
('erp_templates', 'netsuite', '{"name": "Oracle NetSuite", "connection_fields": ["account_id", "realm"], "auth_type": "oauth2"}', 'NetSuite connection template'),
('erp_templates', 'quickbooks', '{"name": "QuickBooks", "connection_fields": ["realm_id", "environment"], "auth_type": "oauth2"}', 'QuickBooks connection template'),
('erp_templates', 'oracle', '{"name": "Oracle EBS", "connection_fields": ["instance_url", "database"], "auth_type": "basic"}', 'Oracle EBS connection template'),
('erp_templates', 'dynamics', '{"name": "Microsoft Dynamics 365", "connection_fields": ["organization_url", "tenant_id"], "auth_type": "oauth2"}', 'Dynamics 365 connection template'),
('erp_templates', 'sage', '{"name": "Sage Intacct", "connection_fields": ["company_id", "entity_id"], "auth_type": "api_key"}', 'Sage Intacct connection template')
ON CONFLICT (parameter_category, parameter_key) DO NOTHING;

-- Grant permissions (adjust as needed for your auth system)
-- GRANT SELECT, INSERT, UPDATE ON erp_integrations TO authenticated;
-- GRANT SELECT ON integration_sync_history TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON erp_account_mappings TO authenticated;
-- GRANT SELECT ON integration_logs TO authenticated;

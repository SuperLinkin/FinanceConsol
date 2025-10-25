-- Data Version Control System
-- Enables rollback capability for ERP sync operations

-- Table to store data snapshots for rollback
CREATE TABLE IF NOT EXISTS data_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_name VARCHAR(255) NOT NULL,
  table_name VARCHAR(100) NOT NULL, -- 'chart_of_accounts', 'trial_balance', 'entities', etc.
  operation_type VARCHAR(50) NOT NULL, -- 'manual_upload', 'erp_sync', 'bulk_edit'
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  record_count INTEGER DEFAULT 0,
  data_hash VARCHAR(64), -- MD5 hash of data for integrity check
  metadata JSONB, -- Additional info like entity_id, period, sync details
  is_active BOOLEAN DEFAULT true
);

-- Table to store individual record versions
CREATE TABLE IF NOT EXISTS data_version_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID REFERENCES data_snapshots(id) ON DELETE CASCADE,
  record_data JSONB NOT NULL, -- Complete record as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to track sync operations and their metadata
CREATE TABLE IF NOT EXISTS sync_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(50) NOT NULL, -- 'preview', 'sync', 'rollback'
  table_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'rolled_back'
  snapshot_id UUID REFERENCES data_snapshots(id),
  changes_summary JSONB, -- {added: 5, updated: 10, deleted: 2, unchanged: 100}
  preview_data JSONB, -- Data to be synced for user preview
  entity_filter VARCHAR(100), -- For trial_balance syncs
  period_filter VARCHAR(20), -- For trial_balance syncs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(100),
  error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_snapshots_table_created ON data_snapshots(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_active ON data_snapshots(is_active);
CREATE INDEX IF NOT EXISTS idx_version_records_snapshot ON data_version_records(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_sync_ops_table_status ON sync_operations(table_name, status);
CREATE INDEX IF NOT EXISTS idx_sync_ops_created ON sync_operations(created_at DESC);

-- Function to create snapshot before sync
CREATE OR REPLACE FUNCTION create_data_snapshot(
  p_table_name VARCHAR(100),
  p_operation_type VARCHAR(50),
  p_created_by VARCHAR(100) DEFAULT 'system',
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_record_count INTEGER;
  v_snapshot_name VARCHAR(255);
BEGIN
  -- Generate snapshot name
  v_snapshot_name := p_table_name || '_' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDD_HH24MISS');

  -- Create snapshot record
  INSERT INTO data_snapshots (
    snapshot_name,
    table_name,
    operation_type,
    created_by,
    metadata
  ) VALUES (
    v_snapshot_name,
    p_table_name,
    p_operation_type,
    p_created_by,
    p_metadata
  ) RETURNING id INTO v_snapshot_id;

  -- Copy data based on table name
  IF p_table_name = 'chart_of_accounts' THEN
    INSERT INTO data_version_records (snapshot_id, record_data)
    SELECT v_snapshot_id, row_to_json(coa.*)::jsonb
    FROM chart_of_accounts coa;

  ELSIF p_table_name = 'coa_master_hierarchy' THEN
    INSERT INTO data_version_records (snapshot_id, record_data)
    SELECT v_snapshot_id, row_to_json(cmh.*)::jsonb
    FROM coa_master_hierarchy cmh;

  ELSIF p_table_name = 'trial_balance' THEN
    -- Filter by entity and period if provided in metadata
    INSERT INTO data_version_records (snapshot_id, record_data)
    SELECT v_snapshot_id, row_to_json(tb.*)::jsonb
    FROM trial_balance tb
    WHERE (p_metadata->>'entity_id' IS NULL OR tb.entity_id::text = p_metadata->>'entity_id')
      AND (p_metadata->>'period' IS NULL OR tb.period = p_metadata->>'period');

  ELSIF p_table_name = 'entities' THEN
    INSERT INTO data_version_records (snapshot_id, record_data)
    SELECT v_snapshot_id, row_to_json(e.*)::jsonb
    FROM entities e;
  END IF;

  -- Update record count
  SELECT COUNT(*) INTO v_record_count
  FROM data_version_records
  WHERE snapshot_id = v_snapshot_id;

  UPDATE data_snapshots
  SET record_count = v_record_count
  WHERE id = v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- Function to rollback to a snapshot
CREATE OR REPLACE FUNCTION rollback_to_snapshot(
  p_snapshot_id UUID,
  p_delete_newer_snapshots BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  v_table_name VARCHAR(100);
  v_metadata JSONB;
  v_record_count INTEGER;
  v_result JSONB;
BEGIN
  -- Get snapshot details
  SELECT table_name, metadata, record_count
  INTO v_table_name, v_metadata, v_record_count
  FROM data_snapshots
  WHERE id = p_snapshot_id;

  IF v_table_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Snapshot not found');
  END IF;

  -- Rollback based on table
  IF v_table_name = 'chart_of_accounts' THEN
    DELETE FROM chart_of_accounts;

    INSERT INTO chart_of_accounts
    SELECT (record_data->>'id')::uuid,
           record_data->>'account_code',
           record_data->>'account_name',
           record_data->>'class_name',
           record_data->>'subclass_name',
           record_data->>'note_name',
           record_data->>'subnote_name',
           (record_data->>'is_active')::boolean,
           (record_data->>'to_be_eliminated')::boolean,
           (record_data->>'created_at')::timestamp with time zone,
           (record_data->>'updated_at')::timestamp with time zone
    FROM data_version_records
    WHERE snapshot_id = p_snapshot_id;

  ELSIF v_table_name = 'coa_master_hierarchy' THEN
    DELETE FROM coa_master_hierarchy;

    INSERT INTO coa_master_hierarchy
    SELECT (record_data->>'id')::uuid,
           record_data->>'class_name',
           record_data->>'subclass_name',
           record_data->>'note_name',
           record_data->>'subnote_name',
           record_data->>'statement_type',
           record_data->>'normal_balance',
           (record_data->>'is_active')::boolean,
           (record_data->>'created_at')::timestamp with time zone,
           (record_data->>'updated_at')::timestamp with time zone
    FROM data_version_records
    WHERE snapshot_id = p_snapshot_id;

  ELSIF v_table_name = 'trial_balance' THEN
    -- Delete records matching metadata filters
    IF v_metadata->>'entity_id' IS NOT NULL THEN
      DELETE FROM trial_balance
      WHERE entity_id::text = v_metadata->>'entity_id'
        AND (v_metadata->>'period' IS NULL OR period = v_metadata->>'period');
    ELSE
      DELETE FROM trial_balance;
    END IF;

    -- Restore from snapshot
    INSERT INTO trial_balance
    SELECT (record_data->>'id')::uuid,
           (record_data->>'entity_id')::uuid,
           record_data->>'period',
           record_data->>'gl_code',
           record_data->>'gl_name',
           (record_data->>'debit_amount')::decimal,
           (record_data->>'credit_amount')::decimal,
           record_data->>'class_name',
           record_data->>'subclass_name',
           record_data->>'note_name',
           record_data->>'subnote_name',
           (record_data->>'created_at')::timestamp with time zone,
           (record_data->>'updated_at')::timestamp with time zone
    FROM data_version_records
    WHERE snapshot_id = p_snapshot_id;

  ELSIF v_table_name = 'entities' THEN
    DELETE FROM entities;

    INSERT INTO entities
    SELECT (record_data->>'id')::uuid,
           record_data->>'entity_name',
           record_data->>'entity_code',
           (record_data->>'parent_entity_id')::uuid,
           (record_data->>'ownership_percentage')::decimal,
           record_data->>'currency_code',
           record_data->>'country',
           record_data->>'region',
           record_data->>'controller',
           (record_data->>'is_active')::boolean,
           (record_data->>'created_at')::timestamp with time zone,
           (record_data->>'updated_at')::timestamp with time zone
    FROM data_version_records
    WHERE snapshot_id = p_snapshot_id;
  END IF;

  -- Mark newer snapshots as inactive if requested
  IF p_delete_newer_snapshots THEN
    UPDATE data_snapshots
    SET is_active = false
    WHERE table_name = v_table_name
      AND created_at > (SELECT created_at FROM data_snapshots WHERE id = p_snapshot_id);
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'table_name', v_table_name,
    'records_restored', v_record_count,
    'snapshot_id', p_snapshot_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get snapshot history
CREATE OR REPLACE FUNCTION get_snapshot_history(
  p_table_name VARCHAR(100) DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  snapshot_id UUID,
  snapshot_name VARCHAR(255),
  table_name VARCHAR(100),
  operation_type VARCHAR(50),
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE,
  record_count INTEGER,
  metadata JSONB,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.snapshot_name,
    ds.table_name,
    ds.operation_type,
    ds.created_by,
    ds.created_at,
    ds.record_count,
    ds.metadata,
    ds.is_active
  FROM data_snapshots ds
  WHERE (p_table_name IS NULL OR ds.table_name = p_table_name)
    AND ds.is_active = true
  ORDER BY ds.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON data_snapshots TO authenticated;
GRANT ALL ON data_version_records TO authenticated;
GRANT ALL ON sync_operations TO authenticated;
GRANT EXECUTE ON FUNCTION create_data_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_to_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION get_snapshot_history TO authenticated;

-- Comments
COMMENT ON TABLE data_snapshots IS 'Stores metadata for data snapshots used for version control and rollback';
COMMENT ON TABLE data_version_records IS 'Stores individual record versions as JSONB for rollback capability';
COMMENT ON TABLE sync_operations IS 'Tracks ERP sync operations with preview data and status';
COMMENT ON FUNCTION create_data_snapshot IS 'Creates a snapshot of specified table before sync operation';
COMMENT ON FUNCTION rollback_to_snapshot IS 'Restores data from a specific snapshot';
COMMENT ON FUNCTION get_snapshot_history IS 'Returns snapshot history for a table';

-- Fix RLS policies for all tables to include WITH CHECK clause
-- This ensures INSERT operations work properly with RLS enabled
-- Run this in Supabase SQL Editor

-- ============================================================================
-- ENTITIES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_entities" ON entities;
CREATE POLICY "users_manage_company_entities" ON entities
  FOR ALL
  USING (company_id = public.get_company_id())
  WITH CHECK (company_id = public.get_company_id());

-- ============================================================================
-- REGIONS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_regions" ON regions;
CREATE POLICY "users_manage_company_regions" ON regions
  FOR ALL
  USING (company_id = public.get_company_id())
  WITH CHECK (company_id = public.get_company_id());

-- ============================================================================
-- ENTITY CONTROLLERS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_controllers" ON entity_controllers;
CREATE POLICY "users_manage_company_controllers" ON entity_controllers
  FOR ALL
  USING (company_id = public.get_company_id())
  WITH CHECK (company_id = public.get_company_id());

-- ============================================================================
-- TRIAL BALANCE
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_trial_balance" ON trial_balance;
CREATE POLICY "users_manage_company_trial_balance" ON trial_balance
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- CHART OF ACCOUNTS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_coa" ON chart_of_accounts;
CREATE POLICY "users_manage_company_coa" ON chart_of_accounts
  FOR ALL
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- COA MASTER HIERARCHY
-- ============================================================================
DROP POLICY IF EXISTS "admins_manage_coa_master" ON coa_master_hierarchy;
DROP POLICY IF EXISTS "users_manage_coa_master" ON coa_master_hierarchy;
CREATE POLICY "users_manage_coa_master" ON coa_master_hierarchy
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CONSOLIDATION WORKINGS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_workings" ON consolidation_workings;
CREATE POLICY "users_manage_company_workings" ON consolidation_workings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- BUILDER ENTRIES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_builder_entries" ON builder_entries;
CREATE POLICY "users_manage_company_builder_entries" ON builder_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ADJUSTMENT ENTRIES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_adjustments" ON adjustment_entries;
CREATE POLICY "users_manage_company_adjustments" ON adjustment_entries
  FOR ALL
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- ELIMINATIONS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_eliminations" ON eliminations;
CREATE POLICY "users_manage_company_eliminations" ON eliminations
  FOR ALL
  USING (
    entity_1_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_1_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- ELIMINATION ENTRIES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_elimination_entries" ON elimination_entries;
CREATE POLICY "users_manage_company_elimination_entries" ON elimination_entries
  FOR ALL
  USING (
    entity_from IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_from IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- ELIMINATION TEMPLATES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_elimination_templates" ON elimination_templates;
CREATE POLICY "users_manage_elimination_templates" ON elimination_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRANSLATION RULES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_translation_rules" ON translation_rules;
CREATE POLICY "users_manage_company_translation_rules" ON translation_rules
  FOR ALL
  USING (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_id IS NULL OR
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- TRANSLATION ADJUSTMENTS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_translation_adjustments" ON translation_adjustments;
CREATE POLICY "users_manage_company_translation_adjustments" ON translation_adjustments
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- INTERCOMPANY TRANSACTIONS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_intercompany" ON intercompany_transactions;
CREATE POLICY "users_manage_company_intercompany" ON intercompany_transactions
  FOR ALL
  USING (
    from_entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    from_entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- ENTITY GL MAPPING
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_gl_mapping" ON entity_gl_mapping;
CREATE POLICY "users_manage_company_gl_mapping" ON entity_gl_mapping
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- ENTITY LOGIC ASSIGNMENTS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_logic_assignments" ON entity_logic_assignments;
CREATE POLICY "users_manage_company_logic_assignments" ON entity_logic_assignments
  FOR ALL
  USING (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  )
  WITH CHECK (
    entity_id IN (
      SELECT id FROM entities WHERE company_id = public.get_company_id()
    )
  );

-- ============================================================================
-- EXCHANGE RATES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_exchange_rates" ON exchange_rates;
CREATE POLICY "users_manage_exchange_rates" ON exchange_rates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- REPORT NOTES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_report_notes" ON report_notes;
CREATE POLICY "users_manage_report_notes" ON report_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- REPORT VERSIONS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_report_versions" ON report_versions;
CREATE POLICY "users_manage_report_versions" ON report_versions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- REPORT CHANGES
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_report_changes" ON report_changes;
CREATE POLICY "users_manage_report_changes" ON report_changes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FINANCIAL REPORTS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_company_reports" ON financial_reports;
CREATE POLICY "users_manage_company_reports" ON financial_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VALIDATION RESULTS
-- ============================================================================
DROP POLICY IF EXISTS "users_manage_validation_results" ON validation_results;
CREATE POLICY "users_manage_validation_results" ON validation_results
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL AND with_check IS NOT NULL THEN 'Both USING and WITH CHECK'
    WHEN qual IS NOT NULL THEN 'Only USING'
    WHEN with_check IS NOT NULL THEN 'Only WITH CHECK'
    ELSE 'Neither'
  END as policy_clauses
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'ALL'
ORDER BY tablename, policyname;

-- ============================================================================
-- COMPLETE!
-- ============================================================================

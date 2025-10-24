# Database Schema Review Report
## CLOE Application - Production Readiness Assessment

**Date**: 2025-01-14
**Reviewer**: Claude Code
**Environment**: Supabase PostgreSQL
**Application Version**: Production Deployed

---

## Executive Summary

**Overall Assessment**: ⚠️ **NEEDS ATTENTION** - Schema is functional but has critical missing components

### Key Findings

✅ **Strengths**:
- Comprehensive financial consolidation schema
- Well-designed entity hierarchy
- Good audit trail structure
- Proper foreign key relationships
- Finance Close module fully supported

⚠️ **Critical Issues Found**:
1. **Missing RLS (Row Level Security) policies** - Major security risk
2. **Missing indexes on frequently queried columns** - Performance bottleneck
3. **Missing tables for key features** - Note builder, saved reports, workflow data
4. **No database triggers** - Missing automation for timestamps, audit logs
5. **Missing unique constraints** - Potential data integrity issues

---

## 1. Missing Critical Tables

### 1.1 Notes Builder Feature (HIGH PRIORITY)

**Missing Table**: `notes_builder`

**Current Issue**: The note builder page (`app/note-builder/page.js`) and reporting page reference saved notes, but there's no table to store them.

**Required Schema**:
```sql
CREATE TABLE public.notes_builder (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  note_number character varying NOT NULL,
  note_title character varying NOT NULL,
  note_type character varying NOT NULL DEFAULT 'Financial', -- Financial, Accounting Policy, Disclosure
  note_category character varying, -- Assets, Liabilities, Equity, Revenue, Expenses
  note_content text NOT NULL,
  gl_accounts jsonb DEFAULT '[]'::jsonb, -- Array of linked GL codes
  tables jsonb DEFAULT '[]'::jsonb, -- Array of table data
  is_template boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notes_builder_pkey PRIMARY KEY (id),
  CONSTRAINT notes_builder_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT notes_builder_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT notes_builder_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

CREATE INDEX idx_notes_builder_company_id ON public.notes_builder(company_id);
CREATE INDEX idx_notes_builder_note_number ON public.notes_builder(note_number);
CREATE INDEX idx_notes_builder_is_active ON public.notes_builder(is_active);
```

**Impact**: Without this table, users cannot save notes they create in the note builder, and the reporting page cannot load saved notes.

---

### 1.2 Saved Financial Reports (HIGH PRIORITY)

**Current Issue**: `financial_reports` table exists but may need enhancement for the annual report feature.

**Recommended Addition**: Ensure `content` column can store the full annual report structure with sections.

**Additional Table for Report Sections**:
```sql
CREATE TABLE public.report_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  section_type character varying NOT NULL, -- cover, index, mda, statement, notes, policy
  section_title character varying NOT NULL,
  section_content jsonb NOT NULL,
  section_order integer NOT NULL DEFAULT 1,
  is_editable boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT report_sections_pkey PRIMARY KEY (id),
  CONSTRAINT report_sections_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.financial_reports(id) ON DELETE CASCADE
);

CREATE INDEX idx_report_sections_report_id ON public.report_sections(report_id);
CREATE INDEX idx_report_sections_order ON public.report_sections(section_order);
```

**Impact**: Better organization of annual report sections, easier editing and version control.

---

### 1.3 Finance Close Tasks (CRITICAL)

**Missing Table**: `close_tasks`

**Current Issue**: Finance Close task management page (`app/close/tasks/page.js`) has no database backing.

**Required Schema**:
```sql
CREATE TABLE public.close_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  task_name character varying NOT NULL,
  task_description text,
  task_type character varying, -- Reconciliation, Journal Entry, Review, Approval
  period date NOT NULL,
  assigned_to uuid, -- user_id or close_users.id
  assigned_to_type character varying DEFAULT 'user', -- user or close_user
  preparer uuid,
  reviewer uuid,
  approver uuid,
  status character varying DEFAULT 'Pending', -- Pending, In Progress, Review, Completed, Approved
  priority character varying DEFAULT 'Medium', -- Low, Medium, High, Critical
  due_date date NOT NULL,
  completed_date timestamp with time zone,
  approved_date timestamp with time zone,
  estimated_hours numeric,
  actual_hours numeric,
  dependencies jsonb DEFAULT '[]'::jsonb, -- Array of task IDs that must complete first
  attachments jsonb DEFAULT '[]'::jsonb,
  comments jsonb DEFAULT '[]'::jsonb,
  checklist jsonb DEFAULT '[]'::jsonb,
  is_recurring boolean DEFAULT false,
  recurrence_pattern character varying, -- Monthly, Quarterly, Annually
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT close_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT close_tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

CREATE INDEX idx_close_tasks_company_id ON public.close_tasks(company_id);
CREATE INDEX idx_close_tasks_period ON public.close_tasks(period);
CREATE INDEX idx_close_tasks_assigned_to ON public.close_tasks(assigned_to);
CREATE INDEX idx_close_tasks_status ON public.close_tasks(status);
CREATE INDEX idx_close_tasks_due_date ON public.close_tasks(due_date);
```

**Impact**: Finance Close task management cannot persist data without this table.

---

### 1.4 Finance Close Reconciliations (CRITICAL)

**Missing Table**: `close_reconciliations`

**Current Issue**: Reconciliation management page (`app/close/reconciliation/page.js`) has no database backing.

**Required Schema**:
```sql
CREATE TABLE public.close_reconciliations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  reconciliation_name character varying NOT NULL,
  reconciliation_type character varying NOT NULL, -- Bank, Intercompany, Credit Card, AR, AP, BS Account
  account_code character varying NOT NULL,
  account_name character varying,
  entity_id uuid,
  period date NOT NULL,
  preparer uuid,
  reviewer uuid,
  status character varying DEFAULT 'Pending', -- Pending, In Progress, In Review, Completed, Issues
  book_balance numeric DEFAULT 0,
  bank_balance numeric DEFAULT 0, -- or statement balance
  difference numeric DEFAULT 0,
  reconciling_items jsonb DEFAULT '[]'::jsonb,
  supporting_documents jsonb DEFAULT '[]'::jsonb,
  notes text,
  due_date date,
  completed_date timestamp with time zone,
  reviewed_date timestamp with time zone,
  last_updated timestamp with time zone DEFAULT now(),
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT close_reconciliations_pkey PRIMARY KEY (id),
  CONSTRAINT close_reconciliations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT close_reconciliations_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id)
);

CREATE INDEX idx_close_reconciliations_company_id ON public.close_reconciliations(company_id);
CREATE INDEX idx_close_reconciliations_period ON public.close_reconciliations(period);
CREATE INDEX idx_close_reconciliations_entity_id ON public.close_reconciliations(entity_id);
CREATE INDEX idx_close_reconciliations_status ON public.close_reconciliations(status);
CREATE INDEX idx_close_reconciliations_account_code ON public.close_reconciliations(account_code);
```

**Impact**: Reconciliation tracking cannot be saved without this table.

---

### 1.5 Finance Close Calendar/Milestones (HIGH PRIORITY)

**Missing Table**: `close_milestones`

**Current Issue**: Close calendar page (`app/close/calendar/page.js`) needs milestone tracking.

**Required Schema**:
```sql
CREATE TABLE public.close_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  milestone_name character varying NOT NULL,
  milestone_type character varying, -- Data Collection, Reconciliation, Review, Sign-off
  period date NOT NULL,
  target_date date NOT NULL,
  actual_date date,
  status character varying DEFAULT 'Pending', -- Pending, At Risk, On Track, Completed
  is_critical boolean DEFAULT false,
  owner uuid,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT close_milestones_pkey PRIMARY KEY (id),
  CONSTRAINT close_milestones_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

CREATE INDEX idx_close_milestones_company_id ON public.close_milestones(company_id);
CREATE INDEX idx_close_milestones_period ON public.close_milestones(period);
CREATE INDEX idx_close_milestones_status ON public.close_milestones(status);
```

---

### 1.6 Management Discussion & Analysis (MDA) (MEDIUM PRIORITY)

**Missing Table**: `mda_templates` and `mda_content`

**Current Issue**: MDA page (`app/mda/page.js`) needs storage for MD&A drafts.

**Required Schema**:
```sql
CREATE TABLE public.mda_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  period date NOT NULL,
  section_type character varying NOT NULL, -- Executive Summary, Operations, Financial Position, Risks
  section_title character varying NOT NULL,
  section_content text NOT NULL,
  version integer DEFAULT 1,
  status character varying DEFAULT 'Draft', -- Draft, Review, Approved, Published
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mda_content_pkey PRIMARY KEY (id),
  CONSTRAINT mda_content_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

CREATE INDEX idx_mda_content_company_id ON public.mda_content(company_id);
CREATE INDEX idx_mda_content_period ON public.mda_content(period);
```

---

## 2. Missing Row Level Security (RLS) Policies

**⚠️ CRITICAL SECURITY ISSUE**

Your SQL file shows table definitions but **NO RLS POLICIES**. This means any authenticated user can access ANY company's data.

### Required RLS Policies for EVERY Table

**Example for `entities` table**:
```sql
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- Users can only see entities from their company
CREATE POLICY "Users can view own company entities"
  ON public.entities
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.users WHERE id = auth.uid()
  ));

-- Users can insert entities for their company
CREATE POLICY "Users can insert own company entities"
  ON public.entities
  FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM public.users WHERE id = auth.uid()
  ));

-- Users can update entities from their company
CREATE POLICY "Users can update own company entities"
  ON public.entities
  FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.users WHERE id = auth.uid()
  ));

-- Users can delete entities from their company (based on permissions)
CREATE POLICY "Users can delete own company entities"
  ON public.entities
  FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM public.users WHERE id = auth.uid()
  ));

-- Service role bypass (for API operations)
CREATE POLICY "Service role full access entities"
  ON public.entities
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Tables Requiring RLS (ALL of them)**:
- ✅ `close_users` - Already has RLS from our recent work
- ❌ `companies` - MISSING
- ❌ `users` - MISSING (CRITICAL)
- ❌ `entities` - MISSING (CRITICAL)
- ❌ `trial_balance` - MISSING (CRITICAL)
- ❌ `chart_of_accounts` - MISSING
- ❌ `consolidation_workings` - MISSING
- ❌ `elimination_entries` - MISSING
- ❌ `financial_reports` - MISSING
- ❌ All other tables - MISSING

**Security Impact**: **10/10 CRITICAL**
- Users from Company A can see Company B's financial data
- Competitors could access sensitive information
- Violates data privacy regulations (GDPR, SOX, etc.)
- Could lead to data breaches and legal liability

---

## 3. Missing Indexes for Performance

### High-Impact Missing Indexes

**3.1 Trial Balance**
```sql
-- Currently only has primary key index
CREATE INDEX idx_trial_balance_entity_period ON public.trial_balance(entity_id, period);
CREATE INDEX idx_trial_balance_account_code ON public.trial_balance(account_code);
CREATE INDEX idx_trial_balance_period ON public.trial_balance(period);
```

**3.2 Consolidation Workings**
```sql
CREATE INDEX idx_consolidation_workings_period ON public.consolidation_workings(period);
CREATE INDEX idx_consolidation_workings_statement_type ON public.consolidation_workings(statement_type);
CREATE INDEX idx_consolidation_workings_account_code ON public.consolidation_workings(account_code);
CREATE INDEX idx_consolidation_workings_period_statement ON public.consolidation_workings(period, statement_type);
```

**3.3 Chart of Accounts**
```sql
CREATE INDEX idx_chart_of_accounts_entity_account ON public.chart_of_accounts(entity_id, account_code);
CREATE INDEX idx_chart_of_accounts_class ON public.chart_of_accounts(class_name);
CREATE INDEX idx_chart_of_accounts_is_active ON public.chart_of_accounts(is_active);
```

**3.4 Users**
```sql
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_is_active ON public.users(is_active);
```

**3.5 Audit Log**
```sql
CREATE INDEX idx_audit_log_company_id ON public.audit_log(company_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
```

**3.6 Elimination Entries**
```sql
CREATE INDEX idx_elimination_entries_period ON public.elimination_entries(period);
CREATE INDEX idx_elimination_entries_status ON public.elimination_entries(status);
CREATE INDEX idx_elimination_entries_entity_from ON public.elimination_entries(entity_from);
CREATE INDEX idx_elimination_entries_entity_to ON public.elimination_entries(entity_to);
```

**3.7 Financial Reports**
```sql
CREATE INDEX idx_financial_reports_period ON public.financial_reports(period);
CREATE INDEX idx_financial_reports_status ON public.financial_reports(status);
CREATE INDEX idx_financial_reports_created_by ON public.financial_reports(created_by);
CREATE INDEX idx_financial_reports_created_at ON public.financial_reports(created_at DESC);
```

**Performance Impact**: Without these indexes, queries will do full table scans, causing:
- Slow dashboard load times (5-10 seconds → subsecond with indexes)
- Slow consolidation generation (minutes → seconds)
- Poor user experience as data grows

---

## 4. Missing Database Triggers

### 4.1 Automatic Timestamp Updates

**Issue**: `updated_at` columns won't auto-update on row changes.

**Solution**: Create trigger function
```sql
-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... repeat for all tables with updated_at
```

---

### 4.2 Audit Log Automation

**Issue**: No automatic audit logging for critical table changes.

**Solution**: Create audit trigger
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_log (
      company_id, user_id, action, resource_type, resource_id,
      old_values, created_at
    )
    VALUES (
      OLD.company_id,
      auth.uid(),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      now()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_log (
      company_id, user_id, action, resource_type, resource_id,
      old_values, new_values, created_at
    )
    VALUES (
      NEW.company_id,
      auth.uid(),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_log (
      company_id, user_id, action, resource_type, resource_id,
      new_values, created_at
    )
    VALUES (
      NEW.company_id,
      auth.uid(),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW),
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to critical tables
CREATE TRIGGER audit_entities AFTER INSERT OR UPDATE OR DELETE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trial_balance AFTER INSERT OR UPDATE OR DELETE ON public.trial_balance
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ... apply to financial_reports, elimination_entries, etc.
```

---

## 5. Missing Unique Constraints

### 5.1 Data Integrity Issues

**Issue**: Missing unique constraints allow duplicate data.

**Required Constraints**:
```sql
-- Prevent duplicate trial balance entries for same entity/period/account
ALTER TABLE public.trial_balance
  ADD CONSTRAINT trial_balance_unique_entry
  UNIQUE (entity_id, period, account_code);

-- Prevent duplicate chart of accounts entries
ALTER TABLE public.chart_of_accounts
  ADD CONSTRAINT chart_of_accounts_unique_account
  UNIQUE (entity_id, account_code);

-- Prevent duplicate consolidation workings
ALTER TABLE public.consolidation_workings
  ADD CONSTRAINT consolidation_workings_unique_entry
  UNIQUE (period, statement_type, account_code);

-- Prevent duplicate elimination GL pairs
ALTER TABLE public.elimination_gl_pairs
  ADD CONSTRAINT elimination_gl_pairs_unique_pair
  UNIQUE (company_id, gl1_entity, gl1_code, gl2_entity, gl2_code);

-- Prevent duplicate user emails within company
ALTER TABLE public.users
  ADD CONSTRAINT users_unique_email_per_company
  UNIQUE (company_id, email);
```

**Impact**: Without these, users could:
- Upload same trial balance multiple times (corrupts consolidation)
- Create duplicate GL codes (breaks reporting)
- Invite same user twice (auth confusion)

---

## 6. Missing API Endpoints

Based on application pages, these API endpoints may be missing:

### 6.1 Finance Close Module APIs

**Missing**:
- ❌ `/api/close/tasks` - CRUD for close tasks
- ❌ `/api/close/reconciliations` - CRUD for reconciliations
- ❌ `/api/close/milestones` - CRUD for close calendar
- ❌ `/api/close/allocation` - Task assignment APIs
- ❌ `/api/close/reports` - Close status reporting

**Status**: These pages currently use mock data (found in code review).

---

### 6.2 Note Builder APIs

**Missing**:
- ❌ `/api/notes` - CRUD for notes builder
- ❌ `/api/notes/templates` - Note templates

**Impact**: Users cannot save notes they create.

---

### 6.3 MDA APIs

**Missing**:
- ❌ `/api/mda` - CRUD for MD&A content
- ❌ `/api/mda/templates` - MD&A templates

---

### 6.4 Reporting Builder APIs

**Existing**: ✅ Uses `financial_reports` table
**Enhancement Needed**: API for report sections and annual report generation

---

### 6.5 Cash Flow Statement APIs

**Missing**:
- ❌ `/api/cash-flow` - Cash flow statement generation
- ❌ `/api/cash-flow/classification` - GL classification rules

**Page**: `app/cash-flow/page.js` exists but may need backend support

---

## 7. Data Type Issues

### 7.1 USER-DEFINED Types Not Defined

Your schema references these USER-DEFINED types but doesn't define them:

```sql
-- adjustment_entries.status: entry_status
-- consolidation_workings.statement_type: statement_type
-- entities.entity_type: entity_type
-- entities.ownership_type: ownership_type
-- entities.consolidation_method: consolidation_method
-- reporting_periods.status: period_status
```

**Required**:
```sql
CREATE TYPE entry_status AS ENUM ('Draft', 'Submitted', 'Approved', 'Posted', 'Rejected');
CREATE TYPE statement_type AS ENUM ('Balance Sheet', 'Income Statement', 'Cash Flow', 'Equity Statement');
CREATE TYPE entity_type AS ENUM ('Parent', 'Subsidiary', 'Joint Venture', 'Associate');
CREATE TYPE ownership_type AS ENUM ('Direct', 'Indirect', 'Mixed');
CREATE TYPE consolidation_method AS ENUM ('Full Consolidation', 'Proportionate', 'Equity Method', 'Cost Method');
CREATE TYPE period_status AS ENUM ('Open', 'Closed', 'Locked', 'Archived');
```

**Impact**: Without these type definitions, table creation will FAIL.

---

## 8. Missing Default Data

### 8.1 Permission Categories & Permissions

**Issue**: Empty permissions table means roles & permissions page won't work.

**Required Seed Data**:
```sql
-- Permission Categories
INSERT INTO public.permission_categories (category_name, description, display_order) VALUES
  ('Entity Management', 'Permissions for managing entities and organizational structure', 1),
  ('Financial Data', 'Permissions for trial balance, consolidation, and financial reports', 2),
  ('Eliminations', 'Permissions for intercompany eliminations and adjustments', 3),
  ('User Management', 'Permissions for managing users, roles, and invitations', 4),
  ('System Settings', 'Permissions for company settings and configurations', 5),
  ('Finance Close', 'Permissions for period-end close activities', 6);

-- Core Permissions
INSERT INTO public.permissions (permission_name, permission_slug, category_id, description)
SELECT 'View Entities', 'view_entities', id, 'Can view entity list and details'
FROM permission_categories WHERE category_name = 'Entity Management';

INSERT INTO public.permissions (permission_name, permission_slug, category_id, description)
SELECT 'Create Entities', 'create_entities', id, 'Can create new entities'
FROM permission_categories WHERE category_name = 'Entity Management';

-- ... repeat for all permissions (view, create, update, delete for each category)
```

---

### 8.2 System Roles

**Required**:
```sql
-- Create default system roles for each company upon company creation
-- This should be done via trigger or application logic

-- Example system roles:
INSERT INTO public.custom_roles (company_id, role_name, role_slug, is_system_role)
VALUES
  ('<company_id>', 'Administrator', 'admin', true),
  ('<company_id>', 'Financial Controller', 'controller', true),
  ('<company_id>', 'Accountant', 'accountant', true),
  ('<company_id>', 'Viewer', 'viewer', true);
```

---

## 9. Foreign Key Issues

### 9.1 Missing CASCADE Rules

**Issue**: Deleting a company doesn't delete related data.

**Recommendation**: Add CASCADE delete rules
```sql
-- Example: When company is deleted, delete all related entities
ALTER TABLE public.entities
  DROP CONSTRAINT entities_company_id_fkey,
  ADD CONSTRAINT entities_company_id_fkey
    FOREIGN KEY (company_id)
    REFERENCES public.companies(id)
    ON DELETE CASCADE;

-- Apply to all company_id foreign keys
```

**Caution**: Use CASCADE carefully - may want to soft delete instead.

---

### 9.2 Orphaned Records Risk

**Tables at risk**:
- `trial_balance` - If entity deleted, orphaned TB records remain
- `chart_of_accounts` - Same issue
- `financial_reports` - If working deleted, reports break

**Solution**: Add `ON DELETE CASCADE` or `ON DELETE SET NULL` based on business logic.

---

## 10. Missing Materialized Views for Performance

For complex consolidation queries, consider materialized views:

```sql
CREATE MATERIALIZED VIEW mv_consolidated_balance_sheet AS
SELECT
  period,
  class_name,
  subclass_name,
  note_name,
  SUM(consolidated_amount) as total_amount
FROM consolidation_workings
WHERE statement_type = 'Balance Sheet'
GROUP BY period, class_name, subclass_name, note_name;

CREATE INDEX idx_mv_consolidated_bs_period ON mv_consolidated_balance_sheet(period);

-- Refresh schedule (run via cron or after consolidation generation)
REFRESH MATERIALIZED VIEW mv_consolidated_balance_sheet;
```

---

## 11. Security Recommendations

### 11.1 Password Requirements

**Issue**: No password validation in database.

**Recommendation**: Add check constraint
```sql
ALTER TABLE public.users
  ADD CONSTRAINT users_password_hash_not_empty
  CHECK (length(password_hash) >= 50); -- bcrypt hashes are ~60 chars

ALTER TABLE public.close_users
  ADD CONSTRAINT close_users_password_hash_not_empty
  CHECK (length(password_hash) >= 50);
```

---

### 11.2 Email Validation

```sql
ALTER TABLE public.users
  ADD CONSTRAINT users_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

---

### 11.3 Session Management

**Enhancement for user_sessions**:
```sql
-- Add automatic session cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron extension or application cron job
-- Run every hour: SELECT cleanup_expired_sessions();
```

---

## 12. Backup & Recovery

### 12.1 Missing Backup Strategy

**Recommendations**:
1. **Supabase Automatic Backups**: Ensure enabled (daily snapshots)
2. **Point-in-Time Recovery**: Enable WAL archiving
3. **Export Critical Tables**: Weekly exports to S3/GCS
4. **Disaster Recovery Plan**: Document restore procedures

---

### 12.2 Data Retention Policies

**Recommendation**: Add soft delete instead of hard delete
```sql
-- Add deleted_at column to all tables
ALTER TABLE public.entities
  ADD COLUMN deleted_at timestamp with time zone,
  ADD COLUMN deleted_by uuid;

-- Update policies to exclude soft-deleted records
CREATE POLICY "Users cannot view deleted entities"
  ON public.entities
  FOR SELECT
  USING (deleted_at IS NULL);
```

---

## 13. Performance Monitoring

### 13.1 Add Query Statistics

```sql
-- Enable pg_stat_statements extension (Supabase may have this)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 14. Priority Action Items

### CRITICAL (Do Immediately Before Production Use)

1. **Add RLS Policies to ALL Tables** - Security risk (Est: 4-6 hours)
2. **Create Missing Tables**:
   - `notes_builder` - Required for note builder feature (30 min)
   - `close_tasks` - Required for Finance Close tasks (45 min)
   - `close_reconciliations` - Required for reconciliation tracking (45 min)
3. **Define USER-DEFINED Types** - Tables won't work without these (30 min)
4. **Add Unique Constraints** - Prevent data corruption (1 hour)
5. **Add Performance Indexes** - Slow without these (2 hours)

**Total Critical Work**: ~10-12 hours

---

### HIGH PRIORITY (Do Within 1 Week)

1. **Add Database Triggers** for updated_at automation (2 hours)
2. **Create Missing API Endpoints** for Finance Close (8-12 hours)
3. **Add Audit Triggers** for compliance (3 hours)
4. **Add `close_milestones` table** (1 hour)
5. **Add `mda_content` table** (1 hour)
6. **Seed Permission Data** (2 hours)

**Total High Priority Work**: ~17-21 hours

---

### MEDIUM PRIORITY (Do Within 1 Month)

1. **Add Materialized Views** for performance (4 hours)
2. **Implement Soft Deletes** (4 hours)
3. **Add Email/Password Validation Constraints** (1 hour)
4. **Create Backup Scripts** (3 hours)
5. **Add Session Cleanup Job** (1 hour)
6. **Document Schema Changes** (2 hours)

**Total Medium Priority Work**: ~15 hours

---

## 15. SQL Script to Fix Critical Issues

I'll create a comprehensive SQL migration script in a separate file to address the most critical issues.

---

## Conclusion

Your database schema is **well-designed for financial consolidation** but has **critical security and completeness gaps** that must be addressed before production use.

### Risk Assessment

| Category | Risk Level | Impact |
|----------|------------|--------|
| Security (No RLS) | 🔴 CRITICAL | Data breach, compliance violations |
| Missing Tables | 🔴 CRITICAL | Features won't work |
| Missing Indexes | 🟡 HIGH | Poor performance |
| Missing Triggers | 🟡 HIGH | Manual overhead, data inconsistency |
| Missing Constraints | 🟡 HIGH | Data integrity issues |
| Missing APIs | 🟠 MEDIUM | Finance Close features unavailable |

### Next Steps

1. **STOP** - Do not proceed with user testing until Critical items are fixed
2. **Run Migration Script** (will provide in next file)
3. **Add RLS Policies** to all tables (highest priority)
4. **Create Missing Tables** for Finance Close and Note Builder
5. **Deploy and Test** in staging environment
6. **Then Resume User Testing**

---

**End of Report**

*Generated by Claude Code - 2025-01-14*

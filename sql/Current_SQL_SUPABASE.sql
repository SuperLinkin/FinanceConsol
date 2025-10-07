-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.adjustment_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entry_number text UNIQUE,
  description text NOT NULL,
  adjustment_type text,
  period date NOT NULL,
  status USER-DEFINED DEFAULT 'Draft'::entry_status,
  debit_account text NOT NULL,
  credit_account text NOT NULL,
  amount numeric NOT NULL,
  currency text,
  entity_id uuid,
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  approved_by text,
  approved_at timestamp with time zone,
  notes text,
  CONSTRAINT adjustment_entries_pkey PRIMARY KEY (id),
  CONSTRAINT adjustment_entries_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id)
);
CREATE TABLE public.builder_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  entry_name character varying NOT NULL,
  entry_type character varying NOT NULL,
  description text,
  entries jsonb DEFAULT '[]'::jsonb,
  total_debit numeric DEFAULT 0,
  total_credit numeric DEFAULT 0,
  period date,
  status character varying DEFAULT 'Draft'::character varying,
  is_active boolean DEFAULT true,
  created_by character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT builder_entries_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chart_of_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_id uuid,
  account_code text NOT NULL,
  account_name text NOT NULL,
  class_name text,
  subclass_name text,
  note_name text,
  subnote_name text,
  account_type text,
  normal_balance text CHECK (normal_balance = ANY (ARRAY['Debit'::text, 'Credit'::text])),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT chart_of_accounts_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id)
);
CREATE TABLE public.coa_master_hierarchy (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_name text NOT NULL,
  class_code text,
  subclass_name text NOT NULL,
  subclass_code text,
  note_name text,
  note_code text,
  note_number integer,
  subnote_name text,
  subnote_code text,
  statement_type USER-DEFINED NOT NULL,
  normal_balance text CHECK (normal_balance = ANY (ARRAY['Debit'::text, 'Credit'::text])),
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coa_master_hierarchy_pkey PRIMARY KEY (id)
);
CREATE TABLE public.consolidation_changes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  working_id uuid,
  period character varying NOT NULL,
  statement_type character varying NOT NULL,
  line_item_id character varying NOT NULL,
  account_code character varying,
  account_name character varying,
  field_changed character varying,
  old_value text,
  new_value text,
  change_type character varying,
  changed_by character varying,
  changed_at timestamp without time zone DEFAULT now(),
  ip_address character varying,
  user_agent text,
  CONSTRAINT consolidation_changes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.consolidation_workings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  period date NOT NULL,
  statement_type USER-DEFINED NOT NULL,
  account_code text NOT NULL,
  account_name text,
  class_name text,
  subclass_name text,
  note_name text,
  subnote_name text,
  entity_amounts jsonb,
  elimination_amount numeric DEFAULT 0,
  adjustment_amount numeric DEFAULT 0,
  translation_amount numeric DEFAULT 0,
  consolidated_amount numeric,
  calculated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT consolidation_workings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.currencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  currency_code text NOT NULL UNIQUE,
  currency_name text NOT NULL,
  symbol text,
  is_presentation_currency boolean DEFAULT false,
  is_functional_currency boolean DEFAULT false,
  is_group_reporting_currency boolean DEFAULT false,
  exchange_rate numeric DEFAULT 1.0,
  rate_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT currencies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.elimination_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entry_number text UNIQUE,
  description text NOT NULL,
  elimination_type text,
  period date NOT NULL,
  status USER-DEFINED DEFAULT 'Draft'::entry_status,
  debit_account text NOT NULL,
  credit_account text NOT NULL,
  amount numeric NOT NULL,
  currency text,
  entity_from uuid,
  entity_to uuid,
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  approved_by text,
  approved_at timestamp with time zone,
  notes text,
  CONSTRAINT elimination_entries_pkey PRIMARY KEY (id),
  CONSTRAINT elimination_entries_entity_from_fkey FOREIGN KEY (entity_from) REFERENCES public.entities(id),
  CONSTRAINT elimination_entries_entity_to_fkey FOREIGN KEY (entity_to) REFERENCES public.entities(id)
);
CREATE TABLE public.elimination_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  template_name character varying NOT NULL,
  template_description text,
  template_entries jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT elimination_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.eliminations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  elimination_name character varying NOT NULL,
  entity_1_id uuid,
  entity_2_id uuid,
  template_id character varying,
  entries jsonb DEFAULT '[]'::jsonb,
  description text,
  total_amount numeric DEFAULT 0,
  period date,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT eliminations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.entities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_code text NOT NULL UNIQUE,
  entity_name text NOT NULL,
  entity_type USER-DEFINED NOT NULL,
  parent_entity_id uuid,
  region_id uuid,
  controller_id uuid,
  ownership_percentage numeric,
  ownership_type USER-DEFINED DEFAULT 'Direct'::ownership_type,
  consolidation_method USER-DEFINED DEFAULT 'Full Consolidation'::consolidation_method,
  split_ownership jsonb,
  functional_currency text,
  presentation_currency text,
  acquisition_date date,
  reporting_start_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT entities_pkey PRIMARY KEY (id),
  CONSTRAINT entities_parent_entity_id_fkey FOREIGN KEY (parent_entity_id) REFERENCES public.entities(id),
  CONSTRAINT entities_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id),
  CONSTRAINT entities_controller_id_fkey FOREIGN KEY (controller_id) REFERENCES public.entity_controllers(id)
);
CREATE TABLE public.entity_controllers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT 'Entity Controller'::text,
  email text UNIQUE,
  reporting_to uuid,
  is_ultimate_owner boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT entity_controllers_pkey PRIMARY KEY (id),
  CONSTRAINT entity_controllers_reporting_to_fkey FOREIGN KEY (reporting_to) REFERENCES public.entity_controllers(id)
);
CREATE TABLE public.entity_gl_mapping (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  entity_id uuid NOT NULL,
  entity_gl_code character varying NOT NULL,
  entity_gl_name character varying,
  master_gl_code character varying NOT NULL,
  mapped_by character varying,
  mapped_at timestamp without time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  notes text,
  CONSTRAINT entity_gl_mapping_pkey PRIMARY KEY (id)
);
CREATE TABLE public.entity_logic (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  logic_key character varying NOT NULL UNIQUE,
  logic_name character varying NOT NULL,
  logic_type character varying NOT NULL,
  description text,
  configuration jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT entity_logic_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exchange_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate numeric NOT NULL,
  rate_date date NOT NULL,
  rate_type text DEFAULT 'Spot'::text,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exchange_rates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.financial_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  report_name character varying NOT NULL,
  period character varying NOT NULL,
  template_id uuid,
  working_id uuid,
  content jsonb NOT NULL,
  status character varying DEFAULT 'draft'::character varying,
  version integer DEFAULT 1,
  header text,
  footer text,
  custom_styles jsonb,
  created_by character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_by character varying,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT financial_reports_pkey PRIMARY KEY (id),
  CONSTRAINT financial_reports_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.report_templates(id)
);
CREATE TABLE public.intercompany_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_number text,
  transaction_date date NOT NULL,
  from_entity_id uuid NOT NULL,
  to_entity_id uuid NOT NULL,
  transaction_type text,
  amount numeric NOT NULL,
  currency text,
  from_account text,
  to_account text,
  is_eliminated boolean DEFAULT false,
  elimination_entry_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT intercompany_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT intercompany_transactions_from_entity_id_fkey FOREIGN KEY (from_entity_id) REFERENCES public.entities(id),
  CONSTRAINT intercompany_transactions_to_entity_id_fkey FOREIGN KEY (to_entity_id) REFERENCES public.entities(id),
  CONSTRAINT intercompany_transactions_elimination_entry_id_fkey FOREIGN KEY (elimination_entry_id) REFERENCES public.elimination_entries(id)
);
CREATE TABLE public.regions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_code text NOT NULL UNIQUE,
  region_name text NOT NULL,
  description text,
  associated_currency text,
  parent_region_id uuid,
  controller_id uuid,
  reporting_calendar text DEFAULT 'Jan-Dec'::text,
  regulatory_framework text DEFAULT 'IFRS'::text,
  intra_region_netting boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT regions_pkey PRIMARY KEY (id),
  CONSTRAINT regions_parent_region_id_fkey FOREIGN KEY (parent_region_id) REFERENCES public.regions(id),
  CONSTRAINT regions_controller_id_fkey FOREIGN KEY (controller_id) REFERENCES public.entity_controllers(id)
);
CREATE TABLE public.report_changes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  report_id uuid,
  version integer NOT NULL,
  section character varying,
  change_type character varying,
  field_changed character varying,
  old_value text,
  new_value text,
  description text,
  changed_by character varying,
  changed_at timestamp without time zone DEFAULT now(),
  ip_address character varying,
  CONSTRAINT report_changes_pkey PRIMARY KEY (id),
  CONSTRAINT report_changes_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.financial_reports(id)
);
CREATE TABLE public.report_notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  report_id uuid,
  note_number integer NOT NULL,
  note_title character varying NOT NULL,
  note_content text NOT NULL,
  linked_accounts jsonb,
  working_reference character varying,
  display_order integer DEFAULT 0,
  created_by character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_by character varying,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_notes_pkey PRIMARY KEY (id),
  CONSTRAINT report_notes_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.financial_reports(id)
);
CREATE TABLE public.report_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  template_name character varying NOT NULL,
  template_type character varying DEFAULT 'standard'::character varying,
  description text,
  structure jsonb,
  styles jsonb,
  is_default boolean DEFAULT false,
  created_by character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.report_versions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  report_id uuid,
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  snapshot_type character varying DEFAULT 'auto'::character varying,
  comment text,
  created_by character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT report_versions_pkey PRIMARY KEY (id),
  CONSTRAINT report_versions_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.financial_reports(id)
);
CREATE TABLE public.reporting_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  period_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  fiscal_year integer,
  fiscal_quarter integer,
  fiscal_month integer,
  status USER-DEFINED DEFAULT 'Open'::period_status,
  is_year_end boolean DEFAULT false,
  locked_by uuid,
  locked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reporting_periods_pkey PRIMARY KEY (id),
  CONSTRAINT reporting_periods_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES public.entity_controllers(id)
);
CREATE TABLE public.system_parameters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parameter_category text NOT NULL,
  parameter_key text NOT NULL,
  parameter_value text,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by text,
  CONSTRAINT system_parameters_pkey PRIMARY KEY (id)
);
CREATE TABLE public.translation_adjustments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL,
  account_code text NOT NULL,
  period date NOT NULL,
  functional_amount numeric,
  functional_currency text,
  translated_amount numeric,
  translated_currency text,
  exchange_rate numeric,
  translation_method text,
  adjustment_amount numeric,
  cumulative_adjustment numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT translation_adjustments_pkey PRIMARY KEY (id),
  CONSTRAINT translation_adjustments_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id)
);
CREATE TABLE public.translation_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  class_level character varying NOT NULL,
  subclass_level character varying,
  note_level character varying,
  rate_type character varying NOT NULL CHECK (rate_type::text = ANY (ARRAY['closing'::character varying, 'average'::character varying, 'historical'::character varying, 'opening'::character varying]::text[])),
  description text,
  accounting_standard character varying DEFAULT 'IFRS'::character varying,
  priority integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT translation_rules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.trial_balance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL,
  account_code text NOT NULL,
  account_name text NOT NULL,
  debit numeric DEFAULT 0,
  credit numeric DEFAULT 0,
  currency text,
  period date NOT NULL,
  uploaded_by text,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trial_balance_pkey PRIMARY KEY (id),
  CONSTRAINT trial_balance_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id)
);
CREATE TABLE public.validation_checks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  check_name character varying NOT NULL,
  check_type character varying NOT NULL,
  category character varying,
  description text,
  formula text,
  severity character varying DEFAULT 'error'::character varying,
  is_active boolean DEFAULT true,
  applies_to character varying,
  created_by character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT validation_checks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.validation_results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  check_id uuid,
  working_id uuid,
  period character varying NOT NULL,
  check_name character varying NOT NULL,
  status character varying NOT NULL,
  expected_value text,
  actual_value text,
  variance text,
  message text,
  checked_at timestamp without time zone DEFAULT now(),
  CONSTRAINT validation_results_pkey PRIMARY KEY (id),
  CONSTRAINT validation_results_check_id_fkey FOREIGN KEY (check_id) REFERENCES public.validation_checks(id)
);
CREATE TABLE public.world_currencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  currency_code text NOT NULL UNIQUE,
  currency_name text NOT NULL,
  symbol text,
  decimal_places integer DEFAULT 2,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT world_currencies_pkey PRIMARY KEY (id)
);
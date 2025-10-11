-- Add entity_logic_assignments table to track which logic is applied to which entities
CREATE TABLE IF NOT EXISTS public.entity_logic_assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  logic_id uuid NOT NULL,
  entity_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT entity_logic_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT entity_logic_assignments_logic_id_fkey FOREIGN KEY (logic_id) REFERENCES public.entity_logic(id) ON DELETE CASCADE,
  CONSTRAINT entity_logic_assignments_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON DELETE CASCADE,
  CONSTRAINT entity_logic_assignments_unique UNIQUE (logic_id, entity_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_entity_logic_assignments_logic_id ON public.entity_logic_assignments(logic_id);
CREATE INDEX IF NOT EXISTS idx_entity_logic_assignments_entity_id ON public.entity_logic_assignments(entity_id);

COMMENT ON TABLE public.entity_logic_assignments IS 'Junction table to assign logic rules to specific entities';
COMMENT ON COLUMN public.entity_logic_assignments.priority IS 'Execution order when multiple logics apply (lower number = higher priority)';

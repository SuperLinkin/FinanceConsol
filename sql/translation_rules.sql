-- Translation Rules Table
-- Stores currency translation rules for entities

CREATE TABLE IF NOT EXISTS translation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    applies_to VARCHAR(50) DEFAULT 'All', -- 'All', 'Class', 'Specific GL'
    class_name VARCHAR(100), -- NULL if applies_to is not 'Class'
    gl_account_code VARCHAR(50), -- NULL if applies_to is not 'Specific GL'
    rate_type VARCHAR(50) NOT NULL DEFAULT 'Closing Rate', -- 'Closing Rate', 'Average Rate', 'Historical Rate'
    rate_value DECIMAL(18, 8), -- Exchange rate value
    fctr_account VARCHAR(50), -- FCTR (Foreign Currency Translation Reserve) account code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_translation_entity FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    CONSTRAINT fk_translation_from_currency FOREIGN KEY (from_currency) REFERENCES currencies(currency_code),
    CONSTRAINT fk_translation_to_currency FOREIGN KEY (to_currency) REFERENCES currencies(currency_code),
    CONSTRAINT fk_translation_fctr_account FOREIGN KEY (fctr_account) REFERENCES chart_of_accounts(account_code),

    -- Check constraints
    CONSTRAINT chk_applies_to CHECK (applies_to IN ('All', 'Class', 'Specific GL')),
    CONSTRAINT chk_rate_type CHECK (rate_type IN ('Closing Rate', 'Average Rate', 'Historical Rate')),
    CONSTRAINT chk_class_name CHECK (
        (applies_to = 'Class' AND class_name IS NOT NULL) OR
        (applies_to != 'Class' AND class_name IS NULL)
    ),
    CONSTRAINT chk_gl_account CHECK (
        (applies_to = 'Specific GL' AND gl_account_code IS NOT NULL) OR
        (applies_to != 'Specific GL' AND gl_account_code IS NULL)
    )
);

-- Indexes for better query performance
CREATE INDEX idx_translation_rules_entity ON translation_rules(entity_id);
CREATE INDEX idx_translation_rules_from_currency ON translation_rules(from_currency);
CREATE INDEX idx_translation_rules_to_currency ON translation_rules(to_currency);
CREATE INDEX idx_translation_rules_is_active ON translation_rules(is_active);
CREATE INDEX idx_translation_rules_applies_to ON translation_rules(applies_to);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_translation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trg_translation_rules_updated_at
    BEFORE UPDATE ON translation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_rules_updated_at();

-- Comments
COMMENT ON TABLE translation_rules IS 'Stores currency translation rules for entities';
COMMENT ON COLUMN translation_rules.rule_name IS 'Name of the translation rule';
COMMENT ON COLUMN translation_rules.entity_id IS 'Entity to which this rule applies';
COMMENT ON COLUMN translation_rules.from_currency IS 'Source currency code';
COMMENT ON COLUMN translation_rules.to_currency IS 'Target currency code';
COMMENT ON COLUMN translation_rules.applies_to IS 'Scope of the rule: All accounts, specific Class, or Specific GL';
COMMENT ON COLUMN translation_rules.class_name IS 'Account class name if applies_to is Class';
COMMENT ON COLUMN translation_rules.gl_account_code IS 'GL account code if applies_to is Specific GL';
COMMENT ON COLUMN translation_rules.rate_type IS 'Type of exchange rate to use';
COMMENT ON COLUMN translation_rules.rate_value IS 'Exchange rate value (multiply factor)';
COMMENT ON COLUMN translation_rules.fctr_account IS 'Foreign Currency Translation Reserve account code';
COMMENT ON COLUMN translation_rules.is_active IS 'Whether the rule is active';

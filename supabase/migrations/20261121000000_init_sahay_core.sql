-- =============================================================================
-- SAHAY — Database Migration: Core Schema
-- Production-minded, accessible, voice-first Indian welfare discovery platform
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE scheme_level AS ENUM ('central', 'state', 'ut', 'district');
CREATE TYPE benefit_type AS ENUM (
  'cash_transfer',
  'subsidy',
  'insurance',
  'pension',
  'scholarship',
  'in_kind',
  'loan_guarantee'
);
CREATE TYPE application_mode AS ENUM ('online', 'offline', 'csc', 'hybrid');
CREATE TYPE verification_status AS ENUM ('unverified', 'in_review', 'verified', 'deprecated');
CREATE TYPE rule_operator AS ENUM (
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'between', 'exists', 'not_exists'
);
CREATE TYPE source_type AS ENUM (
  'official_portal', 'gazette_notification', 'ministry_guideline', 'pib_release'
);

-- 1. Schemes Table
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  official_code TEXT UNIQUE,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_hi TEXT NOT NULL,
  department TEXT NOT NULL,
  ministry TEXT,
  level scheme_level NOT NULL DEFAULT 'central',
  applicable_states TEXT[] NOT NULL DEFAULT '{"ALL"}',
  applicable_districts TEXT[] DEFAULT '{}',
  benefit_type benefit_type NOT NULL,
  benefit_amount_max NUMERIC(12, 2),
  benefit_description_en TEXT NOT NULL,
  benefit_description_hi TEXT NOT NULL,
  application_mode application_mode NOT NULL DEFAULT 'online',
  official_portal_url TEXT NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  last_reverified_at TIMESTAMPTZ,
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. AST Eligibility Rules Table
CREATE TABLE eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  criterion_key TEXT NOT NULL,
  operator rule_operator NOT NULL,
  target_value JSONB NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  rule_group INTEGER NOT NULL DEFAULT 1,
  explanation_en TEXT NOT NULL,
  explanation_hi TEXT NOT NULL,
  missing_prompt_en TEXT NOT NULL,
  missing_prompt_hi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Required Documents Matrix
CREATE TABLE scheme_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  document_code TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  description_en TEXT,
  description_hi TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  issuing_authority TEXT,
  alternative_documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Official Gazette / Source Provenance
CREATE TABLE scheme_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  source_title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type source_type NOT NULL DEFAULT 'official_portal',
  publication_date DATE,
  extracted_text_hash TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Scheme Version History (Audit Log)
CREATE TABLE scheme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changed_by TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for High Performance & Zero Scan
CREATE INDEX idx_schemes_verified ON schemes(verification_status) WHERE verification_status = 'verified';
CREATE INDEX idx_schemes_states ON schemes USING GIN(applicable_states);
CREATE INDEX idx_schemes_level ON schemes(level);
CREATE INDEX idx_rules_scheme_id ON eligibility_rules(scheme_id);
CREATE INDEX idx_rules_criterion ON eligibility_rules(criterion_key);
CREATE INDEX idx_documents_scheme_id ON scheme_documents(scheme_id);
CREATE INDEX idx_sources_scheme_id ON scheme_sources(scheme_id);

-- Row Level Security (RLS)
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_versions ENABLE ROW LEVEL SECURITY;

-- Public can read verified schemes only
CREATE POLICY "Public can view verified schemes"
  ON schemes FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Public can view rules of verified schemes"
  ON eligibility_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schemes s
      WHERE s.id = eligibility_rules.scheme_id
      AND s.verification_status = 'verified'
    )
  );

CREATE POLICY "Public can view documents of verified schemes"
  ON scheme_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schemes s
      WHERE s.id = scheme_documents.scheme_id
      AND s.verification_status = 'verified'
    )
  );

CREATE POLICY "Public can view sources of verified schemes"
  ON scheme_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schemes s
      WHERE s.id = scheme_sources.scheme_id
      AND s.verification_status = 'verified'
    )
  );

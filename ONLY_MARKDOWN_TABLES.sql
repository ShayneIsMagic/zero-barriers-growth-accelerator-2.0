-- =====================================================
-- ONLY CREATE MARKDOWN TABLES
-- User and Analysis already exist, don't recreate them!
-- =====================================================

-- =====================================================
-- CREATE: individual_reports table
-- =====================================================
CREATE TABLE individual_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  analysis_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phase TEXT NOT NULL,
  prompt TEXT NOT NULL,
  markdown TEXT NOT NULL,
  score INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES "Analysis"(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_individual_reports_analysis_id ON individual_reports(analysis_id);
CREATE INDEX idx_individual_reports_phase ON individual_reports(phase);
CREATE INDEX idx_individual_reports_timestamp ON individual_reports(timestamp DESC);
CREATE INDEX idx_individual_reports_createdAt ON individual_reports("createdAt" DESC);

-- =====================================================
-- CREATE: markdown_exports table
-- =====================================================
CREATE TABLE markdown_exports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  analysis_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  markdown TEXT NOT NULL,
  overall_score INTEGER,
  rating TEXT,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_analysis_export
    FOREIGN KEY (analysis_id)
    REFERENCES "Analysis"(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_markdown_exports_analysis_id ON markdown_exports(analysis_id);
CREATE INDEX idx_markdown_exports_url ON markdown_exports(url);
CREATE INDEX idx_markdown_exports_createdAt ON markdown_exports("createdAt" DESC);

-- =====================================================
-- VERIFY: Check all 4 tables exist
-- =====================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('User', 'Analysis', 'individual_reports', 'markdown_exports')
ORDER BY table_name;

-- =====================================================
-- SUCCESS! If you see 4 tables above, everything worked!
-- =====================================================


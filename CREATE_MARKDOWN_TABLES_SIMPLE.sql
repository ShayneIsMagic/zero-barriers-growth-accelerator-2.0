-- =====================================================
-- SIMPLE VERSION - Just Create the Tables
-- If the full schema didn't work, try this simpler version
-- =====================================================

-- First, let's check what we have
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- Create individual_reports table
-- =====================================================
CREATE TABLE IF NOT EXISTS individual_reports (
  id TEXT PRIMARY KEY,
  analysis_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phase TEXT NOT NULL,
  prompt TEXT NOT NULL,
  markdown TEXT NOT NULL,
  score INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_individual_reports_analysis_id ON individual_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_individual_reports_phase ON individual_reports(phase);
CREATE INDEX IF NOT EXISTS idx_individual_reports_timestamp ON individual_reports(timestamp DESC);

-- =====================================================
-- Create markdown_exports table
-- =====================================================
CREATE TABLE IF NOT EXISTS markdown_exports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  analysis_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  markdown TEXT NOT NULL,
  overall_score INTEGER,
  rating TEXT,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_markdown_exports_analysis_id ON markdown_exports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_markdown_exports_url ON markdown_exports(url);

-- =====================================================
-- Verify tables were created
-- =====================================================
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('individual_reports', 'markdown_exports')
  AND table_schema = 'public';

-- Should return 2 rows if successful!


-- =====================================================
-- ADD MARKDOWN TABLES TO EXISTING SCHEMA
-- Matches your existing User and Analysis tables
-- =====================================================

-- Check what tables currently exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- CREATE: individual_reports table
-- Stores each individual markdown report (Phase 1, 2, 3)
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

  -- Foreign key matching your Analysis table
  CONSTRAINT fk_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES "Analysis"(id)
    ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_individual_reports_analysis_id ON individual_reports(analysis_id);
CREATE INDEX idx_individual_reports_phase ON individual_reports(phase);
CREATE INDEX idx_individual_reports_timestamp ON individual_reports(timestamp DESC);
CREATE INDEX idx_individual_reports_createdAt ON individual_reports("createdAt" DESC);

-- =====================================================
-- CREATE: markdown_exports table
-- Stores complete combined markdown reports
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

  -- Foreign key matching your Analysis table
  CONSTRAINT fk_analysis_export
    FOREIGN KEY (analysis_id)
    REFERENCES "Analysis"(id)
    ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_markdown_exports_analysis_id ON markdown_exports(analysis_id);
CREATE INDEX idx_markdown_exports_url ON markdown_exports(url);
CREATE INDEX idx_markdown_exports_createdAt ON markdown_exports("createdAt" DESC);

-- =====================================================
-- VERIFY: Check that tables were created successfully
-- =====================================================
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('User', 'Analysis', 'individual_reports', 'markdown_exports')
ORDER BY table_name;

-- Should show 4 tables now!

-- =====================================================
-- TEST: Quick insert and query test
-- =====================================================

-- Test 1: Create a test Analysis record (if one doesn't exist)
INSERT INTO "Analysis" (
  id,
  content,
  "contentType",
  status,
  "userId"
) VALUES (
  'test-analysis-for-markdown',
  'Test analysis content',
  'website',
  'COMPLETED',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Test 2: Insert a test markdown report
INSERT INTO individual_reports (
  id,
  analysis_id,
  name,
  phase,
  prompt,
  markdown,
  score
) VALUES (
  'test-report-001',
  'test-analysis-for-markdown',
  'Test Content Collection',
  'Phase 1',
  'N/A - Direct web scraping',
  '# Test Markdown Report\n\nThis is a test to verify the table works correctly.\n\n## Content\n\nSample content here.',
  85
)
ON CONFLICT (id) DO NOTHING;

-- Test 3: Query the test data
SELECT
  ir.id,
  ir.name,
  ir.phase,
  ir.score,
  a.status as analysis_status
FROM individual_reports ir
LEFT JOIN "Analysis" a ON ir.analysis_id = a.id
WHERE ir.id = 'test-report-001';

-- Should return 1 row with your test data!

-- =====================================================
-- CLEANUP: Remove test data (optional)
-- =====================================================
-- Uncomment these lines to clean up test data:
-- DELETE FROM individual_reports WHERE id = 'test-report-001';
-- DELETE FROM "Analysis" WHERE id = 'test-analysis-for-markdown';

-- =====================================================
-- SUCCESS INDICATORS
-- =====================================================
-- If you see this, everything worked:
-- 1. ✅ 4 tables listed in verification query
-- 2. ✅ Test report inserted successfully
-- 3. ✅ Test query returned 1 row
-- 4. ✅ No error messages
-- =====================================================


-- =====================================================
-- SUPABASE SCHEMA FOR MARKDOWN REPORTS
-- Individual Reports Storage System
-- =====================================================

-- Drop existing tables if they exist (for fresh install)
DROP TABLE IF EXISTS individual_reports CASCADE;
DROP TABLE IF EXISTS markdown_exports CASCADE;

-- =====================================================
-- TABLE: individual_reports
-- Stores each individual markdown report (Phase 1, 2, 3)
-- =====================================================
CREATE TABLE individual_reports (
  id TEXT PRIMARY KEY,
  analysis_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phase TEXT NOT NULL,
  prompt TEXT NOT NULL,
  markdown TEXT NOT NULL,
  score INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key to analyses table
  CONSTRAINT fk_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES "Analysis"(id)
    ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX idx_individual_reports_analysis_id ON individual_reports(analysis_id);
CREATE INDEX idx_individual_reports_phase ON individual_reports(phase);
CREATE INDEX idx_individual_reports_timestamp ON individual_reports(timestamp DESC);
CREATE INDEX idx_individual_reports_created ON individual_reports(created_at DESC);

-- =====================================================
-- TABLE: markdown_exports
-- Stores complete combined markdown reports
-- =====================================================
CREATE TABLE markdown_exports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  analysis_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  markdown TEXT NOT NULL,
  overall_score INTEGER,
  rating TEXT,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key to analyses table
  CONSTRAINT fk_analysis_export
    FOREIGN KEY (analysis_id)
    REFERENCES "Analysis"(id)
    ON DELETE CASCADE
);

-- Indexes for exports
CREATE INDEX idx_markdown_exports_analysis_id ON markdown_exports(analysis_id);
CREATE INDEX idx_markdown_exports_url ON markdown_exports(url);
CREATE INDEX idx_markdown_exports_created ON markdown_exports(created_at DESC);

-- =====================================================
-- FUNCTION: Update timestamp on update
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_individual_reports_updated_at
  BEFORE UPDATE ON individual_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_markdown_exports_updated_at
  BEFORE UPDATE ON markdown_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Get all reports for an analysis
-- =====================================================
CREATE OR REPLACE FUNCTION get_analysis_reports(p_analysis_id TEXT)
RETURNS TABLE (
  report_id TEXT,
  report_name TEXT,
  phase TEXT,
  score INTEGER,
  markdown_preview TEXT,
  timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    name,
    phase,
    score,
    LEFT(markdown, 200) AS markdown_preview,
    timestamp
  FROM individual_reports
  WHERE analysis_id = p_analysis_id
  ORDER BY timestamp ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get reports by phase
-- =====================================================
CREATE OR REPLACE FUNCTION get_phase_reports(
  p_analysis_id TEXT,
  p_phase TEXT
)
RETURNS TABLE (
  report_id TEXT,
  report_name TEXT,
  prompt TEXT,
  markdown TEXT,
  score INTEGER,
  timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    name,
    prompt,
    markdown,
    score,
    timestamp
  FROM individual_reports
  WHERE
    analysis_id = p_analysis_id
    AND phase = p_phase
  ORDER BY timestamp ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Save individual report
-- =====================================================
CREATE OR REPLACE FUNCTION save_individual_report(
  p_id TEXT,
  p_analysis_id TEXT,
  p_name TEXT,
  p_phase TEXT,
  p_prompt TEXT,
  p_markdown TEXT,
  p_score INTEGER DEFAULT NULL,
  p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TEXT AS $$
BEGIN
  INSERT INTO individual_reports (
    id,
    analysis_id,
    name,
    phase,
    prompt,
    markdown,
    score,
    timestamp
  ) VALUES (
    p_id,
    p_analysis_id,
    p_name,
    p_phase,
    p_prompt,
    p_markdown,
    p_score,
    p_timestamp
  )
  ON CONFLICT (id)
  DO UPDATE SET
    markdown = EXCLUDED.markdown,
    score = EXCLUDED.score,
    updated_at = NOW();

  RETURN p_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Save combined markdown export
-- =====================================================
CREATE OR REPLACE FUNCTION save_markdown_export(
  p_analysis_id TEXT,
  p_url TEXT,
  p_markdown TEXT,
  p_overall_score INTEGER DEFAULT NULL,
  p_rating TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_export_id TEXT;
BEGIN
  INSERT INTO markdown_exports (
    analysis_id,
    url,
    markdown,
    overall_score,
    rating
  ) VALUES (
    p_analysis_id,
    p_url,
    p_markdown,
    p_overall_score,
    p_rating
  )
  ON CONFLICT (analysis_id)
  DO UPDATE SET
    markdown = EXCLUDED.markdown,
    overall_score = EXCLUDED.overall_score,
    rating = EXCLUDED.rating,
    exported_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_export_id;

  RETURN v_export_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get complete analysis with all reports
-- =====================================================
CREATE OR REPLACE FUNCTION get_complete_analysis_markdown(p_analysis_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'analysisId', p_analysis_id,
    'export', (
      SELECT row_to_json(e)
      FROM markdown_exports e
      WHERE e.analysis_id = p_analysis_id
    ),
    'individualReports', (
      SELECT json_agg(
        json_build_object(
          'id', r.id,
          'name', r.name,
          'phase', r.phase,
          'prompt', r.prompt,
          'markdown', r.markdown,
          'score', r.score,
          'timestamp', r.timestamp
        )
        ORDER BY r.timestamp ASC
      )
      FROM individual_reports r
      WHERE r.analysis_id = p_analysis_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEW: Recent Reports Summary
-- =====================================================
CREATE OR REPLACE VIEW recent_reports_summary AS
SELECT
  a.id AS analysis_id,
  a."userId" AS user_id,
  a.status,
  a."createdAt" AS analysis_created,
  COUNT(DISTINCT ir.id) AS report_count,
  MAX(ir.timestamp) AS latest_report,
  me.overall_score,
  me.rating,
  CASE
    WHEN me.id IS NOT NULL THEN 'Complete'
    WHEN COUNT(ir.id) > 0 THEN 'In Progress'
    ELSE 'Not Started'
  END AS markdown_status
FROM "Analysis" a
LEFT JOIN individual_reports ir ON a.id = ir.analysis_id
LEFT JOIN markdown_exports me ON a.id = me.analysis_id
GROUP BY a.id, a."userId", a.status, a."createdAt", me.overall_score, me.rating, me.id
ORDER BY a."createdAt" DESC;

-- =====================================================
-- GRANT PERMISSIONS (adjust based on your RLS policies)
-- =====================================================
-- Grant access to authenticated users
-- GRANT ALL ON individual_reports TO authenticated;
-- GRANT ALL ON markdown_exports TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_analysis_reports TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_phase_reports TO authenticated;
-- GRANT EXECUTE ON FUNCTION save_individual_report TO authenticated;
-- GRANT EXECUTE ON FUNCTION save_markdown_export TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_complete_analysis_markdown TO authenticated;

-- =====================================================
-- ROW LEVEL SECURITY (Optional - Uncomment if needed)
-- =====================================================
/*
ALTER TABLE individual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE markdown_exports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own analysis reports
CREATE POLICY individual_reports_user_policy ON individual_reports
  FOR ALL
  USING (
    analysis_id IN (
      SELECT id FROM "Analysis" WHERE "userId" = auth.uid()::TEXT
    )
  );

CREATE POLICY markdown_exports_user_policy ON markdown_exports
  FOR ALL
  USING (
    analysis_id IN (
      SELECT id FROM "Analysis" WHERE "userId" = auth.uid()::TEXT
    )
  );
*/

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================
-- Uncomment to insert test data
/*
INSERT INTO individual_reports (
  id,
  analysis_id,
  name,
  phase,
  prompt,
  markdown,
  score
) VALUES (
  'test-report-1',
  'test-analysis-id',
  'Content Collection',
  'Phase 1',
  'N/A - Direct web scraping',
  '# Content Collection Report\n\nSample markdown content here...',
  NULL
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the schema is set up correctly

-- 1. Check tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_name IN ('individual_reports', 'markdown_exports');

-- 2. Check functions exist
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_name LIKE '%report%' OR routine_name LIKE '%markdown%';

-- 3. Check indexes
-- SELECT indexname FROM pg_indexes
-- WHERE tablename IN ('individual_reports', 'markdown_exports');

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Save a report
/*
SELECT save_individual_report(
  'content-collection-123',
  'analysis-456',
  'Content Collection',
  'Phase 1',
  'N/A - Direct scraping',
  '# Content Collection Report\n\nYour content here...',
  NULL,
  NOW()
);
*/

-- Example 2: Get all reports for an analysis
/*
SELECT * FROM get_analysis_reports('analysis-456');
*/

-- Example 3: Get reports by phase
/*
SELECT * FROM get_phase_reports('analysis-456', 'Phase 1');
*/

-- Example 4: Save combined export
/*
SELECT save_markdown_export(
  'analysis-456',
  'https://example.com',
  '# Complete Analysis Report\n\nAll phases combined...',
  82,
  'Very Good'
);
*/

-- Example 5: Get complete analysis with all reports
/*
SELECT get_complete_analysis_markdown('analysis-456');
*/

-- =====================================================
-- CLEANUP (use with caution - deletes all data)
-- =====================================================
/*
TRUNCATE individual_reports CASCADE;
TRUNCATE markdown_exports CASCADE;
*/


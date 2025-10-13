-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- This fixes the 67 security warnings in Supabase
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE golden_circle_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE golden_circle_why ENABLE ROW LEVEL SECURITY;
ALTER TABLE golden_circle_how ENABLE ROW LEVEL SECURITY;
ALTER TABLE golden_circle_what ENABLE ROW LEVEL SECURITY;
ALTER TABLE golden_circle_who ENABLE ROW LEVEL SECURITY;
ALTER TABLE elements_of_value_b2c ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2c_element_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE elements_of_value_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_element_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE clifton_strengths_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clifton_theme_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clifton_themes_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE clifton_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighthouse_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_practice_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_trends_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_seo_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_barriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_to_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_element_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_element_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_terminology ENABLE ROW LEVEL SECURITY;
ALTER TABLE golden_circle_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE clifton_theme_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: CREATE POLICIES FOR SERVER-SIDE ACCESS
-- These allow your Next.js API routes (using service role key) to access all data
-- =====================================================

-- Reference tables (public read access - everyone can see patterns)
CREATE POLICY "Public read access for reference data"
ON clifton_themes_reference FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Public read access for value elements"
ON value_element_reference FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Public read access for value patterns"
ON value_element_patterns FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Public read access for industry terms"
ON industry_terminology FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Public read access for golden circle patterns"
ON golden_circle_patterns FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Public read access for clifton patterns"
ON clifton_theme_patterns FOR SELECT
TO authenticated, anon
USING (true);

-- Service role bypass for all other tables
-- This allows your Next.js API routes (using service key) to do anything
-- Users can only access via your API routes, not directly

CREATE POLICY "Service role full access websites"
ON websites FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access analysis_progress"
ON analysis_progress FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access golden_circle_analyses"
ON golden_circle_analyses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access golden_circle_why"
ON golden_circle_why FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access golden_circle_how"
ON golden_circle_how FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access golden_circle_what"
ON golden_circle_what FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access golden_circle_who"
ON golden_circle_who FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access elements_of_value_b2c"
ON elements_of_value_b2c FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access b2c_element_scores"
ON b2c_element_scores FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access elements_of_value_b2b"
ON elements_of_value_b2b FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access b2b_element_scores"
ON b2b_element_scores FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access value_insights"
ON value_insights FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access clifton_strengths_analyses"
ON clifton_strengths_analyses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access clifton_theme_scores"
ON clifton_theme_scores FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access clifton_insights"
ON clifton_insights FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access lighthouse_analyses"
ON lighthouse_analyses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access core_web_vitals"
ON core_web_vitals FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access performance_metrics"
ON performance_metrics FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access accessibility_issues"
ON accessibility_issues FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access seo_issues"
ON seo_issues FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access best_practice_issues"
ON best_practice_issues FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access seo_analyses"
ON seo_analyses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access keyword_rankings"
ON keyword_rankings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access google_trends_data"
ON google_trends_data FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access keyword_opportunities"
ON keyword_opportunities FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access content_gaps"
ON content_gaps FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access competitive_keywords"
ON competitive_keywords FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access technical_seo_audit"
ON technical_seo_audit FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access page_seo_scores"
ON page_seo_scores FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access transformation_analyses"
ON transformation_analyses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access growth_barriers"
ON growth_barriers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access growth_opportunities"
ON growth_opportunities FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access recommendations"
ON recommendations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access roadmap_phases"
ON roadmap_phases FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access roadmap_actions"
ON roadmap_actions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access success_metrics"
ON success_metrics FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access content_analyses"
ON content_analyses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access content_structure"
ON content_structure FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access call_to_actions"
ON call_to_actions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access media_analysis"
ON media_analysis FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access page_screenshots"
ON page_screenshots FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access generated_reports"
ON generated_reports FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access report_templates"
ON report_templates FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access analysis_audit_log"
ON analysis_audit_log FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access analysis_comparisons"
ON analysis_comparisons FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access pattern_matches"
ON pattern_matches FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access notifications"
ON notifications FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access subscriptions"
ON subscriptions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access credit_transactions"
ON credit_transactions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access api_usage_log"
ON api_usage_log FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access system_config"
ON system_config FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access feature_flags"
ON feature_flags FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access user_preferences"
ON user_preferences FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verification
DO $$
DECLARE
    tables_with_rls INT;
    tables_without_rls INT;
BEGIN
    SELECT COUNT(*) INTO tables_with_rls
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true;
    
    SELECT COUNT(*) INTO tables_without_rls
    FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = false
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE '_prisma_%';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ROW LEVEL SECURITY ENABLED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables with RLS: %', tables_with_rls;
    RAISE NOTICE 'Tables without RLS: %', tables_without_rls;
    RAISE NOTICE '';
    RAISE NOTICE 'Security warnings should now be gone!';
    RAISE NOTICE '========================================';
END $$;


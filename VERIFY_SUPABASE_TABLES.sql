-- Verify all tables from Prisma schema exist in Supabase
-- This will check if all tables are properly created

-- Check for all main tables from prisma/schema.prisma
SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_name IN (
      'Analysis', 'User', 'accessibility_issues', 'analysis_audit_log', 
      'analysis_comparisons', 'analysis_progress', 'api_usage_log',
      'b2b_element_scores', 'b2b_value_element_reference', 'b2c_element_scores',
      'best_practice_issues', 'brand_analysis', 'brand_patterns', 'brand_pillars',
      'brand_theme_reference', 'call_to_actions', 'clifton_insights',
      'clifton_strengths_analyses', 'clifton_theme_patterns', 'clifton_theme_scores',
      'clifton_themes_reference', 'competitive_keywords', 'content_analyses',
      'content_gaps', 'content_snippets', 'content_structure', 'core_web_vitals',
      'credit_transactions', 'elements_of_value_b2b', 'elements_of_value_b2c',
      'feature_flags', 'generated_reports', 'golden_circle_analyses',
      'golden_circle_how', 'golden_circle_patterns', 'golden_circle_what',
      'golden_circle_who', 'golden_circle_why', 'google_trends_data',
      'growth_barriers', 'growth_opportunities', 'individual_reports',
      'industry_terminology', 'keyword_opportunities', 'keyword_rankings',
      'lighthouse_analyses', 'markdown_exports', 'media_analysis',
      'notifications', 'page_screenshots', 'page_seo_scores', 'pattern_matches',
      'performance_metrics', 'recommendations', 'report_templates',
      'roadmap_actions', 'roadmap_phases', 'seo_analyses', 'seo_issues',
      'subscriptions', 'success_metrics', 'system_config', 'technical_seo_audit',
      'transformation_analyses', 'user_preferences', 'value_element_patterns',
      'value_element_reference', 'value_insights', 'websites'
    ) THEN '✅ Expected'
    ELSE '❌ Unexpected'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY 
  CASE 
    WHEN table_name IN ('Analysis', 'User') THEN 1
    WHEN table_name LIKE '%analysis%' THEN 2
    WHEN table_name LIKE '%clifton%' THEN 3
    WHEN table_name LIKE '%golden%' THEN 4
    WHEN table_name LIKE '%seo%' THEN 5
    WHEN table_name LIKE '%lighthouse%' THEN 6
    WHEN table_name LIKE '%content%' THEN 7
    WHEN table_name LIKE '%brand%' THEN 8
    WHEN table_name LIKE '%value%' THEN 9
    WHEN table_name LIKE '%element%' THEN 10
    ELSE 11
  END,
  table_name;

-- Count total tables
SELECT 
  COUNT(*) as total_tables,
  COUNT(CASE WHEN table_name IN (
    'Analysis', 'User', 'accessibility_issues', 'analysis_audit_log', 
    'analysis_comparisons', 'analysis_progress', 'api_usage_log',
    'b2b_element_scores', 'b2b_value_element_reference', 'b2c_element_scores',
    'best_practice_issues', 'brand_analysis', 'brand_patterns', 'brand_pillars',
    'brand_theme_reference', 'call_to_actions', 'clifton_insights',
    'clifton_strengths_analyses', 'clifton_theme_patterns', 'clifton_theme_scores',
    'clifton_themes_reference', 'competitive_keywords', 'content_analyses',
    'content_gaps', 'content_snippets', 'content_structure', 'core_web_vitals',
    'credit_transactions', 'elements_of_value_b2b', 'elements_of_value_b2c',
    'feature_flags', 'generated_reports', 'golden_circle_analyses',
    'golden_circle_how', 'golden_circle_patterns', 'golden_circle_what',
    'golden_circle_who', 'golden_circle_why', 'google_trends_data',
    'growth_barriers', 'growth_opportunities', 'individual_reports',
    'industry_terminology', 'keyword_opportunities', 'keyword_rankings',
    'lighthouse_analyses', 'markdown_exports', 'media_analysis',
    'notifications', 'page_screenshots', 'page_seo_scores', 'pattern_matches',
    'performance_metrics', 'recommendations', 'report_templates',
    'roadmap_actions', 'roadmap_phases', 'seo_analyses', 'seo_issues',
    'subscriptions', 'success_metrics', 'system_config', 'technical_seo_audit',
    'transformation_analyses', 'user_preferences', 'value_element_patterns',
    'value_element_reference', 'value_insights', 'websites'
  ) THEN 1 END) as expected_tables,
  COUNT(CASE WHEN table_name NOT IN (
    'Analysis', 'User', 'accessibility_issues', 'analysis_audit_log', 
    'analysis_comparisons', 'analysis_progress', 'api_usage_log',
    'b2b_element_scores', 'b2b_value_element_reference', 'b2c_element_scores',
    'best_practice_issues', 'brand_analysis', 'brand_patterns', 'brand_pillars',
    'brand_theme_reference', 'call_to_actions', 'clifton_insights',
    'clifton_strengths_analyses', 'clifton_theme_patterns', 'clifton_theme_scores',
    'clifton_themes_reference', 'competitive_keywords', 'content_analyses',
    'content_gaps', 'content_snippets', 'content_structure', 'core_web_vitals',
    'credit_transactions', 'elements_of_value_b2b', 'elements_of_value_b2c',
    'feature_flags', 'generated_reports', 'golden_circle_analyses',
    'golden_circle_how', 'golden_circle_patterns', 'golden_circle_what',
    'golden_circle_who', 'golden_circle_why', 'google_trends_data',
    'growth_barriers', 'growth_opportunities', 'individual_reports',
    'industry_terminology', 'keyword_opportunities', 'keyword_rankings',
    'lighthouse_analyses', 'markdown_exports', 'media_analysis',
    'notifications', 'page_screenshots', 'page_seo_scores', 'pattern_matches',
    'performance_metrics', 'recommendations', 'report_templates',
    'roadmap_actions', 'roadmap_phases', 'seo_analyses', 'seo_issues',
    'subscriptions', 'success_metrics', 'system_config', 'technical_seo_audit',
    'transformation_analyses', 'user_preferences', 'value_element_patterns',
    'value_element_reference', 'value_insights', 'websites'
  ) THEN 1 END) as unexpected_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Check for missing critical tables
SELECT 
  'Missing Tables' as check_type,
  table_name as missing_table
FROM (
  VALUES 
    ('Analysis'), ('User'), ('individual_reports'), ('markdown_exports'),
    ('clifton_strengths_analyses'), ('golden_circle_analyses'),
    ('elements_of_value_b2c'), ('elements_of_value_b2b'),
    ('seo_analyses'), ('lighthouse_analyses'), ('content_analyses')
) AS expected_tables(table_name)
WHERE table_name NOT IN (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
);

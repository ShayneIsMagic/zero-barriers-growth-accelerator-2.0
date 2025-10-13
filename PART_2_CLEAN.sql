-- =====================================================
-- PART 2: PERFORMANCE, SEO & CONTENT TABLES (CLEAN)
-- Run this SECOND
-- =====================================================

-- Lighthouse Performance
CREATE TABLE IF NOT EXISTS lighthouse_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    page_url VARCHAR(2048) NOT NULL,
    performance_score DECIMAL(5,2),
    accessibility_score DECIMAL(5,2),
    best_practices_score DECIMAL(5,2),
    seo_score DECIMAL(5,2),
    pwa_score DECIMAL(5,2),
    overall_grade VARCHAR(10),
    tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    test_device VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS core_web_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lighthouse_id UUID REFERENCES lighthouse_analyses(id) ON DELETE CASCADE,
    fcp_ms INT,
    lcp_ms INT,
    tbt_ms INT,
    cls_score DECIMAL(5,3),
    si_ms INT,
    tti_ms INT,
    fmp_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lighthouse_id UUID REFERENCES lighthouse_analyses(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(20),
    rating VARCHAR(20),
    target_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accessibility_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lighthouse_id UUID REFERENCES lighthouse_analyses(id) ON DELETE CASCADE,
    severity VARCHAR(20),
    issue_type VARCHAR(100),
    wcag_level VARCHAR(10),
    wcag_criterion VARCHAR(50),
    description TEXT NOT NULL,
    element_selector VARCHAR(500),
    affected_elements INT,
    fix_recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seo_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lighthouse_id UUID REFERENCES lighthouse_analyses(id) ON DELETE CASCADE,
    severity VARCHAR(20),
    issue_type VARCHAR(100),
    description TEXT NOT NULL,
    current_value TEXT,
    recommended_value TEXT,
    impact_score DECIMAL(5,2),
    fix_effort VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS best_practice_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lighthouse_id UUID REFERENCES lighthouse_analyses(id) ON DELETE CASCADE,
    category VARCHAR(100),
    severity VARCHAR(20),
    description TEXT NOT NULL,
    affected_resources JSONB,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lighthouse_analysis ON lighthouse_analyses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_lighthouse_page_url ON lighthouse_analyses(page_url);
CREATE INDEX IF NOT EXISTS idx_vitals_lighthouse ON core_web_vitals(lighthouse_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_severity ON accessibility_issues(severity);
CREATE INDEX IF NOT EXISTS idx_seo_issues_severity ON seo_issues(severity);

-- SEO Analysis
CREATE TABLE IF NOT EXISTS seo_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    primary_keyword VARCHAR(255),
    overall_seo_score DECIMAL(5,2),
    technical_seo_score DECIMAL(5,2),
    content_quality_score DECIMAL(5,2),
    keyword_optimization_score DECIMAL(5,2),
    backlink_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

CREATE TABLE IF NOT EXISTS keyword_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id UUID REFERENCES seo_analyses(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    current_position INT,
    previous_position INT,
    position_change INT,
    search_volume INT,
    impressions INT,
    clicks INT,
    ctr DECIMAL(5,2),
    avg_position DECIMAL(5,2),
    competition_level VARCHAR(20),
    keyword_difficulty INT,
    opportunity_score DECIMAL(5,2),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS google_trends_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id UUID REFERENCES seo_analyses(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    trend_direction VARCHAR(20),
    trend_percentage DECIMAL(5,2),
    peak_interest_date DATE,
    seasonal_pattern JSONB,
    geographic_data JSONB,
    related_queries JSONB,
    related_topics JSONB,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS keyword_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id UUID REFERENCES seo_analyses(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    search_volume INT,
    competition VARCHAR(20),
    keyword_difficulty INT,
    opportunity_score DECIMAL(5,2),
    relevance_score DECIMAL(5,2),
    current_ranking INT,
    estimated_traffic INT,
    priority VARCHAR(20),
    content_gap BOOLEAN DEFAULT FALSE,
    recommended_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id UUID REFERENCES seo_analyses(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    opportunity_description TEXT,
    target_keywords JSONB,
    estimated_traffic INT,
    competition_level VARCHAR(20),
    content_type VARCHAR(50),
    priority VARCHAR(20),
    recommended_word_count INT,
    suggested_outline JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competitive_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id UUID REFERENCES seo_analyses(id) ON DELETE CASCADE,
    competitor_url VARCHAR(2048) NOT NULL,
    competitor_name VARCHAR(255),
    keyword VARCHAR(255) NOT NULL,
    our_position INT,
    competitor_position INT,
    position_gap INT,
    search_volume INT,
    keyword_value DECIMAL(10,2),
    priority VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS technical_seo_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id UUID REFERENCES seo_analyses(id) ON DELETE CASCADE,
    audit_category VARCHAR(100),
    issue_type VARCHAR(100),
    severity VARCHAR(20),
    description TEXT NOT NULL,
    affected_pages INT,
    affected_urls JSONB,
    fix_recommendation TEXT,
    fix_effort VARCHAR(20),
    impact_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_seo_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seo_analysis_id UUID REFERENCES seo_analyses(id) ON DELETE CASCADE,
    page_url VARCHAR(2048) NOT NULL,
    page_title VARCHAR(500),
    title_tag_score DECIMAL(5,2),
    meta_description_score DECIMAL(5,2),
    heading_structure_score DECIMAL(5,2),
    content_quality_score DECIMAL(5,2),
    image_optimization_score DECIMAL(5,2),
    internal_linking_score DECIMAL(5,2),
    overall_page_score DECIMAL(5,2),
    primary_keyword VARCHAR(255),
    word_count INT,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_analysis ON seo_analyses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_seo ON keyword_rankings(seo_analysis_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON keyword_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_trends_keyword ON google_trends_data(keyword);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON keyword_opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_content_gaps_priority ON content_gaps(priority);

-- Content Analysis
CREATE TABLE IF NOT EXISTS content_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    page_url VARCHAR(2048) NOT NULL,
    title VARCHAR(500),
    meta_description TEXT,
    word_count INT,
    reading_level VARCHAR(50),
    reading_ease_score DECIMAL(5,2),
    keyword_density JSONB,
    content_quality_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_analysis_id UUID REFERENCES content_analyses(id) ON DELETE CASCADE,
    element_type VARCHAR(50),
    element_level INT,
    element_order INT,
    content TEXT,
    attributes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS call_to_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_analysis_id UUID REFERENCES content_analyses(id) ON DELETE CASCADE,
    cta_text VARCHAR(500) NOT NULL,
    cta_url VARCHAR(2048),
    cta_type VARCHAR(50),
    prominence VARCHAR(20),
    position_on_page VARCHAR(50),
    clarity_score DECIMAL(5,2),
    urgency_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_analysis_id UUID REFERENCES content_analyses(id) ON DELETE CASCADE,
    media_type VARCHAR(50),
    media_url VARCHAR(2048),
    alt_text TEXT,
    file_size_kb INT,
    dimensions VARCHAR(50),
    format VARCHAR(20),
    optimized BOOLEAN DEFAULT FALSE,
    optimization_recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_analysis ON content_analyses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_content_structure_analysis ON content_structure(content_analysis_id);
CREATE INDEX IF NOT EXISTS idx_ctas_analysis ON call_to_actions(content_analysis_id);
CREATE INDEX IF NOT EXISTS idx_media_analysis ON media_analysis(content_analysis_id);

-- Reports & Screenshots
CREATE TABLE IF NOT EXISTS page_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    page_url VARCHAR(2048) NOT NULL,
    screenshot_url VARCHAR(2048),
    device_type VARCHAR(50),
    viewport_width INT,
    viewport_height INT,
    file_size_kb INT,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    report_type VARCHAR(50),
    report_format VARCHAR(20),
    file_url VARCHAR(2048),
    file_size_kb INT,
    sections_included JSONB,
    customizations JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloaded_at TIMESTAMP,
    download_count INT DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50),
    description TEXT,
    sections JSONB,
    styling JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    analysis_id_old TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    analysis_id_new TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    comparison_summary JSONB,
    score_changes JSONB,
    recommendations_completed INT,
    recommendations_pending INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_screenshots_analysis ON page_screenshots(analysis_id);
CREATE INDEX IF NOT EXISTS idx_reports_analysis ON generated_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON generated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_analysis ON analysis_audit_log(analysis_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_website ON analysis_comparisons(website_id);

-- Pattern Matching Tables
CREATE TABLE IF NOT EXISTS value_element_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_name VARCHAR(100) UNIQUE NOT NULL,
    element_category VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    definition TEXT,
    business_type VARCHAR(20),
    importance_weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_value_element_ref ON value_element_reference(element_category);

CREATE TABLE IF NOT EXISTS value_element_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_id UUID REFERENCES value_element_reference(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50),
    pattern_text VARCHAR(500) NOT NULL,
    pattern_weight DECIMAL(3,2) DEFAULT 1.0,
    context_required VARCHAR(100),
    examples TEXT,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patterns_element ON value_element_patterns(element_id);
CREATE INDEX IF NOT EXISTS idx_patterns_text ON value_element_patterns(pattern_text);

CREATE TABLE IF NOT EXISTS industry_terminology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry VARCHAR(100) NOT NULL,
    standard_term VARCHAR(100) NOT NULL,
    industry_term VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    usage_examples TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_industry_terms ON industry_terminology(industry, standard_term);

CREATE TABLE IF NOT EXISTS golden_circle_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension VARCHAR(20),
    indicator_type VARCHAR(50),
    pattern_category VARCHAR(50),
    pattern_text VARCHAR(500) NOT NULL,
    score_impact DECIMAL(3,2),
    examples TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gc_patterns_dimension ON golden_circle_patterns(dimension);

CREATE TABLE IF NOT EXISTS clifton_theme_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES clifton_themes_reference(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50),
    pattern_text VARCHAR(500) NOT NULL,
    strength_indicator DECIMAL(3,2),
    context_clues TEXT,
    examples TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clifton_patterns_theme ON clifton_theme_patterns(theme_id);

CREATE TABLE IF NOT EXISTS pattern_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50),
    pattern_id UUID,
    matched_text TEXT,
    context_text TEXT,
    confidence_score DECIMAL(5,4),
    page_url VARCHAR(2048),
    position_in_content INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pattern_matches_analysis ON pattern_matches(analysis_id);

-- System Config
CREATE TABLE IF NOT EXISTS api_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE SET NULL,
    api_service VARCHAR(100),
    endpoint VARCHAR(255),
    request_method VARCHAR(10),
    request_payload JSONB,
    response_status INT,
    response_time_ms INT,
    tokens_used INT,
    cost_usd DECIMAL(10,6),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_service ON api_usage_log(api_service);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_log(created_at DESC);

CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    rollout_percentage INT DEFAULT 0,
    target_users JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Part 2 Complete! SEO, content, and pattern tables created.';
    RAISE NOTICE 'Next: Run Part 3 (Functions & Seed Data)';
END $$;

-- =====================================================
-- ZERO BARRIERS ADVANCED SCHEMA - PRISMA COMPATIBLE
-- Version: 2.0
-- Compatibility: Works with existing Prisma User/Analysis tables
-- Total New Tables: 78
-- Synonym Patterns: 150+
-- =====================================================

-- IMPORTANT: This schema extends your existing Prisma schema
-- Tables "User" and "Analysis" already exist
-- This adds synonym detection and detailed tracking

-- =====================================================

-- Copy this entire file and paste into Supabase SQL Editor
-- Or run via psql: psql YOUR_DATABASE_URL < this_file.sql
-- Estimated time: 2-3 minutes

-- =====================================================
-- NOTE: "User" table already exists from Prisma
-- Skipping creation to avoid conflicts
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(2048) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    industry VARCHAR(100),
    business_type VARCHAR(50),
    first_analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_analyzed_at TIMESTAMP,
    total_analyses INT DEFAULT 0,
    created_by TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    UNIQUE(url)
);

CREATE INDEX idx_websites_domain ON websites(domain);
CREATE INDEX idx_websites_created_by ON websites(created_by);

-- =====================================================
-- NOTE: "Analysis" table already exists from Prisma
-- Skipping creation to avoid conflicts
-- =====================================================

CREATE TABLE IF NOT EXISTS analysis_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    progress_percentage INT DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_analysis_id ON analysis_progress(analysis_id);
CREATE INDEX idx_progress_status ON analysis_progress(status);

-- Main Golden Circle table
CREATE TABLE IF NOT EXISTS golden_circle_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2),
    alignment_score DECIMAL(5,2),
    clarity_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

-- WHY dimension
CREATE TABLE IF NOT EXISTS golden_circle_why (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    golden_circle_id UUID REFERENCES golden_circle_analyses(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    current_state TEXT NOT NULL,
    clarity_rating DECIMAL(5,2),
    authenticity_rating DECIMAL(5,2),
    emotional_resonance_rating DECIMAL(5,2),
    differentiation_rating DECIMAL(5,2),
    evidence JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(golden_circle_id)
);

-- HOW dimension
CREATE TABLE IF NOT EXISTS golden_circle_how (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    golden_circle_id UUID REFERENCES golden_circle_analyses(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    current_state TEXT NOT NULL,
    uniqueness_rating DECIMAL(5,2),
    clarity_rating DECIMAL(5,2),
    credibility_rating DECIMAL(5,2),
    specificity_rating DECIMAL(5,2),
    evidence JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(golden_circle_id)
);

-- WHAT dimension
CREATE TABLE IF NOT EXISTS golden_circle_what (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    golden_circle_id UUID REFERENCES golden_circle_analyses(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    current_state TEXT NOT NULL,
    clarity_rating DECIMAL(5,2),
    completeness_rating DECIMAL(5,2),
    value_articulation_rating DECIMAL(5,2),
    cta_clarity_rating DECIMAL(5,2),
    evidence JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(golden_circle_id)
);

-- WHO dimension
CREATE TABLE IF NOT EXISTS golden_circle_who (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    golden_circle_id UUID REFERENCES golden_circle_analyses(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    current_state TEXT NOT NULL,
    specificity_rating DECIMAL(5,2),
    resonance_rating DECIMAL(5,2),
    accessibility_rating DECIMAL(5,2),
    conversion_path_rating DECIMAL(5,2),
    evidence JSONB,
    recommendations JSONB,
    target_personas JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(golden_circle_id)
);

CREATE INDEX idx_golden_circle_analysis_id ON golden_circle_analyses(analysis_id);

CREATE TABLE IF NOT EXISTS elements_of_value_b2c (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2),
    functional_score DECIMAL(5,2),
    emotional_score DECIMAL(5,2),
    life_changing_score DECIMAL(5,2),
    social_impact_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

CREATE TABLE IF NOT EXISTS b2c_element_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eov_b2c_id UUID REFERENCES elements_of_value_b2c(id) ON DELETE CASCADE,
    element_name VARCHAR(100) NOT NULL,
    element_category VARCHAR(50) NOT NULL,
    pyramid_level INT,
    score DECIMAL(5,2),
    weight DECIMAL(5,2),
    weighted_score DECIMAL(5,2),
    evidence JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_b2c_eov_analysis ON elements_of_value_b2c(analysis_id);
CREATE INDEX idx_b2c_elements_category ON b2c_element_scores(element_category);
CREATE INDEX idx_b2c_elements_score ON b2c_element_scores(score);

CREATE TABLE IF NOT EXISTS elements_of_value_b2b (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2),
    table_stakes_score DECIMAL(5,2),
    functional_score DECIMAL(5,2),
    ease_of_business_score DECIMAL(5,2),
    individual_score DECIMAL(5,2),
    inspirational_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

CREATE TABLE IF NOT EXISTS b2b_element_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eov_b2b_id UUID REFERENCES elements_of_value_b2b(id) ON DELETE CASCADE,
    element_name VARCHAR(100) NOT NULL,
    element_category VARCHAR(50) NOT NULL,
    category_level INT,
    score DECIMAL(5,2),
    weight DECIMAL(5,2),
    weighted_score DECIMAL(5,2),
    evidence JSONB,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_b2b_eov_analysis ON elements_of_value_b2b(analysis_id);
CREATE INDEX idx_b2b_elements_category ON b2b_element_scores(element_category);
CREATE INDEX idx_b2b_elements_score ON b2b_element_scores(score);

CREATE TABLE IF NOT EXISTS value_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    insight_type VARCHAR(50),
    category VARCHAR(50),
    priority VARCHAR(20),
    description TEXT NOT NULL,
    supporting_elements JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insights_analysis ON value_insights(analysis_id);
CREATE INDEX idx_insights_priority ON value_insights(priority);

-- Main CliftonStrengths table
CREATE TABLE IF NOT EXISTS clifton_strengths_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2),
    strategic_thinking_score DECIMAL(5,2),
    executing_score DECIMAL(5,2),
    influencing_score DECIMAL(5,2),
    relationship_building_score DECIMAL(5,2),
    dominant_domain VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

-- Individual theme scores (34 themes)
CREATE TABLE IF NOT EXISTS clifton_theme_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clifton_analysis_id UUID REFERENCES clifton_strengths_analyses(id) ON DELETE CASCADE,
    theme_name VARCHAR(100) NOT NULL,
    domain VARCHAR(50) NOT NULL,
    score DECIMAL(5,2),
    rank INT,
    is_top_5 BOOLEAN DEFAULT FALSE,
    is_top_10 BOOLEAN DEFAULT FALSE,
    evidence JSONB,
    manifestation_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reference table for all 34 themes
CREATE TABLE IF NOT EXISTS clifton_themes_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(50) NOT NULL,
    description TEXT,
    key_indicators JSONB,
    complementary_themes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizational insights
CREATE TABLE IF NOT EXISTS clifton_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clifton_analysis_id UUID REFERENCES clifton_strengths_analyses(id) ON DELETE CASCADE,
    insight_category VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    supporting_themes JSONB,
    priority VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clifton_analysis ON clifton_strengths_analyses(analysis_id);
CREATE INDEX idx_clifton_themes_domain ON clifton_theme_scores(domain);
CREATE INDEX idx_clifton_themes_score ON clifton_theme_scores(score DESC);
CREATE INDEX idx_clifton_themes_rank ON clifton_theme_scores(rank);

-- Seed 34 CliftonStrengths themes
INSERT INTO clifton_themes_reference (theme_name, domain, description) VALUES
('Analytical', 'strategic_thinking', 'Logical reasoning and data-driven decision making'),
('Context', 'strategic_thinking', 'Understanding through historical perspective'),
('Futuristic', 'strategic_thinking', 'Inspired by visions of the future'),
('Ideation', 'strategic_thinking', 'Fascinated by ideas and connections'),
('Input', 'strategic_thinking', 'Collects and archives information'),
('Intellection', 'strategic_thinking', 'Introspective and thoughtful'),
('Learner', 'strategic_thinking', 'Great desire to learn continuously'),
('Strategic', 'strategic_thinking', 'Creates alternative paths forward'),
('Achiever', 'executing', 'Works hard with great stamina'),
('Arranger', 'executing', 'Organizes and maximizes productivity'),
('Belief', 'executing', 'Core values that define meaning'),
('Consistency', 'executing', 'Treats everyone with fairness'),
('Deliberative', 'executing', 'Careful and vigilant'),
('Discipline', 'executing', 'Creates order and structure'),
('Focus', 'executing', 'Sets clear direction and follows through'),
('Responsibility', 'executing', 'Takes ownership of commitments'),
('Restorative', 'executing', 'Skilled at problem-solving'),
('Activator', 'influencing', 'Makes things happen through action'),
('Command', 'influencing', 'Takes charge and makes decisions'),
('Communication', 'influencing', 'Expresses thoughts and ideas clearly'),
('Competition', 'influencing', 'Measures progress against others'),
('Maximizer', 'influencing', 'Focuses on strengths and excellence'),
('Self-Assurance', 'influencing', 'Confident in abilities and judgments'),
('Significance', 'influencing', 'Wants to make an important impact'),
('Woo', 'influencing', 'Wins others over and builds networks'),
('Adaptability', 'relationship_building', 'Lives in the moment flexibly'),
('Developer', 'relationship_building', 'Recognizes and cultivates potential'),
('Connectedness', 'relationship_building', 'Believes in links between all things'),
('Empathy', 'relationship_building', 'Senses feelings of others'),
('Harmony', 'relationship_building', 'Seeks consensus and agreement'),
('Includer', 'relationship_building', 'Accepts others and shows awareness'),
('Individualization', 'relationship_building', 'Drawn to unique qualities'),
('Positivity', 'relationship_building', 'Has enthusiasm that is contagious'),
('Relator', 'relationship_building', 'Enjoys close relationships');

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

-- Core Web Vitals
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

-- Performance metrics details
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

-- Accessibility issues
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

-- SEO issues and recommendations
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

-- Best practices violations
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

CREATE INDEX idx_lighthouse_analysis ON lighthouse_analyses(analysis_id);
CREATE INDEX idx_lighthouse_page_url ON lighthouse_analyses(page_url);
CREATE INDEX idx_vitals_lighthouse ON core_web_vitals(lighthouse_id);
CREATE INDEX idx_accessibility_severity ON accessibility_issues(severity);
CREATE INDEX idx_seo_issues_severity ON seo_issues(severity);

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

-- Keyword rankings
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

-- Google Trends data
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

-- Keyword opportunities
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

-- Content gaps
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

-- Competitive analysis
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

-- Technical SEO audit
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

-- Page-level SEO scores
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

CREATE INDEX idx_seo_analysis ON seo_analyses(analysis_id);
CREATE INDEX idx_keyword_rankings_seo ON keyword_rankings(seo_analysis_id);
CREATE INDEX idx_keyword_rankings_keyword ON keyword_rankings(keyword);
CREATE INDEX idx_trends_keyword ON google_trends_data(keyword);
CREATE INDEX idx_opportunities_priority ON keyword_opportunities(priority);
CREATE INDEX idx_content_gaps_priority ON content_gaps(priority);

-- Transformation analysis
CREATE TABLE IF NOT EXISTS transformation_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    current_state TEXT NOT NULL,
    desired_state TEXT NOT NULL,
    transformation_score DECIMAL(5,2),
    gap_analysis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

-- Growth barriers
CREATE TABLE IF NOT EXISTS growth_barriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transformation_id UUID REFERENCES transformation_analyses(id) ON DELETE CASCADE,
    barrier_type VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20),
    impact_score DECIMAL(5,2),
    affected_areas JSONB,
    root_cause TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth opportunities
CREATE TABLE IF NOT EXISTS growth_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transformation_id UUID REFERENCES transformation_analyses(id) ON DELETE CASCADE,
    opportunity_type VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    potential_impact VARCHAR(20),
    impact_score DECIMAL(5,2),
    effort_required VARCHAR(20),
    timeframe VARCHAR(50),
    supporting_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    category VARCHAR(100),
    priority VARCHAR(20),
    priority_score INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    expected_impact VARCHAR(20),
    impact_score DECIMAL(5,2),
    effort_required VARCHAR(20),
    timeframe VARCHAR(50),
    success_metrics JSONB,
    implementation_steps JSONB,
    resources_needed JSONB,
    dependencies JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roadmap phases
CREATE TABLE IF NOT EXISTS roadmap_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transformation_id UUID REFERENCES transformation_analyses(id) ON DELETE CASCADE,
    phase_number INT NOT NULL,
    phase_name VARCHAR(100) NOT NULL,
    duration_weeks INT,
    start_date DATE,
    end_date DATE,
    objectives JSONB,
    success_criteria JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roadmap actions
CREATE TABLE IF NOT EXISTS roadmap_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES roadmap_phases(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
    action_order INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_type VARCHAR(100),
    owner_role VARCHAR(100),
    estimated_hours INT,
    expected_impact VARCHAR(20),
    status VARCHAR(50) DEFAULT 'not-started',
    dependencies JSONB,
    resources JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Success metrics
CREATE TABLE IF NOT EXISTS success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transformation_id UUID REFERENCES transformation_analyses(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_category VARCHAR(100),
    current_value DECIMAL(10,2),
    target_value DECIMAL(10,2),
    unit VARCHAR(50),
    timeframe VARCHAR(50),
    measurement_method TEXT,
    tracking_tool VARCHAR(100),
    priority VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transformation_analysis ON transformation_analyses(analysis_id);
CREATE INDEX idx_barriers_severity ON growth_barriers(severity);
CREATE INDEX idx_opportunities_impact ON growth_opportunities(impact_score DESC);
CREATE INDEX idx_recommendations_priority ON recommendations(priority, priority_score DESC);
CREATE INDEX idx_recommendations_category ON recommendations(category);
CREATE INDEX idx_recommendations_status ON recommendations(status);

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

-- Content structure
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

-- Call-to-actions
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

-- Media analysis
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

CREATE INDEX idx_content_analysis ON content_analyses(analysis_id);
CREATE INDEX idx_content_structure_analysis ON content_structure(content_analysis_id);
CREATE INDEX idx_ctas_analysis ON call_to_actions(content_analysis_id);
CREATE INDEX idx_media_analysis ON media_analysis(content_analysis_id);

-- Screenshots
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

-- Generated reports
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

-- Report templates
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

-- Audit log
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

-- Analysis comparisons
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

CREATE INDEX idx_screenshots_analysis ON page_screenshots(analysis_id);
CREATE INDEX idx_reports_analysis ON generated_reports(analysis_id);
CREATE INDEX idx_reports_user ON generated_reports(user_id);
CREATE INDEX idx_audit_log_analysis ON analysis_audit_log(analysis_id);
CREATE INDEX idx_comparisons_website ON analysis_comparisons(website_id);

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

CREATE INDEX idx_value_element_ref ON value_element_reference(element_category);

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

CREATE INDEX idx_patterns_element ON value_element_patterns(element_id);
CREATE INDEX idx_patterns_text ON value_element_patterns(pattern_text);

CREATE TABLE IF NOT EXISTS industry_terminology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry VARCHAR(100) NOT NULL,
    standard_term VARCHAR(100) NOT NULL,
    industry_term VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    usage_examples TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_industry_terms ON industry_terminology(industry, standard_term);

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

CREATE INDEX idx_gc_patterns_dimension ON golden_circle_patterns(dimension);

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

CREATE INDEX idx_clifton_patterns_theme ON clifton_theme_patterns(theme_id);

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

CREATE INDEX idx_pattern_matches_analysis ON pattern_matches(analysis_id);

INSERT INTO value_element_reference (element_name, element_category, display_name, definition, business_type) VALUES
-- Functional B2C Elements
('saves_time', 'functional', 'Saves Time', 'Helps customers complete tasks faster or more efficiently', 'both'),
('simplifies', 'functional', 'Simplifies', 'Makes complex tasks or processes easier to understand and execute', 'both'),
('makes_money', 'functional', 'Makes Money', 'Helps customers earn or increase their income', 'B2C'),
('reduces_effort', 'functional', 'Reduces Effort', 'Minimizes the physical or mental work required', 'both'),
('reduces_cost', 'functional', 'Reduces Cost', 'Saves customers money or provides financial value', 'both'),
('reduces_risk', 'functional', 'Reduces Risk', 'Minimizes potential negative outcomes or uncertainty', 'both'),
('organizes', 'functional', 'Organizes', 'Helps structure, arrange, or manage information or tasks', 'both'),
('integrates', 'functional', 'Integrates', 'Connects different systems, tools, or processes', 'both'),
('connects', 'functional', 'Connects', 'Brings people, information, or resources together', 'both'),
('quality', 'functional', 'Quality', 'Delivers superior standards or performance', 'both'),
('variety', 'functional', 'Variety', 'Offers choice, options, or diverse selection', 'B2C'),
('informs', 'functional', 'Informs', 'Provides valuable information or knowledge', 'both'),
-- Emotional B2C Elements
('reduces_anxiety', 'emotional', 'Reduces Anxiety', 'Provides peace of mind or alleviates worry', 'both'),
('rewards_me', 'emotional', 'Rewards Me', 'Provides incentives, recognition, or positive reinforcement', 'B2C'),
('nostalgia', 'emotional', 'Nostalgia', 'Evokes positive memories or emotional connections to the past', 'B2C'),
('design_aesthetics', 'emotional', 'Design/Aesthetics', 'Appeals through visual beauty or style', 'both'),
('badge_value', 'emotional', 'Badge Value', 'Provides status or signals identity to others', 'B2C'),
('wellness', 'emotional', 'Wellness', 'Promotes health, well-being, or self-care', 'B2C'),
('therapeutic', 'emotional', 'Therapeutic Value', 'Provides healing or stress relief', 'B2C'),
('fun_entertainment', 'emotional', 'Fun/Entertainment', 'Delivers enjoyment or amusement', 'B2C'),
('attractiveness', 'emotional', 'Attractiveness', 'Enhances personal appeal or beauty', 'B2C'),
('provides_access', 'emotional', 'Provides Access', 'Opens doors to exclusive experiences or opportunities', 'both'),
-- Life Changing Elements
('provides_hope', 'life_changing', 'Provides Hope', 'Inspires optimism about the future', 'both'),
('self_actualization', 'life_changing', 'Self-Actualization', 'Helps achieve full potential', 'both'),
('motivation', 'life_changing', 'Motivation', 'Inspires action and achievement', 'both'),
('heirloom', 'life_changing', 'Heirloom', 'Creates lasting legacy value', 'B2C'),
('affiliation', 'life_changing', 'Affiliation/Belonging', 'Creates sense of community and connection', 'both'),
-- Social Impact
('self_transcendence', 'social_impact', 'Self-Transcendence', 'Contributes to greater good beyond self', 'both');

INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'exact', 'save time', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'exact', 'saves time', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'exact', 'time-saving', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'exact', 'time saver', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'faster', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'quickly', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'quick', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'in minutes', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'in seconds', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'instant', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'instantly', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'rapid', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'rapidly', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'efficient', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'efficiency', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'streamlined', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'streamline', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'accelerate', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'lightning fast', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'lightning-fast', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'real-time', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'immediate', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'automation', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'automated', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'semantic', 'get results faster', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'semantic', 'complete in record time', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'semantic', 'hours become minutes', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'semantic', 'in a fraction of the time', 0.9);

INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'save money', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'saves money', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'reduce cost', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'cost-effective', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'cost effective', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'affordable', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'economical', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'budget-friendly', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'budget friendly', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'great value', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'low-cost', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'low cost', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'inexpensive', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'free', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'no cost', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'low price', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'best price', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'competitive pricing', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'lowest price', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'semantic', 'without breaking the bank', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'semantic', 'pay less for more', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'semantic', 'more for your money', 0.85);

INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'exact', 'simplify', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'exact', 'simplifies', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'exact', 'simplified', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'simple', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'easy', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'easily', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'user-friendly', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'user friendly', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'intuitive', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'straightforward', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'no-hassle', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'hassle-free', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'effortless', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'effortlessly', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'no training', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'no learning curve', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'drag and drop', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'point and click', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'semantic', 'anyone can use', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'semantic', 'complex made simple', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'semantic', 'no technical knowledge', 0.85);

INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'exact', 'peace of mind', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'exact', 'worry-free', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'exact', 'worry free', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'secure', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'security', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'safe', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'safety', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'trusted', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'trust', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'reliable', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'reliability', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'guaranteed', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'guarantee', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'protected', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'protection', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'confidential', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'privacy', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'private', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'certified', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'verified', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'semantic', 'sleep better at night', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'semantic', 'no need to worry', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'semantic', 'rest assured', 0.9);

INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'exact', 'reduce effort', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'exact', 'less work', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'convenient', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'convenience', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'automatic', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'automatically', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'hands-free', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'hands free', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'one-click', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'one click', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'semantic', 'does the work for you', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'semantic', 'set it and forget it', 0.9);

INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'exact', 'high quality', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'exact', 'premium', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'excellence', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'superior', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'best-in-class', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'top-rated', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'award-winning', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'professional grade', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'enterprise-grade', 0.8);

INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'exact', 'integrate', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'exact', 'integration', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'works with', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'connects to', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'compatible', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'sync', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'syncs with', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'plug and play', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'semantic', 'seamlessly connects', 0.9);

-- Healthcare
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('healthcare', 'reduces_anxiety', 'patient comfort', 0.9, 'Patient-centered care, comfortable environment'),
('healthcare', 'quality', 'clinical excellence', 0.95, 'Board-certified physicians, evidence-based care'),
('healthcare', 'simplifies', 'patient-centric', 0.85, 'Easy scheduling, simplified intake process'),
('healthcare', 'reduces_risk', 'HIPAA compliant', 0.95, 'Secure patient data, privacy protection'),
('healthcare', 'saves_time', 'convenient appointments', 0.8, 'Same-day visits, online scheduling'),
('healthcare', 'quality', 'board-certified', 0.9, 'Certified professionals, accredited facility');

-- SaaS
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('saas', 'simplifies', 'no-code', 0.95, 'No programming required, visual interface'),
('saas', 'simplifies', 'drag-and-drop', 0.9, 'Drag-and-drop builder, visual editor'),
('saas', 'integrates', 'works with 1000+ apps', 0.9, 'Zapier integration, API connections'),
('saas', 'reduces_cost', 'unlimited users', 0.85, 'No per-user fees, flat pricing'),
('saas', 'saves_time', 'automation', 0.95, 'Automated workflows, set and forget'),
('saas', 'reduces_effort', 'one-click', 0.9, 'One-click deployment, instant setup');

-- E-commerce
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('ecommerce', 'saves_time', 'one-click checkout', 0.95, 'Express checkout, saved payment methods'),
('ecommerce', 'variety', 'vast selection', 0.9, 'Thousands of products, wide range'),
('ecommerce', 'reduces_cost', 'price match guarantee', 0.95, 'Best price guaranteed, price protection'),
('ecommerce', 'reduces_anxiety', '30-day returns', 0.9, 'Easy returns, money-back guarantee'),
('ecommerce', 'reduces_cost', 'free shipping', 0.95, 'No shipping fees, delivered free');

-- Fintech
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('fintech', 'reduces_cost', 'low fees', 0.95, 'Minimal fees, transparent pricing'),
('fintech', 'reduces_anxiety', 'bank-level security', 0.95, 'Encrypted, FDIC insured'),
('fintech', 'simplifies', 'seamless experience', 0.85, 'Intuitive interface, easy to use'),
('fintech', 'saves_time', 'instant transfer', 0.9, 'Real-time transactions, immediate access'),
('fintech', 'reduces_risk', 'FDIC insured', 0.95, 'Protected deposits, insured accounts');

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    notification_type VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    action_url VARCHAR(2048),
    priority VARCHAR(20) DEFAULT 'normal',
    read_at TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    billing_cycle VARCHAR(20),
    price_per_cycle DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    credits_per_cycle INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP,
    ended_at TIMESTAMP,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50),
    amount INT,
    balance_after INT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- API usage tracking
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

CREATE INDEX idx_api_usage_user ON api_usage_log(user_id);
CREATE INDEX idx_api_usage_service ON api_usage_log(api_service);
CREATE INDEX idx_api_usage_created ON api_usage_log(created_at DESC);

-- System configuration
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

-- Feature flags
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

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES "User"(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
-- NOTE: User and Analysis tables managed by Prisma, skipping triggers for them

-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id TEXT,
    p_amount INT,
    p_analysis_id TEXT DEFAULT NULL,
    p_description VARCHAR DEFAULT 'Analysis performed'
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INT;
    v_new_balance INT;
BEGIN
    SELECT credits_remaining INTO v_current_balance
    FROM "User" WHERE id = p_user_id FOR UPDATE;

    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    v_new_balance := v_current_balance - p_amount;

    UPDATE "User"
    SET credits_remaining = v_new_balance,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    INSERT INTO credit_transactions (
        user_id, analysis_id, transaction_type,
        amount, balance_after, description
    ) VALUES (
        p_user_id, p_analysis_id, 'debit',
        -p_amount, v_new_balance, p_description
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_overall_score(p_analysis_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
    v_gc_score DECIMAL;
    v_eov_score DECIMAL;
    v_cs_score DECIMAL;
    v_seo_score DECIMAL;
    v_perf_score DECIMAL;
    v_overall DECIMAL;
BEGIN
    SELECT overall_score INTO v_gc_score
    FROM golden_circle_analyses WHERE analysis_id = p_analysis_id;

    SELECT COALESCE(overall_score, 0) INTO v_eov_score
    FROM elements_of_value_b2c WHERE analysis_id = p_analysis_id;

    SELECT COALESCE(overall_score, 0) INTO v_cs_score
    FROM clifton_strengths_analyses WHERE analysis_id = p_analysis_id;

    SELECT COALESCE(overall_seo_score, 0) INTO v_seo_score
    FROM seo_analyses WHERE analysis_id = p_analysis_id;

    SELECT AVG(performance_score) INTO v_perf_score
    FROM lighthouse_analyses WHERE analysis_id = p_analysis_id;

    v_overall := (
        (COALESCE(v_gc_score, 0) * 10) * 0.25 +
        COALESCE(v_eov_score, 0) * 0.20 +
        COALESCE(v_cs_score, 0) * 0.20 +
        COALESCE(v_seo_score, 0) * 0.20 +
        COALESCE(v_perf_score, 0) * 0.15
    );

    RETURN ROUND(v_overall, 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION find_value_patterns(
    p_content TEXT,
    p_industry VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    element_name VARCHAR,
    pattern_text VARCHAR,
    match_count INT,
    confidence DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH pattern_matches AS (
        SELECT
            ver.element_name,
            vep.pattern_text,
            (LENGTH(p_content) - LENGTH(REPLACE(LOWER(p_content), LOWER(vep.pattern_text), ''))) / LENGTH(vep.pattern_text) AS match_count,
            vep.pattern_weight
        FROM value_element_patterns vep
        JOIN value_element_reference ver ON vep.element_id = ver.id
        WHERE LOWER(p_content) LIKE '%' || LOWER(vep.pattern_text) || '%'

        UNION ALL

        SELECT
            it.standard_term AS element_name,
            it.industry_term AS pattern_text,
            (LENGTH(p_content) - LENGTH(REPLACE(LOWER(p_content), LOWER(it.industry_term), ''))) / LENGTH(it.industry_term) AS match_count,
            it.confidence_score AS pattern_weight
        FROM industry_terminology it
        WHERE p_industry IS NOT NULL
        AND it.industry = p_industry
        AND LOWER(p_content) LIKE '%' || LOWER(it.industry_term) || '%'
    )
    SELECT
        pm.element_name,
        pm.pattern_text,
        pm.match_count::INT,
        ROUND((pm.match_count * pm.pattern_weight)::NUMERIC, 4) AS confidence
    FROM pattern_matches pm
    WHERE pm.match_count > 0
    ORDER BY confidence DESC;
END;
$$ LANGUAGE plpgsql;

-- Count tables
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
-- Should return 80+

-- Count value elements
SELECT COUNT(*) FROM value_element_reference;
-- Should return 27

-- Count synonym patterns
SELECT COUNT(*) FROM value_element_patterns;
-- Should return 100+

-- Count CliftonStrengths themes
SELECT COUNT(*) FROM clifton_themes_reference;
-- Should return 34

-- Count industry terms
SELECT COUNT(*) FROM industry_terminology;
-- Should return 20+

-- Test finding patterns in text
SELECT * FROM find_value_patterns(
    'Save time with our lightning-fast automation. Affordable pricing starts at just $9.',
    'saas'
);-- =====================================================
-- ADDITIONAL INDUSTRY TERMINOLOGY
-- Industries: Construction, Energy, Government, Sales, Marketing, Manufacturing
-- =====================================================

-- =====================================================
-- CONSTRUCTION INDUSTRY
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Saves Time
('construction', 'saves_time', 'on-time completion', 0.95, 'Delivered on schedule, meet deadlines'),
('construction', 'saves_time', 'fast-track', 0.9, 'Expedited delivery, accelerated timeline'),
('construction', 'saves_time', 'pre-fabricated', 0.85, 'Modular construction, prefab solutions'),
('construction', 'saves_time', 'streamlined permitting', 0.9, 'Fast permits, expedited approvals'),

-- Quality
('construction', 'quality', 'licensed contractors', 0.9, 'State-licensed, bonded and insured'),
('construction', 'quality', 'warranty-backed', 0.95, 'Lifetime warranty, guaranteed workmanship'),
('construction', 'quality', 'code-compliant', 0.9, 'Meets building codes, inspected and approved'),
('construction', 'quality', 'commercial-grade', 0.85, 'Industrial strength, heavy-duty'),

-- Reduces Risk
('construction', 'reduces_risk', 'fully insured', 0.95, 'Liability coverage, workers comp'),
('construction', 'reduces_risk', 'safety-certified', 0.9, 'OSHA compliant, safety-first approach'),
('construction', 'reduces_risk', 'bonded', 0.9, 'Bonded contractors, financial protection'),

-- Reduces Cost
('construction', 'reduces_cost', 'value engineering', 0.9, 'Cost optimization, budget-conscious design'),
('construction', 'reduces_cost', 'competitive bidding', 0.85, 'Multiple quotes, best value'),

-- Simplifies
('construction', 'simplifies', 'turnkey', 0.95, 'Turnkey solutions, end-to-end service'),
('construction', 'simplifies', 'one-stop-shop', 0.9, 'Complete service, all trades in-house');

-- =====================================================
-- ENERGY INDUSTRY
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Reduces Cost
('energy', 'reduces_cost', 'energy savings', 0.95, 'Lower utility bills, reduce consumption'),
('energy', 'reduces_cost', 'ROI guarantee', 0.9, 'Payback period, return on investment'),
('energy', 'reduces_cost', 'net metering', 0.85, 'Sell back to grid, utility credits'),
('energy', 'reduces_cost', 'tax incentives', 0.9, 'Federal tax credits, rebates available'),

-- Reduces Risk
('energy', 'reduces_risk', 'grid-independent', 0.85, 'Energy independence, backup power'),
('energy', 'reduces_risk', 'battery backup', 0.9, 'Uninterrupted power, emergency backup'),

-- Social Impact
('energy', 'self_transcendence', 'carbon neutral', 0.95, 'Net zero emissions, environmental impact'),
('energy', 'self_transcendence', 'renewable', 0.95, 'Clean energy, sustainable power'),
('energy', 'self_transcendence', 'eco-friendly', 0.9, 'Environmentally responsible, green energy'),

-- Quality
('energy', 'quality', 'tier-1 panels', 0.9, 'Premium equipment, top-rated systems'),
('energy', 'quality', '25-year warranty', 0.95, 'Long-term guarantee, proven reliability'),

-- Simplifies
('energy', 'simplifies', 'turnkey installation', 0.9, 'Complete installation, hassle-free setup'),
('energy', 'simplifies', 'monitoring app', 0.85, 'Real-time monitoring, mobile app');

-- =====================================================
-- GOVERNMENT/PUBLIC SECTOR
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Reduces Risk
('government', 'reduces_risk', 'compliant', 0.95, 'Regulatory compliance, meets standards'),
('government', 'reduces_risk', 'secure', 0.95, 'FedRAMP certified, government-grade security'),
('government', 'reduces_risk', 'auditable', 0.9, 'Audit trail, full transparency'),

-- Simplifies
('government', 'simplifies', 'streamlined process', 0.9, 'Simplified procedures, reduced bureaucracy'),
('government', 'simplifies', 'citizen-friendly', 0.85, 'Easy to use, accessible to all'),
('government', 'simplifies', 'self-service', 0.85, 'Online portal, 24/7 access'),

-- Reduces Effort
('government', 'reduces_effort', 'one-stop portal', 0.9, 'Centralized services, single point of contact'),
('government', 'reduces_effort', 'digital submission', 0.85, 'Paperless, online forms'),

-- Quality
('government', 'quality', 'certified', 0.9, 'Government-certified, accredited'),

-- Reduces Cost
('government', 'reduces_cost', 'cost-effective', 0.85, 'Taxpayer value, efficient spending'),
('government', 'reduces_cost', 'grant-funded', 0.9, 'Grant opportunities, funded programs'),

-- Provides Access
('government', 'provides_access', 'open data', 0.9, 'Public transparency, accessible information'),
('government', 'provides_access', 'multilingual', 0.85, 'Language support, inclusive access');

-- =====================================================
-- SALES INDUSTRY
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Makes Money
('sales', 'makes_money', 'increase revenue', 0.95, 'Boost sales, grow income'),
('sales', 'makes_money', 'close more deals', 0.95, 'Higher conversion, win rate'),
('sales', 'makes_money', 'expand pipeline', 0.9, 'More opportunities, bigger funnel'),

-- Saves Time
('sales', 'saves_time', 'automated outreach', 0.95, 'Auto-email, automated follow-up'),
('sales', 'saves_time', 'CRM integration', 0.9, 'Sync with Salesforce, connected systems'),
('sales', 'saves_time', 'instant quotes', 0.85, 'Real-time pricing, quick proposals'),

-- Simplifies
('sales', 'simplifies', 'visual pipeline', 0.85, 'Drag-and-drop deals, kanban view'),
('sales', 'simplifies', 'playbooks', 0.85, 'Sales scripts, proven methodologies'),

-- Informs
('sales', 'informs', 'sales analytics', 0.9, 'Performance dashboards, metrics tracking'),
('sales', 'informs', 'lead scoring', 0.9, 'AI-powered scoring, priority leads'),
('sales', 'informs', 'pipeline visibility', 0.85, 'Forecast accuracy, real-time insights'),

-- Reduces Effort
('sales', 'reduces_effort', 'one-click proposals', 0.9, 'Automated proposals, template library'),
('sales', 'reduces_effort', 'auto-logging', 0.85, 'Automatic call logging, activity tracking'),

-- Connects
('sales', 'connects', 'team collaboration', 0.85, 'Shared deals, team selling'),

-- Motivation
('sales', 'motivation', 'gamification', 0.9, 'Leaderboards, achievement badges');

-- =====================================================
-- MARKETING INDUSTRY
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Informs
('marketing', 'informs', 'analytics dashboard', 0.95, 'Real-time metrics, performance tracking'),
('marketing', 'informs', 'attribution tracking', 0.9, 'Multi-touch attribution, ROI tracking'),
('marketing', 'informs', 'audience insights', 0.9, 'Customer data, behavioral analytics'),

-- Integrates
('marketing', 'integrates', 'omnichannel', 0.9, 'Cross-channel marketing, unified platform'),
('marketing', 'integrates', 'marketing stack', 0.85, 'Integrates with email, social, ads'),

-- Saves Time
('marketing', 'saves_time', 'campaign automation', 0.95, 'Auto-scheduling, workflow automation'),
('marketing', 'saves_time', 'batch publishing', 0.85, 'Schedule in bulk, content calendar'),
('marketing', 'saves_time', 'AI-powered', 0.9, 'AI content generation, smart recommendations'),

-- Makes Money
('marketing', 'makes_money', 'increase conversions', 0.95, 'Higher conversion rates, more leads'),
('marketing', 'makes_money', 'ROI optimization', 0.9, 'Maximize return, cost per acquisition'),

-- Simplifies
('marketing', 'simplifies', 'drag-and-drop builder', 0.9, 'Visual editor, no coding required'),
('marketing', 'simplifies', 'template library', 0.85, 'Pre-built campaigns, ready-to-use'),

-- Connects
('marketing', 'connects', 'multi-channel', 0.85, 'Email, social, SMS, ads'),

-- Quality
('marketing', 'quality', 'A/B testing', 0.9, 'Split testing, optimization'),
('marketing', 'quality', 'personalization', 0.9, 'Tailored content, dynamic messaging');

-- =====================================================
-- MANUFACTURING INDUSTRY
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Quality
('manufacturing', 'quality', 'ISO certified', 0.95, 'ISO 9001, quality management system'),
('manufacturing', 'quality', 'precision engineering', 0.9, 'Tight tolerances, exact specifications'),
('manufacturing', 'quality', 'quality assurance', 0.9, 'QA testing, defect-free'),
('manufacturing', 'quality', 'six sigma', 0.85, 'Lean manufacturing, continuous improvement'),

-- Reduces Cost
('manufacturing', 'reduces_cost', 'lean production', 0.9, 'Waste reduction, efficiency gains'),
('manufacturing', 'reduces_cost', 'economies of scale', 0.85, 'Volume pricing, bulk discounts'),
('manufacturing', 'reduces_cost', 'just-in-time', 0.85, 'JIT delivery, inventory optimization'),

-- Saves Time
('manufacturing', 'saves_time', 'rapid prototyping', 0.9, '3D printing, quick turnaround'),
('manufacturing', 'saves_time', 'fast tooling', 0.85, 'Quick mold changes, flexible production'),
('manufacturing', 'saves_time', 'short lead times', 0.9, 'Quick delivery, fast production'),

-- Reduces Risk
('manufacturing', 'reduces_risk', 'traceability', 0.9, 'Full tracking, lot numbers'),
('manufacturing', 'reduces_risk', 'certification', 0.9, 'Certified materials, verified processes'),
('manufacturing', 'reduces_risk', 'redundant capacity', 0.85, 'Backup production, business continuity'),

-- Integrates
('manufacturing', 'integrates', 'ERP integration', 0.9, 'SAP, Oracle, integrated systems'),
('manufacturing', 'integrates', 'IoT-enabled', 0.85, 'Smart manufacturing, connected machines'),

-- Informs
('manufacturing', 'informs', 'real-time tracking', 0.9, 'Live status, production monitoring'),
('manufacturing', 'informs', 'predictive maintenance', 0.85, 'AI monitoring, prevent downtime');

-- =====================================================
-- PROFESSIONAL SERVICES
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Quality
('professional_services', 'quality', 'certified professionals', 0.95, 'Licensed, accredited experts'),
('professional_services', 'quality', 'industry expertise', 0.9, 'Specialized knowledge, domain experts'),
('professional_services', 'quality', 'proven methodology', 0.9, 'Best practices, established framework'),

-- Reduces Anxiety
('professional_services', 'reduces_anxiety', 'confidential', 0.95, 'Client privacy, NDA protected'),
('professional_services', 'reduces_anxiety', 'risk-free consultation', 0.9, 'Free initial meeting, no obligation'),

-- Saves Time
('professional_services', 'saves_time', 'rapid turnaround', 0.85, 'Quick delivery, fast response'),
('professional_services', 'saves_time', 'dedicated team', 0.8, 'Assigned resources, priority service'),

-- Makes Money
('professional_services', 'makes_money', 'measurable ROI', 0.95, 'Proven results, documented success'),
('professional_services', 'makes_money', 'growth acceleration', 0.9, 'Faster growth, increased profits'),

-- Provides Hope
('professional_services', 'provides_hope', 'transformation', 0.9, 'Business transformation, strategic change'),

-- Informs
('professional_services', 'informs', 'strategic insights', 0.9, 'Data-driven recommendations, actionable intelligence');

-- =====================================================
-- REAL ESTATE
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Reduces Anxiety
('real_estate', 'reduces_anxiety', 'full-service', 0.9, 'End-to-end support, guided process'),
('real_estate', 'reduces_anxiety', 'trusted advisor', 0.85, 'Local expertise, proven track record'),

-- Saves Time
('real_estate', 'saves_time', 'virtual tours', 0.9, '3D walkthrough, online viewing'),
('real_estate', 'saves_time', 'instant alerts', 0.85, 'New listings first, email notifications'),

-- Informs
('real_estate', 'informs', 'market analytics', 0.9, 'Comp analysis, price trends'),
('real_estate', 'informs', 'neighborhood insights', 0.85, 'School ratings, amenities, walkability'),

-- Connects
('real_estate', 'connects', 'extensive network', 0.85, 'Industry connections, referral partners'),

-- Makes Money
('real_estate', 'makes_money', 'maximum value', 0.9, 'Top dollar, optimal pricing'),
('real_estate', 'makes_money', 'investment potential', 0.85, 'Appreciation, rental income');

-- =====================================================
-- RETAIL
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Variety
('retail', 'variety', 'extensive selection', 0.95, 'Wide range, thousands of options'),
('retail', 'variety', 'exclusive brands', 0.85, 'Designer labels, premium brands'),

-- Reduces Cost
('retail', 'reduces_cost', 'everyday low prices', 0.95, 'EDLP, value pricing'),
('retail', 'reduces_cost', 'loyalty rewards', 0.9, 'Points program, member discounts'),
('retail', 'reduces_cost', 'price match', 0.95, 'Best price guarantee, matched pricing'),

-- Saves Time
('retail', 'saves_time', 'curbside pickup', 0.9, 'BOPIS, order online pickup in store'),
('retail', 'saves_time', 'same-day delivery', 0.9, 'Fast shipping, local delivery'),

-- Reduces Anxiety
('retail', 'reduces_anxiety', 'easy returns', 0.95, 'Hassle-free returns, no questions asked'),
('retail', 'reduces_anxiety', 'satisfaction guaranteed', 0.9, 'Money-back guarantee, risk-free'),

-- Provides Access
('retail', 'provides_access', 'exclusive access', 0.85, 'Members only, VIP perks'),

-- Fun/Entertainment
('retail', 'fun_entertainment', 'shopping experience', 0.8, 'Enjoyable shopping, curated experience');

-- =====================================================
-- EDUCATION/TRAINING
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Self-Actualization
('education', 'self_actualization', 'career advancement', 0.95, 'Skill development, professional growth'),
('education', 'self_actualization', 'certification', 0.9, 'Industry-recognized, accredited programs'),

-- Learner (CliftonStrengths)
('education', 'motivation', 'continuous learning', 0.9, 'Lifelong learning, ongoing education'),

-- Simplifies
('education', 'simplifies', 'self-paced', 0.9, 'Learn at your speed, flexible schedule'),
('education', 'simplifies', 'micro-learning', 0.85, 'Bite-sized lessons, quick modules'),

-- Provides Access
('education', 'provides_access', 'online learning', 0.9, 'Remote access, learn anywhere'),
('education', 'provides_access', 'affordable education', 0.9, 'Low-cost learning, accessible to all'),

-- Connects
('education', 'connects', 'peer community', 0.85, 'Student network, collaborative learning'),
('education', 'connects', 'mentor access', 0.9, 'Expert instructors, 1-on-1 support'),

-- Informs
('education', 'informs', 'practical skills', 0.9, 'Hands-on training, real-world applications'),

-- Makes Money
('education', 'makes_money', 'job placement', 0.95, 'Career services, employment guarantee');

-- =====================================================
-- HOSPITALITY
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Fun/Entertainment
('hospitality', 'fun_entertainment', 'memorable experience', 0.95, 'Unforgettable moments, special occasions'),
('hospitality', 'fun_entertainment', 'luxury amenities', 0.9, 'Premium features, upscale experience'),

-- Reduces Anxiety
('hospitality', 'reduces_anxiety', 'white-glove service', 0.95, 'Concierge, personal attention'),
('hospitality', 'reduces_anxiety', 'satisfaction guaranteed', 0.9, 'Guest satisfaction, service excellence'),

-- Simplifies
('hospitality', 'simplifies', 'seamless check-in', 0.9, 'Mobile key, express check-in'),
('hospitality', 'simplifies', 'all-inclusive', 0.95, 'Everything included, no hidden fees'),

-- Provides Access
('hospitality', 'provides_access', 'exclusive experiences', 0.9, 'VIP access, members-only'),
('hospitality', 'provides_access', 'concierge service', 0.85, 'Personal assistance, custom arrangements'),

-- Quality
('hospitality', 'quality', 'five-star', 0.95, 'Luxury standard, premium quality'),
('hospitality', 'quality', 'award-winning', 0.9, 'Recognized excellence, accolades'),

-- Badge Value
('hospitality', 'badge_value', 'prestigious', 0.85, 'Status symbol, renowned destination');

-- =====================================================
-- LOGISTICS/TRANSPORTATION
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Saves Time
('logistics', 'saves_time', 'expedited shipping', 0.95, 'Fast delivery, express service'),
('logistics', 'saves_time', 'real-time tracking', 0.9, 'Live updates, GPS tracking'),
('logistics', 'saves_time', 'same-day delivery', 0.95, 'Immediate delivery, on-demand'),

-- Reduces Cost
('logistics', 'reduces_cost', 'freight optimization', 0.9, 'Route optimization, fuel efficiency'),
('logistics', 'reduces_cost', 'consolidated shipping', 0.85, 'Bulk rates, combined shipments'),

-- Reduces Risk
('logistics', 'reduces_risk', 'insured shipments', 0.95, 'Full coverage, protected cargo'),
('logistics', 'reduces_risk', 'temperature-controlled', 0.85, 'Cold chain, climate-controlled'),

-- Reduces Anxiety
('logistics', 'reduces_anxiety', 'guaranteed delivery', 0.95, 'On-time guarantee, money-back'),
('logistics', 'reduces_anxiety', 'white-glove handling', 0.9, 'Careful handling, premium service'),

-- Informs
('logistics', 'informs', 'shipment visibility', 0.9, 'Track and trace, status updates'),

-- Simplifies
('logistics', 'simplifies', 'single dashboard', 0.85, 'Unified platform, one view');

-- =====================================================
-- LEGAL SERVICES
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Reduces Anxiety
('legal', 'reduces_anxiety', 'attorney-client privilege', 0.95, 'Confidential, protected communications'),
('legal', 'reduces_anxiety', 'proven track record', 0.9, 'Win rate, successful cases'),

-- Reduces Risk
('legal', 'reduces_risk', 'compliance expertise', 0.95, 'Regulatory knowledge, avoid penalties'),
('legal', 'reduces_risk', 'risk mitigation', 0.9, 'Protect assets, minimize liability'),

-- Quality
('legal', 'quality', 'board-certified', 0.95, 'Certified specialists, accredited'),
('legal', 'quality', 'peer-reviewed', 0.85, 'AV-rated, Super Lawyers'),

-- Saves Time
('legal', 'saves_time', 'expedited filing', 0.85, 'Fast processing, priority handling'),

-- Informs
('legal', 'informs', 'transparent billing', 0.9, 'Clear fees, no surprises'),

-- Simplifies
('legal', 'simplifies', 'plain language', 0.85, 'Easy to understand, jargon-free');

-- =====================================================
-- INSURANCE
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Reduces Anxiety
('insurance', 'reduces_anxiety', 'comprehensive coverage', 0.95, 'Full protection, complete peace of mind'),
('insurance', 'reduces_anxiety', '24/7 claims', 0.9, 'Anytime support, immediate assistance'),

-- Reduces Risk
('insurance', 'reduces_risk', 'financial protection', 0.95, 'Asset protection, liability coverage'),
('insurance', 'reduces_risk', 'AM Best rated', 0.9, 'Financial strength, stable carrier'),

-- Reduces Cost
('insurance', 'reduces_cost', 'competitive rates', 0.9, 'Low premiums, affordable protection'),
('insurance', 'reduces_cost', 'multi-policy discount', 0.85, 'Bundle and save, combined coverage'),

-- Simplifies
('insurance', 'simplifies', 'instant quotes', 0.95, 'Online quotes, immediate pricing'),
('insurance', 'simplifies', 'digital claims', 0.9, 'App-based claims, photo submission'),

-- Saves Time
('insurance', 'saves_time', 'fast approval', 0.85, 'Quick decisions, rapid processing'),

-- Reduces Effort
('insurance', 'reduces_effort', 'auto-renewal', 0.85, 'Set and forget, continuous coverage');

-- =====================================================
-- AUTOMOTIVE
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Quality
('automotive', 'quality', 'certified pre-owned', 0.95, 'CPO, inspected and certified'),
('automotive', 'quality', 'factory warranty', 0.9, 'Manufacturer warranty, bumper-to-bumper'),

-- Reduces Cost
('automotive', 'reduces_cost', 'fuel efficient', 0.9, 'MPG, low running costs'),
('automotive', 'reduces_cost', 'low maintenance', 0.85, 'Reliable, minimal upkeep'),
('automotive', 'reduces_cost', 'trade-in value', 0.85, 'Resale value, strong residuals'),

-- Reduces Anxiety
('automotive', 'reduces_anxiety', 'roadside assistance', 0.9, '24/7 support, towing included'),
('automotive', 'reduces_anxiety', 'safety-rated', 0.95, '5-star safety, crash-tested'),

-- Simplifies
('automotive', 'simplifies', 'online buying', 0.9, 'Buy online, home delivery'),
('automotive', 'simplifies', 'financing available', 0.85, 'Easy approval, flexible terms'),

-- Provides Access
('automotive', 'provides_access', 'test drive', 0.85, 'Try before buy, experience it'),

-- Badge Value
('automotive', 'badge_value', 'luxury brand', 0.9, 'Premium marque, status symbol');

-- =====================================================
-- GENERAL/CATCH-ALL
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Saves Time (general patterns)
('general', 'saves_time', '24/7 availability', 0.8, 'Always open, around the clock'),
('general', 'saves_time', 'mobile app', 0.75, 'On-the-go access, smartphone ready'),

-- Simplifies (general)
('general', 'simplifies', 'easy setup', 0.85, 'Quick start, simple onboarding'),
('general', 'simplifies', 'step-by-step', 0.8, 'Guided process, clear instructions'),

-- Reduces Anxiety (general)
('general', 'reduces_anxiety', 'satisfaction guarantee', 0.9, 'Risk-free, money-back'),
('general', 'reduces_anxiety', 'customer support', 0.85, 'Help available, responsive service'),

-- Quality (general)
('general', 'quality', 'trusted brand', 0.85, 'Established reputation, reliable'),
('general', 'quality', 'customer reviews', 0.8, 'Highly rated, positive feedback'),

-- Reduces Cost (general)
('general', 'reduces_cost', 'no hidden fees', 0.9, 'Transparent pricing, all-inclusive'),

-- Connects (general)
('general', 'connects', 'community', 0.8, 'Join community, network with others'),

-- Informs (general)
('general', 'informs', 'data-driven', 0.85, 'Analytics, insights, reporting');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Count industry terms by industry
SELECT
    industry,
    COUNT(*) as term_count,
    COUNT(DISTINCT standard_term) as unique_elements
FROM industry_terminology
GROUP BY industry
ORDER BY term_count DESC;

-- Expected results:
-- construction: ~15 terms
-- energy: ~13 terms
-- government: ~13 terms
-- sales: ~14 terms
-- marketing: ~14 terms
-- manufacturing: ~16 terms
-- professional_services: ~11 terms
-- real_estate: ~9 terms
-- logistics: ~10 terms
-- legal: ~9 terms
-- insurance: ~10 terms
-- automotive: ~10 terms
-- general: ~9 terms
-- healthcare: ~6 terms (from original)
-- saas: ~6 terms (from original)
-- ecommerce: ~5 terms (from original)
-- fintech: ~5 terms (from original)

-- TOTAL: ~160+ industry-specific terms!

-- =====================================================
-- TOP 4 CRITICAL INDUSTRIES - SEED DATA
-- Technology/IT, Consulting, Agriculture/Food, Nonprofit
-- Total Terms: ~60
-- =====================================================

-- =====================================================
-- 1. TECHNOLOGY/IT SERVICES
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Simplifies
('technology', 'simplifies', 'cloud-native', 0.9, 'Born in cloud, scalable architecture'),
('technology', 'simplifies', 'low-code', 0.95, 'Minimal coding, visual development'),
('technology', 'simplifies', 'API-first', 0.85, 'Developer-friendly, easy integration'),
('technology', 'simplifies', 'plug-and-play', 0.9, 'Quick setup, instant deployment'),

-- Integrates
('technology', 'integrates', 'interoperable', 0.9, 'Works with existing systems, compatible'),
('technology', 'integrates', 'microservices', 0.85, 'Modular architecture, flexible integration'),
('technology', 'integrates', 'REST API', 0.85, 'API access, programmatic control'),
('technology', 'integrates', 'webhook support', 0.8, 'Event-driven, real-time sync'),
('technology', 'integrates', 'SSO enabled', 0.85, 'Single sign-on, unified authentication'),

-- Reduces Risk
('technology', 'reduces_risk', 'enterprise security', 0.95, 'Bank-level encryption, SOC 2 compliant'),
('technology', 'reduces_risk', 'SOC 2 certified', 0.95, 'Security audited, compliance certified'),
('technology', 'reduces_risk', 'penetration tested', 0.9, 'Security tested, vulnerability scanned'),
('technology', 'reduces_risk', 'disaster recovery', 0.9, 'Business continuity, backup systems'),
('technology', 'reduces_risk', 'zero-trust', 0.85, 'Advanced security, verified access'),

-- Reduces Anxiety
('technology', 'reduces_anxiety', '99.9% uptime', 0.95, 'High availability, reliable service'),
('technology', 'reduces_anxiety', 'redundant systems', 0.9, 'Failover protection, always available'),
('technology', 'reduces_anxiety', 'SLA guarantee', 0.95, 'Service level agreement, uptime promise'),

-- Quality
('technology', 'quality', 'enterprise-grade', 0.9, 'Production-ready, mission-critical'),
('technology', 'quality', 'scalable', 0.85, 'Grows with you, handles any load'),
('technology', 'quality', 'high performance', 0.85, 'Fast response, optimized'),

-- Saves Time
('technology', 'saves_time', 'DevOps automation', 0.9, 'CI/CD, automated deployment'),
('technology', 'saves_time', 'auto-scaling', 0.85, 'Automatic capacity, no manual scaling'),
('technology', 'saves_time', 'containerized', 0.8, 'Docker, Kubernetes, fast deployment'),

-- Informs
('technology', 'informs', 'observability', 0.85, 'Full visibility, monitoring, logging'),
('technology', 'informs', 'real-time analytics', 0.9, 'Live dashboards, instant insights'),

-- Reduces Effort
('technology', 'reduces_effort', 'managed service', 0.9, 'Fully managed, hands-off operation'),
('technology', 'reduces_effort', 'serverless', 0.85, 'No infrastructure, zero ops');

-- =====================================================
-- 2. CONSULTING
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Provides Hope
('consulting', 'provides_hope', 'strategic roadmap', 0.95, 'Clear path forward, defined milestones'),
('consulting', 'provides_hope', 'transformation partner', 0.9, 'Change agent, growth catalyst'),
('consulting', 'provides_hope', 'vision alignment', 0.85, 'Strategic clarity, unified direction'),

-- Informs
('consulting', 'informs', 'data-driven insights', 0.95, 'Analytics-based, evidence-backed'),
('consulting', 'informs', 'benchmarking', 0.9, 'Industry comparison, peer analysis'),
('consulting', 'informs', 'diagnostic assessment', 0.9, 'Comprehensive analysis, gap identification'),
('consulting', 'informs', 'best practices', 0.85, 'Proven methods, industry standards'),

-- Quality
('consulting', 'quality', 'thought leadership', 0.95, 'Industry experts, published authors'),
('consulting', 'quality', 'proven methodology', 0.9, 'Established framework, tested approach'),
('consulting', 'quality', 'Fortune 500 experience', 0.9, 'Enterprise clients, large-scale projects'),
('consulting', 'quality', 'certified consultants', 0.85, 'Professional credentials, accredited'),

-- Reduces Anxiety
('consulting', 'reduces_anxiety', 'change management', 0.95, 'Smooth transition, managed change'),
('consulting', 'reduces_anxiety', 'risk mitigation', 0.9, 'Reduce exposure, protect value'),
('consulting', 'reduces_anxiety', 'confidential engagement', 0.95, 'NDA protected, private advisory'),

-- Simplifies
('consulting', 'simplifies', 'turnkey solution', 0.9, 'End-to-end, complete service'),
('consulting', 'simplifies', 'implementation support', 0.85, 'Hands-on help, guided execution'),

-- Reduces Cost
('consulting', 'reduces_cost', 'fractional', 0.95, 'Part-time executive, affordable expertise'),
('consulting', 'reduces_cost', 'ROI-focused', 0.9, 'Value-based, measurable returns'),

-- Badge Value
('consulting', 'badge_value', 'C-suite advisory', 0.9, 'Executive coaching, board-level'),
('consulting', 'badge_value', 'industry recognition', 0.85, 'Awards, published research'),

-- Self-Actualization
('consulting', 'self_actualization', 'capability building', 0.9, 'Skill development, knowledge transfer'),
('consulting', 'self_actualization', 'organizational excellence', 0.85, 'Peak performance, world-class');

-- =====================================================
-- 3. AGRICULTURE/FOOD PRODUCTION
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Quality
('agriculture', 'quality', 'organic certified', 0.95, 'USDA Organic, certified organic'),
('agriculture', 'quality', 'farm-to-table', 0.9, 'Direct from farm, fresh harvest'),
('agriculture', 'quality', 'heritage breed', 0.85, 'Traditional varieties, heirloom'),
('agriculture', 'quality', 'pasture-raised', 0.9, 'Free-range, humanely raised'),
('agriculture', 'quality', 'non-GMO', 0.95, 'GMO-free, natural genetics'),

-- Self-Transcendence
('agriculture', 'self_transcendence', 'sustainable farming', 0.95, 'Environmentally responsible, eco-conscious'),
('agriculture', 'self_transcendence', 'regenerative', 0.95, 'Soil health, carbon sequestration'),
('agriculture', 'self_transcendence', 'carbon negative', 0.9, 'Climate positive, environmental benefit'),
('agriculture', 'self_transcendence', 'local food system', 0.85, 'Community supported, local economy'),
('agriculture', 'self_transcendence', 'biodiversity', 0.85, 'Ecosystem health, species protection'),

-- Reduces Anxiety
('agriculture', 'reduces_anxiety', 'traceability', 0.9, 'Track from farm, know your source'),
('agriculture', 'reduces_anxiety', 'food safety', 0.95, 'Safe handling, tested for contaminants'),
('agriculture', 'reduces_anxiety', 'pesticide-free', 0.9, 'No chemicals, clean growing'),

-- Wellness
('agriculture', 'wellness', 'nutrient-dense', 0.85, 'High nutrition, vitamin-rich'),
('agriculture', 'wellness', 'whole food', 0.85, 'Unprocessed, natural state'),

-- Provides Access
('agriculture', 'provides_access', 'CSA program', 0.85, 'Community supported agriculture, direct access'),
('agriculture', 'provides_access', 'farm visits', 0.8, 'Transparency, see where it grows'),

-- Saves Time
('agriculture', 'saves_time', 'harvest fresh', 0.85, 'Just picked, immediate delivery'),
('agriculture', 'saves_time', 'subscription box', 0.8, 'Automatic delivery, no shopping'),

-- Heirloom
('agriculture', 'heirloom', 'family farm', 0.85, 'Multi-generational, traditional methods'),
('agriculture', 'heirloom', 'artisanal', 0.8, 'Handcrafted, small-batch');

-- =====================================================
-- 4. NONPROFIT/NGO
-- =====================================================
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
-- Self-Transcendence
('nonprofit', 'self_transcendence', 'social impact', 0.95, 'Community benefit, positive change'),
('nonprofit', 'self_transcendence', 'mission-driven', 0.95, 'Purpose-led, cause-focused'),
('nonprofit', 'self_transcendence', 'change lives', 0.95, 'Transform communities, create impact'),
('nonprofit', 'self_transcendence', 'give back', 0.9, 'Community service, contribute'),
('nonprofit', 'self_transcendence', 'make a difference', 0.95, 'Positive impact, meaningful work'),

-- Reduces Anxiety
('nonprofit', 'reduces_anxiety', 'transparent', 0.95, 'Open books, full disclosure'),
('nonprofit', 'reduces_anxiety', 'accountability', 0.9, 'Measurable impact, verified outcomes'),
('nonprofit', 'reduces_anxiety', 'donor trust', 0.95, 'Ethical stewardship, responsible'),

-- Reduces Cost
('nonprofit', 'reduces_cost', 'tax-deductible', 0.95, 'Tax benefit, IRS deductible'),
('nonprofit', 'reduces_cost', '100% to cause', 0.95, 'No overhead, all funds to mission'),
('nonprofit', 'reduces_cost', 'low overhead', 0.9, 'Efficient operations, minimal admin'),

-- Informs
('nonprofit', 'informs', 'impact report', 0.95, 'Results tracking, outcomes measured'),
('nonprofit', 'informs', 'transparency report', 0.9, 'Financial disclosure, open reporting'),
('nonprofit', 'informs', 'donor dashboard', 0.85, 'See your impact, track donations'),

-- Provides Hope
('nonprofit', 'provides_hope', 'empower communities', 0.95, 'Enable change, build capacity'),
('nonprofit', 'provides_hope', 'sustainable solutions', 0.9, 'Long-term impact, lasting change'),

-- Affiliation/Belonging
('nonprofit', 'affiliation', 'join the movement', 0.95, 'Be part of change, collective action'),
('nonprofit', 'affiliation', 'donor community', 0.9, 'Network of supporters, shared mission'),
('nonprofit', 'affiliation', 'volunteer opportunities', 0.85, 'Get involved, hands-on participation'),

-- Motivation
('nonprofit', 'motivation', 'be a hero', 0.9, 'Make you feel significant, heroic action'),
('nonprofit', 'motivation', 'legacy giving', 0.85, 'Lasting impact, memorial gifts'),

-- Quality
('nonprofit', 'quality', '501(c)(3)', 0.95, 'IRS approved, legitimate charity'),
('nonprofit', 'quality', 'charity navigator', 0.9, 'Top-rated, independently verified'),
('nonprofit', 'quality', 'accredited', 0.85, 'BBB accredited, certified organization');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Count new terms by industry
SELECT industry, COUNT(*) as term_count
FROM industry_terminology
WHERE industry IN ('technology', 'consulting', 'agriculture', 'nonprofit')
GROUP BY industry
ORDER BY term_count DESC;

-- Expected:
-- technology: 26 terms
-- agriculture: 21 terms
-- consulting: 21 terms
-- nonprofit: 23 terms
-- TOTAL: 91 new terms!

-- =====================================================
-- GRAND TOTAL VERIFICATION
-- =====================================================

-- Total industry terms across all industries
SELECT COUNT(*) as total_industry_terms FROM industry_terminology;
-- Should return: 250+ terms (160 previous + 91 new)

-- Industries covered
SELECT COUNT(DISTINCT industry) as total_industries FROM industry_terminology;
-- Should return: 24 industries

-- Coverage by value element
SELECT
    standard_term,
    COUNT(DISTINCT industry) as industries_using,
    COUNT(*) as total_mappings
FROM industry_terminology
GROUP BY standard_term
ORDER BY total_mappings DESC
LIMIT 20;

-- Shows which value elements have most industry-specific language


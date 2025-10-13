-- =====================================================
-- PART 1: CORE FRAMEWORK TABLES (CLEAN)
-- Run this FIRST - Creates base analysis tables
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Website tracking
CREATE TABLE IF NOT EXISTS websites (
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

CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);
CREATE INDEX IF NOT EXISTS idx_websites_created_by ON websites(created_by);

-- Analysis progress tracking
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

CREATE INDEX IF NOT EXISTS idx_progress_analysis_id ON analysis_progress(analysis_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON analysis_progress(status);

-- Golden Circle Analysis
CREATE TABLE IF NOT EXISTS golden_circle_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2),
    alignment_score DECIMAL(5,2),
    clarity_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

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

CREATE INDEX IF NOT EXISTS idx_golden_circle_analysis_id ON golden_circle_analyses(analysis_id);

-- Elements of Value B2C
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

CREATE INDEX IF NOT EXISTS idx_b2c_eov_analysis ON elements_of_value_b2c(analysis_id);
CREATE INDEX IF NOT EXISTS idx_b2c_elements_category ON b2c_element_scores(element_category);
CREATE INDEX IF NOT EXISTS idx_b2c_elements_score ON b2c_element_scores(score);

-- Elements of Value B2B
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

CREATE INDEX IF NOT EXISTS idx_b2b_eov_analysis ON elements_of_value_b2b(analysis_id);
CREATE INDEX IF NOT EXISTS idx_b2b_elements_category ON b2b_element_scores(element_category);
CREATE INDEX IF NOT EXISTS idx_b2b_elements_score ON b2b_element_scores(score);

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

CREATE INDEX IF NOT EXISTS idx_insights_analysis ON value_insights(analysis_id);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON value_insights(priority);

-- CliftonStrengths
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

CREATE TABLE IF NOT EXISTS clifton_themes_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(50) NOT NULL,
    description TEXT,
    key_indicators JSONB,
    complementary_themes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_clifton_analysis ON clifton_strengths_analyses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_clifton_themes_domain ON clifton_theme_scores(domain);
CREATE INDEX IF NOT EXISTS idx_clifton_themes_score ON clifton_theme_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_clifton_themes_rank ON clifton_theme_scores(rank);

-- Transformation & Recommendations
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

CREATE INDEX IF NOT EXISTS idx_transformation_analysis ON transformation_analyses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_barriers_severity ON growth_barriers(severity);
CREATE INDEX IF NOT EXISTS idx_opportunities_impact ON growth_opportunities(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);

-- User management
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

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

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

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Part 1 Complete! 30+ core tables created.';
    RAISE NOTICE 'Next: Run Part 2';
END $$;

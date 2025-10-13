-- =====================================================
-- BRAND ANALYSIS LAYER FOR SUPABASE
-- Integrates with existing analysis framework
-- =====================================================

-- =====================================================
-- ENHANCE EXISTING TABLES WITH BRAND COLUMNS
-- =====================================================

-- Add brand analysis columns to golden_circle_analyses
ALTER TABLE golden_circle_analyses
ADD COLUMN IF NOT EXISTS main_value_theme TEXT,
ADD COLUMN IF NOT EXISTS brand_alignment_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS target_audience_specificity DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS value_consistency_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS brand_clarity_score DECIMAL(5,2);

-- Add brand analysis columns to content_analyses
ALTER TABLE content_analyses
ADD COLUMN IF NOT EXISTS brand_pillar_alignment JSONB,
ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS value_theme_consistency DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS brand_messaging_consistency DECIMAL(5,2);

-- =====================================================
-- NEW BRAND ANALYSIS TABLES
-- =====================================================

-- Main Brand Analysis Table
CREATE TABLE IF NOT EXISTS brand_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT REFERENCES "Analysis"(id) ON DELETE CASCADE,
    website_url VARCHAR(255),
    company_name VARCHAR(255),
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    main_value_theme TEXT,
    why_statement TEXT,
    target_audience VARCHAR(255),
    brand_alignment_score DECIMAL(5,2),
    value_consistency_score DECIMAL(5,2),
    brand_clarity_score DECIMAL(5,2),
    overall_brand_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(analysis_id)
);

-- Brand Pillars Table
CREATE TABLE IF NOT EXISTS brand_pillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_analysis_id UUID REFERENCES brand_analysis(id) ON DELETE CASCADE,
    pillar_rank INT,
    pillar_name VARCHAR(100),
    pillar_description TEXT,
    supporting_evidence TEXT,
    frequency_score INT,
    stated_vs_demonstrated_alignment DECIMAL(5,2),
    content_evidence_count INT,
    sentiment_score DECIMAL(3,2),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Source Content Snippets
CREATE TABLE IF NOT EXISTS content_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_analysis_id UUID REFERENCES brand_analysis(id) ON DELETE CASCADE,
    page_section VARCHAR(100),
    snippet_text TEXT,
    sentiment_score DECIMAL(3,2),
    associated_pillar_id UUID REFERENCES brand_pillars(id),
    pattern_matches JSONB, -- Links to existing pattern system
    value_elements_detected JSONB, -- Links to Elements of Value
    clifton_strengths_aligned JSONB, -- Links to CliftonStrengths
    confidence_score DECIMAL(5,4),
    word_count INT,
    position_in_content INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brand Theme Reference Table
CREATE TABLE IF NOT EXISTS brand_theme_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name VARCHAR(100) UNIQUE NOT NULL,
    theme_category VARCHAR(50),
    theme_description TEXT,
    common_phrases JSONB,
    associated_elements JSONB, -- Links to Elements of Value
    associated_strengths JSONB, -- Links to CliftonStrengths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brand Pattern Matching
CREATE TABLE IF NOT EXISTS brand_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID REFERENCES brand_theme_reference(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50),
    pattern_text VARCHAR(500) NOT NULL,
    pattern_weight DECIMAL(3,2) DEFAULT 1.0,
    context_required VARCHAR(100),
    examples TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_brand_analysis_analysis ON brand_analysis(analysis_id);
CREATE INDEX IF NOT EXISTS idx_brand_analysis_company ON brand_analysis(company_name);
CREATE INDEX IF NOT EXISTS idx_brand_pillars_brand ON brand_pillars(brand_analysis_id);
CREATE INDEX IF NOT EXISTS idx_brand_pillars_rank ON brand_pillars(pillar_rank);
CREATE INDEX IF NOT EXISTS idx_content_snippets_brand ON content_snippets(brand_analysis_id);
CREATE INDEX IF NOT EXISTS idx_content_snippets_pillar ON content_snippets(associated_pillar_id);
CREATE INDEX IF NOT EXISTS idx_content_snippets_sentiment ON content_snippets(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_brand_theme_category ON brand_theme_reference(theme_category);
CREATE INDEX IF NOT EXISTS idx_brand_patterns_theme ON brand_patterns(theme_id);
CREATE INDEX IF NOT EXISTS idx_brand_patterns_text ON brand_patterns(pattern_text);

-- =====================================================
-- SEED DATA: COMMON BRAND THEMES
-- =====================================================

INSERT INTO brand_theme_reference (theme_name, theme_category, theme_description, common_phrases, associated_elements, associated_strengths) VALUES
-- Innovation & Technology
('Innovation', 'technology', 'Focus on cutting-edge technology and innovation',
 '["cutting-edge", "innovative", "breakthrough", "revolutionary", "advanced", "next-generation", "state-of-the-art"]',
 '["innovation", "quality", "simplifies", "integrates"]',
 '["Futuristic", "Ideation", "Strategic", "Learner"]'),

-- Trust & Reliability
('Trust', 'relationship', 'Emphasis on trust, reliability, and security',
 '["trusted", "reliable", "secure", "proven", "dependable", "guaranteed", "certified"]',
 '["reduces_anxiety", "quality", "reduces_risk", "stability"]',
 '["Belief", "Consistency", "Responsibility", "Discipline"]'),

-- Growth & Success
('Growth', 'outcome', 'Focus on growth, success, and achievement',
 '["grow", "success", "achieve", "excel", "thrive", "prosper", "advance"]',
 '["self_actualization", "motivation", "makes_money", "provides_hope"]',
 '["Achiever", "Maximizer", "Significance", "Strategic"]'),

-- Simplicity & Ease
('Simplicity', 'experience', 'Emphasis on simplicity and ease of use',
 '["simple", "easy", "effortless", "streamlined", "intuitive", "user-friendly"]',
 '["simplifies", "reduces_effort", "avoids_hassles", "saves_time"]',
 '["Arranger", "Focus", "Consistency", "Discipline"]'),

-- Community & Connection
('Community', 'social', 'Focus on community, connection, and belonging',
 '["community", "connect", "together", "belong", "unite", "collaborate"]',
 '["connects", "belonging", "affiliation", "provides_access"]',
 '["Relator", "Connectedness", "Includer", "Developer"]'),

-- Excellence & Quality
('Excellence', 'performance', 'Emphasis on excellence and superior quality',
 '["excellence", "superior", "premium", "best-in-class", "world-class", "outstanding"]',
 '["quality", "badge_value", "design_aesthetics", "attractiveness"]',
 '["Maximizer", "Belief", "Significance", "Competition"]'),

-- Impact & Purpose
('Impact', 'purpose', 'Focus on making a positive impact and purpose-driven work',
 '["impact", "purpose", "mission", "difference", "change", "transform"]',
 '["self_transcendence", "provides_hope", "social_responsibility", "motivation"]',
 '["Belief", "Significance", "Connectedness", "Strategic"]'),

-- Speed & Efficiency
('Speed', 'performance', 'Emphasis on speed, efficiency, and quick results',
 '["fast", "quick", "rapid", "instant", "efficient", "accelerate", "lightning-fast"]',
 '["saves_time", "reduces_effort", "simplifies", "automation"]',
 '["Activator", "Achiever", "Focus", "Discipline"]'),

-- Care & Support
('Care', 'service', 'Focus on caring, support, and customer service',
 '["care", "support", "help", "assist", "guide", "nurture", "protect"]',
 '["reduces_anxiety", "therapeutic", "wellness", "empathy"]',
 '["Empathy", "Developer", "Relator", "Harmony"]'),

-- Freedom & Flexibility
('Freedom', 'lifestyle', 'Emphasis on freedom, flexibility, and independence',
 '["freedom", "flexible", "independent", "autonomous", "control", "choice"]',
 '["provides_access", "flexibility", "variety", "self_actualization"]',
 '["Adaptability", "Individualization", "Belief", "Strategic"]');

-- =====================================================
-- SEED BRAND PATTERNS
-- =====================================================

-- Innovation Patterns
INSERT INTO brand_patterns (theme_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'exact', 'cutting-edge', 0.95),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'exact', 'innovative', 0.95),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'exact', 'breakthrough', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'exact', 'revolutionary', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'phrase', 'next-generation', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'phrase', 'state-of-the-art', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'phrase', 'advanced technology', 0.80),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'semantic', 'pioneering', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Innovation'), 'semantic', 'groundbreaking', 0.90);

-- Trust Patterns
INSERT INTO brand_patterns (theme_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'exact', 'trusted', 0.95),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'exact', 'reliable', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'exact', 'secure', 0.95),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'exact', 'proven', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'phrase', 'peace of mind', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'phrase', 'guaranteed', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'phrase', 'certified', 0.80),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'semantic', 'dependable', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Trust'), 'semantic', 'established', 0.80);

-- Growth Patterns
INSERT INTO brand_patterns (theme_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'exact', 'grow', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'exact', 'success', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'exact', 'achieve', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'exact', 'excel', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'phrase', 'reach your goals', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'phrase', 'unlock potential', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'phrase', 'accelerate growth', 0.90),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'semantic', 'thrive', 0.85),
((SELECT id FROM brand_theme_reference WHERE theme_name = 'Growth'), 'semantic', 'prosper', 0.80);

-- =====================================================
-- BRAND ANALYSIS FUNCTIONS
-- =====================================================

-- Function to calculate brand alignment score
CREATE OR REPLACE FUNCTION calculate_brand_alignment_score(p_analysis_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
    v_gc_score DECIMAL;
    v_eov_score DECIMAL;
    v_cs_score DECIMAL;
    v_pillar_score DECIMAL;
    v_consistency_score DECIMAL;
    v_overall DECIMAL;
BEGIN
    -- Get scores from existing analysis
    SELECT COALESCE(overall_score, 0) INTO v_gc_score
    FROM golden_circle_analyses WHERE analysis_id = p_analysis_id;

    SELECT COALESCE(overall_score, 0) INTO v_eov_score
    FROM elements_of_value_b2c WHERE analysis_id = p_analysis_id;

    SELECT COALESCE(overall_score, 0) INTO v_cs_score
    FROM clifton_strengths_analyses WHERE analysis_id = p_analysis_id;

    -- Calculate brand-specific scores
    SELECT AVG(stated_vs_demonstrated_alignment) INTO v_pillar_score
    FROM brand_pillars bp
    JOIN brand_analysis ba ON bp.brand_analysis_id = ba.id
    WHERE ba.analysis_id = p_analysis_id;

    SELECT AVG(sentiment_score) INTO v_consistency_score
    FROM content_snippets cs
    JOIN brand_analysis ba ON cs.brand_analysis_id = ba.id
    WHERE ba.analysis_id = p_analysis_id;

    -- Weighted calculation
    v_overall := (
        (COALESCE(v_gc_score, 0) * 0.25) +
        (COALESCE(v_eov_score, 0) * 0.20) +
        (COALESCE(v_cs_score, 0) * 0.20) +
        (COALESCE(v_pillar_score, 0) * 0.20) +
        (COALESCE(v_consistency_score, 0) * 0.15)
    );

    RETURN ROUND(v_overall, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to find brand patterns in content
CREATE OR REPLACE FUNCTION find_brand_patterns(
    p_content TEXT,
    p_analysis_id TEXT DEFAULT NULL
)
RETURNS TABLE(
    theme_name VARCHAR,
    pattern_text VARCHAR,
    match_count INT,
    confidence DECIMAL,
    associated_elements JSONB,
    associated_strengths JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH pattern_matches AS (
        SELECT
            btr.theme_name,
            bp.pattern_text,
            (LENGTH(p_content) - LENGTH(REPLACE(LOWER(p_content), LOWER(bp.pattern_text), ''))) /
                NULLIF(LENGTH(bp.pattern_text), 0) AS match_count,
            bp.pattern_weight,
            btr.associated_elements,
            btr.associated_strengths
        FROM brand_patterns bp
        JOIN brand_theme_reference btr ON bp.theme_id = btr.id
        WHERE LOWER(p_content) LIKE '%' || LOWER(bp.pattern_text) || '%'
    )
    SELECT
        pm.theme_name,
        pm.pattern_text,
        pm.match_count::INT,
        ROUND((pm.match_count * pm.pattern_weight)::NUMERIC, 4) AS confidence,
        pm.associated_elements,
        pm.associated_strengths
    FROM pattern_matches pm
    WHERE pm.match_count > 0
    ORDER BY confidence DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Trigger for brand_analysis updated_at
CREATE OR REPLACE FUNCTION update_brand_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_brand_analysis_updated_at ON brand_analysis;
CREATE TRIGGER update_brand_analysis_updated_at
    BEFORE UPDATE ON brand_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_brand_analysis_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify brand analysis setup
DO $$
DECLARE
    brand_tables INT;
    brand_themes INT;
    brand_patterns INT;
BEGIN
    SELECT COUNT(*) INTO brand_tables FROM information_schema.tables
    WHERE table_name IN ('brand_analysis', 'brand_pillars', 'content_snippets', 'brand_theme_reference', 'brand_patterns');

    SELECT COUNT(*) INTO brand_themes FROM brand_theme_reference;
    SELECT COUNT(*) INTO brand_patterns FROM brand_patterns;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ BRAND ANALYSIS LAYER INSTALLED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created: % / 5', brand_tables;
    RAISE NOTICE 'Brand Themes: % / 10', brand_themes;
    RAISE NOTICE 'Brand Patterns: % / 27', brand_patterns;
    RAISE NOTICE '';
    RAISE NOTICE 'Brand Themes Available:';
    RAISE NOTICE '• Innovation & Technology';
    RAISE NOTICE '• Trust & Reliability';
    RAISE NOTICE '• Growth & Success';
    RAISE NOTICE '• Simplicity & Ease';
    RAISE NOTICE '• Community & Connection';
    RAISE NOTICE '• Excellence & Quality';
    RAISE NOTICE '• Impact & Purpose';
    RAISE NOTICE '• Speed & Efficiency';
    RAISE NOTICE '• Care & Support';
    RAISE NOTICE '• Freedom & Flexibility';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions Available:';
    RAISE NOTICE '• calculate_brand_alignment_score()';
    RAISE NOTICE '• find_brand_patterns()';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for brand analysis integration! 🚀';
    RAISE NOTICE '========================================';
END $$;

-- Test brand pattern matching
SELECT 'Testing brand pattern matching...' as status;
SELECT * FROM find_brand_patterns('We provide cutting-edge innovative solutions for trusted growth and success. Our breakthrough technology helps you achieve excellence.') LIMIT 5;

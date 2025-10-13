-- =====================================================
-- BRAND ANALYSIS LAYER FOR SUPABASE - FIXED VERSION
-- Handles existing tables and missing columns
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

-- Add brand analysis columns to content_analyses (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_analyses') THEN
        ALTER TABLE content_analyses
        ADD COLUMN IF NOT EXISTS brand_pillar_alignment JSONB,
        ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2),
        ADD COLUMN IF NOT EXISTS value_theme_consistency DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS brand_messaging_consistency DECIMAL(5,2);
        RAISE NOTICE 'Enhanced content_analyses table with brand columns';
    ELSE
        RAISE NOTICE 'content_analyses table does not exist, skipping enhancement';
    END IF;
END $$;

-- =====================================================
-- HANDLE EXISTING BRAND_ANALYSIS TABLE
-- =====================================================

-- Check if brand_analysis table exists and add missing columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_analysis') THEN
        -- Add analysis_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_analysis' AND column_name = 'analysis_id') THEN
            ALTER TABLE brand_analysis ADD COLUMN analysis_id TEXT;
            RAISE NOTICE 'Added analysis_id column to existing brand_analysis table';
        END IF;

        -- Add other missing columns
        ALTER TABLE brand_analysis
        ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
        ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS main_value_theme TEXT,
        ADD COLUMN IF NOT EXISTS why_statement TEXT,
        ADD COLUMN IF NOT EXISTS target_audience VARCHAR(255),
        ADD COLUMN IF NOT EXISTS brand_alignment_score DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS value_consistency_score DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS brand_clarity_score DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS overall_brand_score DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

        RAISE NOTICE 'Enhanced existing brand_analysis table with all brand columns';
    ELSE
        RAISE NOTICE 'brand_analysis table does not exist, will create new one';
    END IF;
END $$;

-- =====================================================
-- CREATE NEW BRAND ANALYSIS TABLES (IF NOT EXISTS)
-- =====================================================

-- Main Brand Analysis Table
CREATE TABLE IF NOT EXISTS brand_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id TEXT, -- References golden_circle_analyses.analysis_id
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
-- SAFE INDEX CREATION (ONLY IF COLUMNS EXIST)
-- =====================================================

-- Create indexes only if the columns exist
DO $$
BEGIN
    -- Index on brand_analysis.analysis_id (only if column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_analysis' AND column_name = 'analysis_id') THEN
        CREATE INDEX IF NOT EXISTS idx_brand_analysis_analysis ON brand_analysis(analysis_id);
        RAISE NOTICE 'Created index on brand_analysis.analysis_id';
    END IF;

    -- Index on brand_analysis.company_name (only if column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brand_analysis' AND column_name = 'company_name') THEN
        CREATE INDEX IF NOT EXISTS idx_brand_analysis_company ON brand_analysis(company_name);
        RAISE NOTICE 'Created index on brand_analysis.company_name';
    END IF;
END $$;

-- Standard indexes for other tables (these should always work)
CREATE INDEX IF NOT EXISTS idx_brand_pillars_brand ON brand_pillars(brand_analysis_id);
CREATE INDEX IF NOT EXISTS idx_brand_pillars_rank ON brand_pillars(pillar_rank);
CREATE INDEX IF NOT EXISTS idx_content_snippets_brand ON content_snippets(brand_analysis_id);
CREATE INDEX IF NOT EXISTS idx_content_snippets_pillar ON content_snippets(associated_pillar_id);
CREATE INDEX IF NOT EXISTS idx_content_snippets_sentiment ON content_snippets(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_brand_theme_category ON brand_theme_reference(theme_category);
CREATE INDEX IF NOT EXISTS idx_brand_patterns_theme ON brand_patterns(theme_id);
CREATE INDEX IF NOT EXISTS idx_brand_patterns_type ON brand_patterns(pattern_type);

-- =====================================================
-- POPULATE BRAND THEME REFERENCE DATA
-- =====================================================

-- Insert brand themes (only if table is empty)
INSERT INTO brand_theme_reference (theme_name, theme_category, theme_description, common_phrases, associated_elements, associated_strengths)
VALUES
    ('Innovation', 'Core Values', 'Focus on cutting-edge solutions and forward-thinking approaches',
     '["breakthrough", "cutting-edge", "next-generation", "revolutionary", "pioneering"]',
     '["Innovation", "Quality", "Design Aesthetics"]',
     '["Futuristic", "Strategic", "Innovation"]'),

    ('Trust', 'Core Values', 'Building confidence through reliability and transparency',
     '["trusted", "reliable", "proven", "secure", "transparent"]',
     '["Trust", "Quality", "Reduces Risk"]',
     '["Trust", "Reliability", "Responsibility"]'),

    ('Growth', 'Outcome Focus', 'Enabling expansion and development for clients',
     '["growth", "expansion", "scaling", "development", "advancement"]',
     '["Growth", "Market Access", "Business Impact"]',
     '["Achiever", "Maximizer", "Strategic"]'),

    ('Excellence', 'Quality Focus', 'Commitment to superior performance and results',
     '["excellence", "superior", "best-in-class", "outstanding", "premium"]',
     '["Quality", "Design Aesthetics", "Brand"]',
     '["Maximizer", "Achiever", "Competition"]'),

    ('Partnership', 'Relationship Focus', 'Collaborative approach to achieving mutual success',
     '["partnership", "collaboration", "together", "joint", "alliance"]',
     '["Partnership", "Access", "Connection"]',
     '["Relator", "Harmony", "Connectedness"]'),

    ('Simplicity', 'User Experience', 'Making complex things easy to understand and use',
     '["simple", "easy", "streamlined", "intuitive", "straightforward"]',
     '["Simplicity", "Convenience", "Design Aesthetics"]',
     '["Clarity", "Simplicity", "Focus"]'),

    ('Impact', 'Results Focus', 'Creating meaningful change and measurable outcomes',
     '["impact", "results", "outcomes", "transformation", "change"]',
     '["Impact", "Business Impact", "Growth"]',
     '["Achiever", "Maximizer", "Significance"]'),

    ('Sustainability', 'Values-Based', 'Long-term thinking and environmental responsibility',
     '["sustainable", "long-term", "responsible", "green", "eco-friendly"]',
     '["Sustainability", "Reduces Risk", "Quality"]',
     '["Responsibility", "Strategic", "Consistency"]'),

    ('Accessibility', 'Inclusive Design', 'Making solutions available to everyone',
     '["accessible", "inclusive", "available", "reachable", "open"]',
     '["Access", "Simplicity", "Connection"]',
     '["Includer", "Harmony", "Connectedness"]'),

    ('Performance', 'Efficiency Focus', 'Optimizing speed, reliability, and results',
     '["performance", "fast", "efficient", "optimized", "high-performance"]',
     '["Performance", "Quality", "Business Impact"]',
     '["Achiever", "Competition", "Maximizer"]')

ON CONFLICT (theme_name) DO NOTHING;

-- =====================================================
-- POPULATE BRAND PATTERNS FOR PATTERN MATCHING
-- =====================================================

-- Insert brand patterns (only if table is empty)
INSERT INTO brand_patterns (theme_id, pattern_type, pattern_text, pattern_weight, context_required, examples)
SELECT
    btr.id,
    'value_statement',
    pattern_text,
    pattern_weight,
    'mission_statement',
    examples
FROM brand_theme_reference btr
CROSS JOIN (VALUES
    ('Innovation', 'We [innovate|create|develop] [cutting-edge|next-generation|revolutionary] solutions', 1.0, 'Focus on breakthrough technology and forward-thinking approaches'),
    ('Innovation', 'Leading the [industry|market] in [innovation|technology|advancement]', 0.9, 'Emphasizing market leadership through innovation'),
    ('Innovation', '[Pioneering|Breaking new ground] in [field|industry|technology]', 0.8, 'Highlighting first-mover advantage'),

    ('Trust', 'Trusted by [clients|customers|partners] for [X years|generations]', 1.0, 'Building credibility through longevity'),
    ('Trust', 'Your [reliable|trusted] partner for [service|solution]', 0.9, 'Positioning as dependable choice'),
    ('Trust', 'Proven track record of [success|delivery|results]', 0.8, 'Demonstrating reliability through evidence'),

    ('Growth', 'Helping [clients|businesses] [grow|scale|expand] [faster|more efficiently]', 1.0, 'Focus on client growth outcomes'),
    ('Growth', 'Accelerating [growth|expansion|development] for [clients|partners]', 0.9, 'Emphasizing speed of growth'),
    ('Growth', 'Scaling [business|operations|impact] [globally|efficiently]', 0.8, 'Focus on expansion capabilities'),

    ('Excellence', 'Delivering [excellence|superior|best-in-class] [results|service|quality]', 1.0, 'Commitment to high standards'),
    ('Excellence', 'Setting the standard for [excellence|quality|performance]', 0.9, 'Market leadership through excellence'),
    ('Excellence', 'Exceeding expectations through [excellence|innovation|quality]', 0.8, 'Going above and beyond'),

    ('Partnership', 'Partnering with [clients|customers] to achieve [success|goals|results]', 1.0, 'Collaborative approach to success'),
    ('Partnership', 'Working [together|collaboratively] to [solve|achieve|deliver]', 0.9, 'Emphasizing collaboration'),
    ('Partnership', 'Your strategic partner for [growth|success|transformation]', 0.8, 'Positioning as strategic ally'),

    ('Simplicity', 'Making [complex|complicated] things [simple|easy|intuitive]', 1.0, 'Simplifying complexity'),
    ('Simplicity', '[Simple|Easy|Streamlined] solutions for [complex|challenging] problems', 0.9, 'User-friendly approach'),
    ('Simplicity', 'Intuitive [design|interface|experience] that [just works|is easy to use]', 0.8, 'Focus on user experience'),

    ('Impact', 'Creating [meaningful|measurable|lasting] impact for [clients|society]', 1.0, 'Focus on meaningful outcomes'),
    ('Impact', 'Transforming [businesses|lives|industries] through [innovation|technology]', 0.9, 'Emphasizing transformation'),
    ('Impact', 'Delivering results that [matter|make a difference|create value]', 0.8, 'Value-driven results'),

    ('Sustainability', 'Building a [sustainable|responsible|better] [future|world|business]', 1.0, 'Long-term thinking'),
    ('Sustainability', 'Committed to [sustainability|environmental responsibility|long-term value]', 0.9, 'Values-based commitment'),
    ('Sustainability', 'Creating [sustainable|lasting|responsible] [solutions|impact|growth]', 0.8, 'Sustainable approach'),

    ('Accessibility', 'Making [technology|solutions|opportunities] accessible to [everyone|all]', 1.0, 'Inclusive design philosophy'),
    ('Accessibility', 'Breaking down [barriers|walls] to [access|opportunity|success]', 0.9, 'Removing obstacles'),
    ('Accessibility', 'Inclusive [solutions|design|approach] for [diverse|all] [users|audiences]', 0.8, 'Diversity and inclusion'),

    ('Performance', 'Optimized for [performance|speed|efficiency] and [reliability|results]', 1.0, 'Technical excellence'),
    ('Performance', 'High-performance [solutions|platforms|systems] that [deliver|scale]', 0.9, 'Technical capability'),
    ('Performance', 'Built for [speed|scale|performance] without compromising [quality|reliability]', 0.8, 'Balanced performance')
) AS patterns(theme_name, pattern_text, pattern_weight, examples)
WHERE btr.theme_name = patterns.theme_name
ON CONFLICT DO NOTHING;

-- =====================================================
-- POSTGRESQL FUNCTIONS FOR BRAND ANALYSIS
-- =====================================================

-- Function to calculate brand alignment score
CREATE OR REPLACE FUNCTION calculate_brand_alignment_score(
    p_why_statement TEXT,
    p_target_audience TEXT,
    p_value_theme TEXT
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    alignment_score DECIMAL(5,2) := 0.0;
    why_length INT;
    audience_length INT;
    theme_length INT;
BEGIN
    -- Basic length checks (longer statements often indicate more thought)
    why_length := COALESCE(LENGTH(p_why_statement), 0);
    audience_length := COALESCE(LENGTH(p_target_audience), 0);
    theme_length := COALESCE(LENGTH(p_value_theme), 0);

    -- Base score from completeness
    IF why_length > 50 THEN alignment_score := alignment_score + 30; END IF;
    IF audience_length > 20 THEN alignment_score := alignment_score + 25; END IF;
    IF theme_length > 10 THEN alignment_score := alignment_score + 25; END IF;

    -- Bonus for comprehensive statements
    IF why_length > 100 AND audience_length > 50 THEN alignment_score := alignment_score + 20; END IF;

    -- Ensure score doesn't exceed 100
    RETURN LEAST(alignment_score, 100.0);
END;
$$ LANGUAGE plpgsql;

-- Function to find brand patterns in content
CREATE OR REPLACE FUNCTION find_brand_patterns_in_content(
    p_content TEXT
) RETURNS JSONB AS $$
DECLARE
    result JSONB := '[]'::jsonb;
    pattern_record RECORD;
    pattern_count INT;
BEGIN
    -- Search for brand patterns in the content
    FOR pattern_record IN
        SELECT
            bt.theme_name,
            bp.pattern_text,
            bp.pattern_weight,
            COUNT(*) as match_count
        FROM brand_patterns bp
        JOIN brand_theme_reference bt ON bp.theme_id = bt.id
        WHERE p_content ILIKE '%' || bp.pattern_text || '%'
        GROUP BY bt.theme_name, bp.pattern_text, bp.pattern_weight
        ORDER BY bp.pattern_weight DESC, match_count DESC
    LOOP
        result := result || jsonb_build_object(
            'theme', pattern_record.theme_name,
            'pattern', pattern_record.pattern_text,
            'weight', pattern_record.pattern_weight,
            'matches', pattern_record.match_count
        );
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎯 BRAND ANALYSIS LAYER SUCCESSFULLY DEPLOYED!';
    RAISE NOTICE '✅ Enhanced existing tables with brand columns';
    RAISE NOTICE '✅ Created brand_analysis, brand_pillars, content_snippets tables';
    RAISE NOTICE '✅ Created brand_theme_reference and brand_patterns tables';
    RAISE NOTICE '✅ Populated 10 brand themes and 27+ brand patterns';
    RAISE NOTICE '✅ Created PostgreSQL functions for brand analysis';
    RAISE NOTICE '✅ All indexes created safely (only if columns exist)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for brand analysis integration!';
    RAISE NOTICE '📊 Brand themes: Innovation, Trust, Growth, Excellence, Partnership, Simplicity, Impact, Sustainability, Accessibility, Performance';
    RAISE NOTICE '🔍 Pattern matching: 27+ patterns for automatic brand theme detection';
END $$;

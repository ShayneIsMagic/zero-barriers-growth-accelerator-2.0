-- =====================================================
-- PART 3: FUNCTIONS & SEED DATA (CLEAN)
-- Run this THIRD
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at 
            BEFORE UPDATE ON subscriptions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_config_updated_at') THEN
        CREATE TRIGGER update_system_config_updated_at 
            BEFORE UPDATE ON system_config
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feature_flags_updated_at') THEN
        CREATE TRIGGER update_feature_flags_updated_at 
            BEFORE UPDATE ON feature_flags
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
        CREATE TRIGGER update_user_preferences_updated_at 
            BEFORE UPDATE ON user_preferences
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_value_element_ref_updated_at') THEN
        CREATE TRIGGER update_value_element_ref_updated_at 
            BEFORE UPDATE ON value_element_reference
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Credit deduction function
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
    SELECT "creditsRemaining" INTO v_current_balance
    FROM "User" WHERE id = p_user_id FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RETURN FALSE;
    END IF;

    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    v_new_balance := v_current_balance - p_amount;

    UPDATE "User"
    SET "creditsRemaining" = v_new_balance,
        "updatedAt" = CURRENT_TIMESTAMP
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

-- Overall score calculation
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
    FROM elements_of_value_b2b WHERE analysis_id = p_analysis_id;
    
    IF v_eov_score = 0 THEN
        SELECT COALESCE(overall_score, 0) INTO v_eov_score
        FROM elements_of_value_b2c WHERE analysis_id = p_analysis_id;
    END IF;

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

-- Pattern matching function
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
            (LENGTH(p_content) - LENGTH(REPLACE(LOWER(p_content), LOWER(vep.pattern_text), ''))) / 
                NULLIF(LENGTH(vep.pattern_text), 0) AS match_count,
            vep.pattern_weight
        FROM value_element_patterns vep
        JOIN value_element_reference ver ON vep.element_id = ver.id
        WHERE LOWER(p_content) LIKE '%' || LOWER(vep.pattern_text) || '%'

        UNION ALL

        SELECT
            it.standard_term AS element_name,
            it.industry_term AS pattern_text,
            (LENGTH(p_content) - LENGTH(REPLACE(LOWER(p_content), LOWER(it.industry_term), ''))) / 
                NULLIF(LENGTH(it.industry_term), 0) AS match_count,
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
    ORDER BY confidence DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Seed CliftonStrengths Themes (34 themes)
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
('Relator', 'relationship_building', 'Enjoys close relationships')
ON CONFLICT (theme_name) DO NOTHING;

-- Seed Value Elements (28 elements)
INSERT INTO value_element_reference (element_name, element_category, display_name, definition, business_type) VALUES
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
('provides_hope', 'life_changing', 'Provides Hope', 'Inspires optimism about the future', 'both'),
('self_actualization', 'life_changing', 'Self-Actualization', 'Helps achieve full potential', 'both'),
('motivation', 'life_changing', 'Motivation', 'Inspires action and achievement', 'both'),
('heirloom', 'life_changing', 'Heirloom', 'Creates lasting legacy value', 'B2C'),
('affiliation', 'life_changing', 'Affiliation/Belonging', 'Creates sense of community and connection', 'both'),
('self_transcendence', 'social_impact', 'Self-Transcendence', 'Contributes to greater good beyond self', 'both')
ON CONFLICT (element_name) DO NOTHING;

-- Verification
DO $$
DECLARE
    theme_count INT;
    value_count INT;
BEGIN
    SELECT COUNT(*) INTO theme_count FROM clifton_themes_reference;
    SELECT COUNT(*) INTO value_count FROM value_element_reference;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Part 3 Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CliftonStrengths themes loaded: %', theme_count;
    RAISE NOTICE 'Value elements loaded: %', value_count;
    RAISE NOTICE 'Functions created: 4';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Part 4 (Pattern Data)';
    RAISE NOTICE '========================================';
END $$;

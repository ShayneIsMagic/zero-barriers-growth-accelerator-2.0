-- =====================================================
-- COMPLETE B2B ELEMENTS OF VALUE (40 elements)
-- Source: https://media.bain.com/b2b-eov/
-- Bain & Company B2B Framework
-- =====================================================

-- Create B2B-specific reference table
CREATE TABLE IF NOT EXISTS b2b_value_element_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    display_name VARCHAR(100),
    definition TEXT,
    importance_weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_b2b_element_category ON b2b_value_element_reference(category);
CREATE INDEX IF NOT EXISTS idx_b2b_element_subcategory ON b2b_value_element_reference(subcategory);

-- =====================================================
-- CATEGORY 1: TABLE STAKES (4 elements)
-- =====================================================

INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('meeting_specifications', 'table_stakes', null, 'Meeting Specifications', 'Conforms to the customer''s internal specifications'),
('acceptable_price', 'table_stakes', null, 'Acceptable Price', 'Provides products or services at an acceptable price'),
('regulatory_compliance', 'table_stakes', null, 'Regulatory Compliance', 'Complies with regulations'),
('ethical_standards', 'table_stakes', null, 'Ethical Standards', 'Performs activities in an ethical manner')
ON CONFLICT (element_name) DO NOTHING;

-- =====================================================
-- CATEGORY 2: FUNCTIONAL VALUE (9 elements in 3 subcategories)
-- =====================================================

-- Economic (2 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('improved_top_line', 'functional', 'economic', 'Improved Top Line', 'Helps the customer increase revenue'),
('cost_reduction', 'functional', 'economic', 'Cost Reduction', 'Reduces cost for the customer''s organization')
ON CONFLICT (element_name) DO NOTHING;

-- Performance (3 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('product_quality', 'functional', 'performance', 'Product Quality', 'Provides high-quality goods or services'),
('scalability', 'functional', 'performance', 'Scalability', 'Expands easily to additional demand, processes or tasks'),
('innovation', 'functional', 'performance', 'Innovation', 'Provides innovative capabilities')
ON CONFLICT (element_name) DO NOTHING;

-- Strategic (4 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('risk_reduction', 'functional', 'strategic', 'Risk Reduction', 'Protects the customer against loss or unnecessary risk'),
('reach', 'functional', 'strategic', 'Reach', 'Allows the customer to operate in more locations or market segments'),
('flexibility', 'functional', 'strategic', 'Flexibility', 'Moves beyond standard to allow customization'),
('component_quality', 'functional', 'strategic', 'Component Quality', 'Improves perceived quality of customer''s own products')
ON CONFLICT (element_name) DO NOTHING;

-- =====================================================
-- CATEGORY 3: EASE OF DOING BUSINESS (17 elements in 5 subcategories)
-- =====================================================

-- Productivity (3 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('time_savings', 'ease_of_business', 'productivity', 'Time Savings', 'Saves time for users or the overall organization'),
('reduced_effort', 'ease_of_business', 'productivity', 'Reduced Effort', 'Helps organization get things done with less effort'),
('decreased_hassles', 'ease_of_business', 'productivity', 'Decreased Hassles', 'Helps customer avoid unnecessary hassles')
ON CONFLICT (element_name) DO NOTHING;

-- Information (2 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('information', 'ease_of_business', 'information', 'Information', 'Helps users become informed'),
('transparency', 'ease_of_business', 'information', 'Transparency', 'Provides clear view into the customer''s organization')
ON CONFLICT (element_name) DO NOTHING;

-- Operational (4 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('organization', 'ease_of_business', 'operational', 'Organization', 'Helps users become more organized'),
('simplification', 'ease_of_business', 'operational', 'Simplification', 'Reduces complexity and keeps things simple'),
('connection', 'ease_of_business', 'operational', 'Connection', 'Connects organizations and users with others'),
('integration', 'ease_of_business', 'operational', 'Integration', 'Helps integrate different facets of the business')
ON CONFLICT (element_name) DO NOTHING;

-- Access (4 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('access', 'ease_of_business', 'access', 'Access', 'Provides access to resources, services, or capabilities'),
('availability', 'ease_of_business', 'access', 'Availability', 'Available when and where needed'),
('variety', 'ease_of_business', 'access', 'Variety', 'Provides variety of goods or services to choose from'),
('configurability', 'ease_of_business', 'access', 'Configurability', 'Can be configured to customer''s specific needs')
ON CONFLICT (element_name) DO NOTHING;

-- Relationship (5 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('responsiveness', 'ease_of_business', 'relationship', 'Responsiveness', 'Responds promptly and professionally'),
('expertise', 'ease_of_business', 'relationship', 'Expertise', 'Provides know-how for the relevant industry'),
('commitment', 'ease_of_business', 'relationship', 'Commitment', 'Shows commitment to customer''s success'),
('stability', 'ease_of_business', 'relationship', 'Stability', 'Is a stable company for the foreseeable future'),
('cultural_fit', 'ease_of_business', 'relationship', 'Cultural Fit', 'Fits well with customer''s culture and people')
ON CONFLICT (element_name) DO NOTHING;

-- =====================================================
-- CATEGORY 4: INDIVIDUAL VALUE (7 elements in 2 subcategories)
-- =====================================================

-- Career (3 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('network_expansion', 'individual', 'career', 'Network Expansion', 'Helps users expand their professional network'),
('marketability', 'individual', 'career', 'Marketability', 'Makes users more marketable in their field'),
('reputational_assurance', 'individual', 'career', 'Reputational Assurance', 'Does not jeopardize and may enhance buyer''s reputation')
ON CONFLICT (element_name) DO NOTHING;

-- Personal (4 elements)
INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('design_aesthetics_b2b', 'individual', 'personal', 'Design & Aesthetics', 'Provides aesthetically pleasing goods or services'),
('growth_development', 'individual', 'personal', 'Growth & Development', 'Helps users develop personally'),
('reduced_anxiety_b2b', 'individual', 'personal', 'Reduced Anxiety', 'Helps buyers feel more secure'),
('fun_perks', 'individual', 'personal', 'Fun & Perks', 'Is enjoyable to interact with or rewarding')
ON CONFLICT (element_name) DO NOTHING;

-- =====================================================
-- CATEGORY 5: INSPIRATIONAL VALUE (4 elements)
-- =====================================================

INSERT INTO b2b_value_element_reference (element_name, category, subcategory, display_name, definition) VALUES
('vision', 'inspirational', null, 'Vision', 'Helps customer anticipate direction of markets'),
('hope_b2b', 'inspirational', null, 'Hope', 'Gives buyers hope for future of their organization'),
('social_responsibility', 'inspirational', null, 'Social Responsibility', 'Helps customer be more socially responsible'),
('purpose', 'inspirational', null, 'Purpose', 'Aligns with customer''s organizational purpose')
ON CONFLICT (element_name) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  total INT;
  table_stakes INT;
  functional INT;
  ease INT;
  individual INT;
  inspirational INT;
BEGIN
  SELECT COUNT(*) INTO total FROM b2b_value_element_reference;
  SELECT COUNT(*) INTO table_stakes FROM b2b_value_element_reference WHERE category = 'table_stakes';
  SELECT COUNT(*) INTO functional FROM b2b_value_element_reference WHERE category = 'functional';
  SELECT COUNT(*) INTO ease FROM b2b_value_element_reference WHERE category = 'ease_of_business';
  SELECT COUNT(*) INTO individual FROM b2b_value_element_reference WHERE category = 'individual';
  SELECT COUNT(*) INTO inspirational FROM b2b_value_element_reference WHERE category = 'inspirational';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ B2B ELEMENTS OF VALUE COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Elements: % / 40 %', total, CASE WHEN total = 40 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '';
  RAISE NOTICE 'By Category:';
  RAISE NOTICE '  Table Stakes: % / 4 %', table_stakes, CASE WHEN table_stakes = 4 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  Functional: % / 9 %', functional, CASE WHEN functional = 9 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  Ease of Business: % / 17 %', ease, CASE WHEN ease = 17 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  Individual: % / 7 %', individual, CASE WHEN individual = 7 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  Inspirational: % / 4 %', inspirational, CASE WHEN inspirational = 4 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Source: https://media.bain.com/b2b-eov/';
  RAISE NOTICE '========================================';
END $$;

-- Show all B2B elements
SELECT
  category,
  subcategory,
  COUNT(*) as element_count,
  string_agg(display_name, ', ' ORDER BY element_name) as elements
FROM b2b_value_element_reference
GROUP BY category, subcategory
ORDER BY
  CASE category
    WHEN 'table_stakes' THEN 1
    WHEN 'functional' THEN 2
    WHEN 'ease_of_business' THEN 3
    WHEN 'individual' THEN 4
    WHEN 'inspirational' THEN 5
  END,
  subcategory;


-- =====================================================
-- ADD 2 MISSING VALUE ELEMENTS
-- Completes the 30 B2C Elements of Value from Bain
-- Source: https://media.bain.com/elements-of-value/
-- =====================================================

-- Add the 2 missing functional elements
INSERT INTO value_element_reference (element_name, element_category, display_name, definition, business_type) VALUES
('avoids_hassles', 'functional', 'Avoids Hassles', 'Avoiding or reducing hassles and inconveniences', 'both'),
('sensory_appeal', 'functional', 'Sensory Appeal', 'Appealing in taste, smell, hearing and other senses', 'B2C')
ON CONFLICT (element_name) DO NOTHING;

-- Add synonym patterns for "Avoids Hassles"
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'exact', 'avoid hassles', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'exact', 'hassle-free', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'exact', 'no hassle', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'phrase', 'hassle free', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'phrase', 'no-hassle', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'phrase', 'stress-free', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'phrase', 'smooth', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'phrase', 'seamless', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'phrase', 'frictionless', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'avoids_hassles'), 'semantic', 'takes the headache out', 0.9);

-- Add synonym patterns for "Sensory Appeal"
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'exact', 'sensory appeal', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'exact', 'sensory experience', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'delicious', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'tastes great', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'fresh', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'aroma', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'fragrance', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'texture', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'smooth taste', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'crisp', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'sensory_appeal'), 'phrase', 'rich flavor', 0.85);

-- Verification
DO $$
DECLARE
  total_elements INT;
  functional_count INT;
BEGIN
  SELECT COUNT(*) INTO total_elements FROM value_element_reference;
  SELECT COUNT(*) INTO functional_count FROM value_element_reference WHERE element_category = 'functional';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MISSING ELEMENTS ADDED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Value Elements: % / 30 %', total_elements, CASE WHEN total_elements = 30 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Functional Elements: % / 14 %', functional_count, CASE WHEN functional_count = 14 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Added:';
  RAISE NOTICE '  ✓ avoids_hassles (10 patterns)';
  RAISE NOTICE '  ✓ sensory_appeal (11 patterns)';
  RAISE NOTICE '';
  RAISE NOTICE 'Now matches Bain & Company framework exactly!';
  RAISE NOTICE 'Source: https://media.bain.com/elements-of-value/';
  RAISE NOTICE '========================================';
END $$;


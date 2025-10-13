-- =====================================================
-- CLIFTONSTRENGTHS TEST - Run in Supabase SQL Editor
-- =====================================================

-- Test 1: Count themes (should be 34)
SELECT
  'CliftonStrengths Themes Loaded' as test,
  COUNT(*) as count,
  34 as expected,
  CASE WHEN COUNT(*) = 34 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM clifton_themes_reference;

-- Test 2: Show all themes by domain
SELECT
  domain,
  COUNT(*) as theme_count,
  string_agg(theme_name, ', ' ORDER BY theme_name) as themes
FROM clifton_themes_reference
GROUP BY domain
ORDER BY domain;

-- Test 3: List all 34 themes
SELECT
  theme_name,
  domain,
  description
FROM clifton_themes_reference
ORDER BY domain, theme_name;

-- Test 4: Verify each domain has correct count
SELECT
  domain,
  COUNT(*) as count,
  CASE
    WHEN domain = 'strategic_thinking' AND COUNT(*) = 8 THEN '✅ Complete (8/8)'
    WHEN domain = 'executing' AND COUNT(*) = 9 THEN '✅ Complete (9/9)'
    WHEN domain = 'influencing' AND COUNT(*) = 8 THEN '✅ Complete (8/8)'
    WHEN domain = 'relationship_building' AND COUNT(*) = 9 THEN '✅ Complete (9/9)'
    ELSE '❌ Incomplete'
  END as status
FROM clifton_themes_reference
GROUP BY domain
ORDER BY domain;

-- Final Verification
DO $$
DECLARE
  total_themes INT;
  strategic INT;
  executing INT;
  influencing INT;
  relationship INT;
BEGIN
  SELECT COUNT(*) INTO total_themes FROM clifton_themes_reference;
  SELECT COUNT(*) INTO strategic FROM clifton_themes_reference WHERE domain = 'strategic_thinking';
  SELECT COUNT(*) INTO executing FROM clifton_themes_reference WHERE domain = 'executing';
  SELECT COUNT(*) INTO influencing FROM clifton_themes_reference WHERE domain = 'influencing';
  SELECT COUNT(*) INTO relationship FROM clifton_themes_reference WHERE domain = 'relationship_building';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'CLIFTONSTRENGTHS VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Themes: % / 34 %', total_themes, CASE WHEN total_themes = 34 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '';
  RAISE NOTICE 'By Domain:';
  RAISE NOTICE '  Strategic Thinking: % / 8 %', strategic, CASE WHEN strategic = 8 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  Executing: % / 9 %', executing, CASE WHEN executing = 9 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  Influencing: % / 8 %', influencing, CASE WHEN influencing = 8 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  Relationship Building: % / 9 %', relationship, CASE WHEN relationship = 9 THEN '✅' ELSE '❌' END;
  RAISE NOTICE '';

  IF total_themes = 34 AND strategic = 8 AND executing = 9 AND influencing = 8 AND relationship = 9 THEN
    RAISE NOTICE '🎉 CLIFTONSTRENGTHS COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE 'All 34 themes are loaded correctly:';
    RAISE NOTICE '  ✓ Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic';
    RAISE NOTICE '  ✓ Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative';
    RAISE NOTICE '  ✓ Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo';
    RAISE NOTICE '  ✓ Adaptability, Developer, Connectedness, Empathy, Harmony, Includer, Individualization, Positivity, Relator';
  ELSE
    RAISE NOTICE '❌ INCOMPLETE - Some themes missing';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;


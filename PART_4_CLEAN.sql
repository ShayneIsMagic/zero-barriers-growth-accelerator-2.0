-- =====================================================
-- PART 4: PATTERN MATCHING DATA (FINAL PART)
-- Run this LAST - Loads 150+ synonym patterns
-- =====================================================

-- Saves Time Patterns
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'exact', 'save time', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'exact', 'saves time', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'exact', 'time-saving', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'faster', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'quickly', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'quick', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'instant', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'rapid', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'efficient', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'streamlined', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'automation', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'automated', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'lightning-fast', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'real-time', 0.75),
((SELECT id FROM value_element_reference WHERE element_name = 'saves_time'), 'phrase', 'immediate', 0.8);

-- Reduces Cost Patterns
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'save money', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'reduce cost', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'exact', 'cost-effective', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'affordable', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'budget-friendly', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'free', 0.95),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'low-cost', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'best price', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'economical', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_cost'), 'phrase', 'inexpensive', 0.8);

-- Simplifies Patterns
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'exact', 'simplify', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'exact', 'simplifies', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'easy', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'user-friendly', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'intuitive', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'hassle-free', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'effortless', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'drag and drop', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'no training', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'simplifies'), 'phrase', 'straightforward', 0.85);

-- Reduces Anxiety Patterns
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'exact', 'peace of mind', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'exact', 'worry-free', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'secure', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'safe', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'trusted', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'reliable', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'guaranteed', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_anxiety'), 'phrase', 'protected', 0.85);

-- Quality Patterns
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'exact', 'high quality', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'exact', 'premium', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'excellence', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'superior', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'best-in-class', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'top-rated', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'quality'), 'phrase', 'award-winning', 0.85);

-- Integrates Patterns
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'exact', 'integrate', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'exact', 'integration', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'works with', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'connects to', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'compatible', 0.8),
((SELECT id FROM value_element_reference WHERE element_name = 'integrates'), 'phrase', 'sync', 0.85);

-- Reduces Effort Patterns
INSERT INTO value_element_patterns (element_id, pattern_type, pattern_text, pattern_weight) VALUES
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'exact', 'reduce effort', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'exact', 'less work', 1.0),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'convenient', 0.85),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'automatic', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'hands-free', 0.9),
((SELECT id FROM value_element_reference WHERE element_name = 'reduces_effort'), 'phrase', 'one-click', 0.85);

-- Industry Terminology: SaaS
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('saas', 'simplifies', 'no-code', 0.95, 'No programming required, visual interface'),
('saas', 'simplifies', 'drag-and-drop', 0.9, 'Drag-and-drop builder, visual editor'),
('saas', 'integrates', 'works with 1000+ apps', 0.9, 'Zapier integration, API connections'),
('saas', 'reduces_cost', 'unlimited users', 0.85, 'No per-user fees, flat pricing'),
('saas', 'saves_time', 'automation', 0.95, 'Automated workflows, set and forget'),
('saas', 'reduces_effort', 'one-click', 0.9, 'One-click deployment, instant setup');

-- Industry Terminology: Healthcare
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('healthcare', 'reduces_anxiety', 'patient comfort', 0.9, 'Patient-centered care, comfortable environment'),
('healthcare', 'quality', 'clinical excellence', 0.95, 'Board-certified physicians, evidence-based care'),
('healthcare', 'simplifies', 'patient-centric', 0.85, 'Easy scheduling, simplified intake process'),
('healthcare', 'reduces_risk', 'HIPAA compliant', 0.95, 'Secure patient data, privacy protection'),
('healthcare', 'saves_time', 'convenient appointments', 0.8, 'Same-day visits, online scheduling'),
('healthcare', 'quality', 'board-certified', 0.9, 'Certified professionals, accredited facility');

-- Industry Terminology: E-commerce
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('ecommerce', 'saves_time', 'one-click checkout', 0.95, 'Express checkout, saved payment methods'),
('ecommerce', 'variety', 'vast selection', 0.9, 'Thousands of products, wide range'),
('ecommerce', 'reduces_cost', 'price match guarantee', 0.95, 'Best price guaranteed, price protection'),
('ecommerce', 'reduces_anxiety', '30-day returns', 0.9, 'Easy returns, money-back guarantee'),
('ecommerce', 'reduces_cost', 'free shipping', 0.95, 'No shipping fees, delivered free');

-- Industry Terminology: Fintech
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('fintech', 'reduces_cost', 'low fees', 0.95, 'Minimal fees, transparent pricing'),
('fintech', 'reduces_anxiety', 'bank-level security', 0.95, 'Encrypted, FDIC insured'),
('fintech', 'simplifies', 'seamless experience', 0.85, 'Intuitive interface, easy to use'),
('fintech', 'saves_time', 'instant transfer', 0.9, 'Real-time transactions, immediate access'),
('fintech', 'reduces_risk', 'FDIC insured', 0.95, 'Protected deposits, insured accounts');

-- Industry Terminology: Technology
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('technology', 'simplifies', 'cloud-native', 0.9, 'Born in cloud, scalable architecture'),
('technology', 'simplifies', 'low-code', 0.95, 'Minimal coding, visual development'),
('technology', 'integrates', 'API-first', 0.85, 'Developer-friendly, easy integration'),
('technology', 'reduces_risk', 'enterprise security', 0.95, 'Bank-level encryption, SOC 2 compliant'),
('technology', 'reduces_anxiety', '99.9% uptime', 0.95, 'High availability, reliable service'),
('technology', 'quality', 'enterprise-grade', 0.9, 'Production-ready, mission-critical'),
('technology', 'saves_time', 'DevOps automation', 0.9, 'CI/CD, automated deployment');

-- Industry Terminology: Construction
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('construction', 'saves_time', 'on-time completion', 0.95, 'Delivered on schedule, meet deadlines'),
('construction', 'saves_time', 'fast-track', 0.9, 'Expedited delivery, accelerated timeline'),
('construction', 'quality', 'licensed contractors', 0.9, 'State-licensed, bonded and insured'),
('construction', 'quality', 'warranty-backed', 0.95, 'Lifetime warranty, guaranteed workmanship'),
('construction', 'reduces_risk', 'fully insured', 0.95, 'Liability coverage, workers comp'),
('construction', 'reduces_cost', 'value engineering', 0.9, 'Cost optimization, budget-conscious design'),
('construction', 'simplifies', 'turnkey', 0.95, 'Turnkey solutions, end-to-end service');

-- Industry Terminology: Energy
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('energy', 'reduces_cost', 'energy savings', 0.95, 'Lower utility bills, reduce consumption'),
('energy', 'reduces_cost', 'ROI guarantee', 0.9, 'Payback period, return on investment'),
('energy', 'reduces_risk', 'grid-independent', 0.85, 'Energy independence, backup power'),
('energy', 'self_transcendence', 'carbon neutral', 0.95, 'Net zero emissions, environmental impact'),
('energy', 'self_transcendence', 'renewable', 0.95, 'Clean energy, sustainable power'),
('energy', 'quality', 'tier-1 panels', 0.9, 'Premium equipment, top-rated systems');

-- Industry Terminology: Consulting
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('consulting', 'provides_hope', 'strategic roadmap', 0.95, 'Clear path forward, defined milestones'),
('consulting', 'provides_hope', 'transformation partner', 0.9, 'Change agent, growth catalyst'),
('consulting', 'informs', 'data-driven insights', 0.95, 'Analytics-based, evidence-backed'),
('consulting', 'informs', 'benchmarking', 0.9, 'Industry comparison, peer analysis'),
('consulting', 'quality', 'thought leadership', 0.95, 'Industry experts, published authors'),
('consulting', 'quality', 'proven methodology', 0.9, 'Established framework, tested approach'),
('consulting', 'reduces_anxiety', 'change management', 0.95, 'Smooth transition, managed change'),
('consulting', 'reduces_cost', 'fractional', 0.95, 'Part-time executive, affordable expertise');

-- Industry Terminology: Government
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('government', 'reduces_risk', 'compliant', 0.95, 'Regulatory compliance, meets standards'),
('government', 'reduces_risk', 'secure', 0.95, 'FedRAMP certified, government-grade security'),
('government', 'simplifies', 'streamlined process', 0.9, 'Simplified procedures, reduced bureaucracy'),
('government', 'simplifies', 'citizen-friendly', 0.85, 'Easy to use, accessible to all'),
('government', 'provides_access', 'open data', 0.9, 'Public transparency, accessible information');

-- Industry Terminology: Sales
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('sales', 'makes_money', 'increase revenue', 0.95, 'Boost sales, grow income'),
('sales', 'makes_money', 'close more deals', 0.95, 'Higher conversion, win rate'),
('sales', 'saves_time', 'automated outreach', 0.95, 'Auto-email, automated follow-up'),
('sales', 'saves_time', 'CRM integration', 0.9, 'Sync with Salesforce, connected systems'),
('sales', 'informs', 'sales analytics', 0.9, 'Performance dashboards, metrics tracking'),
('sales', 'informs', 'lead scoring', 0.9, 'AI-powered scoring, priority leads');

-- Industry Terminology: Marketing
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('marketing', 'informs', 'analytics dashboard', 0.95, 'Real-time metrics, performance tracking'),
('marketing', 'informs', 'attribution tracking', 0.9, 'Multi-touch attribution, ROI tracking'),
('marketing', 'integrates', 'omnichannel', 0.9, 'Cross-channel marketing, unified platform'),
('marketing', 'saves_time', 'campaign automation', 0.95, 'Auto-scheduling, workflow automation'),
('marketing', 'makes_money', 'increase conversions', 0.95, 'Higher conversion rates, more leads'),
('marketing', 'simplifies', 'drag-and-drop builder', 0.9, 'Visual editor, no coding required');

-- Industry Terminology: Manufacturing
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('manufacturing', 'quality', 'ISO certified', 0.95, 'ISO 9001, quality management system'),
('manufacturing', 'quality', 'precision engineering', 0.9, 'Tight tolerances, exact specifications'),
('manufacturing', 'reduces_cost', 'lean production', 0.9, 'Waste reduction, efficiency gains'),
('manufacturing', 'saves_time', 'rapid prototyping', 0.9, '3D printing, quick turnaround'),
('manufacturing', 'reduces_risk', 'traceability', 0.9, 'Full tracking, lot numbers'),
('manufacturing', 'integrates', 'ERP integration', 0.9, 'SAP, Oracle, integrated systems');

-- Industry Terminology: Agriculture
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('agriculture', 'quality', 'organic certified', 0.95, 'USDA Organic, certified organic'),
('agriculture', 'quality', 'farm-to-table', 0.9, 'Direct from farm, fresh harvest'),
('agriculture', 'self_transcendence', 'sustainable farming', 0.95, 'Environmentally responsible, eco-conscious'),
('agriculture', 'self_transcendence', 'regenerative', 0.95, 'Soil health, carbon sequestration'),
('agriculture', 'reduces_anxiety', 'traceability', 0.9, 'Track from farm, know your source'),
('agriculture', 'wellness', 'nutrient-dense', 0.85, 'High nutrition, vitamin-rich');

-- Industry Terminology: Nonprofit
INSERT INTO industry_terminology (industry, standard_term, industry_term, confidence_score, usage_examples) VALUES
('nonprofit', 'self_transcendence', 'social impact', 0.95, 'Community benefit, positive change'),
('nonprofit', 'self_transcendence', 'mission-driven', 0.95, 'Purpose-led, cause-focused'),
('nonprofit', 'self_transcendence', 'change lives', 0.95, 'Transform communities, create impact'),
('nonprofit', 'reduces_anxiety', 'transparent', 0.95, 'Open books, full disclosure'),
('nonprofit', 'reduces_cost', 'tax-deductible', 0.95, 'Tax benefit, IRS deductible'),
('nonprofit', 'informs', 'impact report', 0.95, 'Results tracking, outcomes measured'),
('nonprofit', 'affiliation', 'join the movement', 0.95, 'Be part of change, collective action');

-- Verification
DO $$
DECLARE
    pattern_count INT;
    industry_count INT;
    table_count INT;
BEGIN
    SELECT COUNT(*) INTO pattern_count FROM value_element_patterns;
    SELECT COUNT(*) INTO industry_count FROM industry_terminology;
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 ALL PARTS COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total database tables: %', table_count;
    RAISE NOTICE 'Value element patterns: %', pattern_count;
    RAISE NOTICE 'Industry terminology: %', industry_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Schema installation complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run: npx prisma db pull';
    RAISE NOTICE '2. Run: npx prisma generate';
    RAISE NOTICE '3. Test pattern matching!';
    RAISE NOTICE '========================================';
END $$;

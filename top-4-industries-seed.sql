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


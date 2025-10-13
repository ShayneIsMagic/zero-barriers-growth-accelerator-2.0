-- =====================================================
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


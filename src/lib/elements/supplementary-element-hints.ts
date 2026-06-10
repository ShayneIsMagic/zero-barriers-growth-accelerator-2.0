/**
 * Keyword recognition hints for frameworks beyond core element-definitions.ts exports.
 * Keys use `categoryKey:slug` when dimension names repeat across categories (Golden Circle).
 */

export interface SupplementaryElementHint {
  keywords: string[];
  description: string;
}

/** 24 Golden Circle dimensions — aligned with GOLDEN_CIRCLE_CHUNK_CONFIG */
export const GOLDEN_CIRCLE_DIMENSION_HINTS: Record<
  string,
  SupplementaryElementHint
> = {
  'why:clarity': {
    keywords: ['why', 'purpose', 'believe', 'cause', 'mission', 'clear', 'articulate'],
    description: 'How clear and well-articulated is the WHY on the website?',
  },
  'why:authenticity': {
    keywords: ['authentic', 'genuine', 'true', 'values', 'integrity', 'real'],
    description: 'Does copy reflect true beliefs rather than generic marketing?',
  },
  'why:inspiration': {
    keywords: ['inspire', 'motivate', 'believe', 'vision', 'change the world', 'passion'],
    description: 'Does the site inspire and motivate visitors?',
  },
  'why:consistency': {
    keywords: ['consistent', 'always', 'every', 'aligned', 'same message', 'throughout'],
    description: 'Is WHY messaging consistent across pages and sections?',
  },
  'why:differentiation': {
    keywords: ['unique', 'only', 'different', 'unlike', 'stand out', 'distinct'],
    description: 'Is the WHY unique and meaningful vs competitors?',
  },
  'why:emotional_resonance': {
    keywords: ['feel', 'heart', 'emotion', 'connect', 'resonate', 'care deeply'],
    description: 'Does WHY copy connect emotionally with the audience?',
  },
  'how:uniqueness': {
    keywords: ['unique', 'proprietary', 'only we', 'distinctive', 'differentiator', 'method'],
    description: 'What makes the HOW distinctive in copy?',
  },
  'how:clarity': {
    keywords: ['how we', 'process', 'approach', 'methodology', 'way we', 'clear steps'],
    description: 'How clearly defined are methods and processes?',
  },
  'how:consistency': {
    keywords: ['consistent', 'always', 'standard', 'repeatable', 'systematic'],
    description: 'Is HOW described consistently across the site?',
  },
  'how:alignment': {
    keywords: ['support our why', 'because we believe', 'in service of', 'fulfill', 'aligned'],
    description: 'Does HOW copy show support for the stated WHY?',
  },
  'how:proof_points': {
    keywords: ['proven', 'case study', 'results', 'evidence', 'track record', 'demonstrate'],
    description: 'Are there proof points demonstrating HOW?',
  },
  'how:competitive_moat': {
    keywords: ['advantage', 'moat', 'barrier', 'defensible', 'hard to copy', 'exclusive'],
    description: 'Does copy suggest a durable competitive advantage?',
  },
  'what:clarity': {
    keywords: ['what we do', 'offer', 'product', 'service', 'solution', 'features', 'clear'],
    description: 'How clear are product/service offerings?',
  },
  'what:alignment': {
    keywords: ['bring our why', 'fulfill our mission', 'in line with', 'supports our purpose'],
    description: 'Do offerings align with stated WHY and HOW?',
  },
  'what:quality': {
    keywords: ['quality', 'excellent', 'premium', 'reliable', 'best-in-class', 'superior'],
    description: 'Is quality signaled in WHAT copy?',
  },
  'what:proof': {
    keywords: ['testimonial', 'case study', 'results', 'metrics', 'outcomes', 'clients'],
    description: 'Does WHAT copy prove value with evidence?',
  },
  'what:evolution': {
    keywords: ['innovate', 'evolve', 'next generation', 'improve', 'latest', 'new version'],
    description: 'Does copy show innovation while staying on-mission?',
  },
  'what:market_fit': {
    keywords: ['for teams who', 'built for', 'solves', 'addresses', 'market need', 'customer need'],
    description: 'Does WHAT copy show fit with market needs?',
  },
  'who:clarity': {
    keywords: ['for', 'audience', 'customers like', 'ideal for', 'designed for', 'who we serve'],
    description: 'How clearly is the target audience defined?',
  },
  'who:alignment': {
    keywords: ['people who believe', 'share our values', 'like-minded', 'who care about'],
    description: 'Does copy attract people who share the WHY?',
  },
  'who:specificity': {
    keywords: ['specific', 'niche', 'segment', 'persona', 'industry', 'role', 'not everyone'],
    description: 'Is the audience specific rather than “everyone”?',
  },
  'who:understanding': {
    keywords: ['pain points', 'challenges', 'struggle', 'we understand', 'you need', 'frustrated'],
    description: 'Does copy show deep understanding of audience needs?',
  },
  'who:resonance': {
    keywords: ['resonate', 'speak to', 'for you if', 'sound like you', 'this is for'],
    description: 'Will the target audience feel the message is for them?',
  },
  'who:loyalty': {
    keywords: ['community', 'advocates', 'fans', 'loyal', 'join us', 'belong', 'members'],
    description: 'Does copy foster loyalty and advocacy?',
  },
};

/** 16 Revenue Trends elements — aligned with revenue-trends route chunks */
export const REVENUE_TRENDS_ELEMENT_HINTS: Record<
  string,
  SupplementaryElementHint
> = {
  market_demand: {
    keywords: ['demand', 'growing market', 'market size', 'TAM', 'need for', 'trending demand'],
    description: 'Signals of market demand in site copy or offers',
  },
  trending_keywords: {
    keywords: ['trending', 'popular', 'search volume', 'keywords', 'rising interest', 'hot topic'],
    description: 'Trending topics and search-intent language on the site',
  },
  seasonal_patterns: {
    keywords: ['seasonal', 'quarter', 'holiday', 'peak season', 'cyclical', 'annual'],
    description: 'Seasonal or cyclical demand patterns mentioned',
  },
  competitor_gaps: {
    keywords: ['unlike competitors', 'gap', 'missing', 'only we', 'competitors fail', 'alternative'],
    description: 'Differentiation gaps vs competitors in messaging',
  },
  emerging_opportunities: {
    keywords: ['emerging', 'new opportunity', 'untapped', 'greenfield', 'upcoming', 'future market'],
    description: 'Emerging revenue opportunities signaled in content',
  },
  price_sensitivity: {
    keywords: ['affordable', 'pricing', 'ROI', 'cost', 'budget', 'value for money', 'premium'],
    description: 'Price sensitivity and willingness-to-pay signals',
  },
  customer_segments: {
    keywords: ['segment', 'persona', 'SMB', 'enterprise', 'vertical', 'niche', 'audience'],
    description: 'Distinct customer segments addressed on the site',
  },
  conversion_potential: {
    keywords: ['convert', 'signup', 'trial', 'demo', 'buy now', 'get started', 'CTA'],
    description: 'Conversion-oriented offers and funnel signals',
  },
  upsell_opportunities: {
    keywords: ['upgrade', 'premium', 'pro plan', 'add-on', 'expand', 'tier', 'upsell'],
    description: 'Upsell paths and tiered offer language',
  },
  cross_sell_potential: {
    keywords: ['bundle', 'suite', 'also offers', 'complementary', 'together', 'ecosystem'],
    description: 'Cross-sell and product-suite expansion signals',
  },
  retention_strategies: {
    keywords: ['retention', 'loyalty', 'renew', 'subscription', 'stickiness', 'churn', 'keep customers'],
    description: 'Retention and loyalty messaging',
  },
  expansion_opportunities: {
    keywords: ['expand', 'scale', 'grow with you', 'geographic', 'new markets', 'land and expand'],
    description: 'Account expansion and growth-with-customer signals',
  },
  partnership_potential: {
    keywords: ['partner', 'integration', 'alliance', 'reseller', 'channel', 'ecosystem partner'],
    description: 'Partnership and channel revenue signals',
  },
  content_gaps: {
    keywords: ['blog', 'resources', 'learn', 'guide', 'missing topic', 'FAQ', 'content hub'],
    description: 'Content marketing gaps and resource coverage',
  },
  seo_opportunities: {
    keywords: ['SEO', 'rank', 'organic', 'search', 'meta', 'keywords', 'traffic'],
    description: 'SEO and organic growth opportunity signals',
  },
  social_media_trends: {
    keywords: ['social', 'LinkedIn', 'Instagram', 'viral', 'community', 'followers', 'share'],
    description: 'Social media and community trend alignment',
  },
};

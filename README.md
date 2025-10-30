# Zero Barriers Growth Accelerator 2.0

AI-powered marketing optimization platform that systematically analyzes content to identify growth barriers and provide actionable recommendations.

## 🎯 Mission & Audience

- Built for growth teams, marketers, product owners, and founders who need evidence‑based, revenue‑focused content optimization.
- Primary outcome: increase conversion and revenue by systematically identifying growth barriers and prioritizing high‑impact improvements.

## 🔑 Unique Value Proposition

- Reuse a single content scrape from Content Comparison to run multiple frameworks via the enhanced analysis endpoint (B2C, B2B, Golden Circle, CliftonStrengths); standalone endpoints remain supported
- Revenue‑focused scoring, ROI‑oriented recommendations, and impact/effort prioritization
- Serverless‑safe scraping and Google Tools automation workarounds, with manual data paths when required
- Strict TypeScript and governance standards; reproducible prompts with JSON‑validated outputs

## 🌐 Live Production Reference

**Working Vercel Deployment:** https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/

All pages listed in the Dashboard (https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/dashboard) are production-ready and working. These serve as reference implementations for framework integrations.

### Recently Enhanced (New Features)

- **Content Comparison** (`/dashboard/content-comparison`): Now includes competitor discovery analysis (no frameworks) and framework dropdown to reuse scrapes
- **Reports Dashboard** (`/dashboard/reports`): New page for viewing locally-stored comprehensive reports with "Report Ready" indicators

All other dashboard features remain unchanged and working as deployed on Vercel.

## 🔁 Build → Deploy → Feature Flow (Current Live)

This maps the Vercel commit/build that produced the live Content Comparison page to the runtime flow.

1. Commit pushed to main → Vercel build starts (Next.js 14 App Router)
   - Install deps, type-check, lint, build
   - Generate Prisma client (no dev-time migrations in build)
   - Env vars provided via Vercel project settings
2. Deploy succeeds → Live routes available on Vercel
   - Dashboard (features overview): see [Dashboard (live)](https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/dashboard)
   - Content Comparison UI: see [Content Comparison (live)](https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/dashboard/content-comparison)
3. User action on Content Comparison page
   - Enter URL (+ optional proposed content) → submit
   - Serverless flow triggers scraping/extraction and comparison analysis
4. Server-side analysis (serverless API routes)
   - Scrape: robust extraction (universal/production extractors)
   - Transform: normalize content for frameworks
   - Analyze: Gemini prompts (JSON-validated), persist via Prisma
   - Respond: structured JSON → rendered by page component

Reference snapshot of the commit context and landing page: [Latest marketing page (preview)](https://zero-barriers-growth-accelerato-git-5426a1-shayne-roys-projects.vercel.app/)

## 🚀 **PRODUCTION READY FEATURES**

### **Core Analysis Frameworks**

- **Content Comparison** - Identifies likely competitors from the scrape and assesses language competitiveness for current vs. optional proposed content (no frameworks)
- **B2C Elements of Value** - 30-element consumer value pyramid analysis
- **B2B Elements of Value** - 40-element business value analysis
- **Golden Circle** - Simon Sinek's Why/How/What/Who framework
- **CliftonStrengths** - Gallup's 34 strengths analysis

### **Enterprise Features**

- **Content Version Control** - Track content changes and versions
- **Structured Data Storage** - Organized analysis results
- **Fractional Scoring** - Transparent, count-based scoring system
- **Universal Scraper** - Comprehensive website content extraction
- **JWT Authentication** - Secure user management

## 🛠️ **TECH STACK**

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini API
- **Deployment**: Vercel
- **Authentication**: JWT with bcrypt

## 🧠 **FRAMEWORKS (Detailed)**

**📋 Complete Framework Reference**: See [`docs/FRAMEWORK_COMPREHENSIVE_MAP.md`](./docs/FRAMEWORK_COMPREHENSIVE_MAP.md) for comprehensive framework maps including all elements, categories, subcategories, counts, and fractional scoring systems.

### B2C Elements of Value (30 elements)
- Categories: Functional, Emotional, Life‑Changing, Social Impact
- Outputs: per‑element scores (0–100), category averages, overall score, evidence with citations and detected patterns
- Use cases: consumer value proposition optimization, pricing leverage, satisfaction drivers

### B2B Elements of Value (40 elements)
- Categories: Table Stakes, Functional, Ease of Doing Business, Individual, Inspirational
- Subcategories: Economic, Performance, Productivity, Operational, Access, Relationship, Strategic, Career, Personal, Purpose
- Outputs: per‑element scoring, evidence, enterprise‑focused recommendations (sales enablement, retention)

### Golden Circle (Revenue‑Focused)
- Why, How, What (+ Who/Target where applicable)
- Outputs: revenue impact per layer, ROI calculations, recommendations prioritized by impact/effort

### CliftonStrengths (34 themes)
- Domains: Strategic Thinking, Executing, Influencing, Relationship Building
- Outputs: top 5 themes, domain scoring, evidence of theme manifestations, actionable team/org recommendations

All framework analyses support a unified flow (single scrape feeding multiple analyses) and can be run individually through dedicated endpoints.

## 🤖 **AI & MODEL ORCHESTRATION (Detailed)**

- Primary model: Google Gemini (1.5 family)
- Prompting: structured, deterministic prompts per framework with explicit JSON return contracts
- Validation:
  - Extract fenced JSON blocks or first object match
  - Parse with fallback regex; reject non‑JSON
  - Required fields checked, defaults applied conservatively
- Timeouts/retries: configured per request; fail fast with typed error messages
- Evidence capture: include citations (content sections) and pattern hits to support traceability
- Data persistence: Prisma writes for overall scores and per‑element details to enable re‑fetch and dashboards

## 🔌 **API SURFACE & CONTRACTS (Detailed)**

High‑use routes and purpose (serverless on Vercel):
- `POST /api/analyze/compare` – Compare existing vs proposed content, return side‑by‑side diffs, gaps, and recommendations
- `POST /api/scrape-content` – Production‑safe content extraction for a given URL; standardized payload for downstream analyses
- `POST /api/analyze/elements-value-b2c-standalone` – B2C scoring with evidence and category rollups
- `POST /api/analyze/elements-value-b2b-standalone` – B2B scoring with enterprise‑grade insights
- `POST /api/analyze/golden-circle-standalone` – Golden Circle with revenue impact modeling
- `POST /api/analyze/clifton-strengths-standalone` – CliftonStrengths top themes and domain scoring

Standard response envelope:
```json
{
  "success": true,
  "data": { /* framework-specific result */ },
  "message": "Analysis completed successfully"
}
```

Error pattern (typed):
```json
{
  "success": false,
  "error": "Operation failed",
  "details": "Human-readable explanation"
}
```

Notes
- Validate inputs (URL/proposedContent) and enforce size limits
- Persist analysis ids; clients can retrieve results and render dashboards incrementally

## 🧰 **SCRAPING, PUPPETEER & TOOLS (Detailed)**

- Production Content Extraction
  - Serverless‑compatible extractors for HTML/text normalization
  - Defensive parsing, blocked‑site handling, and graceful fallbacks
- Puppeteer Google Tools (workaround)
  - Automated scraping for Trends, PageSpeed, Search Console where feasible
  - Non‑interactive flows, conservative timeouts, rate limiting
  - Fallback: manual data entry via dashboard when automation is blocked
- Scripts (selected)
  - QA/test runners for endpoints and feature flows
  - Lighthouse/page audits
  - Setup utilities for API keys and environment validation

Live references
- Dashboard: https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/dashboard
- Content Comparison: https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/dashboard/content-comparison
- Preview (referenced commit): https://zero-barriers-growth-accelerato-git-5426a1-shayne-roys-projects.vercel.app/

## 🗂️ **Content Categories for Prompts (Taxonomy)**

Use these categories/subcategories to structure inputs and guide AI prompts for consistent scoring and evidence collection.

### B2C Elements of Value (30)
- Functional (14): saves_time, simplifies, reduces_cost, reduces_risk, organizes, integrates, connects, reduces_effort, avoids_hassles, makes_money, reduces_anxiety, rewards_me, fun_entertainment, quality
- Emotional (10): attractive_appearance, provides_access, variety, therapeutic_value, nostalgia, design_aesthetics, badge_value, wellness, reduces_anxiety_emotional, rewards_me_emotional
- Life‑Changing (5): provides_hope, self_actualization, motivation, heirloom, affiliation_belonging
- Social Impact (1): self_transcendence

### B2B Elements of Value (40 elements)
- Table Stakes (4): meeting_specifications, acceptable_price, regulatory_compliance, ethical_standards
- Functional (7):
  - Economic (2): improved_top_line, cost_reduction
  - Performance (5): product_quality, scalability, innovation, flexibility, component_quality
- Ease of Doing Business (19):
  - Productivity (5): time_savings, reduced_effort, decreased_hassles, information, transparency
  - Operational (4): organization, simplification, connection, integration
  - Access (3): availability, variety, configurability
  - Relationship (5): responsiveness, expertise, commitment, stability, cultural_fit
  - Strategic (2): risk_reduction, reach
- Individual (7):
  - Career (3): network_expansion, marketability, reputational_assurance
  - Personal (4): design_aesthetics_b2b, growth_development, reduced_anxiety_b2b, fun_perks
- Inspirational (3): vision, hope_b2b, social_responsibility
- Note: Purpose is a subcategory (organizational structure), not counted as an element

### CliftonStrengths (domains → themes)
- Executing: achiever, arranger, belief, consistency, deliberative, discipline, focus, responsibility, restorative
- Influencing: activator, command, communication, competition, maximizer, self_assurance, significance, woo
- Relationship Building: adaptability, connectedness, developer, empathy, harmony, includer, individualization, positivity, relator
- Strategic Thinking: analytical, context, futuristic, ideation, input, intellection, learner, strategic

### Golden Circle (revenue‑focused variants)
- Why: why_purpose, why_belief, why_cause, why_inspiration
- How: how_process, how_methodology, how_differentiation, how_values
- What: what_product, what_service, what_features, what_benefits

Prompt guidance: tag extracted content and evidence with category → subcategory keys above; enforce JSON fields using these identifiers for consistent parsing and aggregation.

## 🚀 **QUICK START**

### **Prerequisites**

- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### **Installation**

```bash
# Clone repository
git clone https://github.com/ShayneIsMagic/zero-barriers-growth-accelerator-2.0.git
cd zero-barriers-growth-accelerator-2.0

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and API keys

# Set up database
npx prisma db push

# Start development server
npm run dev
```

### **Environment Variables**

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_GEMINI_API_KEY=your-gemini-key
```

## 📊 **API ENDPOINTS**

### **Authentication**

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user

### **Content Analysis**

Top routes used by the Content Comparison flow (as deployed on Vercel):

- `POST /api/analyze/compare` – Competitor discovery from the scrape and language competitiveness assessment (current vs. optional proposed); used by Dashboard → Content Comparison UI; returns { competitors, current, proposed|null, recommendations, notes }
- `POST /api/scrape-content` – Production-friendly content extraction for a given URL (invoked internally as part of analysis flows)
- `POST /api/analyze/elements-value-b2c-standalone` – Runs B2C framework analysis (used in Unified Analysis and individual runs)
- `POST /api/analyze/elements-value-b2b-standalone` – Runs B2B framework analysis
- `POST /api/analyze/golden-circle-standalone` – Golden Circle analysis
- `POST /api/analyze/clifton-strengths-standalone` – CliftonStrengths analysis

Notes:
- API routes are serverless functions (Vercel). Keep payloads bounded and validate input.
- Analyses persist results via Prisma; clients can fetch by analysis id in follow-up views.

#### Endpoint → Handler Map

| Route | Handler file | Purpose |
| --- | --- | --- |
| `POST /api/analyze/compare` | `src/app/api/analyze/compare/route.ts` | Existing vs proposed side‑by‑side analysis |
| `POST /api/scrape-content` | `src/app/api/scrape/content/route.ts` | Production content extraction for a URL |
| `POST /api/analyze/enhanced` | `src/app/api/analyze/enhanced/route.ts` | Reuse a scrape to run a chosen framework |
| `POST /api/analyze/elements-value-b2c-standalone` | `src/app/api/analyze/elements-value-b2c-standalone/route.ts` | B2C elements scoring |
| `POST /api/analyze/elements-value-b2b-standalone` | `src/app/api/analyze/elements-value-b2b-standalone/route.ts` | B2B elements scoring |
| `POST /api/analyze/golden-circle-standalone` | `src/app/api/analyze/golden-circle-standalone/route.ts` | Golden Circle analysis |
| `POST /api/analyze/clifton-strengths-standalone` | `src/app/api/analyze/clifton-strengths-standalone/route.ts` | CliftonStrengths analysis |
| `POST /api/content/compare` | `src/app/api/content/compare/route.ts` | Persist a versioned comparison record |

### **Version Control**

- `POST /api/content/snapshots` - Create content snapshot
- `POST /api/content/proposed` - Create proposed content version
- `POST /api/content/compare` - Create content comparison

## 🎯 **USAGE**

### **Content Comparison Analysis**

1. Go to `/dashboard/content-comparison`
2. Enter website URL
3. Optionally add proposed content
4. Click "Analyze Existing Content"
5. View side-by-side comparison results

### **B2C Elements of Value Analysis**

1. Go to `/dashboard/elements-value-b2c`
2. Enter website URL
3. Click "Analyze Golden Circle"
4. View 30-element consumer value analysis

### **B2B Elements of Value Analysis**

1. Go to `/dashboard/elements-value-b2b`
2. Enter website URL
3. Click "Analyze Golden Circle"
4. View 40-element business value analysis

## 🏗️ **ARCHITECTURE**

### **Database Schema**

- **User** - User authentication and profiles
- **Analysis** - Analysis records and metadata
- **ContentSnapshot** - Website content snapshots
- **ProposedContent** - Version-controlled proposed content
- **ContentComparison** - Detailed content comparisons
- **FrameworkResult** - Structured analysis results
- **FrameworkCategory** - Category-specific results
- **FrameworkElement** - Individual element analysis

#### Minimal Prisma model outline (indicative)

```prisma
model analysis {
  id           String   @id @default(cuid())
  url          String
  created_at   DateTime @default(now())
}

model elements_of_value_b2c {
  id                   String   @id @default(cuid())
  analysis_id          String
  overall_score        Int
  functional_score     Int
  emotional_score      Int
  life_changing_score  Int
  social_impact_score  Int
}

model b2c_element_scores {
  id              String   @id @default(cuid())
  eov_b2c_id      String
  element_name    String
  element_category String
  pyramid_level   Int
  score           Int
  weight          Float
  weighted_score  Float
  evidence        Json
}
```

### **Key Components**

- **ContentComparisonPage** - Main analysis interface
- **UnifiedDataCollection** - Universal data input
- **AssessmentResultsView** - Standardized result display
- **UniversalPuppeteerScraper** - Website content extraction
- **UnifiedAIAnalysisService** - AI analysis orchestration

## 🚀 **DEPLOYMENT**

### **Vercel Deployment**

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Live References**

- Dashboard (features and statuses): [Vercel Dashboard](https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/dashboard)
- Content Comparison page: [Vercel Content Comparison](https://zero-barriers-growth-accelerator-20-fgbn9enzi.vercel.app/dashboard/content-comparison)
- Latest marketing/landing preview for the referenced commit: [Vercel Preview](https://zero-barriers-growth-accelerato-git-5426a1-shayne-roys-projects.vercel.app/)

### **Database Setup**

1. Create Supabase project
2. Run `supabase-schema-migration.sql` in SQL Editor
3. Update `DATABASE_URL` in environment variables

## 📈 **SCORING SYSTEM**

### **Fractional Scoring**

- **Format**: `18/30` (present elements / total elements)
- **Transparent**: Based on actual element counts
- **Contextual**: Category-specific breakdowns
- **Actionable**: Clear improvement opportunities

### **Example Scores**

- B2C Elements: `18/30` (60% coverage)
- B2B Elements: `25/40` (62.5% coverage)
- Golden Circle: `3/4` (75% coverage)

## 🔒 **SECURITY**

## 🔐 Privacy & Data Retention

### Storage Architecture

**Hybrid Storage Strategy:**
- **LocalForage** (Client-side): Immediate UX storage for scrape bundles, framework results, and comprehensive reports. Stored in browser IndexedDB/localStorage.
- **Supabase/Prisma** (Server-side): Optional persistent storage for permanent analysis records. Requires `DATABASE_URL` environment variable.
- **Graceful Degradation**: System works fully with LocalForage alone. Supabase sync is optional and fails gracefully if unavailable.

### Data Flow

1. **Content Comparison**: Saves scrape bundles → LocalForage (always) → Supabase (if configured)
2. **Framework Analyses**: Client-side results → LocalForage → Background sync to Supabase (optional)
3. **Reports Dashboard**: Reads from LocalForage first, falls back to Supabase if available

### Privacy

- Client‑side storage (LocalForage) is browser-local; users can clear at any time
- Server-side storage (Supabase) requires `DATABASE_URL`; gracefully degrades if not configured
- No mock data in production. Secrets only via environment variables

## 🖼️ Screenshots

- Content Comparison: `docs/screenshots/content-comparison.png` (placeholder)
- Analysis Dashboard: `docs/screenshots/dashboard.png` (placeholder)

- **JWT Authentication** - Secure user sessions
- **Row Level Security** - Database-level access control
- **Password Hashing** - bcrypt encryption
- **API Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize user inputs

## 📝 **LICENSE**

MIT License - see LICENSE file for details

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📚 **DOCUMENTATION**

### Essential Documentation

- **[Framework Comprehensive Map](./docs/FRAMEWORK_COMPREHENSIVE_MAP.md)** - Complete framework reference with all elements, categories, subcategories, counts, and fractional scoring systems
- **[Storage Architecture](./docs/STORAGE_ARCHITECTURE.md)** - Hybrid storage strategy (LocalForage + Supabase/Prisma)
- **[Supabase Cleanup Guide](./docs/SUPABASE_CLEANUP_GUIDE.md)** - Database integration and graceful degradation patterns

### Additional Documentation

All documentation files are located in the `docs/` directory, including:
- Integration guides
- AI prompt templates
- API contracts
- Architecture documentation

## 📞 **SUPPORT**

- **Email**: sk@zerobarriers.io
- **Documentation**: [docs.zerobarriers.io](https://docs.zerobarriers.io)
- **Issues**: [GitHub Issues](https://github.com/ShayneIsMagic/zero-barriers-growth-accelerator-2.0/issues)

---

**Built with ❤️ for content optimization and strategic analysis.**

# Zero Barriers Growth Accelerator 2.0

AI-powered marketing optimization platform that systematically analyzes content to identify growth barriers and provide actionable recommendations.

## 🚀 **PRODUCTION READY FEATURES**

### **Core Analysis Frameworks**

- **Content Comparison** - Side-by-side analysis of existing vs proposed content
- **B2C Elements of Value** - 30-element consumer value analysis (flat fractional scoring)
- **B2B Elements of Value** - 40-element business value analysis (flat fractional scoring)
- **Golden Circle** - Simon Sinek's Why/How/What/Who framework (flat fractional scoring)
- **CliftonStrengths** - Gallup's 34 strengths analysis (flat fractional scoring)
- **Brand Archetypes** - 12 archetypal brand identities for narrative analysis

### **Enterprise Features**

- **Content Version Control** - Track content changes and versions
- **Structured Data Storage** - Organized analysis results with auto-save
- **Flat Fractional Scoring** - Transparent 0.0-1.0 scoring system (all elements equal)
- **Universal Scraper** - Comprehensive Puppeteer-based content extraction with SEO/GA4 data
- **Client-Side Caching** - Local Forage (IndexedDB) for offline capability
- **JWT Authentication** - Secure user management

## 🛠️ **TECH STACK**

- **Frontend**: Next.js 15.5.5, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini API
- **Deployment**: Vercel
- **Authentication**: JWT with bcrypt

## 🚀 **QUICK START**

### **Prerequisites**

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Google Gemini API key (required)
- Anthropic Claude API key (optional fallback)

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
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key

# Optional (Claude fallback when Gemini is unavailable)
CLAUDE_API_KEY=your-claude-api-key

# Optional (defaults shown)
GEMINI_MODEL=gemini-1.5-flash
CLAUDE_MODEL=claude-3-haiku-20240307
NODE_ENV=development
```

## 📊 **API ENDPOINTS**

### **Authentication**

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user

### **Content Analysis**

- `POST /api/scrape-content` - Scrape website content
- `POST /api/analyze/compare` - Content comparison analysis
- `POST /api/analyze/elements-value-b2c-standalone` - B2C analysis
- `POST /api/analyze/elements-value-b2b-standalone` - B2B analysis
- `POST /api/analyze/golden-circle-standalone` - Golden Circle analysis
- `POST /api/analyze/clifton-strengths-standalone` - CliftonStrengths analysis

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
3. Click "Analyze B2C Elements"
4. View 30-element consumer value analysis with flat fractional scoring (0.0-1.0)

### **B2B Elements of Value Analysis**

1. Go to `/dashboard/elements-value-b2b`
2. Enter website URL
3. Click "Analyze B2B Elements"
4. View 40-element business value analysis with flat fractional scoring (0.0-1.0)

### **Golden Circle Analysis**

1. Go to `/dashboard/golden-circle`
2. Enter website URL
3. Click "Analyze Golden Circle"
4. View WHY/HOW/WHAT/WHO analysis with flat fractional scoring (0.0-1.0)

### **CliftonStrengths Analysis**

1. Go to `/dashboard/clifton-strengths`
2. Enter website URL
3. Click "Analyze CliftonStrengths"
4. View 34-theme strengths analysis with flat fractional scoring (0.0-1.0)

## 🏗️ **ARCHITECTURE**

### **Database Schema**

- **User** - User authentication and profiles
- **Analysis** - Analysis records and metadata
- **ContentSnapshot** - Website content snapshots with SEO/GA4 metadata
- **ProposedContent** - Version-controlled proposed content
- **ContentComparison** - Detailed content comparisons
- **FrameworkResult** - Structured analysis results
- **FrameworkCategory** - Category-specific results
- **FrameworkElement** - Individual element analysis

### **Key Components**

- **ContentComparisonPage** - Main analysis interface with Local Forage caching
- **UnifiedDataCollection** - Universal data input
- **AssessmentResultsView** - Standardized result display
- **PuppeteerComprehensiveCollector** - Enhanced website content extraction (SEO, GA4, keywords)
- **ContentStorageService** - Server-side content snapshot management
- **ClientContentStorageService** - Client-side Local Forage caching
- **UnifiedAIAnalysisService** - AI analysis orchestration

### **Content Collection Features**

- **SEO Metadata Extraction**: Meta tags, Open Graph, Twitter Cards, canonical URLs
- **Analytics Detection**: Google Analytics 4 (GA4), Google Tag Manager (GTM), Facebook Pixel
- **Keywords Analysis**: Meta keywords, content keywords, heading keywords, alt text keywords
- **Performance Metrics**: Load time, FCP, LCP, CLS
- **Accessibility Audit**: Alt texts, ARIA labels, heading hierarchy

## 🚀 **DEPLOYMENT**

### **Vercel Deployment**

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Database Setup**

1. Create Supabase project
2. Run `supabase-schema-migration.sql` in SQL Editor
3. Update `DATABASE_URL` in environment variables

## 📈 **SCORING SYSTEM**

### **Flat Fractional Scoring (Version 2.0)**

All frameworks use **flat fractional scoring** where every element counts equally. No weights, no arbitrary importance - just transparent, objective scoring.

- **Format**: `0.0-1.0` fractional scores per element
- **Philosophy**: Every element matters equally - simple averages throughout
- **Transparent**: Easy to understand calculations (sum ÷ count)
- **Fair**: No tier or category weights applied
- **Actionable**: Clear priorities for improvement

### **Scoring Scale**

- **0.8-1.0** - **Excellent** - Industry-leading, exceptional value
- **0.6-0.79** - **Good** - Above market average, solid delivery
- **0.4-0.59** - **Needs Work** - Below expectations, requires improvement
- **0.0-0.39** - **Poor** - Weak or non-existent, critical gap

### **Framework Scoring Details**

#### **B2C Elements of Value (30 elements)**
- **Tier 1: Functional** (14 elements) - Average of 14 scores
- **Tier 2: Emotional** (10 elements) - Average of 10 scores
- **Tier 3: Life-Changing** (5 elements) - Average of 5 scores
- **Tier 4: Social Impact** (1 element) - Single score
- **Overall Score**: Sum of all 30 scores ÷ 30

#### **B2B Elements of Value (40 elements)**
- **Tier 1: Table Stakes** (4 elements) - Average of 4 scores
- **Tier 2: Functional** (7 elements) - Average of 7 scores
- **Tier 3: Ease of Doing Business** (19 elements) - Average of 19 scores
- **Tier 4: Individual** (7 elements) - Average of 7 scores
- **Tier 5: Inspirational** (3 elements) - Average of 3 scores
- **Overall Score**: Sum of all 40 scores ÷ 40

#### **Golden Circle (4 components)**
Each component scored across 6 dimensions (0.0-1.0 each):
- **WHY** (Purpose): Clarity, Authenticity, Inspiration, Consistency, Differentiation, Emotional Resonance
- **HOW** (Differentiators): Uniqueness, Clarity, Consistency, Alignment, Proof Points, Competitive Moat
- **WHAT** (Offerings): Clarity, Alignment, Quality, Proof, Evolution, Market Fit
- **WHO** (Audience): Clarity, Alignment, Specificity, Understanding, Resonance, Loyalty
- **Component Score**: Average of 6 dimensions
- **Overall Score**: Average of 4 component scores

#### **CliftonStrengths (34 themes)**
- **Domain 1: Strategic Thinking** (8 themes) - Average of 8 scores
- **Domain 2: Relationship Building** (9 themes) - Average of 9 scores
- **Domain 3: Influencing** (8 themes) - Average of 8 scores
- **Domain 4: Executing** (9 themes) - Average of 9 scores
- **Overall Score**: Sum of all 34 theme scores ÷ 34

### **Example Scores**

- B2C Elements: `0.68` overall (Good - 30 elements averaged)
- B2B Elements: `0.74` overall (Good - 40 elements averaged)
- Golden Circle: `0.82` overall (Excellent - 4 components averaged)
- CliftonStrengths: `0.63` overall (Good - 34 themes averaged)

## 🔒 **SECURITY**

- **JWT Authentication** - Secure user sessions
- **Row Level Security** - Database-level access control
- **Password Hashing** - bcrypt encryption
- **API Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize user inputs

## 🎭 **BRAND ARCHETYPES**

The platform supports analysis using the 12 Brand Archetypes framework for narrative and storytelling analysis:

1. **Sage** - Wisdom, knowledge, mentorship
2. **Explorer** - Freedom, adventure, discovery
3. **Hero** - Courage, strength, determination
4. **Regular Guy/Girl** - Belonging, relatability, authenticity
5. **Caregiver** - Compassion, nurturing, support
6. **Jester** - Joy, humor, entertainment
7. **Innocent** - Optimism, simplicity, purity
8. **Outlaw** - Revolution, rebellion, change
9. **Magician** - Transformation, vision, innovation
10. **Creator** - Innovation, artistry, expression
11. **Ruler** - Leadership, control, excellence
12. **Lover** - Passion, intimacy, connection

### **Narrative Archetypes**

The platform can analyze content using storytelling frameworks:
- **Happily Ever After** - Success stories and positive outcomes
- **Rebirth** - Transformation and redemption narratives
- **Overcoming the Monster** - Confronting and defeating challenges
- **Rags to Riches** - Journey from struggle to success

## 📝 **LICENSE**

MIT License - see LICENSE file for details

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 **SUPPORT**

- **Email**: sk@zerobarriers.io
- **Documentation**: [docs.zerobarriers.io](https://docs.zerobarriers.io)
- **Issues**: [GitHub Issues](https://github.com/ShayneIsMagic/zero-barriers-growth-accelerator-2.0/issues)

---

**Built with ❤️ for content optimization and strategic analysis.**

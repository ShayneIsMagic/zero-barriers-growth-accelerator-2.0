# Zero Barriers Growth Accelerator 2.0

AI-powered marketing optimization platform that systematically analyzes content to identify growth barriers and provide actionable recommendations.

## 🚀 **PRODUCTION READY FEATURES**

### **Core Analysis Frameworks**

- **Content Comparison** - Side-by-side analysis of existing vs proposed content
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

## 📞 **SUPPORT**

- **Email**: sk@zerobarriers.io
- **Documentation**: [docs.zerobarriers.io](https://docs.zerobarriers.io)
- **Issues**: [GitHub Issues](https://github.com/ShayneIsMagic/zero-barriers-growth-accelerator-2.0/issues)

---

**Built with ❤️ for content optimization and strategic analysis.**

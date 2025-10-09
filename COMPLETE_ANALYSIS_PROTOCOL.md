# 📊 Complete Analysis Protocol & Data Flow

## Database Tables & Relationships

### ✅ Tables Created in Supabase:

#### Table 1: User
```sql
User {
  id: TEXT (Primary Key)
  email: TEXT (Unique)
  name: TEXT
  password: TEXT (bcrypt hashed)
  role: TEXT (SUPER_ADMIN, USER)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

**Contains**: 3 users
- shayne+1@devpipeline.com (SUPER_ADMIN)
- sk@zerobarriers.io (USER)
- shayne+2@devpipeline.com (USER)

#### Table 2: Analysis
```sql
Analysis {
  id: TEXT (Primary Key)
  userId: TEXT (Foreign Key → User.id)
  content: TEXT (Complete JSON result)
  contentType: TEXT ('website', 'comprehensive', 'seo', 'enhanced')
  status: TEXT ('PENDING', 'COMPLETED', 'FAILED')
  score: DOUBLE PRECISION (0-10)
  insights: TEXT
  frameworks: TEXT
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

**Relationship**: User → Analysis (One-to-Many)

**Indexes**:
- userId (for finding user's analyses)
- status (for filtering)
- createdAt (for sorting)

---

## 🔄 Complete Analysis Flow Protocol

### MASTER SEQUENCE (Data-Driven Order)

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: DATA COLLECTION (Foundation Layer)                 │
│ Where: App Server | Tools: Puppeteer, Cheerio               │
│ Time: 0-15% of analysis                                      │
└─────────────────────────────────────────────────────────────┘

Step 1.1: Content Scraping (App Server)
   Tool: Puppeteer + Cheerio
   Input: Website URL
   Output: {
     title, metaDescription, bodyText, headings[],
     images[], links[], navigation[], forms[],
     aboutContent, missionStatement
   }
   Stored: In memory for next steps

Step 1.2: Industry Detection (AI - Gemini)
   Tool: Gemini API Call #1
   Input: Scraped content (focus on about/mission)
   Prompt: "Detect industry, business model, target market"
   Output: {
     industry: "B2B SaaS",
     businessModel: "B2B",
     targetMarket: "SMB",
     confidence: 0.95
   }
   Stored: Sets context for ALL subsequent analysis

┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: TECHNICAL BASELINE (Objective Metrics)              │
│ Where: External Tools | No AI needed                        │
│ Time: 15-30% of analysis                                     │
└─────────────────────────────────────────────────────────────┘

Step 2.1: Lighthouse Analysis (External Tool)
   Tool: Google Lighthouse
   Input: Website URL (direct)
   Output: {
     performance: 79/100,
     accessibility: 95/100,
     bestPractices: 78/100,
     seo: 100/100,
     metrics: { FCP, LCP, TBT, CLS }
   }
   Stored: In memory, added to final result

Step 2.2: PageAudit Technical SEO (External Tool)
   Tool: PageAudit library
   Input: Scraped HTML
   Output: {
     metaTags: {...},
     headingStructure: {...},
     imageOptimization: {...},
     mobileResponsive: boolean
   }
   Stored: In memory

Step 2.3: Google Trends & Search Data (External API)
   Tool: Google Trends API
   Input: Extracted keywords from content
   Output: {
     trendingKeywords: [...],
     searchVolume: {...},
     seasonalPatterns: {...},
     relatedQueries: [...]
   }
   Stored: In memory

┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: LANGUAGE & MESSAGING ANALYSIS (AI)                 │
│ Where: AI Analysis | Tool: Gemini                           │
│ Time: 30-45% of analysis                                     │
└─────────────────────────────────────────────────────────────┘

Step 3.1: Language Type Analysis (AI - Gemini)
   Tool: Gemini API Call #2
   Input: All scraped text content
   Prompt: "Count value-centric vs benefit-centric language"
   Process:
     - Scan for value-centric: "helps you", "enables", "drives success"
     - Scan for benefit-centric: "has features", "includes tools"
     - Calculate ratio
     - Compare to industry benchmark (from Step 1.2)
   Output: {
     valueCentricCount: 45,
     benefitCentricCount: 78,
     ratio: 0.37,
     industryBenchmark: 0.70,
     gap: -0.33,
     recommendation: "Increase value-centric language by 33%"
   }
   Stored: Used in brand alignment and recommendations

Step 3.2: Brand Alignment Analysis (AI - Gemini)
   Tool: Gemini API Call #3
   Input:
     - About page content (stated purpose)
     - All website content (shown emphasis)
     - Language analysis from Step 3.1
   Prompt: "Compare stated vs demonstrated brand elements"
   Process:
     - Extract stated purpose from mission/about
     - Analyze what content actually emphasizes
     - Calculate alignment gap
     - Identify missing elements
   Output: {
     purpose: {
       stated: "We innovate...",
       demonstrated: "Content shows focus on...",
       alignmentScore: 6.5/10,
       gap: "Says innovation but no examples"
     },
     pillars: {
       stated: ["Innovation", "Quality"],
       demonstrated: ["Quality evident", "Innovation missing"],
       missing: ["Innovation case studies needed"]
     },
     contentGaps: [...]
   }
   Stored: Feeds into Golden Circle

┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: FRAMEWORK ANALYSIS (AI - Multi-Perspective)        │
│ Where: AI Analysis | Tool: Gemini                           │
│ Time: 45-85% of analysis                                     │
└─────────────────────────────────────────────────────────────┘

Step 4.1: Golden Circle + WHO (AI - Gemini)
   Tool: Gemini API Call #4
   Input:
     - Brand alignment data (from 3.2)
     - Industry context (from 1.2)
     - All scraped content
   Prompt: "Analyze using Golden Circle framework"
   Process:
     WHY: Purpose (uses stated vs shown from 3.2)
     HOW: Unique approach (industry-relative)
     WHAT: Products/services catalog
     WHO: Target audience (B2C signals, B2B signals, or both)
   Output: {
     why: { score: 8/10, currentState, recommendations, evidence },
     how: { score: 7/10, ... },
     what: { score: 9/10, ... },
     who: {
       score: 7/10,
       audiences: {
         b2cSignals: ["individual users", "consumers"],
         b2bSignals: ["enterprises", "SMBs"],
         primary: "B2B"  // ← CRITICAL: Determines next steps
       }
     }
   }
   Stored: WHO results determine B2C vs B2B weighting

Step 4.2: B2C Elements of Value (AI - Gemini)
   Tool: Gemini API Call #5
   Input:
     - WHO.b2cSignals (from 4.1)
     - Content targeting consumers
     - Industry context (weights from 1.2)
   Condition: ONLY IF WHO shows B2C signals
   Prompt: "Analyze 30 B2C value elements"
   Process:
     - Weight elements by industry
     - E.g., for SaaS: "saves time" = high priority
     - E.g., for retail: "quality" + "variety" = high
   Output: {
     functional: { saves-time: 8/10, simplifies: 7/10, ... },
     emotional: { reduces-anxiety: 6/10, ... },
     lifeChanging: { provides-hope: 5/10, ... },
     socialImpact: { self-transcendence: 4/10 },
     overallScore: 6.5/10,
     insights: [...]
   }
   Stored: Combined with B2B for complete value map

Step 4.3: B2B Elements of Value (AI - Gemini)
   Tool: Gemini API Call #6
   Input:
     - WHO.b2bSignals (from 4.1)
     - Content targeting businesses
     - Industry benchmarks
   Condition: ONLY IF WHO shows B2B signals
   Prompt: "Analyze 40 B2B value elements"
   Process:
     - Weight by industry
     - For SaaS: productivity, integration, ROI = critical
     - For services: ease of business, trust = critical
   Output: {
     tableStakes: { meets-specs: true, quality: 8/10 },
     functional: { improves-productivity: 9/10, reduces-cost: 7/10 },
     easeOfBusiness: { saves-time: 8/10, ... },
     individual: { career-advancement: 6/10, ... },
     inspirational: { vision: 7/10, social-responsibility: 5/10 },
     overallScore: 7.5/10
   }
   Stored: Combined with B2C

Step 4.4: CliftonStrengths (AI - Gemini)
   Tool: Gemini API Call #7
   Input:
     - ALL previous analysis
     - Organizational language patterns
     - Brand personality signals
   Prompt: "Identify organizational strength themes (34 themes)"
   Process:
     - Analyze language for theme patterns
     - E.g., "data-driven", "analytical" → Analytical theme
     - E.g., "get it done", "results" → Achiever theme
     - Score across 4 domains
   Output: {
     strategicThinking: { analytical: 8/10, futuristic: 6/10, ... },
     executing: { achiever: 9/10, discipline: 7/10, ... },
     influencing: { communication: 8/10, ... },
     relationshipBuilding: { empathy: 6/10, ... },
     topThemes: ["Analytical", "Achiever", "Strategic", ...]
   }
   Stored: Organizational personality profile

┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: SYNTHESIS & RECOMMENDATIONS (AI)                   │
│ Where: AI Analysis | Tool: Gemini                           │
│ Time: 85-100% of analysis                                    │
└─────────────────────────────────────────────────────────────┘

Step 5.1: Cross-Perspective Integration (AI - Gemini)
   Tool: Gemini API Call #8
   Input: ALL previous data (Steps 1-4)
   Prompt: "Synthesize all perspectives, find patterns"
   Process:
     - Check B2C vs B2B balance (align with WHO?)
     - Verify brand stated = shown (from 3.2)
     - Cross-reference value elements with Golden Circle
     - Validate CliftonStrengths support brand claims
   Output: {
     coherenceScore: 7.8/10,
     alignmentIssues: [...],
     opportunities: [...]
   }

Step 5.2: Industry-Specific Recommendations (AI - Gemini)
   Tool: Gemini API Call #9 (Final)
   Input:
     - Industry context (from 1.2)
     - All analysis results
     - Industry benchmarks
   Prompt: "Generate prioritized recommendations for [industry]"
   Process:
     - Compare to industry standards
     - Identify critical gaps
     - Prioritize by impact and effort
     - Add industry-specific best practices
   Output: {
     immediate: ["Add ROI calculator (SaaS standard)", ...],
     shortTerm: ["Increase value-centric to 70%", ...],
     longTerm: ["Develop case study library", ...],
     industrySpecific: [...]
   }

┌─────────────────────────────────────────────────────────────┐
│ FINAL: STORE & RETURN                                       │
│ Where: Database & Client | Time: Final 1%                   │
└─────────────────────────────────────────────────────────────┘

Step 6: Store Complete Result
   Database: Supabase Analysis table
   Structure: {
     id: generated,
     userId: current user,
     content: JSON.stringify({
       industry: {...},
       languageAnalysis: {...},
       brandAlignment: {...},
       goldenCircle: {...},
       b2cElements: {...},
       b2bElements: {...},
       cliftonStrengths: {...},
       seoAnalysis: {...},
       lighthouseAnalysis: {...},
       recommendations: {...}
     }),
     score: overallScore,
     status: 'COMPLETED',
     createdAt: now
   }

Step 7: Return to Client
   Client receives complete analysis
   Saves to localStorage (backup)
   Displays results
   Shows export buttons
```

---

## 📋 Tool-by-Tool Protocol

### App Server (Next.js)
**Responsibilities:**
- Orchestrate the sequence
- Call external tools in order
- Aggregate results
- Store in database

**Does NOT**:
- Analyze content (AI does that)
- Calculate scores (AI does that)
- Make recommendations (AI does that)

---

### Gemini AI (9 API Calls Total)
**Call #1**: Industry Detection
**Call #2**: Language Type Analysis
**Call #3**: Brand Alignment
**Call #4**: Golden Circle + WHO
**Call #5**: B2C Elements (conditional on WHO)
**Call #6**: B2B Elements (conditional on WHO)
**Call #7**: CliftonStrengths
**Call #8**: Cross-Perspective Synthesis
**Call #9**: Final Recommendations

**Protocol**: SEQUENTIAL (one at a time)
```typescript
// CORRECT:
const industry = await gemini.call1_detectIndustry();  // Wait
const language = await gemini.call2_analyzeLanguage();  // Then this
const brand = await gemini.call3_brandAlignment();      // Then this
// etc...

// WRONG:
await Promise.all([
  gemini.call1(), // All at once = rate limits!
  gemini.call2(),
  gemini.call3()
]);
```

---

### Google Tools (External APIs)
**Google Trends**:
- Input: Keywords from scraped content
- When: Phase 2 (Step 2.3)
- Output: Search trends, volume, patterns

**Google Search Console** (if configured):
- Input: Domain
- When: Phase 2 (Step 2.3)
- Output: Current rankings, impressions

**Google Lighthouse**:
- Input: Website URL
- When: Phase 2 (Step 2.1)
- Output: Performance metrics

---

### Puppeteer (Web Scraping)
**When**: First step of Phase 1
**Input**: Website URL
**Process**:
1. Launch headless browser
2. Navigate to URL
3. Wait for content load
4. Extract all text, images, links
5. Capture screenshots (optional)
6. Close browser

**Output**: Raw HTML and extracted data

---

## 🎯 Data Dependencies (What Needs What)

```
Industry Detection (Step 1.2)
    ↓ (sets weights)
Language Analysis (Step 3.1)
    ↓ (provides style context)
Brand Alignment (Step 3.2)
    ↓ (informs purpose)
Golden Circle + WHO (Step 4.1)
    ↓ (determines which elements to analyze)
    ├──→ B2C Elements (if WHO shows consumers)
    └──→ B2B Elements (if WHO shows businesses)
         ↓ (provides value context)
CliftonStrengths (Step 4.4)
    ↓ (all data together)
Synthesis (Step 5)
```

**Can't skip steps or reorder - each depends on previous!**

---

## 📊 What Gets Stored Where

### During Analysis (Temporary):
- **App Memory**: Current step results
- **No storage**: Data flows through sequence

### After Completion:
- **Supabase Database**: Complete analysis (JSON in content field)
- **Client localStorage**: Backup copy for session
- **Nowhere else**: No file system, no cache

### User Wants to Keep It:
- **Export as PDF**: User downloads
- **Export as Markdown**: User downloads
- **Email**: User sends via email client
- **Database**: Optional - can be deleted after export

---

## 🔄 Associations & Lookups

### User → Analyses
```sql
-- Get all analyses for a user
SELECT * FROM "Analysis"
WHERE "userId" = 'admin-shayne-001'
ORDER BY "createdAt" DESC;
```

### Analysis → User
```sql
-- Get user who created analysis
SELECT u.* FROM "User" u
JOIN "Analysis" a ON a."userId" = u.id
WHERE a.id = 'analysis-123';
```

### URL → Analyses
```sql
-- Find all analyses for a website
SELECT * FROM "Analysis"
WHERE content::json->>'url' = 'https://example.com';
-- Note: PostgreSQL JSON query
```

---

## 🎯 Clear Protocols

### When App Server Acts:
1. Receives analysis request
2. Calls Puppeteer to scrape
3. Calls Lighthouse for performance
4. Calls Google Trends for SEO
5. Orchestrates AI calls (sequential!)
6. Aggregates all results
7. Stores in database
8. Returns to client

### When AI (Gemini) Analyzes:
1. Industry detection → Sets context
2. Language analysis → Style baseline
3. Brand alignment → Purpose check
4. Golden Circle → Framework #1
5. B2C/B2B Elements → Framework #2 (conditional)
6. CliftonStrengths → Framework #3
7. Synthesis → Integration
8. Recommendations → Industry-specific

### When Google Tools Run:
- Lighthouse: Parallel with scraping (independent)
- Trends: After keywords extracted
- PageAudit: After HTML scraped

### When Database Stores:
- ONLY after complete analysis done
- Stores complete JSON result
- One record = one analysis
- Linked to user who requested it

---

## ✅ Verification Checklist

### Tables Created:
- [ ] "User" table exists in Supabase
- [ ] "Analysis" table exists in Supabase
- [ ] Indexes created (userId, status, createdAt)
- [ ] Foreign key relationship: Analysis.userId → User.id

### Users Created:
- [ ] 3 users in database with hashed passwords
- [ ] Can query: SELECT * FROM "User";

### Protocols Clear:
- [x] Sequence documented (10 steps, data-driven order)
- [x] Tool responsibilities defined (App vs AI vs External)
- [x] Dependencies mapped (what needs what)
- [x] Storage strategy clear (JSON in one field)
- [x] Sequential AI calls (not parallel)

---

## 🚀 Next Steps

1. **Verify site is accessible** (Vercel protection disabled)
2. **Test login** (shayne+1@devpipeline.com / ZBadmin123!)
3. **Run one analysis** (check sequence works)
4. **Review Gemini call pattern** (should be sequential)
5. **Add missing analyzers** (Language Type, Brand Alignment)

---

**Is the site loading now without Vercel authentication?**

**Can you see your actual homepage and sign-in form?** 🔓


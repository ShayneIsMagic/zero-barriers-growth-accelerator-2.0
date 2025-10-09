# 🎯 Correct Analysis Framework Structure

## How the Frameworks Actually Work (Your Clarification)

### Multi-Perspective Analysis System:

---

## 📊 The Different Perspectives:

### 1. **B2C Elements of Value** (Consumer Perspective)
**Target**: Individual end-users
**Question**: "What do individual consumers want from this?"

**Analyzes**:
- Functional value (saves time, reduces cost, simplifies)
- Emotional value (reduces anxiety, provides hope, fun)
- Life-changing value (self-actualization, motivation)
- Social impact (self-transcendence)

**From README**: 30 consumer value elements across 4 pyramids

---

### 2. **B2B Elements of Value** (Business Perspective)
**Target**: Organizations and business clients
**Question**: "What do business clients/partners want from this?"

**Analyzes**:
- Table stakes (meets specifications, quality)
- Functional (improves revenue, reduces cost, productivity)
- Ease of doing business (saves time, reduces effort)
- Individual (career advancement, personal benefits)
- Inspirational (vision, hope, social responsibility)

**From README**: 40 business value elements across 5 categories

---

### 3. **Golden Circle + WHO** (Both Perspectives)
**Target**: Universal - applies to both consumers AND businesses
**Question**: "Why does this exist, how is it different, what do they offer, who is it for?"

**Analyzes**:
- WHY (Purpose & belief) - Appeals to both B2C and B2B
- HOW (Unique approach) - Appeals to both
- WHAT (Products/services) - Appeals to both
- WHO (Target audience) - Both consumers AND business clients

---

### 4. **CliftonStrengths** (Both Perspectives)
**Target**: Organizational character that appeals to both
**Question**: "What strengths does the organization demonstrate?"

**Analyzes**:
- Strategic Thinking domain
- Executing domain
- Influencing domain
- Relationship Building domain

**Appeals to**:
- Consumers (trust in organization's capability)
- Businesses (partnership compatibility)

---

### 5. **SEO Tools** (Search & Trends Perspective)
**Target**: How content performs in search
**Question**: "How is the language trending? What are people searching for?"

**Analyzes**:
- Keyword trends (Google Trends)
- Search volume and patterns
- Competitor keywords
- Seasonal patterns
- Geographic interest

---

### 6. **NEW: Brand Purpose, Pillars & Values** ⭐
**Target**: Brand alignment check
**Question**: "Does the website SHOW what they SAY they are?"

**Analyzes**:

#### A. Brand Purpose Analysis
- What they **SAY** their purpose is (About page, mission statement)
- What their content **SHOWS** their purpose is (actual messaging)
- **GAP**: Difference between stated vs. demonstrated

#### B. Brand Pillars
- Stated pillars/values (explicit claims)
- Demonstrated pillars (actual focus in content)
- Alignment score

#### C. Value-Centric vs Benefit-Centric Language
- **Value-centric**: Focus on customer outcomes ("helps you grow")
- **Benefit-centric**: Focus on features ("has 50 tools")
- **Ratio**: Which dominates the content?
- **Recommendation**: Shift toward value-centric

#### D. Content Gap Analysis
- What they **claim** to be about
- What their **content actually** emphasizes
- **Added content needed**: What's missing
- **Desired content**: What should be amplified

---

## 🗄️ Database Structure (Still Simple!)

### We DON'T need separate tables for each framework

### We DO need:

```sql
Analysis {
  content: JSON containing {
    // Consumer perspective
    "b2c": { functional: {...}, emotional: {...}, lifeChanging: {...} },

    // Business perspective
    "b2b": { tableStakes: {...}, functional: {...}, inspirational: {...} },

    // Universal perspective
    "goldenCircle": { why: {...}, how: {...}, what: {...}, who: {...} },
    "cliftonStrengths": { strategicThinking: {...}, executing: {...} },

    // Search perspective
    "seo": { trends: {...}, keywords: {...}, competitors: {...} },

    // NEW: Brand alignment perspective
    "brandAlignment": {
      "purpose": {
        "stated": "What they say on About page",
        "demonstrated": "What content actually shows",
        "gap": "Misalignment areas",
        "gapScore": 7.5,
        "recommendations": [...]
      },
      "pillars": {
        "stated": ["Pillar 1", "Pillar 2"],
        "demonstrated": ["Actually shows X", "Actually shows Y"],
        "alignment": 0.65,
        "missing": ["Need to add Z"]
      },
      "languageAnalysis": {
        "valueCentricCount": 45,
        "benefitCentricCount": 78,
        "ratio": 0.58,
        "recommendation": "Shift 20% more toward value-centric language",
        "examples": {
          "current": ["We have 50 features"],
          "suggested": ["We help you grow 50% faster"]
        }
      },
      "contentGaps": [
        {
          "stated": "We value innovation",
          "found": false,
          "recommendation": "Add innovation examples/case studies"
        }
      ]
    }
  }
}
```

**All in ONE JSON field = Simple database ✅**
**Sophisticated analysis = Smart AI prompts ✅**

---

## 🎯 What Needs to Be Added to Code

### New Analysis Module:

**File**: `src/lib/brand-alignment-analyzer.ts`

```typescript
export async function analyzeBrandAlignment(websiteContent: string) {
  return {
    purpose: await analyzePurposeAlignment(websiteContent),
    pillars: await analyzePillars(websiteContent),
    languageAnalysis: await analyzeLanguageType(websiteContent),
    contentGaps: await findContentGaps(websiteContent)
  };
}

async function analyzePurposeAlignment(content: string) {
  const prompt = `
  Analyze this website content:

  1. Find STATED purpose/mission (usually on About page, mission statement)
  2. Identify DEMONSTRATED purpose (what content actually emphasizes)
  3. Calculate alignment gap (0-10, 10 = perfect alignment)
  4. Provide recommendations to close the gap

  Content: ${content}
  `;

  const result = await gemini.analyze(prompt);
  return result;
}

async function analyzeLanguageType(content: string) {
  const prompt = `
  Analyze the language style in this content:

  Count instances of:
  1. VALUE-CENTRIC language:
     - "helps you achieve"
     - "enables your growth"
     - "drives your success"
     - Customer outcome focused

  2. BENEFIT-CENTRIC language:
     - "has 50 features"
     - "includes X tools"
     - "provides Y functionality"
     - Feature focused

  Provide:
  - Count of each type
  - Ratio (value-centric / total)
  - Recommendation to shift balance
  - Example transformations

  Content: ${content}
  `;

  const result = await gemini.analyze(prompt);
  return result;
}
```

---

## 📋 Updated Analysis Result Structure

```typescript
interface WebsiteAnalysisResult {
  // Existing frameworks
  goldenCircle: { why, how, what, who };  // Both perspectives
  b2cElements: { ... };                   // Consumer perspective
  b2bElements: { ... };                   // Business perspective
  cliftonStrengths: { ... };              // Both perspectives
  seoAnalysis: { ... };                   // Search perspective
  lighthouseAnalysis: { ... };            // Technical perspective

  // NEW: Brand alignment perspective
  brandAlignment: {
    purpose: {
      stated: string;
      demonstrated: string;
      alignmentScore: number;  // 0-10
      gap: string[];
      recommendations: string[];
    };
    pillars: {
      stated: string[];
      demonstrated: string[];
      alignmentScore: number;
      missing: string[];
      recommendations: string[];
    };
    languageAnalysis: {
      valueCentricCount: number;
      benefitCentricCount: number;
      valueCentricRatio: number;
      currentExamples: string[];
      suggestedTransformations: string[];
      recommendation: string;
    };
    contentGaps: Array<{
      claim: string;
      evidenceFound: boolean;
      recommendation: string;
    }>;
    overallAlignmentScore: number;
  };
}
```

---

## 🎯 Simple Implementation Plan

### Step 1: Create Database Tables (Now - 2 min)
- Run SQL in Supabase
- Creates User and Analysis tables
- Simple structure, stores JSON

### Step 2: Add Brand Alignment Analysis (Later - 1 hour)
- Create brand-alignment-analyzer.ts
- Add to analysis pipeline
- Include in results

### Step 3: Update Results Display (Later - 30 min)
- Add Brand Alignment section to results
- Show stated vs demonstrated
- Show value-centric ratio
- Show content gaps

---

## 💡 Key Insight: Database Stays Simple!

**Complex Analysis** (6 different perspectives)
**+**
**Simple Storage** (JSON in one field)
**=**
**Best of both worlds** ✅

The sophistication is in the AI prompts and analysis logic, not in database schema!

---

**For now: Run the SQL above to create tables. Then we can QA and add Brand Alignment analysis after!** 🚀

**Did you paste the SQL and click "Run"? What happened?**

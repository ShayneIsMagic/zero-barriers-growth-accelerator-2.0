# AI PROMPTS DOCUMENTATION

## Zero Barriers Growth Accelerator V2

This document catalogs all AI prompts used in the system, their purposes, and expected outputs.

---

## 🎯 **MAIN ANALYSIS PROMPT** (`src/lib/free-ai-analysis.ts`)

**Purpose**: Comprehensive website analysis using multiple frameworks
**AI Service**: Google Gemini (primary), Claude (fallback)
**Input**: Website content (scraped text)
**Output**: Complete analysis with all frameworks

### **Prompt Structure**:

```
Analyze the following website content using proven marketing frameworks. Provide specific scores (1-10) and actionable insights.

CONTENT TO ANALYZE:
{website_content}

ANALYSIS FRAMEWORKS:

1. SIMON SINEK'S GOLDEN CIRCLE (INCLUDING WHO):
   - WHY: What is the purpose, cause, or belief? (Score 1-10)
   - HOW: What is the unique methodology or approach? (Score 1-10)
   - WHAT: What are the specific products/services offered? (Score 1-10)
   - WHO: Who is the target audience and how does the brand connect emotionally? (Score 1-10)

2. CONSUMER ELEMENTS OF VALUE (30 Elements):
   - Functional (14 elements): Saves time, Simplifies, Makes money, Reduces risk, Organizes, Integrates, Connects, Reduces effort, Avoids hassles, Reduces cost, Quality, Variety, Sensory appeal, Informs
   - Emotional (10 elements): Reduces anxiety, Rewards me, Nostalgia, Design/aesthetics, Badge value, Wellness, Therapeutic value, Fun/entertainment, Attractiveness, Provides access
   - Life-Changing (5 elements): Provides hope, Self-actualization, Motivation, Heirloom, Affiliation and belonging
   - Social Impact (1 element): Self-transcendence

3. B2B ELEMENTS OF VALUE (40 Elements):
   - Table Stakes (4 elements): Meeting specifications, Acceptable price, Regulatory compliance, Ethical standards
   - Functional (9 elements): Economic (Improved top line, Cost reduction), Performance (Product quality, Scalability, Innovation), Strategic (Risk reduction, Reach, Flexibility, Component quality)
   - Ease of Doing Business (17 elements): Productivity, Information, Operational, Access, Relationship subcategories
   - Individual (7 elements): Career, Personal subcategories
   - Inspirational (4 elements): Vision, Hope, Social responsibility, Purpose

4. CLIFTONSTRENGTHS DOMAINS (34 Themes):
   - Strategic Thinking (8 themes): Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic
   - Executing (9 themes): Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
   - Influencing (8 themes): Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
   - Relationship Building (9 themes): Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator

5. TRANSFORMATION ANALYSIS:
   - Messaging: Clear, compelling, benefit-focused (Score 1-10)
   - Social Media: Engaging, shareable, authentic (Score 1-10)
   - Competitive: Unique positioning, differentiation (Score 1-10)
```

### **Expected Output Format**:

```json
{
  "overallScore": 0,
  "executiveSummary": "Your analysis summary here",
  "goldenCircle": {
    "why": { "score": 0, "insights": [] },
    "how": { "score": 0, "insights": [] },
    "what": { "score": 0, "insights": [] },
    "who": {
      "score": 0,
      "targetAudience": [],
      "emotionalConnection": "",
      "insights": []
    },
    "overallScore": 0,
    "recommendations": []
  },
  "elementsOfValue": {
    "functional": { "score": 0, "elements": {}, "recommendations": [] },
    "emotional": { "score": 0, "elements": {}, "recommendations": [] },
    "lifeChanging": { "score": 0, "elements": {}, "recommendations": [] },
    "socialImpact": { "score": 0, "elements": {}, "recommendations": [] },
    "overallScore": 0
  },
  "b2bElements": {
    "tableStakes": { "score": 0, "elements": {}, "recommendations": [] },
    "functional": { "score": 0, "elements": {}, "recommendations": [] },
    "easeOfDoingBusiness": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "individual": { "score": 0, "elements": {}, "recommendations": [] },
    "inspirational": { "score": 0, "elements": {}, "recommendations": [] },
    "overallScore": 0
  },
  "cliftonStrengths": {
    "strategicThinking": { "score": 0, "elements": {}, "recommendations": [] },
    "executing": { "score": 0, "elements": {}, "recommendations": [] },
    "influencing": { "score": 0, "elements": {}, "recommendations": [] },
    "relationshipBuilding": {
      "score": 0,
      "elements": {},
      "recommendations": []
    },
    "overallScore": 0
  },
  "transformationAnalysis": {
    "messaging": {
      "current": "",
      "recommended": "",
      "score": 0,
      "insights": []
    },
    "socialMedia": {
      "current": "",
      "recommended": "",
      "score": 0,
      "insights": []
    },
    "competitive": {
      "current": "",
      "recommended": "",
      "score": 0,
      "insights": []
    },
    "overallScore": 0,
    "recommendations": []
  }
}
```

---

## 🎯 **FOCUSED ANALYSIS PROMPTS** (`src/lib/services/focused-analysis.service.ts`)

### **1. WHY Analysis Prompt**

**Purpose**: Focused Golden Circle WHY dimension analysis
**Input**: Website content
**Output**: WHY statement with ratings and evidence

```
Analyze ONLY the WHY dimension of this organization's Golden Circle.

WEBSITE CONTENT:
{website_content}

FOCUS: WHY - Purpose & Belief
- What is their core purpose/belief?
- Why does this organization exist beyond making money?
- Rate clarity (1-10): How clearly is the WHY communicated?
- Rate authenticity (1-10): Does it feel genuine?
- Rate emotional resonance (1-10): Does it inspire emotion?
- Rate differentiation (1-10): Is it unique vs competitors?

Provide evidence with specific citations from content.
Give 3-5 recommendations for improvement.
```

### **2. Functional Elements Analysis Prompt**

**Purpose**: Focused B2C Functional Elements analysis (14 elements)
**Input**: Website content
**Output**: Functional elements scores and evidence

```
Analyze ONLY the FUNCTIONAL elements of value (14 elements).

WEBSITE CONTENT:
{website_content}

FOCUS: FUNCTIONAL ELEMENTS (Pyramid Level 1)
1. saves_time - Helps complete tasks faster
2. simplifies - Makes things easier
3. makes_money - Helps earn income
4. reduces_effort - Minimizes work required
5. reduces_cost - Saves money
6. reduces_risk - Minimizes negative outcomes
7. organizes - Helps structure tasks
8. integrates - Connects systems
9. connects - Brings people together
10. quality - Superior standards
11. variety - Offers choices
12. informs - Provides knowledge
13. avoids_hassles - Avoiding or reducing hassles
14. sensory_appeal - Appealing in taste, smell, hearing

For each element:
- Score 0-100 (0 = not present, 100 = strongly present)
- Provide evidence with specific citations
- Note which patterns were detected
```

### **3. Strategic Thinking Analysis Prompt**

**Purpose**: Focused CliftonStrengths Strategic Thinking domain (8 themes)
**Input**: Website content + themes from database
**Output**: Strategic Thinking themes scores and manifestations

```
Analyze ONLY the Strategic Thinking domain of CliftonStrengths (8 themes).

WEBSITE CONTENT:
{website_content}

FOCUS: STRATEGIC THINKING THEMES (8 themes)
{themes_from_database}

For each theme:
- Score 0-100 based on evidence in content
- Identify specific manifestations (how the theme shows up)
- Provide evidence with citations from the website
- Rank themes (1 = strongest, 8 = weakest)
```

### **4. Table Stakes Analysis Prompt**

**Purpose**: Focused B2B Table Stakes analysis (4 elements)
**Input**: Website content
**Output**: Table Stakes elements scores and evidence

```
Analyze ONLY the Table Stakes elements of B2B value (4 elements).

WEBSITE CONTENT:
{website_content}

FOCUS: TABLE STAKES (Must-haves for B2B)
1. meeting_specifications - Conforms to customer's internal specifications
2. acceptable_price - Provides products/services at acceptable price
3. regulatory_compliance - Complies with regulations
4. ethical_standards - Performs activities in ethical manner

For each element:
- Score 0-100 (0 = not present, 100 = strongly present)
- Provide evidence with specific citations
- Note which patterns were detected
```

---

## 🎯 **SERVICE-SPECIFIC PROMPTS**

### **Golden Circle Detailed Service** (`src/lib/services/golden-circle-detailed.service.ts`)

**Purpose**: Complete Golden Circle analysis with all 4 dimensions
**Features**:

- WHY, HOW, WHAT, WHO analysis
- Evidence-based scoring
- Industry context integration
- Pattern matching from database

### **CliftonStrengths Detailed Service** (`src/lib/services/clifton-strengths-detailed.service.ts`)

**Purpose**: Complete CliftonStrengths analysis with all 34 themes
**Features**:

- All 34 themes from database
- Organized by 4 domains
- Evidence-based scoring
- Manifestation identification

### **Elements of Value B2C Service** (`src/lib/services/elements-value-b2c.service.ts`)

**Purpose**: Complete B2C Elements of Value analysis (30 elements)
**Features**:

- All 30 elements properly categorized
- Pyramid level organization
- Evidence-based scoring
- Pattern matching integration

### **Elements of Value B2B Service** (`src/lib/services/elements-value-b2b.service.ts`)

**Purpose**: Complete B2B Elements of Value analysis (40 elements)
**Features**:

- All 40 elements with proper categories
- Subcategory organization
- Evidence-based scoring
- Industry-specific analysis

---

## 🔧 **PROMPT ENHANCEMENT FEATURES**

### **Synonym Detection Integration**

- **Service**: `src/lib/services/synonym-detection.service.ts`
- **Purpose**: Enhances prompts with industry-specific context
- **Features**:
  - Pattern matching from database
  - Industry term mapping
  - Confidence scoring
  - Evidence integration

### **Industry Context Enhancement**

- **Method**: `buildEnhancedPrompt()`
- **Purpose**: Adds industry-specific patterns to prompts
- **Features**:
  - Industry term mapping
  - Pattern confidence scoring
  - Evidence-based recommendations

---

## 📊 **PROMPT QUALITY METRICS**

### **Template Elimination** ✅

- ❌ Removed hard-coded example values
- ❌ Removed template JSON structures
- ✅ Empty placeholders force genuine analysis
- ✅ Evidence-based scoring required

### **Framework Completeness** ✅

- ✅ All 34 CliftonStrengths themes
- ✅ All 30 B2C Elements of Value
- ✅ All 40 B2B Elements of Value
- ✅ Complete Golden Circle (including WHO)

### **Evidence Requirements** ✅

- ✅ Specific citations required
- ✅ Pattern matching integration
- ✅ Industry context inclusion
- ✅ Confidence scoring

---

## 🚀 **USAGE EXAMPLES**

### **Complete Analysis**

```javascript
POST / api / analyze / phase -
  new {
    url: 'https://example.com',
    phase: 1,
    industry: 'technology',
  }();
```

### **Focused Analysis**

```javascript
POST /api/analyze/focused
{
  "url": "https://example.com",
  "analysisType": "why",
  "industry": "technology"
}
```

### **Service-Specific Analysis**

```javascript
// Golden Circle
const result = await GoldenCircleDetailedService.analyze(
  analysisId,
  content,
  industry,
  patterns
);

// CliftonStrengths
const result = await CliftonStrengthsService.analyze(
  analysisId,
  content,
  industry,
  patterns
);
```

---

## 📝 **MAINTENANCE NOTES**

1. **Prompt Updates**: All prompts are now template-free and evidence-based
2. **Framework Accuracy**: All frameworks match their original sources exactly
3. **Database Integration**: Prompts pull real data from database tables
4. **Industry Context**: Prompts adapt to industry-specific patterns
5. **Quality Assurance**: All prompts require evidence and citations

---

**Last Updated**: October 8, 2025
**Version**: 2.0.0
**Status**: ✅ Production Ready

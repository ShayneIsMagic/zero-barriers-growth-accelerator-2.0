# 🚀 API & Scoring Systems Overview

## 📋 **CURRENT API ENDPOINTS**

### **Core Analysis APIs**

#### 1. **Phase-Based Analysis**
- **`POST /api/analyze/phase-new`** - Main phase execution (1, 2, 3)
- **`POST /api/analyze/phase`** - Legacy (deprecated)
- **`POST /api/analyze/controlled`** - Step-by-step controlled analysis

#### 2. **Comprehensive Analysis**
- **`POST /api/analyze/comprehensive`** - Full analysis with all frameworks
- **`POST /api/analyze/website`** - Real AI analysis (no demo data)
- **`POST /api/analyze/enhanced`** - Enhanced analysis with detailed insights

#### 3. **Specialized Analysis**
- **`POST /api/analyze/seo`** - SEO analysis with keyword research
- **`POST /api/analyze/page`** - Individual page analysis
- **`POST /api/analyze/progressive`** - Progressive rendering analysis
- **`POST /api/analyze/step-by-step`** - Detailed step-by-step analysis

#### 4. **Status & Control**
- **`GET /api/analyze/controlled?action=status`** - System health check
- **`GET /api/analyze/controlled?action=steps`** - Available analysis steps
- **`GET /api/analyze/progressive/status`** - Progressive analysis status

---

## 🎯 **SCORING SYSTEMS & ALGORITHMS**

### **1. Golden Circle Analysis (Simon Sinek)**
**Scoring Scale**: 1-10 for each dimension
- **WHY**: Core purpose clarity, emotional resonance
- **HOW**: Methodology uniqueness, differentiation
- **WHAT**: Product/service specificity, value articulation
- **WHO**: Target audience specificity, connection clarity

**Overall Calculation**: `(WHY + HOW + WHAT + WHO) / 4`

### **2. Elements of Value (Bain & Company)**

#### **B2C Elements (30 total)**
**Scoring Scale**: 1-10 per element, weighted by importance
- **Functional** (14): saves_time, simplifies, makes_money, reduces_risk, etc.
- **Emotional** (10): reduces_anxiety, rewards_me, nostalgia, etc.
- **Life-Changing** (5): provides_hope, self_actualization, motivation, etc.
- **Social Impact** (1): self_transcendence

**Category Scoring**: `Σ(element_score × weight) / total_weight`

#### **B2B Elements (40 total)**
**Scoring Scale**: 1-10 per element, weighted by category
- **Table Stakes** (4): meeting_specifications, acceptable_price, etc.
- **Functional** (9): improved_top_line, cost_reduction, etc.
- **Ease of Business** (17): time_savings, reduced_effort, etc.
- **Individual** (7): network_expansion, marketability, etc.
- **Inspirational** (4): vision, hope, social_responsibility, etc.

### **3. CliftonStrengths Analysis (Gallup)**
**Scoring Scale**: 1-10 per theme, ranked within domains
- **Strategic Thinking** (8 themes): Analytical, Context, Futuristic, etc.
- **Executing** (9 themes): Achiever, Arranger, Belief, etc.
- **Influencing** (8 themes): Activator, Command, Communication, etc.
- **Relationship Building** (9 themes): Adaptability, Connectedness, etc.

**Domain Scoring**: `Σ(theme_scores) / theme_count`
**Overall Scoring**: `(Strategic + Executing + Influencing + Relationship) / 4`

### **4. Technical Performance Scoring**
- **Lighthouse Scores**: 0-100 (Performance, Accessibility, SEO, Best Practices)
- **Core Web Vitals**: FCP, LCP, TBT, CLS (Google standards)
- **Overall Performance**: Weighted average of all metrics

### **5. SEO Analysis Scoring**
- **Technical SEO**: 0-100 (site structure, meta tags, etc.)
- **Content Quality**: 0-100 (keyword optimization, readability)
- **Keyword Rankings**: Position-based scoring
- **Opportunity Scoring**: Search volume × competition × relevance

---

## 🔧 **SERVICE LAYER ARCHITECTURE**

### **Core Services**
1. **`ComprehensiveReportService`** - Final report generation
2. **`GoldenCircleDetailedService`** - WHY/HOW/WHAT/WHO analysis
3. **`ElementsOfValueB2CService`** - Consumer elements analysis
4. **`ElementsOfValueB2BService`** - Business elements analysis
5. **`CliftonStrengthsService`** - Organizational strengths analysis
6. **`LighthouseDetailedService`** - Performance analysis
7. **`SEOOpportunitiesService`** - SEO analysis and opportunities

### **Supporting Services**
- **`SynonymDetectionService`** - Pattern matching and synonym detection
- **`AIService`** - Gemini/Claude integration
- **`WebsiteEvaluationFramework`** - Overall website scoring
- **`ThreePhaseAnalyzer`** - Phase-based analysis orchestration

---

## 📊 **DATABASE TABLES & SCORING**

### **Main Analysis Tables**
- **`golden_circle_analyses`** - Main Golden Circle scores
- **`golden_circle_why/how/what/who`** - Dimension-specific details
- **`elements_of_value_b2c`** - B2C element scores
- **`b2c_element_scores`** - Individual B2C element breakdowns
- **`elements_of_value_b2b`** - B2B element scores
- **`b2b_element_scores`** - Individual B2B element breakdowns
- **`clifton_strengths_analyses`** - Main CliftonStrengths scores
- **`clifton_theme_scores`** - Individual theme scores (34 themes)

### **Reference Tables**
- **`value_element_reference`** - B2C elements (30)
- **`b2b_value_element_reference`** - B2B elements (40)
- **`clifton_themes_reference`** - CliftonStrengths themes (34)
- **`value_element_patterns`** - Synonym patterns (150+)
- **`industry_terminology`** - Industry-specific terms

### **Scoring Functions**
- **`calculate_overall_score()`** - PostgreSQL function for weighted scoring
- **`find_value_patterns()`** - Pattern matching with confidence scores
- **`deduct_credits()`** - User credit management

---

## 🎯 **SCORING CRITERIA**

### **Score Interpretation**
- **9-10**: Exceptional/Outstanding - Best practice, highly effective
- **7-8**: Good/Strong - Well-executed with minor gaps
- **5-6**: Fair/Average - Some strengths, room for improvement
- **3-4**: Poor/Weak - Major improvements needed
- **1-2**: Critical - Fundamental issues requiring immediate attention

### **Weighted Calculations**
- **Golden Circle**: Equal weight (25% each dimension)
- **Elements of Value**: Category-weighted by importance
- **CliftonStrengths**: Domain-weighted by relevance
- **Technical**: Performance-weighted by user impact
- **Overall**: Framework-weighted by business impact

---

## 🔌 **API INTEGRATION REQUIREMENTS**

### **Required Environment Variables**
```bash
# AI Services
GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key

# Database
DATABASE_URL=your_supabase_url

# Optional Services
GOOGLE_SEARCH_CONSOLE_API_KEY=optional
LIGHTHOUSE_API_KEY=optional
```

### **API Request Formats**
```typescript
// Phase Analysis
POST /api/analyze/phase-new
{
  "url": "https://example.com",
  "phase": 1|2|3,
  "analysisId": "uuid",
  "industry": "saas|healthcare|ecommerce"
}

// Comprehensive Analysis
POST /api/analyze/comprehensive
{
  "url": "https://example.com",
  "includePageAudit": true,
  "includeLighthouse": true,
  "includeAllPages": false
}
```

### **Response Formats**
All APIs return standardized JSON with:
- **`success`**: boolean
- **`data`**: analysis results
- **`message`**: human-readable status
- **`timestamp`**: ISO timestamp
- **`scores`**: framework-specific scores

---

## 🚀 **NEXT STEPS FOR IMPLEMENTATION**

1. **Configure AI APIs** - Set up Gemini/Claude keys
2. **Test Database Connection** - Verify Supabase connectivity
3. **Run Analysis** - Execute phase-based analysis
4. **Generate Reports** - Use comprehensive report service
5. **Monitor Performance** - Track scoring accuracy

---

## 📈 **SCORING ACCURACY & VALIDATION**

- **Pattern Matching**: 150+ synonym patterns with confidence scores
- **Industry Context**: Industry-specific terminology mapping
- **AI Validation**: Gemini/Claude cross-validation
- **Benchmark Testing**: Against known high-performing websites
- **Continuous Improvement**: Pattern refinement based on results

This system provides comprehensive, accurate scoring across all major business analysis frameworks with robust API integration and detailed database tracking.

# 🏭 Industry Analysis Framework

## Why Industry Matters

**Different industries = Different priorities, language, and value propositions**

---

## How Industry Changes the Analysis

### Industry Detection (Step 0 - Before Everything)

**Auto-detect from website content:**

```typescript
async function detectIndustry(websiteContent: string) {
  const prompt = `
  Analyze this website and determine the industry/sector:

  Options:
  - E-commerce / Retail
  - B2B SaaS / Software
  - Healthcare / Medical
  - Finance / Banking / Insurance
  - Education / E-learning
  - Professional Services (Legal, Consulting, etc.)
  - Real Estate
  - Manufacturing / Industrial
  - Technology / IT Services
  - Marketing / Advertising
  - Non-profit / Social Impact
  - Other: [specify]

  Also identify:
  - Primary business model: B2C, B2B, or Both
  - Target market size: Enterprise, SMB, Consumer
  - Service vs Product focus

  Content: ${websiteContent}
  `;

  return {
    industry: "B2B SaaS",
    businessModel: "B2B",
    targetMarket: "SMB",
    serviceType: "Software",
    confidence: 0.95
  };
}
```

---

## Industry-Specific Framework Weights

### E-commerce / Retail

**B2C Elements (Higher Weight)**:
- Saves time: 10/10 priority
- Reduces effort: 10/10
- Quality: 9/10
- Variety: 9/10
- Sensory appeal: 8/10

**B2B Elements (Lower Weight)**:
- Less relevant unless wholesale

**Golden Circle**:
- WHAT (Products): 10/10 priority - must be crystal clear
- WHO (Target audience): 10/10 - specific customer personas
- WHY: 7/10 - nice but not critical for retail

**Language Expected**:
- Value-centric: 60% minimum
- Benefit-centric: 40% max
- Focus on outcomes, ease, satisfaction

**SEO Priority**:
- Product keywords: CRITICAL
- Shopping intent: CRITICAL
- Local SEO: HIGH (if physical stores)

---

### B2B SaaS / Software

**B2B Elements (Higher Weight)**:
- Improves productivity: 10/10
- Reduces cost: 10/10
- Scalability: 10/10
- Integration: 9/10
- ROI/Value: 10/10

**B2C Elements (Lower Weight)**:
- Individual user experience matters for end-users
- But decision makers care about business value

**Golden Circle**:
- WHY: 10/10 priority - purpose-driven buying
- HOW: 10/10 - differentiation is critical in crowded market
- WHAT: 9/10 - features matter but not enough alone
- WHO: 10/10 - must nail ICP (Ideal Customer Profile)

**Brand Alignment**:
- CRITICAL - B2B buyers research heavily
- Stated vs shown gaps = deal breakers
- Value pillars must be evident throughout

**Language Expected**:
- Value-centric: 70%+ required
- ROI-focused language
- Case studies and proof
- Industry-specific terminology

**SEO Priority**:
- Solution keywords: CRITICAL
- Comparison keywords: HIGH
- Brand keywords: MEDIUM

---

### Healthcare / Medical

**B2C Elements (Patient Perspective)**:
- Reduces anxiety: 10/10 priority
- Provides hope: 10/10
- Wellness: 10/10
- Trust/Quality: 10/10

**B2B Elements (Provider Perspective)**:
- Compliance: 10/10
- Risk reduction: 10/10
- Patient outcomes: 10/10

**Golden Circle**:
- WHY: 10/10 - mission-critical, literally life/death
- WHO: 10/10 - patients vs providers, very different
- HOW: 9/10 - methodology matters for credibility

**Brand Alignment**:
- Trust signals: CRITICAL
- Certifications must be visible
- Patient testimonials required
- HIPAA compliance messaging

**Language Expected**:
- Empathetic tone: REQUIRED
- Medical accuracy: REQUIRED
- Avoid fear-mongering: REQUIRED
- Value-centric (outcomes): 80%+

---

### Finance / Banking / Insurance

**B2C Elements**:
- Reduces anxiety: 10/10
- Security: 10/10
- Reduces risk: 10/10
- Makes money: 9/10

**B2B Elements**:
- Compliance: 10/10
- Risk management: 10/10
- Cost reduction: 9/10

**Brand Pillars**:
- Trust: NON-NEGOTIABLE
- Security: NON-NEGOTIABLE
- Transparency: CRITICAL

**Language Expected**:
- Conservative, professional
- Trust-building language
- Regulatory compliance mentions
- Data security prominent

---

## Updated Analysis Sequence with Industry

### REVISED PHASE 1: Foundation + Industry Detection

```
Step 1.1: Content Scraping (0-10%)
   ↓
Step 1.2: Industry Detection (10-15%)  ← NEW
   ↓
   Sets weights for all subsequent analysis
   ↓
Step 1.3: Technical Performance (15-25%)
   ↓
Step 1.4: SEO & Trends (25-30%)
```

### PHASE 2: Language & Brand (Industry-Aware)

```
Step 2.1: Language Type Analysis (30-35%)
   - Industry-specific expectations
   - E.g., SaaS needs 70% value-centric
   - E.g., E-commerce needs 60% value-centric
   ↓
Step 2.2: Brand Alignment (35-45%)
   - Industry-specific trust signals
   - Required elements per industry
```

### PHASE 3: Framework Analysis (Industry-Weighted)

```
Step 3.1: Golden Circle + WHO (45-55%)
   - Industry context applied
   - Different WHO for different industries
   ↓
Step 3.2: B2C Elements (55-65%)
   - If B2C or Both
   - Industry-specific element weights
   ↓
Step 3.3: B2B Elements (65-75%)
   - If B2B or Both
   - Industry-specific priorities
   ↓
Step 3.4: CliftonStrengths (75-85%)
   - Industry-appropriate themes
```

### PHASE 4: Synthesis (Industry-Specific Recommendations)

```
Step 4.1: Cross-Reference All Perspectives (85-95%)
   ↓
Step 4.2: Industry Best Practices (95-98%)
   - Compare to industry benchmarks
   - Add industry-specific recommendations
   ↓
Step 4.3: Final Roadmap (98-100%)
   - Prioritized by industry norms
   - Timeline realistic for industry
```

---

## Data Structure with Industry

```typescript
interface WebsiteAnalysisResult {
  // NEW: Industry context (Step 0)
  industry: {
    detected: "B2B SaaS",
    businessModel: "B2B",
    targetMarket: "SMB",
    confidence: 0.95,
    industryBenchmarks: {
      typicalValueCentricRatio: 0.70,
      typicalB2BScore: 8.5,
      typicalConversionRate: 0.03
    }
  };

  // Existing with industry weighting applied
  languageAnalysis: {
    valueCentricRatio: 0.45,
    industryExpectation: 0.70,  // From industry benchmarks
    gap: -0.25,  // Below industry standard!
    recommendation: "Increase value-centric language by 25% to match SaaS standards"
  };

  brandAlignment: {
    purpose: { ... },
    pillars: { ... },
    industrySignals: {
      expected: ["Case studies", "ROI calculator", "Integration docs"],
      found: ["Case studies"],
      missing: ["ROI calculator", "Integration docs"],
      recommendation: "Add ROI calculator and integration documentation - standard for B2B SaaS"
    }
  };

  b2cElements: {
    // Weighted per industry
    // E.g., for SaaS, "saves time" weighted higher
  };

  b2bElements: {
    // Weighted per industry
    // E.g., for SaaS, "improves productivity" weighted higher
  };

  recommendations: {
    immediate: [
      "Add ROI calculator (industry standard for SaaS)",
      "Increase value-centric language from 45% to 70%",
      "Add integration documentation"
    ],
    // Industry-specific priorities
  };
}
```

---

## 🎯 Implementation Priority

### Phase 1: Get App Working (Now)
1. ✅ Database connected
2. ✅ Users created
3. ⏳ Test authentication
4. ⏳ Verify analysis works

### Phase 2: Add Industry Context (After QA)
1. Add industry detection
2. Create industry benchmarks
3. Apply industry weights to frameworks
4. Add industry-specific recommendations

### Phase 3: Add Missing Analyzers (After Industry)
1. Language Type Analyzer
2. Brand Alignment Analyzer
3. Industry-Specific Checker

---

## 🏭 Industry Benchmark Database (Future)

```typescript
const INDUSTRY_BENCHMARKS = {
  "B2B SaaS": {
    valueCentricRatio: 0.70,
    keyB2BElements: ["Productivity", "Integration", "Scalability"],
    requiredContent: ["Case studies", "ROI calculator", "Documentation"],
    languageTone: "Professional, value-focused, data-driven",
    avgConversionRate: 0.03,
    avgB2BScore: 8.5
  },
  "E-commerce": {
    valueCentricRatio: 0.60,
    keyB2CElements: ["Saves time", "Quality", "Variety"],
    requiredContent: ["Product images", "Reviews", "Easy checkout"],
    languageTone: "Friendly, benefit-clear, action-oriented",
    avgConversionRate: 0.02,
    avgB2CScore: 7.8
  },
  // ... more industries
};
```

---

**Great addition! Industry context will make recommendations much more actionable.**

**For now: Test the login and analysis, then I'll add industry detection!** 🚀

**Did login work?**

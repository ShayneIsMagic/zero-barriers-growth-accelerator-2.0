# Gemini Prompt Templates - App-Wide Standard

## 🎯 **Purpose**

Clear, optimized **Markdown-formatted** prompt summaries for Google Gemini API that work across all framework analyses. These prompts now include complete framework definitions in Markdown for better Gemini understanding.

---

## 📊 **Gemini Parameters & Best Practices**

### Token Limits
- **Input**: ~1M tokens (Gemini 1.5 Pro)
- **Output**: ~8K tokens (varies by model)
- **Current Usage**: ~500-2000 tokens per framework prompt

### Best Practices
1. **Be Specific** - Clear instructions get better results
2. **Provide Structure** - Use numbered lists and sections
3. **Give Examples** - Show expected output format
4. **Set Boundaries** - Define scoring criteria clearly
5. **Include Context** - URL, word count, keywords

---

## 🏗️ **Template Structure**

### Standard Format
```
1. CONTEXT (URL, content summary, keywords)
2. FRAMEWORK DEFINITIONS (complete element/themes list)
3. ANALYSIS REQUIREMENTS (what to score and how)
4. OUTPUT FORMAT (JSON structure expected)
5. QUALITY GUIDELINES (evidence requirements)
```

---

## 📋 **Framework Prompt Summaries**

### 1. **B2C Elements of Value** (30 Elements)

**API**: `/api/analyze/elements-value-b2c-standalone`

**Framework Categories**:
- **Functional** (14 elements): saves_time, simplifies, makes_money, reduces_effort, reduces_cost, reduces_risk, organizes, integrates, connects, quality, variety, informs, avoids_hassles, sensory_appeal
- **Emotional** (10 elements): reduces_anxiety, rewards_me, nostalgia, design_aesthetics, badge_value, wellness, therapeutic, fun_entertainment, attractiveness, provides_access
- **Life-Changing** (5 elements): provides_hope, self_actualization, motivation, heirloom, affiliation
- **Social Impact** (1 element): self_transcendence

**Prompt Key Points**:
- Analyze existing vs. proposed content
- Score each of 30 elements (0-1 for present/absent)
- Overall score: 0-30
- Provide evidence for present elements
- Recommend missing elements
- Return JSON with scores and actionable insights

**Output Format**:
```json
{
  "overallScore": 0-30,
  "categories": {
    "functional": { "score": 0-14, "elements": [...] },
    "emotional": { "score": 0-10, "elements": [...] },
    "lifeChanging": { "score": 0-5, "elements": [...] },
    "socialImpact": { "score": 0-1, "elements": [...] }
  },
  "presentElements": [...],
  "missingElements": [...],
  "recommendations": [...]
}
```

---

### 2. **B2B Elements of Value** (40 Elements)

**API**: `/api/analyze/elements-value-b2b-standalone`

**Framework Categories**:
- **Table Stakes** (4 elements): meeting_specifications, acceptable_price, regulatory_compliance, ethical_standards
- **Functional** (9 elements): improved_top_line, cost_reduction, product_quality, scalability, innovation, risk_reduction, reach, flexibility, component_quality
- **Ease of Doing Business** (18 elements): time_savings, reduced_effort, decreased_hassles, information, transparency, organization, simplification, connection, integration, access, availability, variety, configurability, responsiveness, expertise, commitment, stability, cultural_fit
- **Individual** (7 elements): network_expansion, marketability, reputational_assurance, design_aesthetics_b2b, growth_development, reduced_anxiety_b2b, fun_perks
- **Inspirational** (2 elements): vision, hope_b2b

**Prompt Key Points**:
- Analyze existing vs. proposed content
- Score each of 40 elements (0-1 for present/absent)
- Overall score: 0-40
- Focus on business value elements
- Return JSON with scores and actionable insights

**Output Format**:
```json
{
  "overallScore": 0-40,
  "categories": {
    "tableStakes": { "score": 0-4, "elements": [...] },
    "functional": { "score": 0-9, "elements": [...] },
    "easeOfDoingBusiness": { "score": 0-18, "elements": [...] },
    "individual": { "score": 0-7, "elements": [...] },
    "inspirational": { "score": 0-2, "elements": [...] }
  },
  "presentElements": [...],
  "missingElements": [...],
  "recommendations": [...]
}
```

---

### 3. **CliftonStrengths** (34 Themes)

**API**: `/api/analyze/clifton-strengths-standalone`

**Framework Domains**:
- **Strategic Thinking** (8 themes): analytical, context, futuristic, ideation, input, intellection, learner, strategic
- **Executing** (9 themes): achiever, arranger, belief, consistency, deliberative, discipline, focus, responsibility, restorative
- **Influencing** (8 themes): activator, command, communication, competition, maximizer, self_assurance, significance, woo
- **Relationship Building** (9 themes): adaptability, connectedness, developer, empathy, harmony, includer, individualization, positivity, relator

**Prompt Key Points**:
- Analyze content for strength themes
- Score each of 34 themes (0-1 for present/absent)
- Overall score: 0-34
- Identify top 5 dominant strengths
- Provide evidence and recommendations
- Return JSON with scores and actionable insights

**Output Format**:
```json
{
  "overallScore": 0-34,
  "domains": {
    "strategicThinking": { "score": 0-8, "themes": [...] },
    "executing": { "score": 0-9, "themes": [...] },
    "influencing": { "score": 0-8, "themes": [...] },
    "relationshipBuilding": { "score": 0-9, "themes": [...] }
  },
  "topStrengths": [...],
  "evidence": [...],
  "recommendations": [...]
}
```

---

### 4. **Golden Circle** (Why, How, What, WHO)

**API**: `/api/analyze/golden-circle-standalone`

**Framework Elements**:
- **WHY** (Purpose, Cause, Belief)
- **HOW** (Process, Methodology, Differentiation, Values)
- **WHAT** (Products, Services, Features, Benefits)
- **WHO** (Target Audience, People, Relationships)

**Prompt Key Points**:
- Analyze Simon Sinek's Golden Circle framework
- Score each of 4 elements (0-10 each)
- Overall score: 0-40
- Extract specific evidence for each element
- Assess alignment between elements
- Return JSON with scores and actionable insights

**Output Format**:
```json
{
  "overallScore": 0-40,
  "why": { "score": 0-10, "statement": "...", "evidence": "...", "recommendations": [...] },
  "how": { "score": 0-10, "methodology": "...", "evidence": "...", "recommendations": [...] },
  "what": { "score": 0-10, "offerings": [...], "evidence": "...", "recommendations": [...] },
  "who": { "score": 0-10, "targetAudience": "...", "testimonials": [...], "recommendations": [...] },
  "alignment": "...",
  "recommendations": [...]
}
```

---

## 🔧 **How To Use These Templates**

### In API Routes
```typescript
import { analyzeWithGemini } from '@/lib/free-ai-analysis';

const prompt = `[Use template structure above]`;

const result = await analyzeWithGemini(prompt, 'framework-name');
```

### Prompt Structure
1. **Context**: URL, existing content summary, proposed content (if provided)
2. **Framework**: Complete definition with all elements/themes
3. **Instructions**: What to analyze and how to score
4. **Output Format**: Expected JSON structure
5. **Quality**: Evidence requirements and recommendations

### Token Optimization
- Keep framework definitions concise but complete
- Limit content preview to 2000 characters
- Use clear headings and numbering
- Structure JSON output requirements clearly

---

## ✅ **Current Status**

All framework APIs use these optimized prompts:
- ✅ B2C Elements (30 elements, 4 categories)
- ✅ B2B Elements (40 elements, 5 categories)
- ✅ CliftonStrengths (34 themes, 4 domains)
- ✅ Golden Circle (4 elements: Why/How/What/WHO)
- ✅ Content-Comparison (generic comparison)

**All prompts are Gemini-optimized and app-wide consistent!**


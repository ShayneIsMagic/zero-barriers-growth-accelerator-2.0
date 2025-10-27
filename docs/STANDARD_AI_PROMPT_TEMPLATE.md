# Standard AI Prompt Template - Comprehensive Guide

## 🎯 **Purpose**

A standardized structure for all framework analysis prompts that provides:
- **SEO optimization analysis** (10 key areas)
- **Metadata evaluation** (title, description, headings, images)
- **Content framework scoring** (fractional 0-1 scores)
- **Actionable recommendations** (prioritized by impact)

---

## ✨ **Key Features**

### 1. **Fractional Scoring (0-1 scale)**
Clear visual representation:
- **🟢 0.8-1.0** (Green) = Excellent
- **🟡 0.6-0.79** (Yellow) = Good
- **🟠 0.4-0.59** (Orange) = Needs Work
- **🔴 0.0-0.39** (Red) = Poor

### 2. **SEO Analysis (10 Areas)**
1. Title Tag Optimization
2. Meta Description Optimization
3. Heading Structure
4. Image Optimization
5. Internal Linking
6. External Linking
7. Keyword Targeting
8. Content Length
9. Readability
10. Value Proposition

### 3. **Framework-Specific Analysis**
- Present elements with evidence
- Missing elements with recommendations
- Weak elements with enhancement strategies

### 4. **Priority Actions**
Categorized by:
- **Category**: seo | metadata | content | framework
- **Priority**: high | medium | low
- **Impact**: Expected improvement
- **Effort**: low | medium | high
- **Estimated Time**: Specific duration

---

## 📊 **Output Format**

### Standard JSON Structure
```json
{
  "url": "https://example.com",
  "analysis_date": "2024-01-15T10:30:00Z",
  "framework": "B2C Elements of Value",

  "seo_analysis": {
    "title_tag": {
      "score": 0.85,
      "status": "good",
      "current": "Current title text",
      "recommendations": ["Add primary keyword", "Shorten to 60 chars"]
    },
    "meta_description": { "score": 0.72, "status": "good", "recommendations": [] },
    "heading_structure": { "score": 0.90, "status": "excellent", "recommendations": [] }
    // ... 7 more SEO areas
  },

  "framework_analysis": {
    "overall_score": 0.75,
    "categories": [
      {
        "name": "Functional Elements",
        "score": 0.80,
        "status": "good",
        "present_elements": [
          {
            "name": "saves_time",
            "score": 0.90,
            "evidence": "Quote from content",
            "strength": "excellent"
          }
        ],
        "missing_elements": [
          {
            "name": "reduces_cost",
            "recommendation": "Add pricing section with cost savings",
            "priority": "high",
            "impact": "Expected 15% improvement"
          }
        ]
      }
    ]
  },

  "priority_actions": [
    {
      "action": "Add primary keyword to H1",
      "category": "seo",
      "priority": "high",
      "impact": "Expected +0.2 score improvement",
      "effort": "low",
      "estimated_time": "5 minutes"
    }
  ],

  "summary": {
    "strengths": ["Strong meta description", "Good heading structure"],
    "opportunities": ["Add more internal links", "Optimize images"],
    "critical_issues": ["Title tag too long", "No alt text on images"]
  }
}
```

---

## 🚀 **How To Use**

### 1. Import the Template
```typescript
import { buildStandardPrompt, parseAnalysisResponse } from '@/lib/prompts/standard-ai-prompt-template';
```

### 2. Build Your Request
```typescript
const request = {
  url: 'https://example.com',
  existingContent: {
    wordCount: 2500,
    title: 'Example Page Title',
    metaDescription: 'Meta description text',
    extractedKeywords: ['keyword1', 'keyword2'],
    cleanText: 'Full text content...',
    headings: ['H1', 'H2', 'H2', 'H3'],
    links: [...],
    images: [...]
  },
  proposedContent: {...}, // Optional
  framework: 'B2C Elements of Value (30 Elements - Bain & Company)',
  analysisType: 'b2c'
};
```

### 3. Build and Send Prompt
```typescript
const prompt = buildStandardPrompt(request);
const result = await analyzeWithGemini(prompt, analysisType);
const analysis = parseAnalysisResponse(result);
```

### 4. Display Results
```typescript
import { getScoreStatus } from '@/lib/prompts/standard-ai-prompt-template';

const { color, label, emoji } = getScoreStatus(analysis.seo_analysis.title_tag.score);
// Returns: { color: '#22c55e', label: 'Excellent', emoji: '🟢' }
```

---

## 🎨 **Visual Representation**

### Score Display
```typescript
// Green bar for 0.8+
<div style={{backgroundColor: '#22c55e', width: '85%'}} />

// Yellow bar for 0.6-0.79
<div style={{backgroundColor: '#eab308', width: '72%'}} />

// Orange bar for 0.4-0.59
<div style={{backgroundColor: '#f97316', width: '50%'}} />

// Red bar for <0.4
<div style={{backgroundColor: '#ef4444', width: '35%'}} />
```

---

## 📋 **Analysis Priorities**

### Critical Issues (Red - Score < 0.4)
- Urgent fixes for SEO penalties
- Missing critical metadata
- Framework elements completely absent

### High Priority (Orange - Score 0.4-0.59)
- Significant SEO improvements
- Major framework gaps
- Important metadata missing

### Medium Priority (Yellow - Score 0.6-0.79)
- Optimization opportunities
- Framework enhancements
- Content refinements

### Low Priority (Green - Score 0.8+)
- Minor tweaks
- Fine-tuning opportunities
- Best practice polish

---

## 🌐 **Best Practices 2024+**

### Google
- Core Web Vitals
- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Semantic HTML5
- Mobile-First
- User Intent
- Freshness
- Quality Backlinks

### Meta (Facebook)
- Open Graph Tags
- Image Dimensions (1200x630px)
- Social Sharing Testing
- Engagement CTAs

### Web3/Web4
- Decentralization Considerations
- Privacy (GDPR, CCPA)
- Accessibility (WCAG 2.1 AA)
- Progressive Web Apps
- Voice Search Optimization
- Video Content
- AI Integration

---

## ✅ **Benefits**

1. **Consistency**: Same format across all frameworks
2. **Actionability**: Specific, prioritized recommendations
3. **Visual Clarity**: Color-coded fractional scores
4. **Comprehensive**: SEO + Framework + Metadata
5. **Modern**: Best practices for 2024+
6. **Scalable**: Works with any framework

---

## 📊 **Usage Examples**

### B2C Elements Analysis
```typescript
const b2cRequest = {
  ...standardRequest,
  framework: 'B2C Elements of Value (30 Elements)',
  analysisType: 'b2c'
};
```

### B2B Elements Analysis
```typescript
const b2bRequest = {
  ...standardRequest,
  framework: 'B2B Elements of Value (42 Elements)',
  analysisType: 'b2b'
};
```

### CliftonStrengths Analysis
```typescript
const strengthsRequest = {
  ...standardRequest,
  framework: 'CliftonStrengths (34 Themes)',
  analysisType: 'clifton-strengths'
};
```

### Golden Circle Analysis
```typescript
const goldenCircleRequest = {
  ...standardRequest,
  framework: 'Golden Circle (Why/How/What/WHO)',
  analysisType: 'golden-circle'
};
```

---

## 🎯 **Ready for Production**

✅ Fractional scoring (0-1)
✅ SEO analysis (10 areas)
✅ Framework-specific scoring
✅ Priority actions
✅ Visual indicators
✅ Best practices 2024+
✅ Modern standards

**This is your standard for all AI-powered framework analysis!**





# 📋 Manual Google Tools & Lighthouse Prompts

**If automated tools fail, use these manual prompts to get the same data.**

---

## 🚀 Quick Access Links

### **1. Google Lighthouse (PageSpeed Insights)**
**URL:** https://pagespeed.web.dev/

**What to do:**
1. Go to: https://pagespeed.web.dev/
2. Enter your website URL
3. Click "Analyze"
4. Wait 30 seconds
5. Copy the scores:
   - Performance: __/100
   - Accessibility: __/100
   - Best Practices: __/100
   - SEO: __/100

**Paste into Gemini with this prompt:**
```
Analyze these Lighthouse scores for [YOUR_URL]:
- Performance: [SCORE]/100
- Accessibility: [SCORE]/100
- Best Practices: [SCORE]/100
- SEO: [SCORE]/100

Key Issues:
[PASTE TOP 3-5 ISSUES FROM LIGHTHOUSE REPORT]

Provide:
1. What these scores mean
2. Priority fixes
3. Quick wins (< 1 hour)
4. Impact on user experience
```

---

### **2. Google Search Console**
**URL:** https://search.google.com/search-console

**What to do:**
1. Go to: https://search.google.com/search-console
2. Select your property (or add it if not already added)
3. Go to "Performance" section
4. Note down:
   - Total clicks (last 28 days): ____
   - Total impressions: ____
   - Average CTR: ____%
   - Average position: ____
5. Go to "Coverage" section
6. Note any errors or warnings

**Paste into Gemini with this prompt:**
```
Analyze my Google Search Console data for [YOUR_URL]:

Performance (Last 28 days):
- Total Clicks: [NUMBER]
- Total Impressions: [NUMBER]
- Average CTR: [PERCENT]%
- Average Position: [NUMBER]

Top 5 Queries:
1. [QUERY] - [CLICKS] clicks, [IMPRESSIONS] impressions
2. [QUERY] - [CLICKS] clicks, [IMPRESSIONS] impressions
3. [QUERY] - [CLICKS] clicks, [IMPRESSIONS] impressions
4. [QUERY] - [CLICKS] clicks, [IMPRESSIONS] impressions
5. [QUERY] - [CLICKS] clicks, [IMPRESSIONS] impressions

Coverage Issues:
[PASTE ANY ERRORS OR WARNINGS]

Provide:
1. SEO performance assessment
2. Keyword optimization opportunities
3. CTR improvement strategies
4. Position improvement tactics
```

---

### **3. Google Trends**
**URL:** https://trends.google.com/trends/

**What to do:**
1. Go to: https://trends.google.com/trends/
2. Enter your main keyword(s)
3. Set region (e.g., United States, Worldwide)
4. Set time range (e.g., Past 12 months)
5. Note:
   - Interest over time (trending up/down?)
   - Related queries
   - Regional interest

**Paste into Gemini with this prompt:**
```
Analyze Google Trends data for my keywords:

Main Keywords Analyzed:
1. [KEYWORD 1]
2. [KEYWORD 2]
3. [KEYWORD 3]

Trends (Past 12 months):
- [KEYWORD]: [Trending Up/Down/Stable] - Interest score: [0-100]

Related Queries (Rising):
1. [QUERY] - [Breakout/+X%]
2. [QUERY] - [Breakout/+X%]
3. [QUERY] - [Breakout/+X%]

Top Related Queries:
1. [QUERY]
2. [QUERY]
3. [QUERY]

Provide:
1. Keyword trend analysis
2. Content opportunities from rising queries
3. Seasonal patterns
4. Recommended focus keywords
```

---

### **4. Google Analytics (GA4)**
**URL:** https://analytics.google.com/

**What to do:**
1. Go to: https://analytics.google.com/
2. Select your property
3. Go to "Reports" → "Engagement" → "Pages and screens"
4. Note top 5 pages by views
5. Go to "User acquisition"
6. Note traffic sources

**Paste into Gemini with this prompt:**
```
Analyze my Google Analytics data for [YOUR_URL]:

Traffic (Last 30 days):
- Total Users: [NUMBER]
- New Users: [NUMBER]
- Sessions: [NUMBER]
- Bounce Rate: [PERCENT]%
- Avg Session Duration: [TIME]

Top 5 Pages:
1. [PAGE URL] - [VIEWS] views, [AVG TIME] avg time
2. [PAGE URL] - [VIEWS] views, [AVG TIME] avg time
3. [PAGE URL] - [VIEWS] views, [AVG TIME] avg time
4. [PAGE URL] - [VIEWS] views, [AVG TIME] avg time
5. [PAGE URL] - [VIEWS] views, [AVG TIME] avg time

Traffic Sources:
- Organic Search: [PERCENT]%
- Direct: [PERCENT]%
- Referral: [PERCENT]%
- Social: [PERCENT]%
- Paid: [PERCENT]%

Provide:
1. Traffic quality assessment
2. User engagement analysis
3. Content performance insights
4. Acquisition optimization strategies
```

---

### **5. Google Keyword Planner**
**URL:** https://ads.google.com/home/tools/keyword-planner/

**What to do:**
1. Go to: https://ads.google.com/home/tools/keyword-planner/
2. Click "Discover new keywords"
3. Enter your website URL or main topic
4. Review keyword ideas
5. Note volume and competition

**Paste into Gemini with this prompt:**
```
Analyze keyword opportunities for [YOUR_URL]:

Target Keywords:
1. [KEYWORD] - [MONTHLY VOLUME] searches, [LOW/MEDIUM/HIGH] competition
2. [KEYWORD] - [MONTHLY VOLUME] searches, [LOW/MEDIUM/HIGH] competition
3. [KEYWORD] - [MONTHLY VOLUME] searches, [LOW/MEDIUM/HIGH] competition
4. [KEYWORD] - [MONTHLY VOLUME] searches, [LOW/MEDIUM/HIGH] competition
5. [KEYWORD] - [MONTHLY VOLUME] searches, [LOW/MEDIUM/HIGH] competition

Related Keywords:
- [LIST 5-10 RELATED KEYWORDS WITH VOLUME]

My Current Focus:
[DESCRIBE YOUR PRODUCT/SERVICE]

Provide:
1. Best keywords to target
2. Content gaps to fill
3. Low-competition opportunities
4. Keyword clustering strategy
```

---

### **6. Google Rich Results Test**
**URL:** https://search.google.com/test/rich-results

**What to do:**
1. Go to: https://search.google.com/test/rich-results
2. Enter your URL
3. Click "Test URL"
4. Review results

**Paste into Gemini with this prompt:**
```
Google Rich Results Test for [YOUR_URL]:

Status: [PASS/FAIL/WARNING]

Detected Schema Types:
- [TYPE 1] (e.g., Article, Product, Organization)
- [TYPE 2]

Issues Found:
[PASTE ANY WARNINGS OR ERRORS]

Provide:
1. Schema markup recommendations
2. Rich snippet opportunities
3. Priority fixes for rich results
```

---

## 🎯 Complete Analysis Prompt (All Tools Combined)

**Use this if you have data from multiple tools:**

```
Comprehensive SEO & Performance Analysis for [YOUR_URL]

=== LIGHTHOUSE SCORES ===
- Performance: [X]/100
- Accessibility: [X]/100
- Best Practices: [X]/100
- SEO: [X]/100

Key Issues:
[PASTE TOP ISSUES]

=== SEARCH CONSOLE ===
- Clicks (28 days): [X]
- Impressions: [X]
- CTR: [X]%
- Avg Position: [X]

Top Keywords:
[PASTE TOP 5]

=== GOOGLE TRENDS ===
- Main Keyword Trend: [UP/DOWN/STABLE]
- Rising Queries: [LIST]

=== ANALYTICS ===
- Monthly Users: [X]
- Bounce Rate: [X]%
- Top Pages: [LIST]

=== MY GOALS ===
[DESCRIBE WHAT YOU WANT TO ACHIEVE]

Provide a comprehensive analysis with:
1. Overall performance grade (A-F)
2. Top 3 critical issues
3. Top 5 quick wins (< 1 week each)
4. Long-term strategy (3-6 months)
5. Keyword/content opportunities
6. Technical improvements needed
7. User experience enhancements
```

---

## 🤖 Where to Paste These Prompts

### **Option 1: Google Gemini AI**
**URL:** https://gemini.google.com/

1. Go to https://gemini.google.com/
2. Paste your prompt with the data
3. Get comprehensive analysis

### **Option 2: ChatGPT**
**URL:** https://chat.openai.com/

1. Go to https://chat.openai.com/
2. Paste your prompt with the data
3. Get detailed recommendations

### **Option 3: Claude**
**URL:** https://claude.ai/

1. Go to https://claude.ai/
2. Paste your prompt with the data
3. Get strategic insights

---

## 📊 Data Collection Checklist

Use this to ensure you have all the data:

- [ ] **Lighthouse**: Performance, Accessibility, Best Practices, SEO scores
- [ ] **Search Console**: Clicks, impressions, CTR, position, top queries
- [ ] **Google Trends**: Keyword trends, related queries
- [ ] **Analytics**: Users, bounce rate, top pages, traffic sources
- [ ] **Keyword Planner**: Target keywords with volume and competition
- [ ] **Rich Results Test**: Schema markup status

---

## 🚀 Quick Start (5 Minutes)

**Minimum viable data collection:**

1. **Lighthouse** (1 min): https://pagespeed.web.dev/
   - Just get the 4 scores

2. **Search Console** (2 min): https://search.google.com/search-console
   - Just get clicks, impressions, CTR, position

3. **Paste to Gemini** (2 min):
```
Quick SEO check for [URL]:

Lighthouse:
- Performance: [X]/100
- SEO: [X]/100

Search Console (28 days):
- Clicks: [X]
- Impressions: [X]
- CTR: [X]%

What are my top 3 priorities to improve these numbers?
```

---

## 🎯 Expected Output from AI

When you paste these prompts with your data, you should get:

1. **Performance Grade**: Overall A-F rating
2. **Critical Issues**: Top 3 things breaking your site
3. **Quick Wins**: 5-10 fixes you can do this week
4. **Keyword Strategy**: Which keywords to target
5. **Content Gaps**: What content you're missing
6. **Technical Fixes**: Schema, speed, mobile issues
7. **UX Improvements**: Navigation, design, accessibility
8. **3-Month Roadmap**: What to do in what order

---

## ✅ This Replaces Automated Tools

If the app can't automatically call these APIs, **these manual prompts give you the same analysis quality** - just copy/paste the data yourself.

**Time required:** 10-15 minutes for complete data collection
**AI analysis time:** 2-3 minutes
**Total:** ~20 minutes for full report

---

**Bookmark this page and use it whenever automated tools fail!** 🚀


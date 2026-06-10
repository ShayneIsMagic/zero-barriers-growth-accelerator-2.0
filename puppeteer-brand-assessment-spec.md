# Puppeteer Brand Assessment Tool
## Complete Configuration Specification

**Version:** 1.0  
**Frameworks:** B2C Elements of Value · B2B Elements of Value · CliftonStrengths · Golden Circle · Brand Archetypes  
**Scoring:** Flat Fractional v2.0 — all elements equal weight  
**Evidence Source:** Website language, CTAs, testimonials, promises, headlines, and behavioral implications — NOT product specs alone

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [How Evidence Becomes Assessment](#2-how-evidence-becomes-assessment)
3. [Puppeteer Page Collection Strategy](#3-puppeteer-page-collection-strategy)
4. [Evidence Stream Configuration](#4-evidence-stream-configuration)
5. [CSS Selectors by Evidence Type](#5-css-selectors-by-evidence-type)
6. [Framework Mapping: What Feeds What](#6-framework-mapping-what-feeds-what)
7. [B2C Elements of Value — Full Collection Map](#7-b2c-elements-of-value--full-collection-map)
8. [B2B Elements of Value — Full Collection Map](#8-b2b-elements-of-value--full-collection-map)
9. [CliftonStrengths Brand Profile — Collection Map](#9-cliftonstrengths-brand-profile--collection-map)
10. [Golden Circle — Collection Map](#10-golden-circle--collection-map)
11. [Brand Archetype Detection — Full Keyword Map](#11-brand-archetype-detection--full-keyword-map)
12. [Existing vs. Proposed Content Comparison Mode](#12-existing-vs-proposed-content-comparison-mode)
13. [Output Structure](#13-output-structure)
14. [Scoring Instructions for Each Framework](#14-scoring-instructions-for-each-framework)
15. [AI Prompt Templates](#15-ai-prompt-templates)

---

## 1. Core Philosophy

### The Key Reframe

This tool does **not** analyze what a company does. It analyzes **what a company says, promises, and implies** — then runs that through five assessment frameworks simultaneously.

The evidence sources are:
- **CTAs** — the brand's most intentional, compressed language. Every button and link reveals a psychological promise.
- **Headlines (H1–H3)** — the narrative arc the brand constructs across the user journey.
- **Testimonials & Reviews** — customer language describing what they *received*, revealing what the brand actually delivers vs. what it promises.
- **Promises & Guarantees** — explicit commitments that reveal values and confidence levels.
- **Mission & Purpose Language** — the brand's stated reason for existing.
- **Image Alt Text** — deliberate visual archetype choices made consciously or unconsciously.
- **Navigation Labels** — structural priorities the brand has decided matter most.

### For CliftonStrengths Specifically

CliftonStrengths traditionally assesses individuals. Applied to brands, we infer the **organizational strengths a brand demonstrates or promises to deliver** based on:
- What behaviors do their CTAs invite? ("Start building" → Activator, Achiever)
- What do testimonials say the company delivered? ("They really listened" → Empathy, Developer)
- What strengths must the company possess to credibly make the promises they're making?

This gives us a **behavioral brand profile** — what strengths show up in how this brand operates and communicates.

### Existing vs. Proposed Mode

When two URLs are provided, Puppeteer collects both and the assessment runs as a **gap analysis**:
- What is the existing site communicating?
- What is the proposed content targeting?
- Where are the alignment gaps, improvements, and regressions?

---

## 2. How Evidence Becomes Assessment

```
WEBSITE
  │
  ├── CTAs ──────────────────────────────────────────────┐
  ├── Headlines (H1–H3) ───────────────────────────────┐ │
  ├── Testimonials & Reviews ──────────────────────── ┐│ │
  ├── Promises & Guarantees ─────────────────────── ┐ ││ │
  ├── Mission / Purpose Language ─────────────────┐ │ ││ │
  ├── Feature / Benefit Claims ───────────────── ┐│ │ ││ │
  ├── Image Alt Text ────────────────────────── ┐││ │ ││ │
  └── Navigation Labels ──────────────────────┐ │││ │ ││ │
                                              │ │││ │ ││ │
                         EVIDENCE PACKAGE ◄──┘─┘┘┘─┘─┘┘─┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
           LANGUAGE          BEHAVIOR        VISUAL
           SIGNALS           IMPLIED         SIGNALS
                │               │               │
     ┌──────────┴──┬────────────┤       ┌───────┘
     │             │            │       │
  B2C Elements  B2B Elements  CliftonStrengths
  (30 elements) (40 elements) (34 themes)
     │             │
  Golden Circle  Archetypes
  (4 × 6 dims)  (12 types)
```

---

## 3. Puppeteer Page Collection Strategy

### Universal Pages (ALL frameworks)

Collected for every run regardless of framework selection.

| Page Path | Evidence Priority | What It Reveals |
|-----------|------------------|-----------------|
| `/` | ★★★★★ | Primary value prop, headline, main CTA, visual archetype |
| `/about` or `/about-us` | ★★★★★ | WHY, values, origin story, brand voice |
| `/our-story` | ★★★★★ | Narrative archetype, founder voice, belief system |
| `/mission` or `/values` | ★★★★☆ | Golden Circle WHY, CliftonStrengths Belief/Connectedness |
| `/why-us` or `/why-[brand]` | ★★★★☆ | HOW differentiators, competitive positioning |
| `/philosophy` or `/manifesto` | ★★★☆☆ | Deep WHY, archetype language |

### B2C-Specific Pages

| Page Path | Key Elements Targeted |
|-----------|----------------------|
| `/features` or `/how-it-works` | Functional tier (14 elements) |
| `/pricing` or `/plans` | Reduces Cost, Acceptable Price, Value |
| `/testimonials` or `/reviews` | Emotional + Life-Changing tier evidence |
| `/results` or `/success-stories` | Self-Actualization, Motivation, Hope |
| `/community` | Affiliation/Belonging, Connects |
| `/benefits` | Functional tier, Emotional tier |
| `/blog` (first 3 posts) | Tone, voice, archetype language patterns |

### B2B-Specific Pages

| Page Path | Key Elements Targeted |
|-----------|----------------------|
| `/solutions` or `/products` | Table Stakes, Functional tier |
| `/case-studies` or `/customers` | Improved Top Line, Cost Reduction, Stability |
| `/integrations` | Integration, Connection, Configurability |
| `/security` or `/compliance` | Regulatory Compliance, Risk Reduction |
| `/enterprise` | Scalability, Meeting Specifications |
| `/support` or `/help` | Responsiveness, Commitment, Expertise |
| `/partners` | Reach, Network Expansion, Commitment |
| `/pricing` | Acceptable Price, Transparency |

### Golden Circle-Specific Pages

| Page Path | Component Targeted |
|-----------|-------------------|
| `/about` | WHY — core purpose |
| `/our-approach` or `/methodology` | HOW — unique process |
| `/how-it-works` | HOW — differentiators |
| `/team` or `/leadership` | WHO — audience + HOW |
| `/careers` or `/culture` | WHY (internal), values alignment |
| `/` (homepage) | WHAT — product/service clarity |

### CliftonStrengths-Specific Pages

| Page Path | Themes Targeted |
|-----------|----------------|
| `/testimonials` | Empathy, Developer, Relator, Positivity |
| `/reviews` | Achiever, Communication, Significance |
| `/culture` or `/team` | Connectedness, Harmony, Includer |
| `/careers` | Belief, Developer, Learner |
| `/community` | Connectedness, Relator, Includer, Woo |
| `/blog` | Learner, Input, Communication, Intellection |
| `/customer-stories` | Developer, Empathy, Achiever |

### Archetype Detection Pages

| Page Path | What to Look For |
|-----------|-----------------|
| `/` | Dominant archetype CTA, hero headline |
| `/about` | Origin narrative archetype |
| `/blog` or `/journal` | Tone and voice archetype patterns |
| `/community` or `/movement` | Explorer, Caregiver, Innocent, Outlaw |
| `/manifesto` | Outlaw, Hero, Creator, Magician |
| `/careers` | Ruler, Creator, Explorer, Caregiver |

---

## 4. Evidence Stream Configuration

Puppeteer organizes collected content into **7 named evidence streams**. Each stream feeds specific framework elements.

### Stream 1: CTA Inventory
**What it is:** Every button, link, and form submission text across all pages, captured with surrounding context (the 200 characters before and after).  
**Why it matters:** CTAs are the brand's most intentional, distilled language — the psychological promise compressed to its minimum.  
**Collected with:** Text + parent section context + page location

```
Example CTA captures:
  "Reclaim Your Freedom" → Explorer/Outlaw archetype; Self-Actualization (B2C); Hope (B2B)
  "Join 50,000 Teams" → Woo/Relator (CliftonStrengths); Connects + Affiliation (B2C)
  "Get Your Free Analysis" → Reduces Risk + Reduces Cost (B2C); Risk Reduction (B2B)
  "See It in Action" → Analytical + Futuristic (CliftonStrengths); Innovation (B2B)
  "Start Building Today" → Activator + Achiever (CliftonStrengths); Makes Money (B2C)
```

### Stream 2: Headline Sequence
**What it is:** All H1, H2, and H3 text from all pages, in page order.  
**Why it matters:** The sequence of headlines reveals the narrative arc the brand is constructing — this maps directly to Brand Archetype narrative structures (Hero's Journey, Rags to Riches, Quest, etc.)  
**Collected with:** Tag level (H1/H2/H3) + page URL + text

### Stream 3: Testimonial & Review Text
**What it is:** All customer-voice content — testimonials, reviews, case study excerpts, star ratings + captions.  
**Why it matters:** Customer language reveals what the brand actually delivers vs. promises. This is the primary evidence stream for CliftonStrengths scoring.  
**Collected with:** Quote text + attributed role/name if visible + page source

```
Example testimonial → CliftonStrengths mapping:
  "They really listened to what we needed" → Empathy (0.8+), Relator (0.7+)
  "The team transformed how we work" → Maximizer, Achiever, Strategic
  "I felt like part of a community" → Connectedness, Includer, Positivity
  "They delivered exactly what they said they would" → Responsibility, Belief, Achiever
  "They challenged us to think differently" → Futuristic, Ideation, Activator
```

### Stream 4: Promise & Guarantee Language
**What it is:** All explicit commitment language — guarantees, pledges, "we promise," "you will," certifications, trust badges.  
**Why it matters:** Explicit promises are the highest-confidence evidence for scoring elements — a money-back guarantee directly scores Reduces Risk (B2C) and Risk Reduction (B2B).  
**Collected with:** Full promise text + context + page location

### Stream 5: Purpose & Mission Language
**What it is:** All mission statement, vision, values, and "why we exist" language.  
**Why it matters:** Primary evidence for Golden Circle WHY scoring and CliftonStrengths Belief/Connectedness themes.  
**Collected with:** Full paragraph text + section label + page URL

### Stream 6: Functional Claims
**What it is:** All feature bullets, benefit statements, capability claims, product descriptions.  
**Why it matters:** Primary evidence for B2C Functional tier (14 elements) and B2B Functional + Table Stakes tiers.  
**Collected with:** Full claim text + context + page source

### Stream 7: Visual Language Signals
**What it is:** Image alt text, icon labels, visual section headers, image captions.  
**Why it matters:** Reveals archetype visual choices. An Innocent brand uses "pure," "natural," "simple." A Hero brand uses "overcome," "win," "achieve" even in alt text.  
**Collected with:** Alt text + surrounding text + image position on page

---

## 5. CSS Selectors by Evidence Type

### CTA Collection
```javascript
const CTA_SELECTORS = [
  'button',
  'a[class*="btn"]',
  'a[class*="cta"]',
  'a[class*="button"]',
  '[class*="cta"]',
  '[class*="call-to-action"]',
  'a[href*="signup"]',
  'a[href*="get-started"]',
  'a[href*="start"]',
  'a[href*="join"]',
  'a[href*="try"]',
  'a[href*="demo"]',
  'a[href*="contact"]',
  'form button[type="submit"]',
  '[data-cta]',
  'input[type="submit"]',
];
```

### Headline Collection
```javascript
const HEADLINE_SELECTORS = ['h1', 'h2', 'h3', 'h4'];
```

### Testimonial Collection
```javascript
const TESTIMONIAL_SELECTORS = [
  '[class*="testimonial"]',
  '[class*="review"]',
  '[class*="quote"]',
  '[class*="case-study"]',
  '[class*="social-proof"]',
  'blockquote',
  '[class*="customer"]',
  '[class*="success-story"]',
  '[itemprop="review"]',
  '[class*="feedback"]',
  '[class*="client"]',
  '[class*="user-story"]',
];
```

### Promise & Guarantee Collection
```javascript
const PROMISE_SELECTORS = [
  '[class*="guarantee"]',
  '[class*="promise"]',
  '[class*="commitment"]',
  '[class*="pledge"]',
  '[class*="trust"]',
  '[class*="badge"]',
  '[class*="seal"]',
  '[class*="certification"]',
  '[class*="award"]',
];
```

### Mission / Purpose Collection
```javascript
const PURPOSE_SELECTORS = [
  '[class*="mission"]',
  '[class*="vision"]',
  '[class*="values"]',
  '[class*="purpose"]',
  '[class*="manifesto"]',
  '[class*="story"]',
  '[class*="about"]',
  '[class*="why-we"]',
  '[class*="our-belief"]',
];
```

### Feature / Functional Claims
```javascript
const FEATURE_SELECTORS = [
  '[class*="feature"]',
  '[class*="benefit"]',
  '[class*="value-prop"]',
  '[class*="highlight"]',
  'ul > li',
  '[class*="card"]',
  '[class*="capability"]',
  '[class*="solution"]',
];
```

### Image Alt Text
```javascript
const IMAGE_SELECTORS = ['img[alt]'];
// Extract: el.getAttribute('alt') — filter blanks and filenames
```

### Navigation
```javascript
const NAV_SELECTORS = [
  'nav a',
  'header a',
  '[class*="nav"] a',
  '[class*="menu"] a',
  '[role="navigation"] a',
];
```

### Stats & Social Proof Numbers
```javascript
const STATS_SELECTORS = [
  '[class*="stat"]',
  '[class*="metric"]',
  '[class*="number"]',
  '[class*="counter"]',
  '[class*="impact"]',
  '[class*="social-proof"]',
];
```

---

## 6. Framework Mapping: What Feeds What

| Evidence Stream | B2C Elements | B2B Elements | CliftonStrengths | Golden Circle | Archetypes |
|----------------|-------------|-------------|-----------------|---------------|-----------|
| CTAs | Functional tier (all 14) | Table Stakes + Functional | Activator, Achiever, Command, Woo | HOW + WHAT | All 12 |
| Headlines | Emotional + Life-Changing | Inspirational tier | Futuristic, Communication, Significance | WHY + HOW | All 12 |
| Testimonials | Emotional + Life-Changing | Ease of Business (Relationship) | Empathy, Developer, Relator, Positivity | WHO | Caregiver, Hero, Sage |
| Promises | Reduces Risk, Quality | Risk Reduction, Stability | Belief, Responsibility, Deliberative | HOW Proof Points | Innocent, Ruler |
| Mission Language | Self-Transcendence | Social Responsibility | Connectedness, Belief | WHY (primary) | All 12 |
| Feature Claims | Functional tier (all 14) | Functional + Table Stakes | Analytical, Strategic, Achiever | WHAT | Sage, Creator, Magician |
| Visual Signals | Attractive Appearance, Design | Design & Aesthetics | Individualization | WHAT Quality | All 12 |
| Navigation | All tiers (structural priority) | All tiers | Focus, Discipline | HOW + WHAT | Ruler, Sage, Explorer |

---

## 7. B2C Elements of Value — Full Collection Map

**Framework:** 30 elements, 4 tiers. Score = Sum of 30 ÷ 30. Each element scored 0.0–1.0.

### Tier 1: Functional (14 Elements)

| # | Element | Language Signals to Collect | Evidence Sources |
|---|---------|----------------------------|-----------------|
| 1 | **Saves Time** | "saves time," "faster," "quick," "instant," "minutes," "seconds," "speed," "rapid," "accelerate," "10x faster" | Feature claims, CTAs, headlines |
| 2 | **Simplifies** | "simple," "easy," "streamlined," "effortless," "intuitive," "one click," "no setup," "just works," "no learning curve" | Feature claims, CTAs, onboarding language |
| 3 | **Reduces Cost** | "save money," "affordable," "free," "cost-effective," "reduce spend," "lower cost," "ROI," "pays for itself" | Pricing page, headlines, feature claims |
| 4 | **Reduces Risk** | "safe," "secure," "reliable," "guaranteed," "trusted," "proven," "risk-free," "money-back," "protected" | Promises, trust badges, guarantee language |
| 5 | **Organizes** | "organize," "structure," "manage," "track," "dashboard," "overview," "system," "clear," "orderly" | Feature claims, product headlines |
| 6 | **Integrates** | "integrates," "connects with," "works with," "compatible," "sync," "unified," "API," "plug-in," "ecosystem" | Feature claims, integrations page |
| 7 | **Connects** | "connect," "network," "community," "together," "share," "collaborate," "join," "link," "social" | CTAs, community language, homepage |
| 8 | **Reduces Effort** | "no effort," "hands-free," "automatic," "without lifting a finger," "we do it for you," "automated" | Feature claims, CTAs |
| 9 | **Avoids Hassles** | "no hassle," "seamless," "friction-free," "smooth," "painless," "no headaches," "without the complexity" | Feature claims, testimonials |
| 10 | **Makes Money** | "earn," "revenue," "profit," "income," "monetize," "grow sales," "more customers," "boost earnings" | Feature claims, case studies, CTAs |
| 11 | **Reduces Anxiety** | "peace of mind," "worry-free," "never worry again," "rest easy," "stress-free," "confident," "reassured" | Promise language, testimonials, CTAs |
| 12 | **Rewards Me** | "rewards," "perks," "bonus," "loyalty," "points," "earn rewards," "benefits," "exclusive offers" | Pricing, feature claims |
| 13 | **Fun/Entertainment** | "fun," "enjoy," "entertaining," "exciting," "delight," "love," "game," "play," "adventure" | Headlines, CTAs, testimonials |
| 14 | **Quality** | "quality," "premium," "best-in-class," "excellence," "superior," "world-class," "crafted," "finest" | Headlines, feature claims, testimonials |

**Scoring Logic:**
- 0.8–1.0 (Excellent): Multiple strong signals, prominent placement, customer confirmation
- 0.6–0.79 (Good): Present and clear, at least one strong signal
- 0.4–0.59 (Needs Work): Mentioned but weak or buried
- 0.0–0.39 (Poor): Absent or contradicted

---

### Tier 2: Emotional (10 Elements)

| # | Element | Language Signals to Collect | Evidence Sources |
|---|---------|----------------------------|-----------------|
| 1 | **Attractive Appearance** | "beautiful," "stunning," "elegant," "stylish," "gorgeous," "visually," "aesthetic," "design-forward" | Visual signals, image alt text, headlines |
| 2 | **Provides Access** | "exclusive," "VIP," "members only," "insider," "early access," "private," "invite-only," "priority" | CTAs, pricing tier labels |
| 3 | **Variety** | "variety," "options," "choose," "selection," "range," "flexible," "customize," "mix," "hundreds of" | Feature claims, navigation |
| 4 | **Therapeutic Value** | "healing," "restore," "refresh," "renew," "unwind," "recharge," "calm," "relax," "rejuvenate," "soothe" | Headlines, about pages |
| 5 | **Nostalgia** | "heritage," "tradition," "since [year]," "classic," "timeless," "legacy," "history," "established," "roots" | About/story pages, footer |
| 6 | **Design/Aesthetics** | "crafted," "artisan," "handmade," "design," "artistry," "meticulously," "thoughtfully designed," "bespoke" | Product pages, about pages |
| 7 | **Badge Value** | "status," "prestigious," "award-winning," "recognized," "respected," "elite," "distinguished" | Social proof, homepage |
| 8 | **Wellness** | "health," "wellbeing," "wellness," "vitality," "thrive," "flourish," "wholesome," "natural," "organic" | Headlines, about pages, product pages |
| 9 | **Reduces Anxiety (Emotional)** | "comfort," "soothing," "calming," "gentle," "reassurance," "nurture," "supportive," "here for you" | Testimonials, mission language |
| 10 | **Rewards Me (Emotional)** | "treat yourself," "indulge," "you deserve," "self-care," "gift yourself," "pamper," "personal reward" | CTAs, product pages |

---

### Tier 3: Life-Changing (5 Elements)

| # | Element | Language Signals to Collect | Evidence Sources |
|---|---------|----------------------------|-----------------|
| 1 | **Provides Hope** | "hope," "possibility," "imagine," "future," "brighter," "better tomorrow," "what if," "vision," "potential" | Headlines, about pages, CTAs |
| 2 | **Self-Actualization** | "become," "potential," "best version," "fulfillment," "purpose," "meaning," "achieve your," "who you are meant to be" | Mission language, CTAs, testimonials |
| 3 | **Motivation** | "inspire," "motivate," "drive," "ambition," "push forward," "momentum," "fuel," "ignite," "empower" | Headlines, CTAs, about pages |
| 4 | **Heirloom** | "legacy," "generations," "last a lifetime," "forever," "passed down," "timeless investment," "heirloom" | Product descriptions, about pages |
| 5 | **Affiliation/Belonging** | "belong," "community," "tribe," "family," "movement," "join us," "part of something," "together we," "member" | CTAs, community pages, testimonials |

---

### Tier 4: Social Impact (1 Element)

| # | Element | Language Signals to Collect | Evidence Sources |
|---|---------|----------------------------|-----------------|
| 1 | **Self-Transcendence** | "change the world," "greater good," "purpose beyond profit," "impact," "mission-driven," "give back," "planet," "humanity," "make a difference" | Mission pages, about pages, footer |

---

## 8. B2B Elements of Value — Full Collection Map

**Framework:** 40 elements, 5 tiers. Score = Sum of 40 ÷ 40. Each element scored 0.0–1.0.

### Tier 1: Table Stakes (4 Elements)

| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 1 | **Meeting Specifications** | "specifications," "requirements," "standards," "compliant," "certified," "meets enterprise needs," "delivers on" | Product pages, case studies |
| 2 | **Acceptable Price** | "transparent pricing," "flexible plans," "ROI," "cost-effective," "value for money," "no hidden fees," "predictable pricing" | Pricing page |
| 3 | **Regulatory Compliance** | "GDPR," "SOC 2," "ISO 27001," "HIPAA," "FTC," "compliant," "certified," "audit-ready," "accredited" | Security/compliance page, footer |
| 4 | **Ethical Standards** | "ethics," "integrity," "responsible," "honest," "transparent," "fair," "trustworthy," "principled" | About/values pages, mission |

---

### Tier 2: Functional (7 Elements)

#### Economic Value
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 1 | **Improved Top Line** | "increase revenue," "grow sales," "more customers," "market share," "drive pipeline," "top-line growth" | Case studies, feature claims, CTAs |
| 2 | **Cost Reduction** | "reduce costs," "save," "lower spend," "cut expenses," "eliminate waste," "cost savings," "efficiency gains" | Case studies, ROI calculators, CTAs |

#### Performance Value
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 3 | **Product Quality** | "reliable," "robust," "enterprise-grade," "high performance," "zero downtime," "SLA," "uptime guarantee" | Product page, testimonials, trust badges |
| 4 | **Scalability** | "scale," "grows with you," "enterprise," "handles volume," "flexible capacity," "from startup to enterprise" | Product page, case studies |
| 5 | **Innovation** | "cutting-edge," "AI-powered," "next-generation," "innovative," "pioneering," "first-to-market," "state of the art" | Homepage, product pages |
| 6 | **Flexibility** | "flexible," "customizable," "adaptable," "configurable," "tailored," "your way," "fits your workflow" | Feature pages, pricing |
| 7 | **Component Quality** | "built on," "powered by," "enterprise infrastructure," "industry-leading tech stack," "best-in-class components" | About/tech pages, product pages |

---

### Tier 3: Ease of Doing Business (19 Elements)

#### Productivity (5)
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 1 | **Time Savings** | "saves hours," "faster workflows," "automate," "eliminate manual work," "hours back," "reduce time-to-value" | Feature claims, CTAs |
| 2 | **Reduced Effort** | "no manual work," "hands-off," "automated," "one-click," "self-service," "zero lift," "it just happens" | Feature claims, CTAs |
| 3 | **Decreased Hassles** | "painless," "smooth onboarding," "no headaches," "eliminate complexity," "no friction," "remove barriers" | Onboarding pages, testimonials |
| 4 | **Information** | "insights," "analytics," "reporting," "real-time data," "visibility," "intelligence," "data-driven decisions" | Feature pages, dashboard screenshots |
| 5 | **Transparency** | "transparent," "open," "no hidden fees," "full visibility," "audit trail," "see everything," "clear pricing" | Pricing page, about pages |

#### Operational (4)
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 6 | **Organization** | "organized," "centralized," "single source of truth," "one place," "unified dashboard," "everything in one" | Feature claims |
| 7 | **Simplification** | "simplify," "streamline," "remove complexity," "straightforward," "no-code," "out of the box," "easy setup" | Feature claims, onboarding |
| 8 | **Connection** | "connects teams," "bridges departments," "cross-functional," "team alignment," "collaboration," "shared workspace" | Feature claims, use-case pages |
| 9 | **Integration** | "integrates with," "native integration," "connects to," "200+ integrations," "open API," "works with your stack" | Integrations page, feature claims |

#### Access (3)
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 10 | **Availability** | "always available," "24/7," "on-demand," "any device," "anywhere," "always on," "cloud-based," "99.9% uptime" | Feature claims, SLA language |
| 11 | **Variety** | "full suite," "complete platform," "all-in-one," "multiple options," "wide range of features," "covers all needs" | Feature pages, pricing tiers |
| 12 | **Configurability** | "configure," "white-label," "custom workflows," "tailor," "build your own," "flexible setup," "no-code builder" | Feature pages, enterprise page |

#### Relationship (5)
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 13 | **Responsiveness** | "24/7 support," "dedicated team," "fast response," "always there," "reach us anytime," "same-day response" | Support page, testimonials |
| 14 | **Expertise** | "experts," "specialists," "team of," "years of experience," "certified," "deep knowledge," "thought leaders" | About/team pages, testimonials |
| 15 | **Commitment** | "dedicated," "long-term partner," "committed to your success," "we grow with you," "invested in your outcome" | About pages, testimonials |
| 16 | **Stability** | "trusted by," "established," "reliable partner," "industry leader," "proven track record," "since [year]" | Homepage, about pages, social proof |
| 17 | **Cultural Fit** | "values alignment," "share your values," "mission-aligned," "purpose-driven," "we believe what you believe" | About/culture pages |

#### Strategic (2)
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 18 | **Risk Reduction** | "reduce risk," "protect," "secure," "insured," "backup," "fail-safe," "disaster recovery," "peace of mind" | Security page, feature claims, promises |
| 19 | **Reach** | "global," "worldwide," "expand into new markets," "distribution," "reach more customers," "international" | About pages, case studies |

---

### Tier 4: Individual (7 Elements)

#### Career (3)
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 1 | **Network Expansion** | "connect with leaders," "industry connections," "expand your network," "access to community," "peer network" | Community pages, testimonials |
| 2 | **Marketability** | "career growth," "advance your career," "certification," "resume builder," "skills development," "hire better" | Careers/training pages, testimonials |
| 3 | **Reputational Assurance** | "trusted by the best," "recognized brands use," "endorsed by," "be seen as a leader," "credibility boost" | Social proof, homepage, case studies |

#### Personal (4)
| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 4 | **Design & Aesthetics** | "beautifully designed," "intuitive UI," "award-winning design," "clean interface," "delightful to use" | Product pages, testimonials |
| 5 | **Growth & Development** | "learn," "grow," "training," "onboarding," "resources," "documentation," "certifications," "knowledge base" | Resources/learning pages |
| 6 | **Reduced Anxiety** | "peace of mind," "no more stress," "take the worry out," "confident decisions," "we handle it for you" | Feature claims, testimonials, promises |
| 7 | **Fun and Perks** | "enjoy," "love using," "customers love," "delightful," "perks," "team loves it," "actually fun to use" | Testimonials, product pages |

---

### Tier 5: Inspirational (3 Elements)

| # | Element | Language Signals | Evidence Sources |
|---|---------|-----------------|-----------------|
| 1 | **Vision** | "the future of," "redefining," "what comes next," "transforming the industry," "bold vision," "reimagining" | Homepage, about pages, headlines |
| 2 | **Hope** | "possibility," "imagine if," "brighter future," "world where," "a better way," "believe in more," "what's possible" | Mission language, headlines, CTAs |
| 3 | **Social Responsibility** | "sustainability," "carbon neutral," "ESG," "social impact," "community give-back," "B Corp," "1% for Planet" | About pages, footer, mission |

---

## 9. CliftonStrengths Brand Profile — Collection Map

**Framework:** 34 themes, 4 domains. Score = Sum of 34 ÷ 34.  
**Evidence:** We infer organizational strengths from brand language, promises, and testimonials — what strengths must the company operate from to deliver what they're claiming?

### Domain 1: Strategic Thinking (8 Themes) 🟣

| # | Theme | Language Signals | Testimonial Signals |
|---|-------|-----------------|-------------------|
| 1 | **Analytical** | "data-driven," "research-backed," "evidence-based," "metrics," "analysis," "proven," "benchmarks," "studied" | "They showed us the data," "Backed everything with numbers" |
| 2 | **Context** | "founded in," "since [year]," "history of," "built on decades," "origins," "where we came from" | "They understood our history," "Respected where we'd been" |
| 3 | **Futuristic** | "the future of," "tomorrow," "next generation," "ahead of the curve," "forward-thinking," "roadmap," "anticipate" | "They helped us see what was coming," "Changed how we think about the future" |
| 4 | **Ideation** | "innovative," "creative," "reimagined," "fresh approach," "out of the box," "invention," "breakthrough" | "They came up with ideas we'd never considered," "Always a new angle" |
| 5 | **Input** | "knowledge base," "library," "resources," "curated," "collection," "research," "comprehensive," "gathered" | "So much valuable content," "A wealth of information" |
| 6 | **Intellection** | "thoughtful," "considered," "deep dive," "nuanced," "deliberate," "thought leadership," "carefully crafted" | "Very thoughtful in their approach," "Depth of thinking surprised us" |
| 7 | **Learner** | "learn," "education," "training," "growth," "skill-building," "courses," "workshops," "continuously improving" | "They helped us learn," "Always getting better," "We grew with them" |
| 8 | **Strategic** | "strategy," "planning," "roadmap," "long-term," "priorities," "alternative paths," "focused approach" | "Had a clear plan," "Helped us prioritize," "Saw the whole picture" |

---

### Domain 2: Relationship Building (9 Themes) 🔵

| # | Theme | Language Signals | Testimonial Signals |
|---|-------|-----------------|-------------------|
| 1 | **Adaptability** | "flexible," "adapts to," "meets you where you are," "evolves with," "agile," "responsive to change" | "They adapted to our needs," "Never rigid," "Changed when we changed" |
| 2 | **Connectedness** | "we are all connected," "community," "unity," "together," "bigger picture," "interdependence," "ecosystem" | "Made us feel part of something," "Understood the bigger picture" |
| 3 | **Developer** | "grow," "develop," "mentor," "coach," "unlock potential," "cultivate," "guide you," "nurture" | "They helped us grow," "Invested in our success," "Built our team up" |
| 4 | **Empathy** | "we understand," "we know how you feel," "listen," "care about," "compassion," "your experience matters" | "They really listened," "Understood our struggles," "Actually cared" |
| 5 | **Harmony** | "everyone included," "consensus," "common ground," "works for all teams," "no silos," "aligned" | "Brought everyone together," "Reduced friction between teams" |
| 6 | **Includer** | "for everyone," "inclusive," "welcome," "belonging," "no one left out," "accessible to all," "open doors" | "Made everyone feel welcome," "Works for all skill levels" |
| 7 | **Individualization** | "personalized," "tailored to you," "your unique needs," "bespoke," "one-size-fits-one," "your way" | "Felt completely customized for us," "Treated us as individuals" |
| 8 | **Positivity** | "exciting," "amazing," "love," "celebrate," "joy," "enthusiastic," "uplifting," "inspiring," "energized" | "Working with them is genuinely fun," "The team's energy is infectious" |
| 9 | **Relator** | "authentic," "genuine," "real relationship," "trust," "deeply know you," "long-term," "partners," "loyal" | "They feel like true partners," "Trust them completely," "Relationship built over time" |

---

### Domain 3: Influencing (8 Themes) 🟠

| # | Theme | Language Signals | Testimonial Signals |
|---|-------|-----------------|-------------------|
| 1 | **Activator** | "get started now," "act today," "take action," "start immediately," "launch," "move fast," "ready to go" | "Got us moving immediately," "No waiting — just action" |
| 2 | **Command** | "we lead," "industry leader," "#1," "dominant," "authority," "the standard," "the benchmark," "we set the bar" | "Clear authority in the space," "They lead, we follow their guidance" |
| 3 | **Communication** | "storytelling," "transparent messaging," "voice," "clearly explains," "articulate," "expressive," "speaks to" | "Communicated clearly at every step," "Always knew what was happening" |
| 4 | **Competition** | "best," "outperform," "beat the competition," "win," "top-ranked," "exceed expectations," "#1 rated" | "They made us competitive," "Results beat all benchmarks" |
| 5 | **Maximizer** | "optimize," "maximize," "best possible," "peak performance," "full potential," "most out of," "10x," "level up" | "Helped us reach our ceiling," "Turned good into great" |
| 6 | **Self-Assurance** | "confident," "bold," "stand behind it," "we know," "guaranteed," "certain," "decisive," "no doubt" | "Confidence in what they do is visible," "They never wavered" |
| 7 | **Significance** | "award-winning," "recognized," "notable," "leading," "respected," "influential," "matters," "prominent" | "Put us on the map," "Recognition came quickly," "We became known" |
| 8 | **Woo** | "join thousands," "loved by," "customers love," "fans," "rave reviews," "word spreads," "community grows" | "Everyone we refer loves them," "Word of mouth brought us here" |

---

### Domain 4: Executing (9 Themes) 🔴

| # | Theme | Language Signals | Testimonial Signals |
|---|-------|-----------------|-------------------|
| 1 | **Achiever** | "we deliver," "results," "accomplishes," "driven," "productive," "hard-working," "proven results," "done" | "They actually deliver," "Results every single time," "Work ethic is extraordinary" |
| 2 | **Arranger** | "orchestrate," "coordinate," "end-to-end," "full-service," "manages complexity," "all in one place" | "Managed everything seamlessly," "Complex situation, simple execution" |
| 3 | **Belief** | "core values," "we believe," "mission-driven," "principles," "stand for," "non-negotiable," "our purpose" | "You can tell they actually believe in what they do," "Values-driven throughout" |
| 4 | **Consistency** | "consistent," "reliable," "always the same quality," "fairness," "equality," "no surprises," "dependable" | "Always consistent," "Every interaction the same quality," "Never a bad experience" |
| 5 | **Deliberative** | "careful," "considered," "risk-aware," "thorough," "no shortcuts," "measured approach," "we think before" | "They thought it through," "Careful and thorough," "Never rushed us into something wrong" |
| 6 | **Discipline** | "structure," "process," "system," "routine," "organized," "methodical," "step-by-step," "framework" | "Very organized," "Clear process made everything easy," "Disciplined approach" |
| 7 | **Focus** | "prioritize," "goal-oriented," "stays on target," "laser-focused," "clear direction," "cut through noise" | "Kept us focused on what mattered," "Never got distracted," "Results-oriented" |
| 8 | **Responsibility** | "ownership," "accountability," "we take responsibility," "stand behind our work," "committed," "follow through" | "They own every outcome," "Never passed the blame," "Responsible for everything" |
| 9 | **Restorative** | "problem-solving," "fix," "troubleshoot," "resolve," "solution-oriented," "when things go wrong," "recover" | "Fixed issues fast," "Turned a problem into a success," "Solution-first mindset" |

---

## 10. Golden Circle — Collection Map

**Framework:** 4 components (WHY, HOW, WHAT, WHO). Each scored across 6 dimensions.  
**Score:** Component = Average of 6 dimensions. Overall = Average of 4 components.

### WHY — Purpose / Cause / Belief

**Where to find it:** About page, mission page, founder story, manifesto

| Dimension | Language to Look For | Evidence Sources |
|-----------|---------------------|-----------------|
| **Clarity** | A clear, non-product statement of purpose | About page, mission statement |
| **Authenticity** | Evidence that actions match stated values | Case studies, policies, commitments |
| **Inspiration** | Language that moves beyond features to meaning | Headlines, mission language |
| **Consistency** | Same WHY language across homepage, about, careers, blog | Multiple pages |
| **Differentiation** | A purpose that could only belong to this brand | About page, brand voice |
| **Emotional Resonance** | Language that evokes feeling, not just understanding | CTAs, headlines, story language |

**WHY Signal Words:** "we believe," "our purpose," "why we exist," "mission is to," "we're on a mission," "we started because," "we refuse to accept," "the world where," "we fight for"

---

### HOW — Unique Process / Differentiators

**Where to find it:** How it works page, methodology, approach, features page

| Dimension | Language to Look For | Evidence Sources |
|-----------|---------------------|-----------------|
| **Uniqueness** | Claims of distinctive approach | How-it-works page, features |
| **Clarity** | Clear explanation of method | How-it-works page, support docs |
| **Consistency** | Same HOW across all touchpoints | Multiple pages |
| **Alignment with WHY** | Method clearly serves the stated purpose | About + feature pages together |
| **Proof Points** | Evidence, data, certifications of method | Case studies, trust badges |
| **Competitive Moat** | Why their HOW can't be copied | Feature claims, about pages |

**HOW Signal Words:** "unlike other," "our approach," "the way we," "our method," "how we do it differently," "proprietary," "our process," "we've developed a way"

---

### WHAT — Products / Services / Results

**Where to find it:** Homepage, product pages, features page, pricing

| Dimension | Language to Look For | Evidence Sources |
|-----------|---------------------|-----------------|
| **Clarity** | Clear, jargon-free description of what's offered | Homepage, features page |
| **Alignment** | WHAT language ties back to WHY and HOW | Across all pages |
| **Quality** | Claims and evidence of excellence | Testimonials, social proof |
| **Proof of WHY** | Products shown as purpose made tangible | About + product pages |
| **Evolution** | Signals of ongoing innovation | Blog, product announcements |
| **Market Fit** | Evidence audience actually wants this | Testimonials, usage stats |

**WHAT Signal Words:** "we offer," "our product," "our service," "get access to," "includes," "what you get," "the platform," "the tool"

---

### WHO — Target Audience / Believers

**Where to find it:** Homepage hero, testimonials, case studies, community pages

| Dimension | Language to Look For | Evidence Sources |
|-----------|---------------------|-----------------|
| **Clarity** | Specific audience named and described | Homepage, about pages |
| **Alignment** | Audience shares the brand's WHY | Testimonials, community language |
| **Specificity** | Named roles, industries, psychographics | Pricing tiers, use case pages |
| **Understanding** | Evidence of deep audience insight | Blog, messaging, language choices |
| **Resonance** | Audience language reflected back | Testimonials, CTAs using "you" language |
| **Loyalty** | Long-term customer evidence | Case studies, community size claims |

**WHO Signal Words:** "for [specific person]," "built for," "designed for teams who," "if you're a," "for people who believe," "our customers are," "[audience] love us because"

---

## 11. Brand Archetype Detection — Full Keyword Map

**Framework:** 12 archetypes (Jungian / Jambojon). Detection via linguistic fingerprint across all collected text.  
**Scoring:** Keyword frequency × prominence weight (H1 = 5x, H2 = 3x, H3 = 2x, CTA = 4x, body = 1x).

Each archetype has a **Core Promise** — the fundamental psychological offer the brand makes.

---

### 🦸 HERO
**Core Promise:** "We help you overcome. You can win."  
**Narrative Archetype:** Overcoming the Monster, Rags to Riches  
**CTA Patterns:** "Crush your goals," "Beat the competition," "Win more," "Achieve greatness," "Don't settle"

| Signal Type | Keywords |
|-------------|---------|
| Power words | overcome, achieve, win, conquer, defeat, fight, warrior, champion, unstoppable |
| Outcome words | results, performance, strength, success, victory, triumph, excel, dominate |
| Challenge framing | challenge, obstacle, struggle, battle, against the odds, hard-earned |
| CTA language | "Take on the challenge," "Prove yourself," "Get results," "Start winning" |

---

### 🦉 SAGE
**Core Promise:** "We give you knowledge. Truth leads to freedom."  
**Narrative Archetype:** Quest for Truth  
**CTA Patterns:** "Learn more," "Get the guide," "See the research," "Discover how," "Understand why"

| Signal Type | Keywords |
|-------------|---------|
| Knowledge words | learn, discover, insights, research, data, expertise, wisdom, understand, truth |
| Authority signals | evidence-based, peer-reviewed, experts, specialists, thought leaders, analysis |
| Educational framing | guide, how-to, explained, breakdown, deep dive, masterclass, whitepaper |
| CTA language | "Read the research," "Access the knowledge," "Learn from experts," "Get the guide" |

---

### 🧭 EXPLORER
**Core Promise:** "There's a better way. Discover it."  
**Narrative Archetype:** The Quest, The Journey  
**CTA Patterns:** "Discover," "Explore," "Find your path," "Start your journey," "See what's possible"

| Signal Type | Keywords |
|-------------|---------|
| Freedom words | freedom, independence, discover, journey, adventure, explore, horizon, open road |
| Possibility words | new, possibilities, potential, uncharted, beyond, unexplored, pioneer |
| Identity words | authentic, self-discovery, true self, your way, on your terms |
| CTA language | "Start exploring," "Discover your path," "Find what works for you," "See the possibilities" |

---

### 😇 INNOCENT
**Core Promise:** "Simple. Pure. Honest. We do right by you."  
**Narrative Archetype:** Happily Ever After  
**CTA Patterns:** "Get started free," "Try it simply," "See how easy," "It just works"

| Signal Type | Keywords |
|-------------|---------|
| Purity words | pure, clean, simple, honest, natural, wholesome, transparent, genuine |
| Trust words | trustworthy, reliable, no hidden, straightforward, no surprises, just works |
| Optimism words | better, good, positive, happy, hope, bright, warm, safe |
| CTA language | "Try it free," "See how simple," "Get started today," "It really is that easy" |

---

### 🤝 CAREGIVER
**Core Promise:** "We're here for you. We protect and serve."  
**Narrative Archetype:** Rebirth (others' transformation)  
**CTA Patterns:** "We're here to help," "Get support," "We take care of it," "You're in good hands"

| Signal Type | Keywords |
|-------------|---------|
| Care words | care, support, help, protect, nurture, serve, dedicated, here for you |
| Community words | together, community, family, belong, connection, we're with you |
| Safety words | safe, protected, looked after, covered, never alone, peace of mind |
| CTA language | "Get support," "Talk to us," "We're here," "You're covered," "Let us help" |

---

### 🃏 JESTER
**Core Promise:** "This should be fun. Life's too short for boring."  
**Narrative Archetype:** Comedy, Celebration  
**CTA Patterns:** "Give it a try," "Have some fun," "See what happens," "Why not?"

| Signal Type | Keywords |
|-------------|---------|
| Fun words | fun, play, laugh, enjoy, delight, witty, lighten up, celebrate, joy |
| Levity signals | no-nonsense, refreshing, actually fun to use, finally a tool that doesn't suck |
| Playful framing | weird, quirky, different, not your typical, seriously though |
| CTA language | "Try it for free (we think you'll like it)," "Join the fun," "See what the fuss is about" |

---

### ✨ MAGICIAN
**Core Promise:** "We will transform you. Nothing will be the same."  
**Narrative Archetype:** Rebirth, Transformation  
**CTA Patterns:** "Transform your [X]," "See the magic," "Watch what happens," "Be transformed"

| Signal Type | Keywords |
|-------------|---------|
| Transformation words | transform, change, magic, possibility, remarkable, revolutionary, shift |
| Vision words | imagine, envision, what if, suddenly, the moment everything changes |
| Power words | unlock, unleash, harness, activate, reveal, discover, breakthrough |
| CTA language | "Transform your results," "Unlock your potential," "See what's possible," "Change everything" |

---

### 🏴‍☠️ OUTLAW
**Core Promise:** "The old way is broken. We're the disruption."  
**Narrative Archetype:** Overcoming the Monster (the status quo is the monster)  
**CTA Patterns:** "Break free," "Ditch the old way," "Join the rebellion," "Disrupt [industry]"

| Signal Type | Keywords |
|-------------|---------|
| Rebellion words | disrupt, rebel, break, challenge, bold, different, rules, revolution, rethink |
| Anti-establishment signals | "not like other," "unlike traditional," "the old way is dead," "status quo" |
| Freedom framing | refuse, reject, break free, on your own terms, independent |
| CTA language | "Break free from [X]," "Join the disruption," "Ditch [competitor/old way]," "Rebel against" |

---

### 👑 RULER
**Core Promise:** "We are the best. Align with the leader."  
**Narrative Archetype:** Quest for Order, Rags to Riches (already arrived)  
**CTA Patterns:** "Get the platform the best use," "Join industry leaders," "Access the #1 solution"

| Signal Type | Keywords |
|-------------|---------|
| Authority words | leader, #1, dominant, authority, premium, exclusive, gold standard, best |
| Power signals | command, control, manage, oversee, govern, set the standard, define |
| Prestige framing | elite, world-class, enterprise, distinguished, trusted by the Fortune 500 |
| CTA language | "Join the leaders," "Get the industry standard," "Access the #1 platform," "Lead with" |

---

### 💝 LOVER
**Core Promise:** "You deserve to feel deeply. This is made for you."  
**Narrative Archetype:** Love Story  
**CTA Patterns:** "Fall in love with," "Experience the difference," "Made just for you," "Feel the difference"

| Signal Type | Keywords |
|-------------|---------|
| Passion words | passion, desire, intimate, beautiful, love, connect, relationship, feel |
| Sensory words | experience, taste, touch, feel, sense, indulge, rich, luxurious, gorgeous |
| Devotion signals | crafted with love, made with care, obsessed with detail, for those who care |
| CTA language | "Fall in love," "Experience it," "Indulge in," "Feel the difference," "Discover your" |

---

### 🎨 CREATOR
**Core Promise:** "Build something that matters. Express your vision."  
**Narrative Archetype:** The Quest (for the masterpiece)  
**CTA Patterns:** "Start building," "Create your," "Build something," "Bring your vision to life"

| Signal Type | Keywords |
|-------------|---------|
| Creation words | build, create, craft, design, make, innovate, express, invent, original |
| Vision words | vision, imagination, idea, concept, bring to life, from scratch, blank canvas |
| Craft signals | handcrafted, artisan, made by hand, custom, original, one-of-a-kind |
| CTA language | "Start creating," "Build your [X]," "Bring your vision to life," "Create something" |

---

### 👥 REGULAR GUY/GIRL
**Core Promise:** "This is for everyone. You belong here."  
**Narrative Archetype:** Rags to Riches (the everyday hero), Hero's Journey (the common person)  
**CTA Patterns:** "Join [X] people," "Get started for free," "For everyone," "No experience needed"

| Signal Type | Keywords |
|-------------|---------|
| Inclusion words | everyone, for all, simple, everyday, down-to-earth, real, honest, unpretentious |
| Belonging signals | belong, fit in, just like you, average, relatable, no jargon, you get it |
| Accessibility framing | free to start, no experience needed, anyone can, works for everyone |
| CTA language | "Join [X] people like you," "Get started free," "No setup required," "Anyone can use this" |

---

### Archetype Scoring Weight Table

| Text Location | Weight Multiplier |
|--------------|-------------------|
| H1 headline | 5× |
| CTA button / link | 4× |
| H2 headline | 3× |
| H3 headline | 2× |
| Hero section body copy | 2× |
| Testimonial quote | 2× |
| Body / feature copy | 1× |
| Footer | 0.5× |
| Image alt text | 1× |

**Primary Archetype:** Highest weighted score  
**Secondary Archetype:** Second highest (often complementary)  
**Archetype Tension:** When primary and secondary archetypes conflict (e.g., Ruler + Regular Guy), flag as potential brand inconsistency.

---

## 12. Existing vs. Proposed Content Comparison Mode

When two URLs are provided, run both through the full collection process and output a side-by-side gap analysis.

### How It Works

```
URL 1 (existing)  ──► Evidence Package A ──► Assessment Scores A
                                                        │
                                              GAP ANALYSIS REPORT
                                                        │
URL 2 (proposed)  ──► Evidence Package B ──► Assessment Scores B
```

### Gap Analysis Output Per Framework

For each element / theme / component, report:

| Field | Description |
|-------|-------------|
| **Element** | Framework element name |
| **Existing Score** | Score from URL 1 (0.0–1.0) |
| **Proposed Score** | Score from URL 2 (0.0–1.0) |
| **Delta** | Proposed minus Existing (+ = improvement, - = regression) |
| **Status** | Improved / Regressed / Unchanged / New Signal / Lost Signal |
| **Evidence Existing** | Quotes/signals from URL 1 |
| **Evidence Proposed** | Quotes/signals from URL 2 |
| **Recommendation** | What to do if delta is negative |

### Gap Analysis Summary Metrics

- **Total Elements Improved:** X of 30 / 40 / 34
- **Total Elements Regressed:** X
- **Biggest Improvement:** [Element] +0.XX
- **Biggest Regression:** [Element] -0.XX
- **Net Score Change:** Overall proposed score minus existing score
- **Archetype Shift:** Did the primary archetype change? Is this intentional?

### Common Scenarios

**Scenario A — Proposed adds value:**  
Existing site scores 0.45 on Affiliation/Belonging. Proposed content introduces community language and "join 10,000 members." New score: 0.78. Delta: +0.33. Status: Improved.

**Scenario B — Proposed loses signal:**  
Existing site scores 0.82 on Reduces Risk (money-back guarantee prominent on homepage). Proposed redesign moves guarantee to footer. New score: 0.40. Delta: -0.42. Status: Regressed. Recommendation: Reinstate guarantee language above the fold.

**Scenario C — Archetype shift:**  
Existing site is primarily Explorer (freedom, discovery language). Proposed copy shifts to Ruler (authority, #1, premium). Flag as intentional brand repositioning — requires confirmation from stakeholder.

---

## 13. Output Structure

All outputs are saved to the specified output directory. The following files are generated per run:

```
/output/
├── 01-evidence-package.json          # Raw structured evidence from scrape
├── 02-evidence-summary.md            # Human-readable evidence overview
├── 03-b2c-assessment-prompt.md       # Ready-to-use B2C prompt with evidence
├── 04-b2b-assessment-prompt.md       # Ready-to-use B2B prompt with evidence
├── 05-clifton-assessment-prompt.md   # Ready-to-use CliftonStrengths prompt
├── 06-golden-assessment-prompt.md    # Ready-to-use Golden Circle prompt
├── 07-archetype-assessment-prompt.md # Ready-to-use Archetype prompt
├── 08-archetype-scores.json          # Pre-computed archetype keyword scores
├── 09-full-report.md                 # Combined summary report (all frameworks)
└── 10-gap-analysis.md                # (Only if comparison URL provided)
```

---

## 14. Scoring Instructions for Each Framework

### Universal Scoring Rules

1. **Score based on language evidence only** — not assumptions about the company
2. **CTAs count heavily** — a prominent CTA is strong evidence (score +0.2 above body text alone)
3. **Testimonial confirmation** — if a customer confirms a claim, add 0.1–0.2 to that element's score
4. **Absence of evidence** — if no language signals exist for an element, score 0.1–0.2, not 0.0 (0.0 = actively contradicted)
5. **Prominence matters** — H1 evidence scores higher than footer evidence for the same element
6. **Consistency across pages** — signals present on 3+ pages score higher than signals on 1 page

### B2C Specific

- Score across all 30 elements even if Tier 4 (Social Impact) is effectively 0.1
- Emotional tier requires feeling language, not just feature claims
- Life-Changing tier requires aspirational language, not just benefits

### B2B Specific

- Table Stakes must be confirmed with specifics (e.g., "SOC 2 certified" vs. just "secure")
- Tier 3 (Ease of Business) benefits from testimonial evidence more than feature claims
- Tier 5 (Inspirational) is often low for B2B — this is normal; score honestly

### CliftonStrengths Brand Profile

- Score what the brand **demonstrates**, not what it aspires to
- Testimonials are the highest-quality evidence for this framework
- If customers say it, score it higher than if the brand says it about itself
- Domain scores reveal the brand's **primary operating mode** — which domain is highest tells you how the organization moves through the world

### Golden Circle

- WHY must be non-product — "We help people save time" is a WHAT masquerading as a WHY
- A genuine WHY answers: "Why does this matter to humanity beyond revenue?"
- HOW must be distinctive — if any competitor could say it, score it lower
- Score Alignment separately — a perfect WHY with misaligned WHAT still scores poorly on alignment

### Brand Archetypes

- Report primary and secondary archetypes
- Note any archetype tensions (conflicting signals)
- Connect archetype to narrative structure (which of the 7 story archetypes is this brand living?)
- Note whether CTA language matches headline archetype or conflicts

---

## 15. AI Prompt Templates

### Master System Instruction (All Frameworks)

```
You are an expert brand analyst conducting a comprehensive multi-framework assessment.
You will analyze brand language, CTAs, testimonials, and promises — NOT product features alone.
Your evidence comes from what the brand SAYS and IMPLIES, including behavioral signals in their messaging.
Use FLAT FRACTIONAL SCORING: every element counts equally, simple averages, no arbitrary weights.
Score based on evidence strength: prominence, frequency, customer confirmation, and consistency across pages.
Be accurate. Be thorough. Credible reports depend on honest, evidence-based scoring.
```

---

### B2C Elements Prompt Template

```
Analyze the following brand using B2C ELEMENTS OF VALUE — FLAT FRACTIONAL SCORING v2.0

**Brand/Product:** [NAME]
**URL Analyzed:** [URL]
**Analysis Mode:** [Existing Only / Proposed Comparison]

## EVIDENCE STREAMS COLLECTED BY PUPPETEER

### CTAs (Most Important Signal)
[PASTE CTA INVENTORY WITH CONTEXT]

### Headline Sequence (H1–H3 across all pages)
[PASTE HEADLINE SEQUENCE]

### Testimonial & Review Text
[PASTE TESTIMONIAL TEXT]

### Promise & Guarantee Language
[PASTE PROMISE LANGUAGE]

### Mission & Purpose Language
[PASTE PURPOSE LANGUAGE]

### Functional Claims
[PASTE FEATURE/BENEFIT CLAIMS]

### Visual Language Signals (image alt text)
[PASTE IMAGE ALT TEXT]

## ANALYSIS INSTRUCTIONS

Score EACH of the 30 elements (0.0–1.0) based on the language evidence above.
Scoring rules:
- 0.8–1.0 (Excellent): Multiple strong signals, prominent placement, customer confirmation
- 0.6–0.79 (Good): Present and clear, at least one strong signal
- 0.4–0.59 (Needs Work): Mentioned but weak or buried
- 0.0–0.39 (Poor): Absent, contradicted, or only mentioned in passing

IMPORTANT:
- Score language evidence, not assumed product capability
- CTAs are your strongest signal — weight them heavily
- Testimonial language confirming a claim adds 0.1–0.2 to that element's score
- Consistency across 3+ pages adds credibility to a score
- Tier scores = simple average of elements in tier
- Overall = sum of all 30 scores ÷ 30

[INCLUDE FULL OUTPUT FORMAT FROM B2C FRAMEWORK SPEC]
```

---

### Archetype Detection Prompt Template

```
Analyze the following brand to identify its PRIMARY and SECONDARY archetypes
using the 12 Brand Archetypes framework.

**Brand:** [NAME]
**URL:** [URL]

## WEIGHTED EVIDENCE STREAMS

### H1 Headlines (weight: 5×)
[PASTE H1 TEXT]

### CTAs (weight: 4×)
[PASTE ALL CTA TEXT WITH CONTEXT]

### H2 Headlines (weight: 3×)
[PASTE H2 TEXT]

### H3 Headlines (weight: 2×)
[PASTE H3 TEXT]

### Testimonials (weight: 2×)
[PASTE TESTIMONIAL TEXT]

### Body Copy & Feature Claims (weight: 1×)
[PASTE BODY COPY SAMPLES]

### Image Alt Text (weight: 1×)
[PASTE ALT TEXT]

### Pre-Computed Keyword Frequency Scores
[PASTE JSON ARCHETYPE SCORES]

## INSTRUCTIONS

1. Identify PRIMARY archetype (strongest overall signal)
2. Identify SECONDARY archetype (second strongest)
3. Identify the narrative archetype structure (Hero's Journey / Quest / Rags to Riches / Overcoming the Monster / Happily Ever After / Rebirth / Tragedy)
4. Note any archetype TENSIONS (conflicting signals between primary and secondary)
5. Assess consistency: does the archetype hold across CTAs, headlines, and testimonials?
6. Provide the brand's implied Core Promise (the psychological offer they're making)
7. Score each of the 12 archetypes 0.0–1.0 with evidence

## OUTPUT FORMAT

### PRIMARY ARCHETYPE: [Name]
- Score: X.XX
- Core Promise: [Their implied psychological offer]
- Evidence: [Top 5 signals]
- Narrative Structure: [Which story arc they're living]

### SECONDARY ARCHETYPE: [Name]
- Score: X.XX
- How it relates to primary: [Complementary or tension?]

### ARCHETYPE TENSIONS
[Any conflicting signals and what they mean]

### ALL 12 ARCHETYPE SCORES
| Archetype | Score | Primary Signals |
|-----------|-------|----------------|
[Full table]

### BRAND IMPLICATIONS
[What this archetype profile means for messaging, audience, and value delivery]
```

---

*This document serves as the complete specification for Puppeteer Brand Assessment Tool v1.0.*  
*All frameworks use Flat Fractional Scoring v2.0. All evidence is language-based and behavioral.*  
*Last updated: 2025*

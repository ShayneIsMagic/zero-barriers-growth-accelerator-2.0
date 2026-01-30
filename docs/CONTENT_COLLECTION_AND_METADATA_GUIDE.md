# Content Collection and Metadata Guide

## Overview

This guide explains how content is collected, stored, and exported in the Zero Barriers Growth Accelerator.

## 1. Content Collection Flow

### Step 1: Existing Content Collection (Always First)

When you enter a URL, the system:

1. **Checks Local Forage cache first** - If content was previously collected, it uses cached data
2. **Scrapes with Puppeteer** - If no cache, uses `PuppeteerComprehensiveCollector` to collect:
   - Page content (text, headings, links, images)
   - SEO metadata (titles, descriptions, tags)
   - Keywords (from meta tags, content, headings, alt text)
   - Analytics data (GA4, GTM, Facebook Pixel)
   - Performance metrics
   - Site structure

3. **Stores immediately** - Content is saved to:
   - **Local Forage** (client-side IndexedDB) for fast access
   - **Database** (server-side Prisma) if userId is provided

### Step 2: AI Analysis (Only If Proposed Content Exists)

**AI is ONLY called if you provide proposed content to compare against.**

- If **no proposed content**: Returns existing content immediately (no AI call)
- If **proposed content exists**: Calls Gemini AI for comparison analysis

## 2. Content Format

### Best Format: Structured JSON

Content is collected in **structured JSON format** for easy analysis:

```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-28T00:00:00.000Z",
  "pages": [
    {
      "url": "https://example.com",
      "title": "Page Title",
      "metaDescription": "Meta description text",
      "headings": {
        "h1": ["Main Heading"],
        "h2": ["Subheading 1", "Subheading 2"],
        "h3": ["Sub-subheading"]
      },
      "metaTags": {
        "title": "Page Title",
        "description": "Meta description",
        "keywords": "keyword1, keyword2",
        "ogTitle": "OG Title",
        "ogDescription": "OG Description",
        "canonical": "https://example.com",
        // ... all meta tags
      },
      "keywords": {
        "metaKeywords": ["keyword1", "keyword2"],
        "contentKeywords": ["content", "words"],
        "headingKeywords": ["heading", "words"],
        "altTextKeywords": ["alt", "text"],
        "allKeywords": ["all", "unique", "keywords"],
        "keywordFrequency": {
          "keyword": 5,
          "word": 3
        }
      },
      "analytics": {
        "googleAnalytics4": {
          "measurementIds": ["G-XXXXXXXXXX"]
        },
        "googleTagManager": {
          "containerIds": ["GTM-XXXXX"]
        },
        "facebookPixel": {
          "pixelId": "123456789"
        }
      },
      "content": {
        "text": "Clean text content from page",
        "wordCount": 500,
        "images": [...],
        "links": [...],
        "forms": [...],
        "buttons": [...]
      }
    }
  ],
  "seo": {...},
  "performance": {...},
  "content": {...},
  "technical": {...},
  "userExperience": {...}
}
```

### Why This Format?

1. **Structured** - Easy to parse and analyze
2. **Complete** - All metadata, keywords, analytics in one place
3. **Reusable** - Can be used for multiple analyses
4. **Exportable** - Easy to export as JSON, Markdown, or CSV

## 3. Saving Metadata

### What Gets Saved?

All collected metadata is automatically saved:

- **Titles**: Page title, OG title, Twitter title
- **Descriptions**: Meta description, OG description, Twitter description
- **Tags**: All meta tags (robots, canonical, language, etc.)
- **Keywords**: Meta keywords, content keywords, heading keywords, alt text keywords
- **Analytics**: GA4 IDs, GTM IDs, Facebook Pixel ID

### Where It's Saved?

1. **Local Forage** (IndexedDB) - Fast client-side storage
   - Store: `puppeteer_data`
   - Key: URL
   - Includes: Full comprehensive data + extracted metadata

2. **Database** (Prisma/Supabase) - Server-side persistence
   - Table: `ContentSnapshot`
   - Includes: Full comprehensive data as JSON

### How to Access Saved Metadata?

Metadata is included in the API response:

```json
{
  "success": true,
  "existing": {...},
  "metadata": {
    "titles": [...],
    "descriptions": [...],
    "tags": [...],
    "keywords": [...],
    "analytics": [...]
  },
  "comprehensive": {...}
}
```

## 4. Exporting Metadata

### Using ContentExporter Component

The `ContentExporter` component provides easy export options:

1. **Copy Metadata** - Copy to clipboard as JSON
2. **Download Metadata JSON** - Download as `.json` file
3. **Download Metadata Markdown** - Download as `.md` file
4. **Download Metadata CSV** - Download as `.csv` file

### Export Formats

#### JSON Format
```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-28T00:00:00.000Z",
  "titles": [...],
  "descriptions": [...],
  "tags": [...],
  "keywords": [...],
  "analytics": [...]
}
```

#### Markdown Format
```markdown
# Metadata Export

**URL:** https://example.com
**Timestamp:** 2026-01-28T00:00:00.000Z

## Titles
### Page 1: https://example.com
- **Title:** Page Title
- **OG Title:** OG Title
- **Twitter Title:** Twitter Title
...
```

#### CSV Format
```csv
Type,URL,Field,Value
Title,https://example.com,Title,"Page Title"
Description,https://example.com,Meta Description,"Meta description text"
Keywords,https://example.com,All Keywords,"keyword1, keyword2"
```

## 5. Reusing Collected Content

### For Other Analyses

Once content is collected, you can:

1. **Use for multiple analyses** - Same content can be analyzed with:
   - B2C Elements of Value
   - B2B Elements of Value
   - Golden Circle
   - CliftonStrengths
   - Content Comparison

2. **Export and reuse** - Download as JSON and upload to other analysis pages

3. **Access from cache** - Content is automatically cached and reused

### Best Practices

1. **Collect once, analyze many** - Scrape a URL once, use for all analyses
2. **Export metadata** - Save metadata separately for easy reference
3. **Use structured format** - JSON format is best for programmatic analysis
4. **Cache management** - Clear cache when content changes significantly

## 6. Content Collection Details

### What Puppeteer Collects

- **Text Content**: Clean text from all pages
- **Headings**: H1-H6 tags with hierarchy
- **Meta Tags**: All standard, Open Graph, Twitter Card tags
- **Keywords**: Extracted from multiple sources
- **Analytics**: GA4, GTM, Facebook Pixel detection
- **Links**: Internal and external links
- **Images**: With alt text and dimensions
- **Forms**: Form fields and structure
- **Performance**: Load times, metrics
- **SEO**: SEO scores and recommendations

### Multi-Page Collection

- **Max Pages**: Configurable (default: 10)
- **Max Depth**: Configurable (default: 2)
- **Site Map**: Automatically discovers pages
- **Deduplication**: Prevents duplicate page collection

## Summary

1. **Existing content is collected FIRST** - Always scrapes/stores before any AI call
2. **AI only called if proposed content exists** - Saves API costs and time
3. **Metadata is automatically extracted and saved** - Titles, descriptions, tags, keywords
4. **Content is in structured JSON format** - Best for analysis and reuse
5. **Easy export options** - JSON, Markdown, CSV formats available


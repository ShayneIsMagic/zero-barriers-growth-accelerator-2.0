#!/usr/bin/env node

/**
 * PageAudit.com Integration Script
 * Analyzes websites using PageAudit.com API
 * 
 * Usage: node scripts/pageaudit-analysis.js <url> [keyword]
 * Example: node scripts/pageaudit-analysis.js https://example.com "marketing automation"
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const PAGEAUDIT_BASE_URL = 'https://pageaudit.com';
const OUTPUT_DIR = './analysis-reports';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Simulate PageAudit.com analysis by scraping the site
 */
async function analyzeWithPageAudit(url, keyword = '') {
  console.log(`🔍 Analyzing ${url} with PageAudit.com approach...`);
  
  try {
    // Step 1: Get the main page content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000,
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);
    console.log(`Extracting domain from: ${url}`);
    const domain = extractDomain(url);
    console.log(`Extracted domain: ${domain}`);
    
    // Step 2: Analyze page structure and content
    const analysis = {
      url: url,
      domain: domain,
      keyword: keyword,
      timestamp: new Date().toISOString(),
      analysis: {
        // Basic page metrics
        pageSize: Buffer.byteLength(response.data, 'utf8'),
        loadTime: response.headers['x-response-time'] || 'unknown',
        statusCode: response.status,
        
        // SEO Analysis
        seo: {
          title: $('title').text().trim() || 'No title found',
          titleLength: $('title').text().trim().length,
          metaDescription: $('meta[name="description"]').attr('content') || 'No meta description',
          metaDescriptionLength: $('meta[name="description"]').attr('content')?.length || 0,
          h1Tags: $('h1').map((i, el) => $(el).text().trim()).get(),
          h2Tags: $('h2').map((i, el) => $(el).text().trim()).get(),
          h3Tags: $('h3').map((i, el) => $(el).text().trim()).get(),
          imageCount: $('img').length,
          imagesWithoutAlt: $('img:not([alt])').length,
          internalLinks: $('a[href^="/"], a[href^="' + domain + '"]').length,
          externalLinks: $('a[href^="http"]:not([href*="' + domain + '"])').length,
          keywordDensity: keyword ? calculateKeywordDensity($('body').text(), keyword) : 0,
        },
        
        // Technical Analysis
        technical: {
          hasSitemap: $('link[rel="sitemap"]').length > 0,
          hasRobots: false, // Would need separate request to robots.txt
          hasFavicon: $('link[rel="icon"], link[rel="shortcut icon"]').length > 0,
          hasCanonical: $('link[rel="canonical"]').length > 0,
          hasOpenGraph: $('meta[property^="og:"]').length > 0,
          hasTwitterCards: $('meta[name^="twitter:"]').length > 0,
          hasSchema: $('script[type="application/ld+json"]').length > 0,
          hasGoogleAnalytics: $('script').text().includes('google-analytics') || $('script').text().includes('gtag'),
          hasGoogleTagManager: $('script').text().includes('googletagmanager'),
          hasFacebookPixel: $('script').text().includes('facebook.net') || $('script').text().includes('fbevents'),
          https: url.startsWith('https://'),
          responsiveDesign: $('meta[name="viewport"]').length > 0,
        },
        
        // Content Analysis
        content: {
          totalWords: $('body').text().split(/\s+/).length,
          totalCharacters: $('body').text().length,
          paragraphs: $('p').length,
          lists: $('ul, ol').length,
          tables: $('table').length,
          forms: $('form').length,
          videos: $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length,
          hasContactInfo: hasContactInformation($),
          hasSocialMedia: hasSocialMediaLinks($),
          readabilityScore: calculateReadabilityScore($('body').text()),
        },
        
        // Performance Indicators
        performance: {
          cssFiles: $('link[rel="stylesheet"]').length,
          jsFiles: $('script[src]').length,
          inlineStyles: $('style').length,
          inlineScripts: $('script:not([src])').length,
          largeImages: $('img').filter((i, el) => {
            const src = $(el).attr('src');
            return src && (src.includes('width=') || src.includes('height=') || src.includes('large') || src.includes('big'));
          }).length,
          lazyLoading: $('img[loading="lazy"]').length,
        },
        
        // Accessibility Analysis
        accessibility: {
          hasLangAttribute: $('html[lang]').length > 0,
          hasSkipLinks: $('a[href="#main"], a[href="#content"], a[href="#skip"]').length > 0,
          hasAltTexts: $('img[alt]').length,
          hasFormLabels: $('label[for]').length,
          hasHeadings: $('h1, h2, h3, h4, h5, h6').length > 0,
          colorContrastIssues: 0, // Would need more sophisticated analysis
          ariaLabels: $('[aria-label]').length,
          ariaDescribedBy: $('[aria-describedby]').length,
        }
      },
      
      // Scoring
      scores: {
        seo: calculateSEOScore($, keyword),
        technical: calculateTechnicalScore($, url),
        content: calculateContentScore($),
        accessibility: calculateAccessibilityScore($),
        overall: 0 // Will be calculated
      }
    };
    
    // Calculate overall score
    analysis.scores.overall = Math.round(
      (analysis.scores.seo + analysis.scores.technical + 
       analysis.scores.content + analysis.scores.accessibility) / 4
    );
    
    // Generate recommendations
    analysis.recommendations = generateRecommendations(analysis);
    
    console.log(`✅ Analysis completed for ${domain}`);
    console.log(`📊 Overall Score: ${analysis.scores.overall}/100`);
    
    return analysis;
    
  } catch (error) {
    console.error(`❌ Error analyzing ${url}:`, error.message);
    console.error('Full error:', error);
    throw error;
  }
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(text, keyword) {
  const words = text.toLowerCase().split(/\s+/);
  const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;
  return Math.round((keywordCount / words.length) * 100 * 100) / 100; // Percentage with 2 decimal places
}

/**
 * Check for contact information
 */
function hasContactInformation($) {
  const contactPatterns = [
    /phone/i, /email/i, /contact/i, /address/i, 
    /tel:/i, /mailto:/i, /\d{3}[-.]?\d{3}[-.]?\d{4}/
  ];
  
  const bodyText = $('body').text().toLowerCase();
  return contactPatterns.some(pattern => pattern.test(bodyText));
}

/**
 * Check for social media links
 */
function hasSocialMediaLinks($) {
  const socialPatterns = [
    /facebook\.com/i, /twitter\.com/i, /linkedin\.com/i, 
    /instagram\.com/i, /youtube\.com/i, /tiktok\.com/i
  ];
  
  const links = $('a[href]').map((i, el) => $(el).attr('href')).get().join(' ');
  return socialPatterns.some(pattern => pattern.test(links));
}

/**
 * Calculate readability score (simplified)
 */
function calculateReadabilityScore(text) {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const syllables = text.split(/\s+/).reduce((count, word) => {
    return count + (word.match(/[aeiouy]/gi) || []).length;
  }, 0);
  
  if (sentences === 0 || words === 0) return 0;
  
  // Simplified Flesch Reading Ease
  const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate SEO score
 */
function calculateSEOScore($, keyword) {
  let score = 0;
  
  // Title (20 points)
  const title = $('title').text().trim();
  if (title && title.length > 0) score += 10;
  if (title && title.length >= 30 && title.length <= 60) score += 10;
  
  // Meta description (15 points)
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc && metaDesc.length > 0) score += 5;
  if (metaDesc && metaDesc.length >= 120 && metaDesc.length <= 160) score += 10;
  
  // H1 tags (15 points)
  const h1Count = $('h1').length;
  if (h1Count === 1) score += 15;
  else if (h1Count > 1) score += 5;
  
  // Images with alt text (10 points)
  const totalImages = $('img').length;
  const imagesWithAlt = $('img[alt]').length;
  if (totalImages > 0) {
    score += Math.round((imagesWithAlt / totalImages) * 10);
  }
  
  // Internal linking (10 points)
  const baseHref = $('base').attr('href');
  const baseDomain = baseHref ? extractDomain(baseHref) : '';
  const internalLinks = $('a[href^="/"], a[href^="' + baseDomain + '"]').length;
  if (internalLinks > 0) score += Math.min(10, Math.round(internalLinks / 5));
  
  // Keyword optimization (15 points)
  if (keyword) {
    const bodyText = $('body').text().toLowerCase();
    const keywordCount = (bodyText.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    if (keywordCount > 0) score += Math.min(15, keywordCount * 3);
  }
  
  // Structured data (15 points)
  if ($('script[type="application/ld+json"]').length > 0) score += 15;
  
  return Math.min(100, score);
}

/**
 * Calculate technical score
 */
function calculateTechnicalScore($, url) {
  let score = 0;
  
  // HTTPS (20 points)
  if (url.startsWith('https://')) score += 20;
  
  // Mobile responsive (20 points)
  if ($('meta[name="viewport"]').length > 0) score += 20;
  
  // Fast loading indicators (20 points)
  const cssFiles = $('link[rel="stylesheet"]').length;
  const jsFiles = $('script[src]').length;
  if (cssFiles < 10) score += 10;
  if (jsFiles < 10) score += 10;
  
  // SEO basics (20 points)
  if ($('link[rel="canonical"]').length > 0) score += 10;
  if ($('link[rel="icon"]').length > 0) score += 5;
  if ($('meta[name="robots"]').length > 0) score += 5;
  
  // Schema markup (10 points)
  if ($('script[type="application/ld+json"]').length > 0) score += 10;
  
  // Social media tags (10 points)
  if ($('meta[property^="og:"]').length > 0) score += 5;
  if ($('meta[name^="twitter:"]').length > 0) score += 5;
  
  return Math.min(100, score);
}

/**
 * Calculate content score
 */
function calculateContentScore($) {
  let score = 0;
  
  const bodyText = $('body').text();
  const wordCount = bodyText.split(/\s+/).length;
  
  // Content length (30 points)
  if (wordCount >= 300) score += 30;
  else if (wordCount >= 150) score += 20;
  else if (wordCount >= 100) score += 10;
  
  // Content structure (25 points)
  if ($('h1').length > 0) score += 5;
  if ($('h2').length > 0) score += 5;
  if ($('p').length > 0) score += 5;
  if ($('ul, ol').length > 0) score += 5;
  if ($('img').length > 0) score += 5;
  
  // Contact information (20 points)
  if (hasContactInformation($)) score += 20;
  
  // Social media presence (15 points)
  if (hasSocialMediaLinks($)) score += 15;
  
  // Readability (10 points)
  const readability = calculateReadabilityScore(bodyText);
  if (readability >= 60) score += 10;
  else if (readability >= 30) score += 5;
  
  return Math.min(100, score);
}

/**
 * Calculate accessibility score
 */
function calculateAccessibilityScore($) {
  let score = 0;
  
  // Language attribute (15 points)
  if ($('html[lang]').length > 0) score += 15;
  
  // Image alt texts (25 points)
  const totalImages = $('img').length;
  const imagesWithAlt = $('img[alt]').length;
  if (totalImages > 0) {
    score += Math.round((imagesWithAlt / totalImages) * 25);
  }
  
  // Form labels (20 points)
  const totalInputs = $('input, select, textarea').length;
  const inputsWithLabels = $('label[for]').length;
  if (totalInputs > 0) {
    score += Math.round((inputsWithLabels / totalInputs) * 20);
  }
  
  // Heading structure (20 points)
  if ($('h1').length > 0) score += 10;
  if ($('h1, h2, h3, h4, h5, h6').length > 0) score += 10;
  
  // ARIA attributes (10 points)
  if ($('[aria-label]').length > 0) score += 5;
  if ($('[aria-describedby]').length > 0) score += 5;
  
  // Skip links (10 points)
  if ($('a[href="#main"], a[href="#content"], a[href="#skip"]').length > 0) score += 10;
  
  return Math.min(100, score);
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  const scores = analysis.scores;
  
  // SEO recommendations
  if (scores.seo < 70) {
    if (!analysis.analysis.seo.title) recommendations.push('Add a page title');
    if (!analysis.analysis.seo.metaDescription) recommendations.push('Add a meta description');
    if (analysis.analysis.seo.h1Tags.length === 0) recommendations.push('Add H1 heading');
    if (analysis.analysis.seo.imagesWithoutAlt > 0) recommendations.push(`Add alt text to ${analysis.analysis.seo.imagesWithoutAlt} images`);
  }
  
  // Technical recommendations
  if (scores.technical < 70) {
    if (!analysis.analysis.technical.https) recommendations.push('Implement HTTPS');
    if (!analysis.analysis.technical.responsiveDesign) recommendations.push('Add responsive design viewport meta tag');
    if (!analysis.analysis.technical.hasCanonical) recommendations.push('Add canonical URL');
  }
  
  // Content recommendations
  if (scores.content < 70) {
    if (analysis.analysis.content.totalWords < 300) recommendations.push('Increase content length to at least 300 words');
    if (!analysis.analysis.content.hasContactInfo) recommendations.push('Add contact information');
    if (!analysis.analysis.content.hasSocialMedia) recommendations.push('Add social media links');
  }
  
  // Accessibility recommendations
  if (scores.accessibility < 70) {
    if (!analysis.analysis.accessibility.hasLangAttribute) recommendations.push('Add language attribute to HTML tag');
    if (analysis.analysis.accessibility.hasAltTexts < analysis.analysis.seo.imageCount) recommendations.push('Add alt text to all images');
  }
  
  return recommendations;
}

/**
 * Save analysis results to file
 */
async function saveAnalysisResults(analysis) {
  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    const filename = `pageaudit-${analysis.domain}-${Date.now()}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(analysis, null, 2));
    console.log(`📁 Analysis saved to: ${filepath}`);
    
    return filepath;
  } catch (error) {
    console.error('❌ Error saving analysis:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
🔍 PageAudit.com Analysis Script

Usage: node scripts/pageaudit-analysis.js <url> [keyword]

Examples:
  node scripts/pageaudit-analysis.js https://example.com
  node scripts/pageaudit-analysis.js https://example.com "marketing automation"
  node scripts/pageaudit-analysis.js https://pageaudit.com "SEO analysis"

Options:
  url     - The website URL to analyze
  keyword - Optional keyword for SEO analysis
    `);
    process.exit(1);
  }
  
  const url = args[0];
  const keyword = args[1] || '';
  
  try {
    console.log(`🚀 Starting PageAudit.com analysis...`);
    console.log(`📊 URL: ${url}`);
    if (keyword) console.log(`🔑 Keyword: ${keyword}`);
    console.log('');
    
    // Perform analysis
    const analysis = await analyzeWithPageAudit(url, keyword);
    
    // Save results
    const filepath = await saveAnalysisResults(analysis);
    
    // Display summary
    console.log('');
    console.log('📋 ANALYSIS SUMMARY');
    console.log('==================');
    console.log(`🌐 URL: ${analysis.url}`);
    console.log(`🏢 Domain: ${analysis.domain}`);
    console.log(`📅 Date: ${new Date(analysis.timestamp).toLocaleString()}`);
    console.log('');
    console.log('📊 SCORES:');
    console.log(`   SEO: ${analysis.scores.seo}/100`);
    console.log(`   Technical: ${analysis.scores.technical}/100`);
    console.log(`   Content: ${analysis.scores.content}/100`);
    console.log(`   Accessibility: ${analysis.scores.accessibility}/100`);
    console.log(`   Overall: ${analysis.scores.overall}/100`);
    console.log('');
    
    if (analysis.recommendations.length > 0) {
      console.log('💡 TOP RECOMMENDATIONS:');
      analysis.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
    
    console.log('');
    console.log(JSON.stringify(analysis, null, 2));
    console.log(`✅ Analysis complete! Results saved to: ${filepath}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  analyzeWithPageAudit,
  calculateSEOScore,
  calculateTechnicalScore,
  calculateContentScore,
  calculateAccessibilityScore
};

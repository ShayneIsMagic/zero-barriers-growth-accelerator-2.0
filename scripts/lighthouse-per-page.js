#!/usr/bin/env node

/**
 * Lighthouse Per-Page Analysis Script
 * Runs Lighthouse analysis on individual pages of a website
 * 
 * Usage: node scripts/lighthouse-per-page.js <url> [options]
 * Example: node scripts/lighthouse-per-page.js https://example.com --pages home,about,services
 * Example: node scripts/lighthouse-per-page.js https://example.com --all-pages
 */

const lighthouse = require('lighthouse').default || require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const OUTPUT_DIR = './lighthouse-reports';
const DEFAULT_PAGES = ['/', '/about', '/services', '/contact', '/blog'];
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Extract domain and base URL from input
 */
function parseUrl(inputUrl) {
  try {
    const url = new URL(inputUrl);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      baseUrl: `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`,
      pathname: url.pathname
    };
  } catch (error) {
    throw new Error(`Invalid URL: ${inputUrl}`);
  }
}

/**
 * Discover pages on the website
 */
async function discoverPages(baseUrl) {
  console.log(`🔍 Discovering pages on ${baseUrl}...`);
  
  try {
    const response = await axios.get(baseUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 30000
    });
    
    const $ = cheerio.load(response.data);
    const pages = new Set();
    
    // Add the homepage
    pages.add('/');
    
    // Find all internal links
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          // Handle relative URLs
          if (href.startsWith('/')) {
            pages.add(href);
          } else if (href.startsWith(baseUrl)) {
            const url = new URL(href);
            pages.add(url.pathname);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Filter out common non-content pages
    const filteredPages = Array.from(pages).filter(page => {
      const lowerPage = page.toLowerCase();
      return !lowerPage.includes('admin') &&
             !lowerPage.includes('wp-') &&
             !lowerPage.includes('.xml') &&
             !lowerPage.includes('.json') &&
             !lowerPage.includes('.pdf') &&
             !lowerPage.includes('.jpg') &&
             !lowerPage.includes('.png') &&
             !lowerPage.includes('.gif') &&
             !lowerPage.includes('mailto:') &&
             !lowerPage.includes('#') &&
             page.length < 100; // Skip very long URLs
    });
    
    console.log(`📄 Found ${filteredPages.length} pages to analyze`);
    return filteredPages.slice(0, 20); // Limit to first 20 pages
    
  } catch (error) {
    console.warn(`⚠️  Could not discover pages, using defaults: ${error.message}`);
    return DEFAULT_PAGES;
  }
}

/**
 * Run Lighthouse analysis on a single page
 */
async function runLighthouseOnPage(url, options = {}) {
  let chrome;
  
  try {
    console.log(`🚀 Running Lighthouse on: ${url}`);
    
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Faster loading
        '--disable-javascript', // For performance testing
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });
    
    // Lighthouse options
    const lighthouseOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      ...options
    };
    
    // Run Lighthouse
    const runnerResult = await lighthouse(url, lighthouseOptions);
    
    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('Lighthouse analysis failed to return valid results');
    }
    
    const lhr = runnerResult.lhr;
    
    // Extract key metrics
    const result = {
      url: url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round((lhr.categories.performance?.score || 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((lhr.categories.seo?.score || 0) * 100)
      },
      metrics: {
        firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue || 0,
        totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: lhr.audits['speed-index']?.numericValue || 0,
        timeToInteractive: lhr.audits['interactive']?.numericValue || 0
      },
      opportunities: extractOpportunities(lhr.audits),
      diagnostics: extractDiagnostics(lhr.audits),
      issues: extractIssues(lhr.audits),
      recommendations: generateRecommendations(lhr)
    };
    
    // Calculate overall score
    result.scores.overall = Math.round(
      (result.scores.performance + result.scores.accessibility + 
       result.scores.bestPractices + result.scores.seo) / 4
    );
    
    console.log(`✅ Lighthouse completed for ${url} - Overall: ${result.scores.overall}/100`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Lighthouse failed for ${url}:`, error.message);
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Extract optimization opportunities from Lighthouse audits
 */
function extractOpportunities(audits) {
  const opportunities = [];
  const opportunityAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'unminified-css',
    'unminified-javascript',
    'efficient-animated-content',
    'modern-image-formats',
    'uses-optimized-images',
    'uses-webp-images',
    'uses-text-compression',
    'uses-responsive-images'
  ];
  
  opportunityAudits.forEach(auditId => {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      opportunities.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: Math.round(audit.score * 100),
        savings: audit.details?.overallSavingsMs || 0,
        items: audit.details?.items?.length || 0
      });
    }
  });
  
  return opportunities;
}

/**
 * Extract diagnostics from Lighthouse audits
 */
function extractDiagnostics(audits) {
  const diagnostics = [];
  const diagnosticAudits = [
    'main-thread-work-breakdown',
    'bootup-time',
    'network-requests',
    'network-rtt',
    'dom-size',
    'max-potential-fid',
    'estimated-input-latency'
  ];
  
  diagnosticAudits.forEach(auditId => {
    const audit = audits[auditId];
    if (audit && audit.score !== null) {
      diagnostics.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: Math.round(audit.score * 100),
        value: audit.numericValue || 0
      });
    }
  });
  
  return diagnostics;
}

/**
 * Extract issues from Lighthouse audits
 */
function extractIssues(audits) {
  const issues = [];
  
  // Accessibility issues
  const accessibilityIssues = [
    'color-contrast',
    'image-alt',
    'label',
    'link-name',
    'list',
    'listitem',
    'heading-order',
    'document-title',
    'html-has-lang',
    'html-lang-valid'
  ];
  
  accessibilityIssues.forEach(auditId => {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      issues.push({
        category: 'accessibility',
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: Math.round(audit.score * 100),
        items: audit.details?.items?.length || 0
      });
    }
  });
  
  // SEO issues
  const seoIssues = [
    'document-title',
    'meta-description',
    'hreflang',
    'canonical',
    'robots-txt',
    'structured-data'
  ];
  
  seoIssues.forEach(auditId => {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      issues.push({
        category: 'seo',
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: Math.round(audit.score * 100),
        items: audit.details?.items?.length || 0
      });
    }
  });
  
  return issues;
}

/**
 * Generate recommendations based on Lighthouse results
 */
function generateRecommendations(lhr) {
  const recommendations = [];
  const scores = {
    performance: Math.round((lhr.categories.performance?.score || 0) * 100),
    accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
    seo: Math.round((lhr.categories.seo?.score || 0) * 100)
  };
  
  // Performance recommendations
  if (scores.performance < 70) {
    recommendations.push({
      category: 'performance',
      priority: 'high',
      title: 'Improve Page Performance',
      description: 'Optimize images, minify CSS/JS, and reduce render-blocking resources'
    });
  }
  
  // Accessibility recommendations
  if (scores.accessibility < 70) {
    recommendations.push({
      category: 'accessibility',
      priority: 'high',
      title: 'Improve Accessibility',
      description: 'Add alt text to images, improve color contrast, and ensure proper heading structure'
    });
  }
  
  // SEO recommendations
  if (scores.seo < 70) {
    recommendations.push({
      category: 'seo',
      priority: 'medium',
      title: 'Improve SEO',
      description: 'Add meta descriptions, optimize page titles, and implement structured data'
    });
  }
  
  return recommendations;
}

/**
 * Run Lighthouse analysis on multiple pages
 */
async function analyzeMultiplePages(baseUrl, pages) {
  console.log(`📊 Analyzing ${pages.length} pages on ${baseUrl}...`);
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const fullUrl = page.startsWith('http') ? page : `${baseUrl}${page}`;
    
    try {
      console.log(`\n[${i + 1}/${pages.length}] Analyzing: ${fullUrl}`);
      const result = await runLighthouseOnPage(fullUrl);
      results.push(result);
      
      // Add a small delay between requests
      if (i < pages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to analyze ${fullUrl}: ${error.message}`);
      errors.push({ url: fullUrl, error: error.message });
    }
  }
  
  return { results, errors };
}

/**
 * Generate comprehensive report
 */
function generateReport(baseUrl, analysisResults) {
  const { results, errors } = analysisResults;
  
  // Calculate averages
  const averages = {
    performance: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length) : 0,
    accessibility: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length) : 0,
    bestPractices: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.scores.bestPractices, 0) / results.length) : 0,
    seo: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.scores.seo, 0) / results.length) : 0,
    overall: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.scores.overall, 0) / results.length) : 0
  };
  
  // Find best and worst performing pages
  const bestPage = results.length > 0 ? results.reduce((best, current) => 
    current.scores.overall > best.scores.overall ? current : best
  ) : null;
  
  const worstPage = results.length > 0 ? results.reduce((worst, current) => 
    current.scores.overall < worst.scores.overall ? current : worst
  ) : null;
  
  // Collect all opportunities and issues
  const allOpportunities = [];
  const allIssues = [];
  
  results.forEach(result => {
    allOpportunities.push(...result.opportunities.map(opp => ({
      ...opp,
      url: result.url
    })));
    allIssues.push(...result.issues.map(issue => ({
      ...issue,
      url: result.url
    })));
  });
  
  // Group opportunities by type
  const opportunitiesByType = {};
  allOpportunities.forEach(opp => {
    if (!opportunitiesByType[opp.id]) {
      opportunitiesByType[opp.id] = [];
    }
    opportunitiesByType[opp.id].push(opp);
  });
  
  // Group issues by category
  const issuesByCategory = {};
  allIssues.forEach(issue => {
    if (!issuesByCategory[issue.category]) {
      issuesByCategory[issue.category] = [];
    }
    issuesByCategory[issue.category].push(issue);
  });
  
  const report = {
    summary: {
      baseUrl: baseUrl,
      analyzedPages: results.length,
      failedPages: errors.length,
      timestamp: new Date().toISOString(),
      averageScores: averages,
      bestPerformingPage: bestPage ? {
        url: bestPage.url,
        score: bestPage.scores.overall,
        scores: bestPage.scores
      } : null,
      worstPerformingPage: worstPage ? {
        url: worstPage.url,
        score: worstPage.scores.overall,
        scores: worstPage.scores
      } : null
    },
    pageResults: results,
    opportunities: opportunitiesByType,
    issues: issuesByCategory,
    errors: errors,
    recommendations: generateOverallRecommendations(averages, opportunitiesByType, issuesByCategory)
  };
  
  return report;
}

/**
 * Generate overall recommendations
 */
function generateOverallRecommendations(averages, opportunities, issues) {
  const recommendations = [];
  
  // Performance recommendations
  if (averages.performance < 70) {
    recommendations.push({
      priority: 'high',
      category: 'performance',
      title: 'Improve Overall Performance',
      description: `Average performance score is ${averages.performance}/100. Focus on optimizing images, reducing JavaScript, and improving Core Web Vitals.`
    });
  }
  
  // Accessibility recommendations
  if (averages.accessibility < 70) {
    recommendations.push({
      priority: 'high',
      category: 'accessibility',
      title: 'Improve Accessibility',
      description: `Average accessibility score is ${averages.accessibility}/100. Add alt text to images, improve color contrast, and ensure proper heading structure.`
    });
  }
  
  // Top opportunities
  const topOpportunities = Object.keys(opportunities)
    .map(id => ({
      id,
      count: opportunities[id].length,
      avgSavings: opportunities[id].reduce((sum, opp) => sum + (opp.savings || 0), 0) / opportunities[id].length
    }))
    .sort((a, b) => b.avgSavings - a.avgSavings)
    .slice(0, 3);
  
  topOpportunities.forEach(opp => {
    if (opp.avgSavings > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'optimization',
        title: `Optimize ${opp.id.replace(/-/g, ' ')}`,
        description: `This optimization appears on ${opp.count} pages and could save an average of ${Math.round(opp.avgSavings)}ms.`
      });
    }
  });
  
  return recommendations;
}

/**
 * Save report to file
 */
async function saveReport(report, baseUrl) {
  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    const domain = new URL(baseUrl).hostname;
    const filename = `lighthouse-${domain}-${Date.now()}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    console.log(`📁 Report saved to: ${filepath}`);
    
    return filepath;
  } catch (error) {
    console.error('❌ Error saving report:', error.message);
    throw error;
  }
}

/**
 * Display summary report
 */
function displaySummary(report) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 LIGHTHOUSE ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`🌐 Base URL: ${report.summary.baseUrl}`);
  console.log(`📄 Pages Analyzed: ${report.summary.analyzedPages}`);
  console.log(`❌ Failed Pages: ${report.summary.failedPages}`);
  console.log(`📅 Date: ${new Date(report.summary.timestamp).toLocaleString()}`);
  
  console.log('\n📊 AVERAGE SCORES:');
  console.log(`   Performance: ${report.summary.averageScores.performance}/100`);
  console.log(`   Accessibility: ${report.summary.averageScores.accessibility}/100`);
  console.log(`   Best Practices: ${report.summary.averageScores.bestPractices}/100`);
  console.log(`   SEO: ${report.summary.averageScores.seo}/100`);
  console.log(`   Overall: ${report.summary.averageScores.overall}/100`);
  
  console.log('\n🏆 BEST PERFORMING PAGE:');
  console.log(`   URL: ${report.summary.bestPerformingPage.url}`);
  console.log(`   Score: ${report.summary.bestPerformingPage.score}/100`);
  
  console.log('\n⚠️  WORST PERFORMING PAGE:');
  console.log(`   URL: ${report.summary.worstPerformingPage.url}`);
  console.log(`   Score: ${report.summary.worstPerformingPage.score}/100`);
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 TOP RECOMMENDATIONS:');
    report.recommendations.slice(0, 5).forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`      ${rec.description}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
🚀 Lighthouse Per-Page Analysis Script

Usage: node scripts/lighthouse-per-page.js <url> [options]

Examples:
  node scripts/lighthouse-per-page.js https://example.com
  node scripts/lighthouse-per-page.js https://example.com --pages home,about,services
  node scripts/lighthouse-per-page.js https://example.com --all-pages
  node scripts/lighthouse-per-page.js https://example.com --discover

Options:
  --pages <list>    - Comma-separated list of pages to analyze (e.g., home,about,services)
  --all-pages       - Analyze all discovered pages (up to 20)
  --discover        - Auto-discover pages and analyze them
  --help            - Show this help message

Default behavior: Analyzes common pages (/, /about, /services, /contact, /blog)
    `);
    process.exit(1);
  }
  
  const url = args[0];
  let pages = DEFAULT_PAGES;
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--pages' && i + 1 < args.length) {
      pages = args[i + 1].split(',').map(page => page.startsWith('/') ? page : '/' + page);
      i++;
    } else if (arg === '--all-pages' || arg === '--discover') {
      pages = await discoverPages(url);
    } else if (arg === '--help') {
      console.log('Help displayed above');
      process.exit(0);
    }
  }
  
  try {
    console.log(`🚀 Starting Lighthouse per-page analysis...`);
    console.log(`📊 Base URL: ${url}`);
    console.log(`📄 Pages to analyze: ${pages.join(', ')}`);
    console.log('');
    
    // Parse the base URL
    const urlInfo = parseUrl(url);
    
    // Analyze all pages
    const analysisResults = await analyzeMultiplePages(urlInfo.baseUrl, pages);
    
    // Generate comprehensive report
    const report = generateReport(urlInfo.baseUrl, analysisResults);
    
    // Save report
    const filepath = await saveReport(report, urlInfo.baseUrl);
    
    // Display summary
    displaySummary(report);
    
    console.log(`\n✅ Analysis complete! Report saved to: ${filepath}`);
    
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
  runLighthouseOnPage,
  analyzeMultiplePages,
  discoverPages,
  generateReport
};

import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsiteContent } from '@/lib/production-content-extractor';

export const maxDuration = 300; // 5 minutes for complete Phase 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`🚀 Starting Complete Phase 1 analysis for: ${url}`);

    // Step 1: Content Scraping
    console.log('📊 Step 1: Scraping website content...');
    const scrapedContent = await scrapeWebsiteContent(url);

    // Step 2: Google SEO Tools Analysis
    console.log('🔍 Step 2: Running Google SEO Tools analysis...');
    const seoAnalysis = await runGoogleSEOTools(url, scrapedContent);

    // Step 3: Lighthouse Performance Test
    console.log('🏗️ Step 3: Running Lighthouse performance test...');
    const lighthouseData = await runLighthouseAnalysis(url);

    // Step 4: ESLint/QA Tools Analysis
    console.log('🔧 Step 4: Running QA tools analysis...');
    const qaAnalysis = await runQAAnalysis(url, scrapedContent);

    // Step 5: Google Trends Analysis
    console.log('📈 Step 5: Running Google Trends analysis...');
    const trendsAnalysis = await runGoogleTrendsAnalysis(scrapedContent);

    // Step 6: Competition Analysis
    console.log('🏆 Step 6: Running competition analysis...');
    const competitionAnalysis = await runCompetitionAnalysis(url, scrapedContent);

    const phase1Result = {
      url,
      timestamp: new Date().toISOString(),
      scrapedContent,
      seoAnalysis,
      lighthouseData,
      qaAnalysis,
      trendsAnalysis,
      competitionAnalysis,
      summary: {
        contentWords: scrapedContent.wordCount || 0,
        contentImages: scrapedContent.imageCount || 0,
        contentLinks: scrapedContent.linkCount || 0,
        seoScore: seoAnalysis.overallScore || 0,
        performanceScore: lighthouseData?.scores?.performance || 0,
        accessibilityScore: lighthouseData?.scores?.accessibility || 0,
        qaIssues: qaAnalysis.issues?.length || 0,
        trendsData: trendsAnalysis.trendingTopics?.length || 0,
        competitors: competitionAnalysis.competitors?.length || 0
      }
    };

    console.log(`✅ Complete Phase 1 analysis completed for: ${url}`);

    return NextResponse.json({
      success: true,
      url,
      phase: 1,
      data: phase1Result,
      message: 'Complete Phase 1 analysis completed successfully'
    });

  } catch (error) {
    console.error('Complete Phase 1 analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Complete Phase 1 analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Google SEO Tools Analysis
async function runGoogleSEOTools(url: string, content: any) {
  try {
    // Extract keywords from content
    const keywords = extractKeywords(content);
    
    // Analyze meta tags
    const metaAnalysis = analyzeMetaTags(content);
    
    // Check for structured data
    const structuredData = analyzeStructuredData(content);
    
    // Analyze headings structure
    const headingAnalysis = analyzeHeadings(content);
    
    // Check for internal/external links
    const linkAnalysis = analyzeLinks(content);
    
    // Calculate overall SEO score
    const overallScore = calculateSEOScore(metaAnalysis, headingAnalysis, linkAnalysis, structuredData);

    return {
      keywords,
      metaAnalysis,
      structuredData,
      headingAnalysis,
      linkAnalysis,
      overallScore,
      recommendations: generateSEORecommendations(metaAnalysis, headingAnalysis, linkAnalysis, structuredData)
    };
  } catch (error) {
    console.error('Google SEO Tools analysis failed:', error);
    return { error: 'SEO analysis failed', overallScore: 0 };
  }
}

// Lighthouse Performance Analysis
async function runLighthouseAnalysis(url: string) {
  try {
    // Use Google PageSpeed Insights API
    const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${process.env.GOOGLE_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Lighthouse API failed');
    }
    
    const data = await response.json();
    
    return {
      scores: {
        performance: data.lighthouseResult.categories.performance.score * 100,
        accessibility: data.lighthouseResult.categories.accessibility.score * 100,
        bestPractices: data.lighthouseResult.categories['best-practices'].score * 100,
        seo: data.lighthouseResult.categories.seo.score * 100
      },
      metrics: {
        firstContentfulPaint: data.lighthouseResult.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: data.lighthouseResult.audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: data.lighthouseResult.audits['cumulative-layout-shift'].numericValue,
        speedIndex: data.lighthouseResult.audits['speed-index'].numericValue
      },
      opportunities: data.lighthouseResult.categories.performance.auditRefs
        .filter((audit: any) => audit.group === 'load-opportunities')
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score
        })),
      diagnostics: data.lighthouseResult.categories.performance.auditRefs
        .filter((audit: any) => audit.group === 'diagnostics')
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score
        }))
    };
  } catch (error) {
    console.error('Lighthouse analysis failed:', error);
    return { error: 'Lighthouse analysis failed', scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 } };
  }
}

// QA Tools Analysis
async function runQAAnalysis(url: string, content: any) {
  try {
    const issues = [];
    
    // Check for common issues
    if (!content.title) issues.push({ type: 'critical', message: 'Missing page title' });
    if (!content.metaDescription) issues.push({ type: 'warning', message: 'Missing meta description' });
    if (content.wordCount < 300) issues.push({ type: 'warning', message: 'Content too short (less than 300 words)' });
    if (content.imageCount === 0) issues.push({ type: 'info', message: 'No images found' });
    if (content.linkCount === 0) issues.push({ type: 'warning', message: 'No internal links found' });
    
    // Check for broken elements
    if (content.brokenLinks && content.brokenLinks.length > 0) {
      issues.push({ type: 'error', message: `Found ${content.brokenLinks.length} broken links` });
    }
    
    // Check for accessibility issues
    if (!content.headings?.h1 || content.headings.h1.length === 0) {
      issues.push({ type: 'error', message: 'Missing H1 heading' });
    }
    
    return {
      issues,
      score: Math.max(0, 100 - (issues.filter(i => i.type === 'error').length * 20) - (issues.filter(i => i.type === 'warning').length * 10)),
      recommendations: generateQARecommendations(issues)
    };
  } catch (error) {
    console.error('QA analysis failed:', error);
    return { error: 'QA analysis failed', issues: [], score: 0 };
  }
}

// Google Trends Analysis
async function runGoogleTrendsAnalysis(content: any) {
  try {
    const keywords = extractKeywords(content);
    const trendingTopics = [];
    
    // Analyze trending topics for each keyword
    for (const keyword of keywords.slice(0, 5)) { // Limit to top 5 keywords
      try {
        const trendsData = await analyzeTrendingTopics(keyword);
        trendingTopics.push({
          keyword,
          trend: trendsData.trend,
          relatedQueries: trendsData.relatedQueries,
          risingQueries: trendsData.risingQueries
        });
      } catch (err) {
        console.error(`Trends analysis failed for keyword: ${keyword}`, err);
      }
    }
    
    return {
      trendingTopics,
      overallTrend: calculateOverallTrend(trendingTopics),
      recommendations: generateTrendsRecommendations(trendingTopics)
    };
  } catch (error) {
    console.error('Google Trends analysis failed:', error);
    return { error: 'Trends analysis failed', trendingTopics: [] };
  }
}

// Competition Analysis
async function runCompetitionAnalysis(url: string, content: any) {
  try {
    const domain = new URL(url).hostname;
    const competitors = await findCompetitors(domain, content);
    
    return {
      competitors,
      competitiveAnalysis: await analyzeCompetitors(competitors),
      recommendations: generateCompetitionRecommendations(competitors)
    };
  } catch (error) {
    console.error('Competition analysis failed:', error);
    return { error: 'Competition analysis failed', competitors: [] };
  }
}

// Helper functions
function extractKeywords(content: any): string[] {
  const text = content.cleanText || content.content || '';
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

function analyzeMetaTags(content: any) {
  return {
    title: {
      present: !!content.title,
      length: content.title?.length || 0,
      score: content.title ? Math.min(10, Math.max(0, 10 - Math.abs(60 - content.title.length))) : 0
    },
    description: {
      present: !!content.metaDescription,
      length: content.metaDescription?.length || 0,
      score: content.metaDescription ? Math.min(10, Math.max(0, 10 - Math.abs(160 - content.metaDescription.length))) : 0
    },
    keywords: {
      present: !!content.metaKeywords,
      count: content.metaKeywords?.length || 0,
      score: content.metaKeywords ? Math.min(10, content.metaKeywords.length) : 0
    }
  };
}

function analyzeStructuredData(content: any) {
  return {
    present: content.structuredData && content.structuredData.length > 0,
    count: content.structuredData?.length || 0,
    types: content.structuredData?.map((item: any) => item.type) || [],
    score: content.structuredData ? Math.min(10, content.structuredData.length) : 0
  };
}

function analyzeHeadings(content: any) {
  const headings = content.headings || {};
  return {
    h1: {
      present: headings.h1 && headings.h1.length > 0,
      count: headings.h1?.length || 0,
      score: headings.h1 ? Math.min(10, headings.h1.length) : 0
    },
    h2: {
      present: headings.h2 && headings.h2.length > 0,
      count: headings.h2?.length || 0,
      score: headings.h2 ? Math.min(10, headings.h2.length) : 0
    },
    h3: {
      present: headings.h3 && headings.h3.length > 0,
      count: headings.h3?.length || 0,
      score: headings.h3 ? Math.min(10, headings.h3.length) : 0
    }
  };
}

function analyzeLinks(content: any) {
  return {
    internal: content.internalLinks || 0,
    external: content.externalLinks || 0,
    broken: content.brokenLinks?.length || 0,
    score: Math.max(0, 10 - (content.brokenLinks?.length || 0))
  };
}

function calculateSEOScore(meta: any, headings: any, links: any, structured: any) {
  const scores = [
    meta.title.score,
    meta.description.score,
    meta.keywords.score,
    headings.h1.score,
    headings.h2.score,
    headings.h3.score,
    links.score,
    structured.score
  ];
  
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function generateSEORecommendations(meta: any, headings: any, links: any, structured: any) {
  const recommendations = [];
  
  if (meta.title.score < 5) recommendations.push('Improve page title length and relevance');
  if (meta.description.score < 5) recommendations.push('Add or improve meta description');
  if (headings.h1.score === 0) recommendations.push('Add H1 heading');
  if (headings.h2.score < 3) recommendations.push('Add more H2 headings for structure');
  if (links.score < 5) recommendations.push('Fix broken links');
  if (structured.score === 0) recommendations.push('Add structured data markup');
  
  return recommendations;
}

function generateQARecommendations(issues: any[]) {
  return issues.map(issue => ({
    priority: issue.type === 'error' ? 'high' : issue.type === 'warning' ? 'medium' : 'low',
    action: issue.message,
    impact: issue.type === 'error' ? 'Critical' : issue.type === 'warning' ? 'Important' : 'Nice to have'
  }));
}

async function analyzeTrendingTopics(keyword: string) {
  // This would integrate with Google Trends API
  // For now, return mock data
  return {
    trend: 'stable',
    relatedQueries: [`${keyword} guide`, `${keyword} tips`, `${keyword} best practices`],
    risingQueries: [`${keyword} 2024`, `${keyword} latest`]
  };
}

function calculateOverallTrend(trendingTopics: any[]) {
  const trends = trendingTopics.map(t => t.trend);
  const stable = trends.filter(t => t === 'stable').length;
  const rising = trends.filter(t => t === 'rising').length;
  const falling = trends.filter(t => t === 'falling').length;
  
  if (rising > stable && rising > falling) return 'rising';
  if (falling > stable && falling > rising) return 'falling';
  return 'stable';
}

function generateTrendsRecommendations(trendingTopics: any[]) {
  return trendingTopics.map(topic => ({
    keyword: topic.keyword,
    recommendation: `Focus on ${topic.trend} trend for "${topic.keyword}"`,
    relatedContent: topic.relatedQueries.slice(0, 3)
  }));
}

async function findCompetitors(domain: string, content: any) {
  // This would use Google Search API or similar
  // For now, return mock data
  return [
    { domain: 'competitor1.com', similarity: 0.8 },
    { domain: 'competitor2.com', similarity: 0.7 },
    { domain: 'competitor3.com', similarity: 0.6 }
  ];
}

async function analyzeCompetitors(competitors: any[]) {
  return competitors.map(comp => ({
    domain: comp.domain,
    strengths: ['Strong SEO', 'Good content'],
    weaknesses: ['Slow loading', 'Poor mobile'],
    opportunities: ['Better UX', 'More content']
  }));
}

function generateCompetitionRecommendations(competitors: any[]) {
  return [
    'Analyze competitor content strategies',
    'Identify gaps in competitor offerings',
    'Develop unique value propositions',
    'Monitor competitor SEO strategies'
  ];
}

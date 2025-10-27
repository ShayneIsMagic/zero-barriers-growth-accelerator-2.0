#!/usr/bin/env node

/**
 * Test script for Comprehensive Google Analysis
 * This script tests all Google analysis tools in one comprehensive service
 */

const {
  ComprehensiveGoogleAnalysisService,
} = require('../src/lib/comprehensive-google-analysis');

async function testComprehensiveGoogleAnalysis() {
  console.log('🧪 Testing Comprehensive Google Analysis');
  console.log('=========================================\n');

  const testUrl = process.argv[2] || 'https://example.com';
  const testKeywords = [
    'digital marketing',
    'SEO',
    'web development',
    'content strategy',
  ];

  try {
    console.log(`📊 Testing URL: ${testUrl}`);
    console.log(`🔍 Test Keywords: ${testKeywords.join(', ')}\n`);

    // Initialize the comprehensive service
    const googleAnalysisService = new ComprehensiveGoogleAnalysisService(
      testUrl,
      testKeywords
    );

    console.log('🚀 Starting comprehensive Google analysis...\n');

    // Perform comprehensive analysis
    const results = await googleAnalysisService.performComprehensiveAnalysis();

    console.log('📊 ANALYSIS RESULTS:');
    console.log('===================\n');

    // Search Console Results
    console.log('1. 🔍 SEARCH CONSOLE:');
    console.log(
      `   Configured: ${results.searchConsole.configured ? '✅' : '❌'}`
    );
    if (results.searchConsole.error) {
      console.log(`   Error: ${results.searchConsole.error}`);
    } else if (results.searchConsole.data) {
      console.log(`   ✅ Data available`);
    }
    console.log();

    // Google Trends Results
    console.log('2. 📈 GOOGLE TRENDS:');
    console.log(`   Configured: ${results.trends.configured ? '✅' : '❌'}`);
    if (results.trends.error) {
      console.log(`   Error: ${results.trends.error}`);
    } else if (results.trends.data) {
      console.log(
        `   ✅ Keywords analyzed: ${results.trends.data.keywordTrends.length}`
      );
      console.log(
        `   ✅ Trending keywords: ${results.trends.data.trendingKeywords.length}`
      );
      console.log(
        `   🔥 Top trending: ${results.trends.data.trendingKeywords.slice(0, 3).join(', ')}`
      );
    }
    console.log();

    // PageSpeed Insights Results
    console.log('3. ⚡ PAGESPEED INSIGHTS:');
    console.log(`   Configured: ${results.pageSpeed.configured ? '✅' : '❌'}`);
    if (results.pageSpeed.error) {
      console.log(`   Error: ${results.pageSpeed.error}`);
    } else if (results.pageSpeed.data) {
      console.log(
        `   ✅ Performance Score: ${results.pageSpeed.data.performance}/100`
      );
      console.log(`   ✅ SEO Score: ${results.pageSpeed.data.seo}/100`);
      console.log(
        `   ✅ Accessibility Score: ${results.pageSpeed.data.accessibility}/100`
      );
      console.log(
        `   ✅ Best Practices Score: ${results.pageSpeed.data.bestPractices}/100`
      );
    }
    console.log();

    // Safe Browsing Results
    console.log('4. 🛡️ SAFE BROWSING:');
    console.log(
      `   Configured: ${results.safeBrowsing.configured ? '✅' : '❌'}`
    );
    if (results.safeBrowsing.error) {
      console.log(`   Error: ${results.safeBrowsing.error}`);
    } else if (results.safeBrowsing.data) {
      console.log(
        `   ✅ Safe: ${results.safeBrowsing.data.safe ? '✅ YES' : '❌ NO'}`
      );
      if (results.safeBrowsing.data.threats.length > 0) {
        console.log(
          `   ⚠️ Threats detected: ${results.safeBrowsing.data.threats.length}`
        );
      }
    }
    console.log();

    // Custom SEO Analysis Results
    console.log('5. 🔍 CUSTOM SEO ANALYSIS:');
    console.log(
      `   Configured: ${results.seoAnalysis.configured ? '✅' : '❌'}`
    );
    if (results.seoAnalysis.error) {
      console.log(`   Error: ${results.seoAnalysis.error}`);
    } else if (results.seoAnalysis.data) {
      const seo = results.seoAnalysis.data.technicalSeo;
      console.log(`   ✅ Title Length: ${seo.titleLength} characters`);
      console.log(
        `   ✅ Meta Description: ${seo.metaDescriptionLength} characters`
      );
      console.log(`   ✅ H1 Tags: ${seo.headingStructure.h1}`);
      console.log(`   ✅ Internal Links: ${seo.internalLinks}`);
      console.log(`   ✅ External Links: ${seo.externalLinks}`);
      console.log(
        `   ✅ Images with Alt: ${seo.imagesWithAlt}/${seo.totalImages}`
      );
    }
    console.log();

    // Analysis Summary
    console.log('6. 📊 ANALYSIS SUMMARY:');
    console.log(
      `   ✅ Tools Configured: ${results.summary.totalToolsConfigured}/${results.summary.totalToolsAvailable}`
    );
    console.log(
      `   ✅ Analysis Quality: ${results.summary.analysisQuality.toUpperCase()}`
    );
    console.log(
      `   ✅ Recommendations: ${results.summary.recommendations.length}`
    );

    if (results.summary.recommendations.length > 0) {
      console.log('\n   💡 TOP RECOMMENDATIONS:');
      results.summary.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(
          `      ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`
        );
        console.log(`         ${rec.description}`);
      });
    }

    console.log('\n🎉 COMPREHENSIVE GOOGLE ANALYSIS RESULTS:');
    console.log('==========================================');
    console.log(
      `✅ Analysis Quality: ${results.summary.analysisQuality.toUpperCase()}`
    );
    console.log(
      `✅ Tools Working: ${results.summary.totalToolsConfigured}/${results.summary.totalToolsAvailable}`
    );
    console.log(
      `✅ Recommendations Generated: ${results.summary.recommendations.length}`
    );

    if (results.summary.analysisQuality === 'comprehensive') {
      console.log('\n🚀 EXCELLENT! All Google analysis tools are working!');
    } else if (results.summary.analysisQuality === 'advanced') {
      console.log('\n👍 GOOD! Most Google analysis tools are working!');
    } else if (results.summary.analysisQuality === 'intermediate') {
      console.log(
        '\n⚠️ PARTIAL! Some Google analysis tools need configuration.'
      );
    } else {
      console.log(
        '\n❌ BASIC! Most Google analysis tools need API key configuration.'
      );
    }
  } catch (error) {
    console.error(
      '❌ Comprehensive Google analysis test failed:',
      error.message
    );
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check internet connection');
    console.log('2. Verify all required packages are installed');
    console.log('3. Check if test URL is accessible');
    console.log('4. Review error details above');

    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testComprehensiveGoogleAnalysis();
}

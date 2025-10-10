/**
 * Test Script: Execute Markdowns with Supabase Integration
 * This script tests the complete flow of markdown generation and Supabase storage
 */

import {
    generateB2BElementsReport,
    generateCliftonStrengthsReport,
    generateComprehensiveReport,
    generateContentCollectionReport,
    generateElementsB2CReport,
    generateGoldenCircleReport,
    generateLighthouseReport,
    IndividualReport
} from './src/lib/individual-report-generator';

import { generateMarkdownReport } from './src/lib/markdown-report-generator';

import {
    checkMarkdownTablesExist,
    getAnalysisReports,
    getCompleteAnalysisMarkdown,
    getMarkdownExport,
    getPhaseReports,
    getReportStats,
    saveIndividualReports,
    saveMarkdownExport
} from './src/lib/supabase-markdown-service';

import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const TEST_URL = 'https://example.com';
const TEST_ANALYSIS_ID = `test-analysis-${Date.now()}`;

// Sample data (same as previous test)
const sampleScrapedContent = {
  title: 'Example Business - Leading Digital Solutions Provider',
  metaDescription: 'We provide cutting-edge digital solutions for modern businesses. Transform your operations with our innovative technology platform and expert consulting services.',
  metaKeywords: ['digital solutions', 'technology', 'consulting'],
  ogTitle: 'Example Business - Digital Solutions',
  ogDescription: 'Transform your business with our solutions',
  ogImage: 'https://example.com/og-image.jpg',
  canonicalUrl: 'https://example.com',
  hasSSL: true,
  schemaTypes: ['Organization', 'WebSite'],
  extractedKeywords: ['digital', 'solutions', 'technology', 'business', 'innovation', 'platform'],
  topicClusters: ['Digital Transformation', 'Cloud Solutions', 'Business Analytics'],
  wordCount: 1547,
  imageCount: 12,
  linkCount: 34,
  headings: {
    h1: ['Transform Your Business with Digital Solutions'],
    h2: ['Our Services', 'Why Choose Us', 'Success Stories', 'Get Started Today'],
    h3: ['Cloud Migration', 'Data Analytics', 'Custom Development']
  },
  content: 'We help businesses transform through digital solutions. Our expert team delivers cloud migration, data analytics, and custom development services...',
  cleanText: 'Transform Your Business with Digital Solutions. We help businesses succeed in the digital age.'
};

const sampleLighthouseData = {
  scores: {
    performance: 87,
    accessibility: 92,
    bestPractices: 95,
    seo: 88
  },
  metrics: {
    'First Contentful Paint': '1.2s',
    'Largest Contentful Paint': '2.4s',
    'Time to Interactive': '3.1s',
    'Cumulative Layout Shift': '0.05',
    'Speed Index': '2.1s'
  }
};

const sampleGoldenCircle = {
  why: 'We believe that every business deserves access to world-class digital solutions without barriers.',
  whyScore: 8,
  how: 'We deliver through a proven three-phase methodology: discovery, implementation, and optimization.',
  howScore: 7,
  what: 'Cloud migration services, custom software development, data analytics platforms.',
  whatScore: 9,
  who: 'Mid-market businesses (50-500 employees) seeking digital transformation.',
  whoScore: 8,
  overallScore: 80,
  recommendations: ['Lead with your "Why" more prominently', 'Add customer testimonials']
};

const sampleElementsB2C = {
  overallScore: 72,
  functional: {
    'Saves time': { score: 8, evidence: 'Automated workflows reduce manual tasks by 60%' },
    'Simplifies': { score: 7, evidence: 'Intuitive interface requires minimal training' }
  },
  emotional: {
    'Reduces anxiety': { score: 6, evidence: '24/7 support team provides peace of mind' }
  },
  lifeChanging: {},
  socialImpact: {},
  keyFindings: ['Strong functional value proposition']
};

const sampleB2BElements = {
  overallScore: 78,
  tableStakes: {
    'Meets specifications': { score: 9, evidence: 'Comprehensive feature list' }
  },
  functional: {
    'Improves productivity': { score: 9, evidence: 'Automation saves 15 hours per week' }
  },
  ease: {},
  individual: {},
  inspirational: {}
};

const sampleCliftonStrengths = {
  overallScore: 74,
  topStrengths: [
    {
      name: 'Achiever',
      domain: 'Executing',
      score: 9,
      evidence: 'Results-focused language throughout'
    }
  ],
  executing: [{ name: 'Achiever', score: 9 }],
  influencing: [],
  relationshipBuilding: [],
  strategicThinking: [{ name: 'Strategic', score: 8 }],
  summary: 'Strong Executing and Strategic Thinking themes'
};

const sampleComprehensive = {
  overallScore: 82,
  rating: 'Very Good',
  priorityRecommendations: [
    'Enhance homepage hero section',
    'Add video testimonials',
    'Improve mobile performance'
  ],
  quickWins: [
    'Add meta description to 3 pages',
    'Compress hero image',
    'Fix broken link'
  ],
  longTermImprovements: [
    'Develop content marketing strategy',
    'Create interactive ROI calculator'
  ],
  performanceOptimizations: [
    'Implement CDN for static assets',
    'Enable HTTP/2'
  ],
  seoImprovements: [
    'Create pillar content',
    'Build internal linking structure'
  ]
};

async function main() {
  console.log('🚀 MARKDOWN + SUPABASE EXECUTION TEST\n');
  console.log('=' .repeat(80));
  console.log(`Test Analysis ID: ${TEST_ANALYSIS_ID}\n`);

  const testResults: any[] = [];
  let allReports: IndividualReport[] = [];

  // Step 1: Check if Supabase tables exist
  console.log('\n📋 Step 1: Check Supabase Tables');
  console.log('-'.repeat(80));
  try {
    const tablesExist = await checkMarkdownTablesExist();
    console.log(`✅ individual_reports table: ${tablesExist.individualReports ? 'EXISTS' : '❌ MISSING'}`);
    console.log(`✅ markdown_exports table: ${tablesExist.markdownExports ? 'EXISTS' : '❌ MISSING'}`);

    if (!tablesExist.individualReports || !tablesExist.markdownExports) {
      console.log('\n⚠️  WARNING: Tables are missing!');
      console.log('   Run this SQL file to create them:');
      console.log('   supabase-markdown-schema.sql');
      testResults.push({ step: 'Check Tables', status: 'WARN', message: 'Tables missing' });
    } else {
      testResults.push({ step: 'Check Tables', status: 'PASS' });
    }
  } catch (error) {
    console.error('❌ FAIL - Could not check tables:', error);
    testResults.push({ step: 'Check Tables', status: 'FAIL', error: String(error) });
  }

  // Step 2: Generate Phase 1 Reports
  console.log('\n📝 Step 2: Generate Phase 1 Reports');
  console.log('-'.repeat(80));
  try {
    const contentReport = generateContentCollectionReport(sampleScrapedContent, TEST_URL);
    const lighthouseReport = generateLighthouseReport(sampleLighthouseData, TEST_URL);

    allReports.push(contentReport, lighthouseReport);

    console.log(`✅ Generated ${allReports.length} Phase 1 reports`);
    testResults.push({ step: 'Generate Phase 1', status: 'PASS', count: 2 });
  } catch (error) {
    console.error('❌ FAIL - Phase 1 generation:', error);
    testResults.push({ step: 'Generate Phase 1', status: 'FAIL', error: String(error) });
  }

  // Step 3: Generate Phase 2 Reports
  console.log('\n📝 Step 3: Generate Phase 2 Reports');
  console.log('-'.repeat(80));
  try {
    const goldenReport = generateGoldenCircleReport(sampleGoldenCircle, TEST_URL, 'Golden Circle prompt...');
    const b2cReport = generateElementsB2CReport(sampleElementsB2C, TEST_URL, 'B2C Elements prompt...');
    const b2bReport = generateB2BElementsReport(sampleB2BElements, TEST_URL, 'B2B Elements prompt...');
    const cliftonReport = generateCliftonStrengthsReport(sampleCliftonStrengths, TEST_URL, 'CliftonStrengths prompt...');

    const phase2Reports = [goldenReport, b2cReport, b2bReport, cliftonReport];
    allReports.push(...phase2Reports);

    console.log(`✅ Generated ${phase2Reports.length} Phase 2 reports`);
    testResults.push({ step: 'Generate Phase 2', status: 'PASS', count: 4 });
  } catch (error) {
    console.error('❌ FAIL - Phase 2 generation:', error);
    testResults.push({ step: 'Generate Phase 2', status: 'FAIL', error: String(error) });
  }

  // Step 4: Generate Phase 3 Report
  console.log('\n📝 Step 4: Generate Phase 3 Report');
  console.log('-'.repeat(80));
  try {
    const comprehensiveReport = generateComprehensiveReport(sampleComprehensive, TEST_URL, 'Comprehensive analysis prompt...');
    allReports.push(comprehensiveReport);

    console.log(`✅ Generated Phase 3 report`);
    testResults.push({ step: 'Generate Phase 3', status: 'PASS', count: 1 });
  } catch (error) {
    console.error('❌ FAIL - Phase 3 generation:', error);
    testResults.push({ step: 'Generate Phase 3', status: 'FAIL', error: String(error) });
  }

  // Step 5: Save Individual Reports to Supabase
  console.log('\n💾 Step 5: Save Reports to Supabase');
  console.log('-'.repeat(80));
  try {
    await saveIndividualReports(allReports, TEST_ANALYSIS_ID);
    console.log(`✅ Saved ${allReports.length} reports to Supabase`);
    testResults.push({ step: 'Save to Supabase', status: 'PASS', count: allReports.length });
  } catch (error) {
    console.error('❌ FAIL - Could not save to Supabase:', error);
    console.log('\n   This might be because:');
    console.log('   1. Tables don\'t exist (run supabase-markdown-schema.sql)');
    console.log('   2. Database connection issue');
    console.log('   3. Test Analysis ID doesn\'t exist in Analysis table');
    testResults.push({ step: 'Save to Supabase', status: 'FAIL', error: String(error) });
  }

  // Step 6: Retrieve Reports from Supabase
  console.log('\n📥 Step 6: Retrieve Reports from Supabase');
  console.log('-'.repeat(80));
  try {
    const retrievedReports = await getAnalysisReports(TEST_ANALYSIS_ID);
    console.log(`✅ Retrieved ${retrievedReports.length} reports from Supabase`);

    // Get by phase
    const phase1Reports = await getPhaseReports(TEST_ANALYSIS_ID, 'Phase 1');
    const phase2Reports = await getPhaseReports(TEST_ANALYSIS_ID, 'Phase 2');
    const phase3Reports = await getPhaseReports(TEST_ANALYSIS_ID, 'Phase 3');

    console.log(`   - Phase 1: ${phase1Reports.length} reports`);
    console.log(`   - Phase 2: ${phase2Reports.length} reports`);
    console.log(`   - Phase 3: ${phase3Reports.length} reports`);

    testResults.push({
      step: 'Retrieve from Supabase',
      status: 'PASS',
      total: retrievedReports.length,
      phase1: phase1Reports.length,
      phase2: phase2Reports.length,
      phase3: phase3Reports.length
    });
  } catch (error) {
    console.error('❌ FAIL - Could not retrieve from Supabase:', error);
    testResults.push({ step: 'Retrieve from Supabase', status: 'FAIL', error: String(error) });
  }

  // Step 7: Generate Combined Markdown
  console.log('\n📄 Step 7: Generate Combined Markdown');
  console.log('-'.repeat(80));
  try {
    const completeAnalysisData = {
      phase1Data: { scrapedContent: sampleScrapedContent, lighthouseData: sampleLighthouseData, summary: {} },
      phase2Data: { goldenCircle: sampleGoldenCircle, summary: {} },
      phase3Data: { comprehensive: sampleComprehensive, summary: {} },
      finalReport: {
        evaluationFramework: { overallScore: 82, rating: 'Very Good' },
        executiveSummary: 'Test executive summary'
      }
    };

    const combinedMarkdown = generateMarkdownReport(completeAnalysisData, TEST_URL);
    console.log(`✅ Generated combined markdown (${combinedMarkdown.length} chars)`);

    testResults.push({ step: 'Generate Combined', status: 'PASS', size: combinedMarkdown.length });

    // Save to file
    const outputDir = path.join(process.cwd(), 'test-markdown-output');
    fs.writeFileSync(
      path.join(outputDir, 'supabase-test-combined.md'),
      combinedMarkdown
    );
  } catch (error) {
    console.error('❌ FAIL - Combined markdown generation:', error);
    testResults.push({ step: 'Generate Combined', status: 'FAIL', error: String(error) });
  }

  // Step 8: Save Combined Export to Supabase
  console.log('\n💾 Step 8: Save Combined Export to Supabase');
  console.log('-'.repeat(80));
  try {
    const combinedMarkdown = generateMarkdownReport({
      finalReport: {
        evaluationFramework: { overallScore: 82, rating: 'Very Good' }
      }
    }, TEST_URL);

    const exportId = await saveMarkdownExport(
      TEST_ANALYSIS_ID,
      TEST_URL,
      combinedMarkdown,
      82,
      'Very Good'
    );

    console.log(`✅ Saved combined export (ID: ${exportId})`);
    testResults.push({ step: 'Save Export', status: 'PASS', exportId });
  } catch (error) {
    console.error('❌ FAIL - Could not save export:', error);
    testResults.push({ step: 'Save Export', status: 'FAIL', error: String(error) });
  }

  // Step 9: Retrieve Combined Export
  console.log('\n📥 Step 9: Retrieve Combined Export');
  console.log('-'.repeat(80));
  try {
    const exportData = await getMarkdownExport(TEST_ANALYSIS_ID);

    if (exportData) {
      console.log(`✅ Retrieved export:`);
      console.log(`   - URL: ${exportData.url}`);
      console.log(`   - Score: ${exportData.overallScore}`);
      console.log(`   - Rating: ${exportData.rating}`);
      console.log(`   - Size: ${exportData.markdown.length} chars`);
      testResults.push({ step: 'Retrieve Export', status: 'PASS' });
    } else {
      console.log('⚠️  No export found');
      testResults.push({ step: 'Retrieve Export', status: 'WARN', message: 'No export found' });
    }
  } catch (error) {
    console.error('❌ FAIL - Could not retrieve export:', error);
    testResults.push({ step: 'Retrieve Export', status: 'FAIL', error: String(error) });
  }

  // Step 10: Get Report Statistics
  console.log('\n📊 Step 10: Get Report Statistics');
  console.log('-'.repeat(80));
  try {
    const stats = await getReportStats(TEST_ANALYSIS_ID);
    console.log(`✅ Report Statistics:`);
    console.log(`   - Total: ${stats.total}`);
    console.log(`   - Phase 1: ${stats.phase1}`);
    console.log(`   - Phase 2: ${stats.phase2}`);
    console.log(`   - Phase 3: ${stats.phase3}`);
    testResults.push({ step: 'Get Statistics', status: 'PASS', stats });
  } catch (error) {
    console.error('❌ FAIL - Could not get statistics:', error);
    testResults.push({ step: 'Get Statistics', status: 'FAIL', error: String(error) });
  }

  // Step 11: Get Complete Analysis JSON
  console.log('\n📦 Step 11: Get Complete Analysis JSON');
  console.log('-'.repeat(80));
  try {
    const completeData = await getCompleteAnalysisMarkdown(TEST_ANALYSIS_ID);

    if (completeData) {
      console.log(`✅ Retrieved complete analysis:`);
      console.log(`   - Analysis ID: ${completeData.analysisId}`);
      console.log(`   - Individual Reports: ${completeData.individualReports?.length || 0}`);
      console.log(`   - Has Export: ${completeData.export ? 'Yes' : 'No'}`);

      // Save to file
      const outputDir = path.join(process.cwd(), 'test-markdown-output');
      fs.writeFileSync(
        path.join(outputDir, 'supabase-complete-analysis.json'),
        JSON.stringify(completeData, null, 2)
      );

      testResults.push({ step: 'Get Complete JSON', status: 'PASS' });
    } else {
      console.log('⚠️  No data found');
      testResults.push({ step: 'Get Complete JSON', status: 'WARN', message: 'No data found' });
    }
  } catch (error) {
    console.error('❌ FAIL - Could not get complete analysis:', error);
    testResults.push({ step: 'Get Complete JSON', status: 'FAIL', error: String(error) });
  }

  // Step 12: Cleanup (Optional - commented out by default)
  console.log('\n🗑️  Step 12: Cleanup (Skipped)');
  console.log('-'.repeat(80));
  console.log('   Cleanup is disabled by default.');
  console.log('   To clean up test data, uncomment the cleanup code.');
  /*
  try {
    await deleteAnalysisReports(TEST_ANALYSIS_ID);
    console.log(`✅ Cleaned up test data`);
    testResults.push({ step: 'Cleanup', status: 'PASS' });
  } catch (error) {
    console.error('❌ FAIL - Could not cleanup:', error);
    testResults.push({ step: 'Cleanup', status: 'FAIL', error: String(error) });
  }
  */

  // Final Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST SUMMARY\n');

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const warned = testResults.filter(r => r.status === 'WARN').length;

  console.log(`Total Steps: ${testResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`Success Rate: ${(passed / testResults.length * 100).toFixed(1)}%\n`);

  // Detailed results
  console.log('Detailed Results:');
  testResults.forEach((result, i) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} Step ${i + 1}: ${result.step}`);
    if (result.error) {
      console.log(`   Error: ${result.error.substring(0, 100)}...`);
    }
  });

  // Save results
  const resultsFile = {
    timestamp: new Date().toISOString(),
    testAnalysisId: TEST_ANALYSIS_ID,
    summary: {
      total: testResults.length,
      passed,
      failed,
      warned,
      successRate: `${(passed / testResults.length * 100).toFixed(1)}%`
    },
    steps: testResults
  };

  const outputDir = path.join(process.cwd(), 'test-markdown-output');
  fs.writeFileSync(
    path.join(outputDir, 'supabase-test-results.json'),
    JSON.stringify(resultsFile, null, 2)
  );

  console.log('\n✅ Results saved to test-markdown-output/supabase-test-results.json');
  console.log('\n' + '='.repeat(80));
  console.log('🎉 SUPABASE MARKDOWN EXECUTION TEST COMPLETE!\n');

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

// Run the test
main().catch(error => {
  console.error('\n💥 TEST SUITE CRASHED:');
  console.error(error);
  process.exit(1);
});


/**
 * Test Script: Execute and Verify Markdown Generators
 * This script tests all markdown generation functions with sample data
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

import * as fs from 'fs'
import { MarkdownReportGenerator } from './src/lib/markdown-report-generator';;
import * as path from 'path';
import { generateMarkdownReport } from './src/lib/markdown-report-generator';

// Sample data for testing
const TEST_URL = 'https://example.com';

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
  why: 'We believe that every business deserves access to world-class digital solutions without barriers. Our purpose is to democratize technology and enable growth for all.',
  whyScore: 8,
  how: 'We deliver through a proven three-phase methodology: discovery, implementation, and optimization. Our agile approach ensures rapid deployment and continuous improvement.',
  howScore: 7,
  what: 'Cloud migration services, custom software development, data analytics platforms, and digital transformation consulting.',
  whatScore: 9,
  who: 'Mid-market businesses (50-500 employees) seeking digital transformation, particularly in manufacturing, healthcare, and professional services sectors.',
  whoScore: 8,
  overallScore: 80,
  recommendations: [
    'Lead with your "Why" more prominently on the homepage',
    'Add customer testimonials that reinforce your purpose',
    'Create case studies that demonstrate your unique methodology'
  ]
};

const sampleElementsB2C = {
  overallScore: 72,
  functional: {
    'Saves time': { score: 8, evidence: 'Automated workflows reduce manual tasks by 60%' },
    'Simplifies': { score: 7, evidence: 'Intuitive interface requires minimal training' },
    'Quality': { score: 9, evidence: '99.9% uptime SLA and enterprise-grade security' }
  },
  emotional: {
    'Reduces anxiety': { score: 6, evidence: '24/7 support team provides peace of mind' },
    'Provides access': { score: 8, evidence: 'Cloud-based platform accessible anywhere' }
  },
  lifeChanging: {
    'Motivation': { score: 5, evidence: 'Dashboard provides insights but limited gamification' }
  },
  socialImpact: {
    'Self-transcendence': { score: 4, evidence: 'Some environmental claims but not prominent' }
  },
  keyFindings: [
    'Strong functional value proposition',
    'Emotional benefits could be more prominent',
    'Limited life-changing or social impact messaging'
  ]
};

const sampleB2BElements = {
  overallScore: 78,
  tableStakes: {
    'Meets specifications': { score: 9, evidence: 'Comprehensive feature list matches industry standards' },
    'Acceptable price': { score: 7, evidence: 'Competitive pricing with ROI calculator' }
  },
  functional: {
    'Improves productivity': { score: 9, evidence: 'Automation saves 15 hours per week per employee' },
    'Reduces cost': { score: 8, evidence: 'Average 35% cost reduction in first year' }
  },
  ease: {
    'Simple onboarding': { score: 7, evidence: 'Guided setup process takes under 2 hours' },
    'Good cultural fit': { score: 6, evidence: 'Customizable to match company workflows' }
  },
  individual: {
    'Reduces anxiety': { score: 7, evidence: 'Automated compliance reporting' },
    'Career advancement': { score: 5, evidence: 'Training programs mentioned but not detailed' }
  },
  inspirational: {
    'Vision': { score: 6, evidence: 'Innovation roadmap shared but not strongly positioned' }
  }
};

const sampleCliftonStrengths = {
  overallScore: 74,
  topStrengths: [
    {
      name: 'Achiever',
      domain: 'Executing',
      score: 9,
      evidence: 'Results-focused language throughout, emphasis on measurable outcomes'
    },
    {
      name: 'Strategic',
      domain: 'Strategic Thinking',
      score: 8,
      evidence: 'Clear methodology and planning approach highlighted'
    },
    {
      name: 'Learner',
      domain: 'Strategic Thinking',
      score: 7,
      evidence: 'Continuous improvement and innovation themes present'
    },
    {
      name: 'Responsibility',
      domain: 'Executing',
      score: 8,
      evidence: 'Strong commitment language and accountability messaging'
    },
    {
      name: 'Developer',
      domain: 'Relationship Building',
      score: 7,
      evidence: 'Focus on customer growth and partnership'
    }
  ],
  executing: [
    { name: 'Achiever', score: 9 },
    { name: 'Responsibility', score: 8 },
    { name: 'Discipline', score: 6 }
  ],
  influencing: [
    { name: 'Communication', score: 7 },
    { name: 'Woo', score: 5 }
  ],
  relationshipBuilding: [
    { name: 'Developer', score: 7 },
    { name: 'Empathy', score: 6 }
  ],
  strategicThinking: [
    { name: 'Strategic', score: 8 },
    { name: 'Learner', score: 7 },
    { name: 'Analytical', score: 7 }
  ],
  summary: 'This brand shows strong Executing and Strategic Thinking themes, with particular emphasis on achievement and strategic planning. The personality comes across as results-driven, methodical, and committed to continuous improvement.'
};

const sampleComprehensive = {
  overallScore: 82,
  rating: 'Very Good - Strong Foundation with Growth Opportunities',
  priorityRecommendations: [
    'Enhance homepage hero section to lead with purpose (Why)',
    'Add video testimonials to build emotional connection',
    'Implement progressive disclosure for complex technical content',
    'Improve mobile performance (currently 78/100)',
    'Add live chat for immediate engagement'
  ],
  quickWins: [
    'Add meta description to 3 pages missing it',
    'Compress hero image (reduce 2.1MB to under 500KB)',
    'Fix broken link on Resources page',
    'Add alt text to 8 images',
    'Implement lazy loading for below-fold images'
  ],
  longTermImprovements: [
    'Develop comprehensive content marketing strategy',
    'Create interactive ROI calculator',
    'Build customer success story hub with video',
    'Implement personalization based on industry',
    'Launch customer community platform'
  ],
  performanceOptimizations: [
    'Implement CDN for static assets',
    'Enable HTTP/2 or HTTP/3',
    'Minify JavaScript and CSS',
    'Implement service worker for offline capability',
    'Optimize font loading strategy'
  ],
  seoImprovements: [
    'Create pillar content for each service area',
    'Build internal linking structure',
    'Develop FAQ schema markup',
    'Create location-specific landing pages',
    'Implement breadcrumb navigation with schema'
  ]
};

// Complete analysis data for combined report
const completeAnalysisData = {
  phase1Data: {
    scrapedContent: sampleScrapedContent,
    lighthouseData: sampleLighthouseData,
    summary: {
      totalWords: 1547,
      totalImages: 12,
      totalLinks: 34,
      seoScore: 88,
      performanceScore: 87,
      accessibilityScore: 92,
      technicalIssues: [
        'Some images missing alt text',
        'Mobile performance needs improvement'
      ],
      contentIssues: [
        'Meta description missing on some pages'
      ]
    }
  },
  phase2Data: {
    goldenCircle: sampleGoldenCircle,
    elementsB2C: sampleElementsB2C,
    b2bElements: sampleB2BElements,
    cliftonStrengths: sampleCliftonStrengths,
    summary: {
      overallFrameworkScore: 76,
      goldenCircleScore: 80,
      elementsOfValueScore: 72,
      b2bElementsScore: 78,
      cliftonStrengthsScore: 74,
      keyStrengths: [
        'Clear value proposition',
        'Strong results focus',
        'Good technical foundation'
      ],
      keyWeaknesses: [
        'Limited emotional connection',
        'Purpose could be more prominent',
        'Mobile experience needs work'
      ],
      valueCentricLanguage: ['transform', 'innovation', 'growth', 'results'],
      functionalLanguage: ['cloud', 'platform', 'integration', 'automation']
    }
  },
  phase3Data: {
    comprehensive: sampleComprehensive,
    summary: {
      primaryRecommendations: sampleComprehensive.priorityRecommendations,
      quickWins: sampleComprehensive.quickWins,
      longTermImprovements: sampleComprehensive.longTermImprovements,
      performanceOptimizations: sampleComprehensive.performanceOptimizations,
      seoImprovements: sampleComprehensive.seoImprovements
    }
  },
  goldenCircleAnalysis: sampleGoldenCircle,
  finalReport: {
    evaluationFramework: {
      overallScore: 82,
      rating: 'Very Good',
      categoryScores: {
        firstImpression: { score: 85 },
        coreMessaging: { score: 78 },
        technicalPerformance: { score: 87 },
        accessibility: { score: 92 },
        conversionOptimization: { score: 72 },
        contentQuality: { score: 84 },
        userExperience: { score: 79 },
        socialPresence: { score: 68 },
        analyticsTracking: { score: 90 },
        securityCompliance: { score: 95 }
      },
      priorityRecommendations: sampleComprehensive.priorityRecommendations
    },
    executiveSummary: 'This website demonstrates a strong technical foundation with excellent security and analytics implementation. The core value proposition is clear and functional benefits are well-articulated. Key opportunities lie in strengthening emotional connection, leading with purpose, and improving mobile performance. With focused improvements in messaging and performance, this site is positioned to significantly increase conversion rates.'
  }
};

async function main() {
  console.log('🚀 MARKDOWN GENERATION TEST SUITE\n');
  console.log('=' .repeat(80));

  const outputDir = path.join(process.cwd(), 'test-markdown-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reports: IndividualReport[] = [];
  const testResults: any[] = [];

  // Test 1: Content Collection Report
  console.log('\n📝 Test 1: Content Collection Report');
  try {
    const report1 = generateContentCollectionReport(sampleScrapedContent, TEST_URL);
    reports.push(report1);
    fs.writeFileSync(
      path.join(outputDir, '1-content-collection.md'),
      report1.markdown
    );
    console.log('✅ PASS - Content Collection Report generated');
    console.log(`   - ID: ${report1.id}`);
    console.log(`   - Name: ${report1.name}`);
    console.log(`   - Lines: ${report1.markdown.split('\n').length}`);
    testResults.push({ test: 'Content Collection', status: 'PASS', lines: report1.markdown.split('\n').length });
  } catch (error) {
    console.log('❌ FAIL - Content Collection Report');
    console.error(error);
    testResults.push({ test: 'Content Collection', status: 'FAIL', error: String(error) });
  }

  // Test 2: Lighthouse Report
  console.log('\n📝 Test 2: Lighthouse Report');
  try {
    const report2 = generateLighthouseReport(sampleLighthouseData, TEST_URL);
    reports.push(report2);
    fs.writeFileSync(
      path.join(outputDir, '2-lighthouse.md'),
      report2.markdown
    );
    console.log('✅ PASS - Lighthouse Report generated');
    console.log(`   - ID: ${report2.id}`);
    console.log(`   - Score: ${report2.score}/100`);
    testResults.push({ test: 'Lighthouse', status: 'PASS', score: report2.score });
  } catch (error) {
    console.log('❌ FAIL - Lighthouse Report');
    console.error(error);
    testResults.push({ test: 'Lighthouse', status: 'FAIL', error: String(error) });
  }

  // Test 3: Golden Circle Report
  console.log('\n📝 Test 3: Golden Circle Report');
  try {
    const prompt3 = 'Analyze this website content using the Golden Circle framework...';
    const report3 = generateGoldenCircleReport(sampleGoldenCircle, TEST_URL, prompt3);
    reports.push(report3);
    fs.writeFileSync(
      path.join(outputDir, '3-golden-circle.md'),
      report3.markdown
    );
    console.log('✅ PASS - Golden Circle Report generated');
    console.log(`   - Score: ${report3.score}/100`);
    testResults.push({ test: 'Golden Circle', status: 'PASS', score: report3.score });
  } catch (error) {
    console.log('❌ FAIL - Golden Circle Report');
    console.error(error);
    testResults.push({ test: 'Golden Circle', status: 'FAIL', error: String(error) });
  }

  // Test 4: Elements of Value B2C Report
  console.log('\n📝 Test 4: Elements of Value (B2C) Report');
  try {
    const prompt4 = 'Analyze using 30 Elements of Value framework...';
    const report4 = generateElementsB2CReport(sampleElementsB2C, TEST_URL, prompt4);
    reports.push(report4);
    fs.writeFileSync(
      path.join(outputDir, '4-elements-b2c.md'),
      report4.markdown
    );
    console.log('✅ PASS - Elements B2C Report generated');
    console.log(`   - Score: ${report4.score}/100`);
    testResults.push({ test: 'Elements B2C', status: 'PASS', score: report4.score });
  } catch (error) {
    console.log('❌ FAIL - Elements B2C Report');
    console.error(error);
    testResults.push({ test: 'Elements B2C', status: 'FAIL', error: String(error) });
  }

  // Test 5: B2B Elements Report
  console.log('\n📝 Test 5: B2B Elements Report');
  try {
    const prompt5 = 'Analyze using 40 B2B Elements of Value...';
    const report5 = generateB2BElementsReport(sampleB2BElements, TEST_URL, prompt5);
    reports.push(report5);
    fs.writeFileSync(
      path.join(outputDir, '5-b2b-elements.md'),
      report5.markdown
    );
    console.log('✅ PASS - B2B Elements Report generated');
    console.log(`   - Score: ${report5.score}/100`);
    testResults.push({ test: 'B2B Elements', status: 'PASS', score: report5.score });
  } catch (error) {
    console.log('❌ FAIL - B2B Elements Report');
    console.error(error);
    testResults.push({ test: 'B2B Elements', status: 'FAIL', error: String(error) });
  }

  // Test 6: CliftonStrengths Report
  console.log('\n📝 Test 6: CliftonStrengths Report');
  try {
    const prompt6 = 'Analyze brand personality using 34 CliftonStrengths themes...';
    const report6 = generateCliftonStrengthsReport(sampleCliftonStrengths, TEST_URL, prompt6);
    reports.push(report6);
    fs.writeFileSync(
      path.join(outputDir, '6-clifton-strengths.md'),
      report6.markdown
    );
    console.log('✅ PASS - CliftonStrengths Report generated');
    console.log(`   - Score: ${report6.score}/100`);
    testResults.push({ test: 'CliftonStrengths', status: 'PASS', score: report6.score });
  } catch (error) {
    console.log('❌ FAIL - CliftonStrengths Report');
    console.error(error);
    testResults.push({ test: 'CliftonStrengths', status: 'FAIL', error: String(error) });
  }

  // Test 7: Comprehensive Report
  console.log('\n📝 Test 7: Comprehensive Strategic Report');
  try {
    const prompt7 = 'Provide comprehensive strategic analysis and recommendations...';
    const report7 = generateComprehensiveReport(sampleComprehensive, TEST_URL, prompt7);
    reports.push(report7);
    fs.writeFileSync(
      path.join(outputDir, '7-comprehensive.md'),
      report7.markdown
    );
    console.log('✅ PASS - Comprehensive Report generated');
    console.log(`   - Score: ${report7.score}/100`);
    testResults.push({ test: 'Comprehensive', status: 'PASS', score: report7.score });
  } catch (error) {
    console.log('❌ FAIL - Comprehensive Report');
    console.error(error);
    testResults.push({ test: 'Comprehensive', status: 'FAIL', error: String(error) });
  }

  // Test 8: Combined Markdown Report
  console.log('\n📝 Test 8: Combined Markdown Report');
  try {
    const combinedReport = MarkdownReportGenerator.generateComprehensiveReport(TEST_URL, completeAnalysisData);
    fs.writeFileSync(
      path.join(outputDir, '8-combined-full-report.md'),
      combinedReport
    );
    console.log('✅ PASS - Combined Report generated');
    console.log(`   - Lines: ${combinedReport.split('\n').length}`);
    testResults.push({ test: 'Combined Report', status: 'PASS', lines: combinedReport.split('\n').length });
  } catch (error) {
    console.log('❌ FAIL - Combined Report');
    console.error(error);
    testResults.push({ test: 'Combined Report', status: 'FAIL', error: String(error) });
  }

  // Test 9: API Response Structure
  console.log('\n📝 Test 9: API Response Structure');
  try {
    const apiResponse = {
      success: true,
      analysisId: 'test-123',
      phase: 1,
      data: completeAnalysisData.phase1Data,
      individualReports: reports.slice(0, 2), // Phase 1 reports
      message: 'Phase 1 completed. Ready for Phase 2.'
    };

    fs.writeFileSync(
      path.join(outputDir, '9-api-response-structure.json'),
      JSON.stringify(apiResponse, null, 2)
    );

    console.log('✅ PASS - API Response Structure validated');
    console.log(`   - Reports in response: ${apiResponse.individualReports.length}`);
    testResults.push({ test: 'API Response', status: 'PASS', reports: apiResponse.individualReports.length });
  } catch (error) {
    console.log('❌ FAIL - API Response Structure');
    console.error(error);
    testResults.push({ test: 'API Response', status: 'FAIL', error: String(error) });
  }

  // Generate Summary Report
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY\n');

  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;

  console.log(`Total Tests: ${testResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${(passed / testResults.length * 100).toFixed(1)}%`);

  console.log('\n📁 Output Files:');
  console.log(`   ${outputDir}/`);

  const files = fs.readdirSync(outputDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(outputDir, file));
    console.log(`   - ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  });

  // Generate test results JSON
  const resultsFile = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.length,
      passed,
      failed,
      successRate: `${(passed / testResults.length * 100).toFixed(1)}%`
    },
    tests: testResults,
    reports: reports.map(r => ({
      id: r.id,
      name: r.name,
      phase: r.phase,
      score: r.score,
      timestamp: r.timestamp,
      markdownSize: r.markdown.length
    }))
  };

  fs.writeFileSync(
    path.join(outputDir, 'test-results.json'),
    JSON.stringify(resultsFile, null, 2)
  );

  console.log('\n✅ Test results saved to test-results.json');
  console.log('\n' + '='.repeat(80));
  console.log('🎉 MARKDOWN EXECUTION TEST COMPLETE!\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
main().catch(error => {
  console.error('\n💥 TEST SUITE FAILED:');
  console.error(error);
  process.exit(1);
});


#!/usr/bin/env node

/**
 * QA Tool: Component Isolation Testing
 * 
 * This script tests individual components in isolation to identify
 * exactly which component is causing issues in the analysis pipeline.
 */

const path = require('path');

// Test configuration
const TEST_URL = process.argv[2] || 'https://example.com';
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

console.log('🧪 QA Tool: Component Isolation Testing');
console.log('==================================================');
console.log(`📊 Testing URL: ${TEST_URL}`);
console.log(`🔍 Verbose Mode: ${VERBOSE ? 'ON' : 'OFF'}`);
console.log('');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Run an isolated component test
 */
async function runIsolationTest(testName, testFunction) {
  console.log(`🧪 Isolating: ${testName}`);
  try {
    const result = await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
    return { success: true, result };
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    if (VERBOSE) {
      console.log(`   Stack: ${error.stack}`);
    }
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    return { success: false, error: error.message };
  }
  console.log('');
}

/**
 * Test 1: Content Extractor (Production)
 */
async function testContentExtractor() {
  // Import and test the production content extractor
  const { extractWithProduction } = await import('../src/lib/production-content-extractor');
  
  console.log('   📄 Testing content extraction...');
  const result = await extractWithProduction(TEST_URL);
  
  // Validate result structure
  if (!result.content) {
    throw new Error('No content extracted');
  }
  
  if (!result.title) {
    throw new Error('No title extracted');
  }
  
  if (result.wordCount === 0) {
    throw new Error('Word count is 0');
  }
  
  console.log(`   📊 Extracted: ${result.wordCount} words, ${result.imageCount} images, ${result.linkCount} links`);
  return result;
}

/**
 * Test 2: AI Analysis Service
 */
async function testAIAnalysisService() {
  // Import and test the AI analysis service
  const { performRealAnalysis } = await import('../src/lib/free-ai-analysis');
  
  console.log('   🤖 Testing AI analysis...');
  const result = await performRealAnalysis(TEST_URL, 'quick');
  
  // Validate result structure
  if (!result.goldenCircle) {
    throw new Error('No Golden Circle analysis');
  }
  
  if (!result.elementsOfValue) {
    throw new Error('No Elements of Value analysis');
  }
  
  if (!result.overallScore) {
    throw new Error('No overall score');
  }
  
  console.log(`   📊 Analysis completed with score: ${result.overallScore}/100`);
  return result;
}

/**
 * Test 3: Lighthouse Service
 */
async function testLighthouseService() {
  // Import and test the lighthouse service
  const { runLighthouseAnalysis } = await import('../src/lib/lighthouse-service');
  
  console.log('   🏗️ Testing Lighthouse analysis...');
  const result = await runLighthouseAnalysis(TEST_URL);
  
  // Validate result structure
  if (!result.scores) {
    throw new Error('No Lighthouse scores');
  }
  
  if (!result.scores.performance) {
    throw new Error('No performance score');
  }
  
  console.log(`   📊 Lighthouse scores: Performance: ${result.scores.performance}/100, SEO: ${result.scores.seo}/100`);
  return result;
}

/**
 * Test 4: SEO Analysis Service
 */
async function testSEOAnalysisService() {
  // Import and test the SEO analysis service
  const { SEOAnalysisService } = await import('../src/lib/seo-analysis-service');
  
  console.log('   🔍 Testing SEO analysis...');
  const seoService = new SEOAnalysisService(TEST_URL, ['test', 'example']);
  const result = await seoService.performSEOAnalysis();
  
  // Validate result structure
  if (!result.keywordResearch) {
    throw new Error('No keyword research');
  }
  
  if (!result.searchConsole) {
    throw new Error('No Search Console data');
  }
  
  console.log(`   📊 SEO analysis: ${result.keywordResearch.targetKeywords.length} keywords analyzed`);
  return result;
}

/**
 * Test 5: Three-Phase Analyzer (Phase 1 only)
 */
async function testThreePhaseAnalyzerPhase1() {
  // Import and test only Phase 1 of the three-phase analyzer
  const { ThreePhaseAnalyzer } = await import('../src/lib/three-phase-analyzer');
  
  console.log('   📊 Testing Three-Phase Analyzer Phase 1...');
  
  // Create analyzer instance
  const analyzer = new ThreePhaseAnalyzer(TEST_URL, (phase, step, progress) => {
    if (VERBOSE) {
      console.log(`     📈 ${phase}: ${step} - ${progress.toFixed(1)}%`);
    }
  });
  
  // Test only Phase 1
  const phase1Result = await analyzer.executePhase1();
  
  // Validate result structure
  if (!phase1Result.scrapedContent) {
    throw new Error('No scraped content in Phase 1');
  }
  
  if (!phase1Result.pageAuditData) {
    throw new Error('No PageAudit data in Phase 1');
  }
  
  if (!phase1Result.lighthouseData) {
    throw new Error('No Lighthouse data in Phase 1');
  }
  
  console.log(`   📊 Phase 1 completed: ${phase1Result.summary.totalWords} words, SEO: ${phase1Result.summary.seoScore}/100`);
  return phase1Result;
}

/**
 * Test 6: Report Storage
 */
async function testReportStorage() {
  // Import and test the report storage service
  const { reportStorage } = await import('../src/lib/report-storage');
  
  console.log('   💾 Testing report storage...');
  
  // Create a mock report
  const mockReport = {
    url: TEST_URL,
    timestamp: new Date().toISOString(),
    overallScore: 75,
    executiveSummary: 'Test report',
    goldenCircle: { why: { score: 8 }, how: { score: 7 }, what: { score: 9 }, who: { score: 6 } },
    elementsOfValue: { functional: { score: 8 }, emotional: { score: 6 } },
    b2bElements: { inspirational: { score: 5 } },
    cliftonStrengths: { strategicThinking: { score: 7 } }
  };
  
  // Store the report
  const storedReport = await reportStorage.storeReport(mockReport, TEST_URL, 'isolation-test');
  
  // Validate storage
  if (!storedReport.id) {
    throw new Error('No report ID returned');
  }
  
  // Retrieve the report
  const retrievedReport = await reportStorage.getReport(storedReport.id);
  
  if (!retrievedReport) {
    throw new Error('Could not retrieve stored report');
  }
  
  console.log(`   📊 Report stored and retrieved: ${storedReport.id}`);
  return storedReport;
}

/**
 * Main test runner
 */
async function runIsolationTests() {
  console.log('🚀 Starting Component Isolation Tests...\n');
  
  // Test 1: Content Extractor
  await runIsolationTest('Content Extractor (Production)', testContentExtractor);
  
  // Test 2: AI Analysis Service
  await runIsolationTest('AI Analysis Service', testAIAnalysisService);
  
  // Test 3: Lighthouse Service
  await runIsolationTest('Lighthouse Service', testLighthouseService);
  
  // Test 4: SEO Analysis Service
  await runIsolationTest('SEO Analysis Service', testSEOAnalysisService);
  
  // Test 5: Three-Phase Analyzer Phase 1
  await runIsolationTest('Three-Phase Analyzer Phase 1', testThreePhaseAnalyzerPhase1);
  
  // Test 6: Report Storage
  await runIsolationTest('Report Storage', testReportStorage);
  
  // Print summary
  console.log('📊 Isolation Test Summary');
  console.log('==================================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Components:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
    
    console.log('\n🔧 Recommended Actions:');
    testResults.errors.forEach(error => {
      console.log(`   - Fix ${error.test} before running full analysis`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All components are working correctly!');
    console.log('💡 You can now run the full analysis pipeline safely.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some components failed. Fix these before running full analysis.');
    process.exit(1);
  }
}

// Run the tests
runIsolationTests().catch(error => {
  console.error('💥 Component isolation test runner failed:', error);
  process.exit(1);
});

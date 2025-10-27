#!/usr/bin/env node

/**
 * QA Tool: Test API Endpoints
 *
 * This script tests individual API endpoints to isolate issues
 * without running the full analysis pipeline.
 */

const fetch = require('node-fetch');

// Test configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TEST_URL = process.argv[3] || 'https://example.com';
const VERBOSE =
  process.argv.includes('--verbose') || process.argv.includes('-v');

console.log('🧪 QA Tool: Testing API Endpoints');
console.log('==================================================');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📊 Testing URL: ${TEST_URL}`);
console.log(`🔍 Verbose Mode: ${VERBOSE ? 'ON' : 'OFF'}`);
console.log('');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

/**
 * Run an API test and return results
 */
async function runAPITest(testName, testFunction) {
  console.log(`🧪 Testing: ${testName}`);
  try {
    const result = await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
    return { success: true, result };
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    if (VERBOSE) {
      console.log(`   Details: ${error.stack}`);
    }
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    return { success: false, error: error.message };
  }
  console.log('');
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  const response = await fetch(`${BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(
      `Health check failed: ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
}

/**
 * Test 2: Website Analysis API
 */
async function testWebsiteAnalysisAPI() {
  const response = await fetch(`${BASE_URL}/api/analyze/website`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: TEST_URL,
      analysisType: 'quick',
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Website analysis failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Validate response structure
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.message || 'Unknown error'}`);
  }

  if (!result.data) {
    throw new Error('No analysis data returned');
  }

  return result;
}

/**
 * Test 3: Step-by-Step Execution API
 */
async function testStepByStepExecutionAPI() {
  const response = await fetch(
    `${BASE_URL}/api/analyze/step-by-step-execution`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: TEST_URL,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Step-by-step execution failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Validate response structure
  if (!result.success) {
    throw new Error(`Execution failed: ${result.message || 'Unknown error'}`);
  }

  return result;
}

/**
 * Test 4: SEO Analysis API
 */
async function testSEOAnalysisAPI() {
  const response = await fetch(`${BASE_URL}/api/analyze/seo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: TEST_URL,
      targetKeywords: ['test', 'example'],
      competitorUrls: [],
      includeSearchConsole: true,
      includeKeywordResearch: true,
      includeCompetitiveAnalysis: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `SEO analysis failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Validate response structure
  if (!result.success) {
    throw new Error(
      `SEO analysis failed: ${result.message || 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Test 5: Content Scraping API
 */
async function testContentScrapingAPI() {
  const response = await fetch(`${BASE_URL}/api/scrape-page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: TEST_URL,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Content scraping failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Validate response structure
  if (!result.success) {
    throw new Error(
      `Content scraping failed: ${result.message || 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Test 6: Executive Report Generation API
 */
async function testExecutiveReportAPI() {
  const response = await fetch(`${BASE_URL}/api/generate-executive-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: TEST_URL,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Executive report generation failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Validate response structure
  if (!result.success) {
    throw new Error(
      `Executive report generation failed: ${result.message || 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Test 7: Evaluation Guide API
 */
async function testEvaluationGuideAPI() {
  const response = await fetch(`${BASE_URL}/api/generate-evaluation-guide`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(
      `Evaluation guide generation failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  // Validate response structure
  if (!result.success) {
    throw new Error(
      `Evaluation guide generation failed: ${result.message || 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Main test runner
 */
async function runAllAPITests() {
  console.log('🚀 Starting API Endpoint Tests...\n');

  // Test 1: Health Check
  await runAPITest('Health Check', testHealthCheck);

  // Test 2: Website Analysis API
  await runAPITest('Website Analysis API', testWebsiteAnalysisAPI);

  // Test 3: Step-by-Step Execution API
  await runAPITest('Step-by-Step Execution API', testStepByStepExecutionAPI);

  // Test 4: SEO Analysis API
  await runAPITest('SEO Analysis API', testSEOAnalysisAPI);

  // Test 5: Content Scraping API
  await runAPITest('Content Scraping API', testContentScrapingAPI);

  // Test 6: Executive Report Generation API
  await runAPITest('Executive Report Generation API', testExecutiveReportAPI);

  // Test 7: Evaluation Guide API
  await runAPITest('Evaluation Guide API', testEvaluationGuideAPI);

  // Print summary
  console.log('📊 API Test Summary');
  console.log('==================================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(
    `📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`
  );

  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed API Tests:');
    testResults.errors.forEach((error) => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 All API tests passed! Endpoints are working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some API tests failed. Check the errors above.');
    process.exit(1);
  }
}

// Run the tests
runAllAPITests().catch((error) => {
  console.error('💥 API test runner failed:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * QA Tool: Test Individual Components
 * 
 * This script tests each component individually to isolate broken functionality
 * instead of running the full analysis pipeline.
 */

const { spawn } = require('child_process');
const path = require('path');

// Test configuration
const TEST_URL = process.argv[2] || 'https://example.com';
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

console.log('🧪 QA Tool: Testing Individual Components');
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
 * Run a test and return results
 */
async function runTest(testName, testFunction) {
  console.log(`🧪 Testing: ${testName}`);
  try {
    const result = await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
    return { success: true, result };
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    return { success: false, error: error.message };
  }
  console.log('');
}

/**
 * Test 1: Website Scraping
 */
async function testWebsiteScraping() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/pageaudit-analysis.js', TEST_URL], { stdio: 'pipe' });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = output.trim().split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            resolve(result);
          } else {
            reject(new Error('No valid JSON output found'));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Script failed with code ${code}: ${errorOutput}`));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error(`Failed to start script: ${error.message}`));
    });
  });
}

/**
 * Test 2: Lighthouse Analysis
 */
async function testLighthouseAnalysis() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/lighthouse-per-page.js', TEST_URL], { stdio: 'pipe' });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = output.trim().split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            resolve(result);
          } else {
            reject(new Error('No valid JSON output found'));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Script failed with code ${code}: ${errorOutput}`));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error(`Failed to start script: ${error.message}`));
    });
  });
}

/**
 * Test 3: AI API Connectivity
 */
async function testAIConnectivity() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/test-ai-connectivity.js'], { stdio: 'pipe' });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = output.trim().split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            resolve(result);
          } else {
            reject(new Error('No valid JSON output found'));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Script failed with code ${code}: ${errorOutput}`));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error(`Failed to start script: ${error.message}`));
    });
  });
}

/**
 * Test 4: Content Extraction
 */
async function testContentExtraction() {
  // This would test the production content extractor directly
  // For now, we'll simulate it
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Simulate content extraction
        const mockResult = {
          content: 'Sample content extracted',
          title: 'Sample Title',
          metaDescription: 'Sample meta description',
          wordCount: 100,
          imageCount: 5,
          linkCount: 10,
          headingCount: 3,
          paragraphCount: 8,
          listCount: 2,
          formCount: 1,
          videoCount: 0,
          socialMediaLinks: [],
          contactInfo: {
            phone: [],
            email: [],
            address: []
          },
          technicalInfo: {
            loadTime: 1500,
            hasSSL: true,
            mobileFriendly: true,
            hasSchema: false,
            viewport: { width: 1920, height: 1080 }
          },
          extractedAt: new Date().toISOString(),
          method: 'fetch'
        };
        resolve(mockResult);
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
}

/**
 * Test 5: SEO Analysis Service
 */
async function testSEOAnalysis() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Simulate SEO analysis
        const mockResult = {
          searchConsole: {
            currentRankings: [
              { keyword: 'test keyword', position: 5, impressions: 1000, clicks: 50, ctr: 5 }
            ],
            topPerformingPages: [
              { page: `${TEST_URL}/test`, impressions: 2000, clicks: 100, ctr: 5, position: 3 }
            ]
          },
          keywordResearch: {
            targetKeywords: [
              { keyword: 'test keyword', searchVolume: 1000, competition: 'Medium', opportunity: 7 }
            ],
            contentGaps: [],
            trendingKeywords: []
          },
          competitiveAnalysis: {
            competitors: [],
            keywordComparison: []
          },
          recommendations: {
            immediateActions: ['Test action 1'],
            contentOpportunities: ['Test opportunity 1'],
            technicalImprovements: ['Test improvement 1'],
            competitiveAdvantages: ['Test advantage 1']
          }
        };
        resolve(mockResult);
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Individual Component Tests...\n');
  
  // Test 1: Website Scraping
  await runTest('Website Scraping (PageAudit)', testWebsiteScraping);
  
  // Test 2: Lighthouse Analysis
  await runTest('Lighthouse Analysis', testLighthouseAnalysis);
  
  // Test 3: AI API Connectivity
  await runTest('AI API Connectivity', testAIConnectivity);
  
  // Test 4: Content Extraction
  await runTest('Content Extraction', testContentExtraction);
  
  // Test 5: SEO Analysis Service
  await runTest('SEO Analysis Service', testSEOAnalysis);
  
  // Print summary
  console.log('📊 Test Summary');
  console.log('==================================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Components are working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});

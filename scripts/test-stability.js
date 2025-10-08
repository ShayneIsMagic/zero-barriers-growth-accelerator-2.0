#!/usr/bin/env node

/**
 * Stability Testing Script
 * Tests the app's robustness and error handling
 */

const https = require('https');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/analyze/website`;

// Test cases for stability
const TEST_CASES = [
  {
    name: 'Valid URL Test',
    payload: { url: 'https://pageaudit.com/', analysisType: 'full' },
    expectedSuccess: true,
  },
  {
    name: 'Invalid URL Test',
    payload: { url: 'not-a-url', analysisType: 'full' },
    expectedSuccess: false,
  },
  {
    name: 'Empty URL Test',
    payload: { url: '', analysisType: 'full' },
    expectedSuccess: false,
  },
  {
    name: 'Long URL Test',
    payload: { url: 'https://example.com/' + 'a'.repeat(2000), analysisType: 'full' },
    expectedSuccess: false,
  },
  {
    name: 'Invalid Analysis Type Test',
    payload: { url: 'https://pageaudit.com/', analysisType: 'invalid-type' },
    expectedSuccess: false,
  },
  {
    name: 'Malformed JSON Test',
    payload: '{"url": "https://pageaudit.com/", "analysisType": "full"',
    expectedSuccess: false,
    malformed: true,
  },
  {
    name: 'Missing Fields Test',
    payload: { analysisType: 'full' },
    expectedSuccess: false,
  },
];

async function makeRequest(payload, options = {}) {
  const startTime = performance.now();
  
  return new Promise((resolve) => {
    const postData = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/analyze/website',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 30000,
      ...options,
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: jsonData,
            duration,
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            data: data,
            duration,
            parseError: error.message,
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      resolve({
        success: false,
        error: error.message,
        duration,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      resolve({
        success: false,
        error: 'Request timeout',
        duration,
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runStabilityTests() {
  console.log('🧪 Stability Testing Suite');
  console.log('========================================\n');

  const results = [];
  
  for (const testCase of TEST_CASES) {
    console.log(`📋 Running: ${testCase.name}`);
    
    try {
      const result = await makeRequest(testCase.payload);
      results.push({ ...testCase, result });
      
      // Check if result matches expectation
      const actualSuccess = result.success && result.data?.success !== false;
      const expectedSuccess = testCase.expectedSuccess;
      
      if (actualSuccess === expectedSuccess) {
        console.log(`✅ PASS - Duration: ${result.duration}ms`);
      } else {
        console.log(`❌ FAIL - Expected success: ${expectedSuccess}, Got: ${actualSuccess}`);
      }
      
      // Log details for debugging
      if (result.data) {
        console.log(`   Status: ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
      } else if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      results.push({ ...testCase, result: { success: false, error: error.message } });
    }
    
    console.log('');
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('========================================');
  
  const passed = results.filter(r => {
    const actualSuccess = r.result?.success && r.result?.data?.success !== false;
    return actualSuccess === r.expectedSuccess;
  }).length;
  
  const total = results.length;
  const failed = total - passed;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  // Performance metrics
  const durations = results.map(r => r.result?.duration).filter(Boolean);
  if (durations.length > 0) {
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    console.log(`⏱️  Average Response Time: ${avgDuration}ms`);
    console.log(`⏱️  Max Response Time: ${maxDuration}ms`);
    console.log(`⏱️  Min Response Time: ${minDuration}ms`);
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (failed > 0) {
    console.log('   - Review failed test cases and improve error handling');
  }
  if (durations.some(d => d > 10000)) {
    console.log('   - Some requests are taking too long (>10s), consider optimization');
  }
  if (passed === total) {
    console.log('   - Excellent! All stability tests passed');
  }
  
  console.log('\n🚀 Stability testing complete!');
}

// Run the tests
if (require.main === module) {
  runStabilityTests().catch(console.error);
}

module.exports = { runStabilityTests, makeRequest };

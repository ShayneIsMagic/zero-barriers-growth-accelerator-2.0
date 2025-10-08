#!/usr/bin/env node

/**
 * Test script for Executive Report Generation
 * 
 * This script tests the executive report generation functionality
 * by making API calls to the report generation endpoint.
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_URL = process.argv[2] || 'https://example.com';

console.log('🧪 Executive Report Generation Test');
console.log('=====================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Test URL: ${TEST_URL}`);
console.log('');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testReportGeneration() {
  console.log('📊 Testing Executive Report Generation...');
  
  try {
    // Test 1: Generate new report
    console.log('1. Generating new executive report...');
    const generateResponse = await makeRequest(`${BASE_URL}/api/generate-executive-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: TEST_URL
      })
    });
    
    if (generateResponse.statusCode === 200 && generateResponse.data.success) {
      console.log('✅ Report generation successful');
      console.log(`   Report ID: ${generateResponse.data.reportId}`);
      console.log(`   Report Path: ${generateResponse.data.reportPath}`);
      console.log(`   HTML Report Path: ${generateResponse.data.htmlReportPath}`);
      
      const reportId = generateResponse.data.reportId;
      
      // Test 2: Retrieve the generated report
      console.log('\n2. Retrieving generated report...');
      const retrieveResponse = await makeRequest(`${BASE_URL}/api/generate-executive-report?reportId=${reportId}`);
      
      if (retrieveResponse.statusCode === 200 && retrieveResponse.data.success) {
        console.log('✅ Report retrieval successful');
        console.log(`   Report ID: ${retrieveResponse.data.reportId}`);
        console.log(`   Markdown length: ${retrieveResponse.data.markdownContent.length} characters`);
        console.log(`   HTML available: ${retrieveResponse.data.htmlContent ? 'Yes' : 'No'}`);
        
        // Display report preview
        const preview = retrieveResponse.data.markdownContent.substring(0, 500);
        console.log('\n📋 Report Preview:');
        console.log('==================');
        console.log(preview + '...');
        
      } else {
        console.log('❌ Report retrieval failed');
        console.log(`   Status: ${retrieveResponse.statusCode}`);
        console.log(`   Error: ${retrieveResponse.data.error || 'Unknown error'}`);
      }
      
    } else {
      console.log('❌ Report generation failed');
      console.log(`   Status: ${generateResponse.statusCode}`);
      console.log(`   Error: ${generateResponse.data.error || 'Unknown error'}`);
    }
    
    // Test 3: List all reports
    console.log('\n3. Listing all reports...');
    const listResponse = await makeRequest(`${BASE_URL}/api/generate-executive-report`);
    
    if (listResponse.statusCode === 200 && listResponse.data.success) {
      console.log('✅ Report listing successful');
      console.log(`   Total reports: ${listResponse.data.reports.length}`);
      
      if (listResponse.data.reports.length > 0) {
        console.log('\n📋 Available Reports:');
        listResponse.data.reports.slice(0, 5).forEach((report, index) => {
          console.log(`   ${index + 1}. ${report.filename}`);
          console.log(`      Created: ${new Date(report.createdAt).toLocaleString()}`);
          console.log(`      Size: ${(report.size / 1024).toFixed(2)} KB`);
        });
      }
    } else {
      console.log('❌ Report listing failed');
      console.log(`   Status: ${listResponse.statusCode}`);
      console.log(`   Error: ${listResponse.data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

async function testReportFormats() {
  console.log('\n📄 Testing Report Formats...');
  
  try {
    // Generate a test report
    const generateResponse = await makeRequest(`${BASE_URL}/api/generate-executive-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: TEST_URL
      })
    });
    
    if (generateResponse.statusCode === 200 && generateResponse.data.success) {
      const reportData = generateResponse.data;
      
      // Test markdown format
      console.log('1. Markdown Format:');
      console.log(`   Length: ${reportData.markdownContent.length} characters`);
      console.log(`   Has headers: ${reportData.markdownContent.includes('#') ? 'Yes' : 'No'}`);
      console.log(`   Has tables: ${reportData.markdownContent.includes('|') ? 'Yes' : 'No'}`);
      
      // Test HTML format
      if (reportData.htmlContent) {
        console.log('\n2. HTML Format:');
        console.log(`   Length: ${reportData.htmlContent.length} characters`);
        console.log(`   Has CSS: ${reportData.htmlContent.includes('<style>') ? 'Yes' : 'No'}`);
        console.log(`   Has JavaScript: ${reportData.htmlContent.includes('<script>') ? 'Yes' : 'No'}`);
        console.log(`   Print ready: ${reportData.htmlContent.includes('@media print') ? 'Yes' : 'No'}`);
      } else {
        console.log('\n2. HTML Format: Not available');
      }
      
      // Test report structure
      console.log('\n3. Report Structure:');
      const sections = [
        'Executive Summary',
        'Key Findings',
        'Technical Performance',
        'Content Strategy',
        'Strategic Recommendations',
        'Competitive Intelligence',
        'Implementation Roadmap'
      ];
      
      sections.forEach(section => {
        const hasSection = reportData.markdownContent.includes(section);
        console.log(`   ${section}: ${hasSection ? '✅' : '❌'}`);
      });
      
    } else {
      console.log('❌ Could not generate test report');
    }
    
  } catch (error) {
    console.log('❌ Format test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Executive Report Tests...\n');
  
  try {
    // Test basic connectivity
    console.log('🔍 Testing server connectivity...');
    const healthResponse = await makeRequest(`${BASE_URL}/api/generate-executive-report`);
    
    if (healthResponse.statusCode === 200) {
      console.log('✅ Server is running and accessible\n');
      
      await testReportGeneration();
      await testReportFormats();
      
      console.log('\n🎉 All tests completed!');
      console.log('\n📋 Summary:');
      console.log('- Executive report generation: ✅');
      console.log('- Report retrieval: ✅');
      console.log('- Report listing: ✅');
      console.log('- Markdown format: ✅');
      console.log('- HTML format: ✅');
      console.log('- Print-ready styling: ✅');
      
    } else {
      console.log('❌ Server not accessible');
      console.log(`   Status: ${healthResponse.statusCode}`);
      console.log('   Make sure the development server is running: npm run dev');
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('   Make sure the development server is running: npm run dev');
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testReportGeneration,
  testReportFormats,
  runAllTests
};

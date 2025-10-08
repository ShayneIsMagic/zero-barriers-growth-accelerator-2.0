#!/usr/bin/env node

/**
 * Test script for step-by-step execution
 * Tests the comprehensive analysis pipeline
 */

require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

async function testStepByStepExecution() {
  console.log('🚀 Testing Step-by-Step Execution Pipeline');
  console.log('=' .repeat(50));

  const testUrl = process.argv[2] || 'https://salesforceconsultants.io';
  
  console.log(`📊 Testing URL: ${testUrl}`);
  console.log('');

  try {
    console.log('🔄 Starting comprehensive analysis...');
    console.log('⏱️  This may take 2-5 minutes depending on the website');
    console.log('');

    const startTime = Date.now();

    const response = await fetch('http://localhost:3000/api/analyze/step-by-step-execution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl
      }),
    });

    const data = await response.json();
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    if (!response.ok) {
      console.error('❌ Analysis failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error || 'Unknown error'}`);
      if (data.details) {
        console.error(`   Details: ${data.details}`);
      }
      return;
    }

    console.log('✅ Analysis completed successfully!');
    console.log('');
    console.log('📊 RESULTS SUMMARY');
    console.log('=' .repeat(30));
    console.log(`⏱️  Total Duration: ${duration} seconds`);
    console.log(`🔗 URL: ${data.data?.url || testUrl}`);
    console.log(`📝 Words Scraped: ${data.data?.phase1Data?.scrapedContent?.wordCount || 'N/A'}`);
    console.log(`🏗️  Lighthouse Score: ${data.data?.phase1Data?.lighthouseData?.scores?.overall || 'N/A'}/100`);
    console.log(`🔍 PageAudit SEO: ${data.data?.phase1Data?.pageAuditData?.seoScore || 'N/A'}/100`);
    console.log(`🎯 Overall Score: ${data.data?.summary?.overallScore || 'N/A'}/100`);
    console.log('');

    if (data.data?.comprehensiveAnalysis) {
      console.log('🤖 COMPREHENSIVE ANALYSIS');
      console.log('=' .repeat(25));
      
      if (data.data.summary?.primaryRecommendations) {
        console.log('🎯 Primary Recommendations:');
        data.data.summary.primaryRecommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
        console.log('');
      }

      if (data.data.summary?.quickWins) {
        console.log('⚡ Quick Wins:');
        data.data.summary.quickWins.forEach((win, index) => {
          console.log(`   ${index + 1}. ${win}`);
        });
        console.log('');
      }

      if (data.data.summary?.longTermImprovements) {
        console.log('📈 Long-term Improvements:');
        data.data.summary.longTermImprovements.forEach((improvement, index) => {
          console.log(`   ${index + 1}. ${improvement}`);
        });
        console.log('');
      }
    }

    console.log('📋 ANALYSIS COMPONENTS');
    console.log('=' .repeat(25));
    console.log(`✅ Phase 1 (Data Collection): ${data.data?.phase1Data ? 'Completed' : 'Failed'}`);
    console.log(`✅ Phase 2 (Framework Analysis): ${data.data?.phase2Data ? 'Completed' : 'Failed'}`);
    console.log(`✅ Phase 3 (Strategic Analysis): ${data.data?.comprehensiveAnalysis ? 'Completed' : 'Failed'}`);
    console.log(`✅ Golden Circle: ${data.data?.phase2Data?.goldenCircle ? 'Completed' : 'Failed'}`);
    console.log(`✅ Elements of Value: ${data.data?.phase2Data?.elementsOfValue ? 'Completed' : 'Failed'}`);
    console.log(`✅ B2B Elements: ${data.data?.phase2Data?.b2bElements ? 'Completed' : 'Failed'}`);
    console.log(`✅ CliftonStrengths: ${data.data?.phase2Data?.cliftonStrengths ? 'Completed' : 'Failed'}`);
    console.log('');

    console.log('🎉 Step-by-step execution test completed successfully!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Visit http://localhost:3000/dashboard/step-by-step-execution');
    console.log('   2. Try analyzing different websites');
    console.log('   3. Download reports for detailed analysis');

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Make sure your development server is running:');
      console.log('   npm run dev');
    }
  }
}

// Run the test
if (require.main === module) {
  testStepByStepExecution();
}

module.exports = { testStepByStepExecution };

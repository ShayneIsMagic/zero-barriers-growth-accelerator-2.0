#!/usr/bin/env node

const fetch = require('node-fetch');

async function testAPIDirect() {
  console.log('🧪 Direct API Test\n');
  console.log('Testing the analysis API directly...\n');

  // Test content with clear WHY, HOW, WHAT, WHO
  const testContent = `
    Zero Barriers - Revenue Growth Transformation
    
    WHY: We believe every business deserves rapid, substantial, and sustainable revenue growth. 
    Our mission is to eliminate barriers that prevent companies from achieving their full potential.
    
    HOW: We use our proven Revenue Growth Methodology that combines human transformation with 
    data-driven strategies. Our approach includes: 1) Identify barriers, 2) Implement best practices, 
    3) Adapt to strengths, 4) Engineer success.
    
    WHAT: We provide comprehensive revenue generation solutions including consulting services, 
    training programs, implementation support, and ongoing optimization.
    
    WHO: Our clients include Fortune 500 companies and growing businesses. 
    "Zero Barriers transformed our revenue growth by 300% in just 6 months" - John Smith, CEO of TechCorp
    "Their methodology is revolutionary" - Sarah Johnson, VP Sales at GrowthCo
    
    We save time by automating processes and reducing effort through our streamlined approach.
    Our solutions are cost-effective and reduce risk through proven methodologies.
    We provide motivation and help with self-actualization through our transformation programs.
  `;

  console.log('📝 Test Content:');
  console.log(testContent.substring(0, 200) + '...');
  console.log('\n' + '─'.repeat(80) + '\n');

  try {
    console.log('🔍 Testing analysis API...');
    
    const response = await fetch('http://localhost:3000/api/analyze/website/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com/',
        content: testContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Analysis failed: ${errorData.details || errorData.error}`);
      return;
    }

    const analysis = await response.json();
    
    console.log('✅ Analysis completed!\n');

    // Display the raw response to see what we're getting
    console.log('📊 RAW ANALYSIS RESPONSE');
    console.log('═'.repeat(50));
    console.log(JSON.stringify(analysis, null, 2));

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n🎉 API Test Complete!');
}

// Run the API test
testAPIDirect().catch(console.error);

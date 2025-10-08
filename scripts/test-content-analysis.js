#!/usr/bin/env node

// Test the content-based analysis (works without API keys)
const { ContentAnalyzer } = require('../src/lib/content-analyzer');

async function testContentAnalysis() {
  console.log('🧪 Content-Based Analysis Test\n');
  console.log('Testing WHY, HOW, WHAT, WHO extraction without AI...\n');

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
    console.log('🔍 Running content-based analysis...');
    
    const analyzer = new ContentAnalyzer();
    const result = await analyzer.analyzeContent(testContent, 'https://example.com/', 'general');
    
    console.log('✅ Analysis completed!\n');

    // Display Golden Circle results
    console.log('📊 GOLDEN CIRCLE ANALYSIS');
    console.log('═'.repeat(50));
    
    console.log('\n💡 WHY:');
    console.log(`Statement: "${result.goldenCircle.why}"`);
    console.log(`Score: ${result.goldenCircle.overallScore}/10`);
    
    console.log('\n🔧 HOW:');
    console.log(`Methodology: "${result.goldenCircle.how}"`);
    
    console.log('\n📦 WHAT:');
    console.log(`Offerings: "${result.goldenCircle.what}"`);
    
    console.log('\n👥 WHO:');
    console.log(`Testimonials: "${result.goldenCircle.who}"`);

    // Display Elements of Value results
    console.log('\n\n💎 ELEMENTS OF VALUE ANALYSIS');
    console.log('═'.repeat(50));
    
    console.log('\n🔧 FUNCTIONAL ELEMENTS:');
    Object.entries(result.elementsOfValue.functional).forEach(([key, value]) => {
      console.log(`${key}: ${value.score}/10 - "${value.evidence}"`);
    });
    
    console.log('\n❤️ EMOTIONAL ELEMENTS:');
    Object.entries(result.elementsOfValue.emotional).forEach(([key, value]) => {
      console.log(`${key}: ${value.score}/10 - "${value.evidence}"`);
    });
    
    console.log('\n🚀 LIFE-CHANGING ELEMENTS:');
    Object.entries(result.elementsOfValue.lifeChanging).forEach(([key, value]) => {
      console.log(`${key}: ${value.score}/10 - "${value.evidence}"`);
    });

    // Display CliftonStrengths results
    console.log('\n\n🎭 CLIFTONSTRENGTHS ANALYSIS');
    console.log('═'.repeat(50));
    
    console.log('\n⚡ EXECUTING THEMES:');
    Object.entries(result.cliftonStrengths.executing).forEach(([key, value]) => {
      console.log(`${key}: ${value.score}/10 - "${value.evidence}"`);
    });
    
    console.log('\n🎯 INFLUENCING THEMES:');
    Object.entries(result.cliftonStrengths.influencing).forEach(([key, value]) => {
      console.log(`${key}: ${value.score}/10 - "${value.evidence}"`);
    });

    // Display recommendations
    console.log('\n\n💡 RECOMMENDATIONS');
    console.log('═'.repeat(50));
    
    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log(`\n📊 Overall Score: ${result.overallScore}/10`);
    console.log(`Summary: ${result.summary}`);

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Content Analysis Test Complete!');
}

// Run the content analysis test
testContentAnalysis().catch(console.error);

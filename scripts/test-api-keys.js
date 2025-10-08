#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

async function testAPIKeys() {
  console.log('🧪 Testing API Keys Configuration\n');
  
  const keys = {
    openai: process.env.OPENAI_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    claude: process.env.CLAUDE_API_KEY
  };
  
  console.log('📋 Current Configuration:');
  console.log(`  OpenAI: ${keys.openai ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Gemini: ${keys.gemini ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  Claude: ${keys.claude ? '✅ Configured' : '❌ Not configured'}`);
  
  const configuredCount = Object.values(keys).filter(key => key).length;
  
  if (configuredCount === 0) {
    console.log('\n⚠️  No API keys configured. The app will use content-based analysis.');
    console.log('💡 Run "node scripts/setup-api-keys.js" to configure your keys.');
    return;
  }
  
  console.log(`\n🎯 ${configuredCount} provider(s) configured!`);
  
  // Test with a simple analysis
  console.log('\n🚀 Testing analysis with Apple.com...');
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze/website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://apple.com'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Analysis successful!');
      console.log(`📊 Overall Score: ${result.analysis.overallScore}/100`);
      console.log(`🎯 Golden Circle Score: ${result.analysis.goldenCircle.overallScore}/100`);
      console.log(`💎 Elements of Value Score: ${result.analysis.elementsOfValue.overallScore}/100`);
      console.log(`🧠 CliftonStrengths Score: ${result.analysis.cliftonStrengths.overallScore}/100`);
      
      // Check if sophisticated analysis was used
      const hasDetailedStructure = result.analysis.goldenCircle.why && 
                                 typeof result.analysis.goldenCircle.why === 'object' &&
                                 result.analysis.goldenCircle.why.statement;
      
      if (hasDetailedStructure) {
        console.log('🎉 Sophisticated AI analysis is working!');
        console.log('📝 WHY Statement:', result.analysis.goldenCircle.why.statement.substring(0, 100) + '...');
      } else {
        console.log('📝 Using content-based analysis (fallback)');
      }
      
    } else {
      console.log('❌ Analysis failed:', response.statusText);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. If you see sophisticated analysis, your API keys are working!');
  console.log('2. If you see content-based analysis, check your API keys');
  console.log('3. Deploy to Cloudflare Pages for production use');
}

testAPIKeys().catch(console.error);

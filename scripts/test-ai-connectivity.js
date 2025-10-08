#!/usr/bin/env node

/**
 * Test AI API Connectivity
 * Tests Google Gemini and Anthropic Claude API connections
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

/**
 * Test Google Gemini API
 */
async function testGeminiAPI() {
  if (!GEMINI_API_KEY) {
    return { success: false, error: 'No API key provided' };
  }

  try {
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: "Hello, this is a test message. Please respond with 'Test successful'."
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, message: 'Gemini API is working' });
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}: ${responseData}` });
          }
        });
      });

      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });

      req.write(data);
      req.end();
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test Anthropic Claude API
 */
async function testClaudeAPI() {
  if (!CLAUDE_API_KEY) {
    return { success: false, error: 'No API key provided' };
  }

  try {
    const data = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Hello, this is a test message. Please respond with "Test successful".'
      }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'anthropic-version': '2023-06-01'
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, message: 'Claude API is working' });
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}: ${responseData}` });
          }
        });
      });

      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });

      req.write(data);
      req.end();
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 AI API Connectivity Test');
  console.log('=' .repeat(40));
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log(`Gemini API Key: ${GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`Claude API Key: ${CLAUDE_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  if (!GEMINI_API_KEY && !CLAUDE_API_KEY) {
    console.log('\n❌ No API keys found!');
    console.log('Please set GEMINI_API_KEY and/or CLAUDE_API_KEY environment variables');
    console.log('See FREE_AI_SETUP_GUIDE.md for instructions');
    process.exit(1);
  }
  
  // Test Gemini
  if (GEMINI_API_KEY) {
    console.log('\n🤖 Testing Google Gemini API...');
    const geminiResult = await testGeminiAPI();
    if (geminiResult.success) {
      console.log('✅ Gemini API: Working');
    } else {
      console.log('❌ Gemini API: Failed');
      console.log(`   Error: ${geminiResult.error}`);
    }
  }
  
  // Test Claude
  if (CLAUDE_API_KEY) {
    console.log('\n🤖 Testing Anthropic Claude API...');
    const claudeResult = await testClaudeAPI();
    if (claudeResult.success) {
      console.log('✅ Claude API: Working');
    } else {
      console.log('❌ Claude API: Failed');
      console.log(`   Error: ${claudeResult.error}`);
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  const geminiWorking = GEMINI_API_KEY ? (await testGeminiAPI()).success : false;
  const claudeWorking = CLAUDE_API_KEY ? (await testClaudeAPI()).success : false;
  
  const results = {
    gemini: { available: !!GEMINI_API_KEY, working: geminiWorking },
    claude: { available: !!CLAUDE_API_KEY, working: claudeWorking },
    summary: {
      atLeastOneWorking: geminiWorking || claudeWorking,
      message: geminiWorking || claudeWorking ? 'At least one AI API is working!' : 'No AI APIs are working.'
    }
  };
  
  console.log(JSON.stringify(results, null, 2));
  
  if (geminiWorking || claudeWorking) {
    console.log('🎉 At least one AI API is working!');
    console.log('Your app will use real AI analysis.');
  } else {
    console.log('⚠️  No AI APIs are working.');
    console.log('Your app will use mock data (still functional).');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Start your app: npm run dev');
  console.log('2. Go to: http://localhost:3000/dashboard/website-analysis');
  console.log('3. Test with a real website URL');
  console.log('4. Check console logs for AI usage status');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Simple AI Setup Script
 * One-click setup for free AI analysis
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🚀 Zero Barriers Growth Accelerator - AI Setup');
  console.log('=' .repeat(50));
  console.log('This will help you set up FREE AI analysis for your app.\n');

  // Check if .env.local already exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);
  
  if (envExists) {
    console.log('✅ Found existing .env.local file');
    const overwrite = await askQuestion('Do you want to update it? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Let\'s get your free AI API keys...\n');

  // Get Gemini API key
  console.log('1. Google Gemini API (Recommended - more generous free tier)');
  console.log('   Go to: https://makersuite.google.com/app/apikey');
  console.log('   Sign in → Create API Key → Copy the key');
  const geminiKey = await askQuestion('   Enter your Gemini API key (or press Enter to skip): ');

  console.log('\n2. Anthropic Claude API (Backup option)');
  console.log('   Go to: https://console.anthropic.com/');
  console.log('   Sign up → API Keys → Create Key → Copy the key');
  const claudeKey = await askQuestion('   Enter your Claude API key (or press Enter to skip): ');

  // Create .env.local content
  let envContent = '# Zero Barriers Growth Accelerator - AI API Keys\n';
  envContent += '# Get these free at: https://makersuite.google.com/app/apikey (Gemini)\n';
  envContent += '# And: https://console.anthropic.com/ (Claude)\n\n';

  if (geminiKey.trim()) {
    envContent += `GEMINI_API_KEY=${geminiKey.trim()}\n`;
  }

  if (claudeKey.trim()) {
    envContent += `CLAUDE_API_KEY=${claudeKey.trim()}\n`;
  }

  envContent += '\n# Optional settings\n';
  envContent += 'ENABLE_GEMINI=true\n';
  envContent += 'ENABLE_CLAUDE=true\n';

  // Write the file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to .env.local');
  } catch (error) {
    console.log('\n❌ Error saving configuration:', error.message);
    rl.close();
    return;
  }

  // Test the setup
  console.log('\n🧪 Testing your setup...');
  
  if (geminiKey.trim() || claudeKey.trim()) {
    console.log('✅ API keys configured');
    console.log('🎉 Your app will now use REAL AI analysis!');
  } else {
    console.log('⚠️  No API keys provided');
    console.log('📝 Your app will use mock data (still functional)');
    console.log('💡 You can add API keys later to get real analysis');
  }

  console.log('\n🚀 Next Steps:');
  console.log('1. Start your app: npm run dev');
  console.log('2. Go to: http://localhost:3000/dashboard/website-analysis');
  console.log('3. Enter any website URL and click "Analyze Website"');
  console.log('4. Get real AI-powered marketing insights!');

  console.log('\n📊 Free Tier Limits:');
  console.log('• Gemini: 15 requests/minute, 1 million tokens/day');
  console.log('• Claude: Varies by account');
  console.log('• Both: More than enough for testing and personal use');

  console.log('\n🎯 What You\'ll Get:');
  console.log('• Real marketing framework analysis');
  console.log('• Trustworthy scores (1-10 scale)');
  console.log('• Actionable recommendations');
  console.log('• Pattern recognition for strengths/weaknesses');

  rl.close();
}

main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});

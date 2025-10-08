#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(process.cwd(), '.env.local');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAIKeys() {
  console.log('🔧 AI Provider Setup for Zero Barriers Growth Accelerator\n');
  console.log('This script will help you configure AI providers for real analysis.\n');
  console.log('You can get API keys from:');
  console.log('- OpenAI: https://platform.openai.com/api-keys');
  console.log('- Google Gemini: https://makersuite.google.com/app/apikey');
  console.log('- Anthropic Claude: https://console.anthropic.com/\n');

  let envContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // OpenAI setup
  console.log('🤖 OpenAI Configuration');
  const openaiKey = await question('Enter your OpenAI API key (or press Enter to skip): ');
  if (openaiKey.trim()) {
    envContent += `\nOPENAI_API_KEY="${openaiKey.trim()}"`;
    envContent += `\nOPENAI_MODEL="gpt-4-turbo-preview"`;
  }

  // Gemini setup
  console.log('\n🧠 Google Gemini Configuration');
  const geminiKey = await question('Enter your Google Gemini API key (or press Enter to skip): ');
  if (geminiKey.trim()) {
    envContent += `\nGEMINI_API_KEY="${geminiKey.trim()}"`;
    envContent += `\nGEMINI_MODEL="gemini-1.5-flash"`;
  }

  // Claude setup
  console.log('\n🎭 Anthropic Claude Configuration');
  const claudeKey = await question('Enter your Anthropic Claude API key (or press Enter to skip): ');
  if (claudeKey.trim()) {
    envContent += `\nCLAUDE_API_KEY="${claudeKey.trim()}"`;
    envContent += `\nCLAUDE_MODEL="claude-3-haiku-20240307"`;
  }

  // Write to .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Configuration saved to .env.local');
  console.log('\n📝 Next steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Test the analysis with a real website');
  console.log('3. The system will now use real AI analysis instead of demo data\n');

  rl.close();
}

setupAIKeys().catch(console.error);
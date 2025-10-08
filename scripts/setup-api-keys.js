#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupAPIKeys() {
  console.log('🚀 Zero Barriers Growth Accelerator - API Keys Setup\n');
  console.log('This script will help you securely configure your AI API keys.');
  console.log('Your keys will be stored in .env.local and are protected by .gitignore\n');

  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if .env.local already exists
  let existingKeys = {};
  if (fs.existsSync(envPath)) {
    console.log('📄 Found existing .env.local file. Current keys:');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key.includes('API_KEY')) {
          existingKeys[key] = value;
          console.log(`  ${key}: ${value.substring(0, 8)}...`);
        }
      }
    });
    console.log('');
  }

  const keys = {};

  // OpenAI
  if (existingKeys.OPENAI_API_KEY) {
    const useExisting = await question(`Use existing OpenAI key? (y/n): `);
    if (useExisting.toLowerCase() === 'y') {
      keys.OPENAI_API_KEY = existingKeys.OPENAI_API_KEY;
    }
  }
  
  if (!keys.OPENAI_API_KEY) {
    keys.OPENAI_API_KEY = await question('Enter your OpenAI API key (or press Enter to skip): ');
  }

  // Gemini
  if (existingKeys.GEMINI_API_KEY) {
    const useExisting = await question(`Use existing Gemini key? (y/n): `);
    if (useExisting.toLowerCase() === 'y') {
      keys.GEMINI_API_KEY = existingKeys.GEMINI_API_KEY;
    }
  }
  
  if (!keys.GEMINI_API_KEY) {
    keys.GEMINI_API_KEY = await question('Enter your Google Gemini API key (or press Enter to skip): ');
  }

  // Claude
  if (existingKeys.CLAUDE_API_KEY) {
    const useExisting = await question(`Use existing Claude key? (y/n): `);
    if (useExisting.toLowerCase() === 'y') {
      keys.CLAUDE_API_KEY = existingKeys.CLAUDE_API_KEY;
    }
  }
  
  if (!keys.CLAUDE_API_KEY) {
    keys.CLAUDE_API_KEY = await question('Enter your Anthropic Claude API key (or press Enter to skip): ');
  }

  // Create .env.local content
  let envContent = `# Zero Barriers Growth Accelerator - API Keys
# These keys are protected by .gitignore and will not be committed to git

`;

  if (keys.OPENAI_API_KEY) {
    envContent += `OPENAI_API_KEY=${keys.OPENAI_API_KEY}\n`;
  }
  if (keys.GEMINI_API_KEY) {
    envContent += `GEMINI_API_KEY=${keys.GEMINI_API_KEY}\n`;
  }
  if (keys.CLAUDE_API_KEY) {
    envContent += `CLAUDE_API_KEY=${keys.CLAUDE_API_KEY}\n`;
  }

  // Write the file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ API keys configured successfully!');
  console.log(`📄 Keys saved to: ${envPath}`);
  console.log('🔒 Keys are protected by .gitignore');
  
  // Test the configuration
  console.log('\n🧪 Testing API configuration...');
  
  const configuredProviders = [];
  if (keys.OPENAI_API_KEY) configuredProviders.push('OpenAI');
  if (keys.GEMINI_API_KEY) configuredProviders.push('Gemini');
  if (keys.CLAUDE_API_KEY) configuredProviders.push('Claude');
  
  if (configuredProviders.length > 0) {
    console.log(`✅ Configured providers: ${configuredProviders.join(', ')}`);
    console.log('🚀 The app will now use these AI providers for sophisticated analysis!');
  } else {
    console.log('⚠️  No API keys configured. The app will use content-based analysis as fallback.');
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Test the analysis with a real website');
  console.log('3. Enjoy sophisticated AI-powered analysis!');
  
  rl.close();
}

setupAPIKeys().catch(console.error);
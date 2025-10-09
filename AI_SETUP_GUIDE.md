# AI Provider Setup Guide

## Getting API Keys

### 1. OpenAI (shayne@devpipeline.com)
1. Go to https://platform.openai.com/api-keys
2. Sign in with shayne@devpipeline.com
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

### 2. Google Gemini (shayne@devpipeline.com)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with shayne@devpipeline.com
3. Click "Create API Key"
4. Copy the API key

### 3. Anthropic Claude (shayne@devpipeline.com)
1. Go to https://console.anthropic.com/
2. Sign in with shayne@devpipeline.com
3. Go to API Keys section
4. Click "Create Key"
5. Copy the API key (starts with `sk-ant-`)

## Environment Setup

Create a `.env.local` file in your project root with:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Anthropic Claude Configuration
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-haiku-20240307
```

## Free Tier Limits

### OpenAI
- $5 free credit (expires after 3 months)
- GPT-4: ~$0.03 per 1K tokens
- GPT-3.5: ~$0.001 per 1K tokens

### Google Gemini
- 15 requests per minute
- 1M tokens per day
- Free tier available

### Anthropic Claude
- $5 free credit (expires after 1 month)
- Claude 3 Haiku: ~$0.25 per 1M input tokens
- Claude 3 Sonnet: ~$3 per 1M input tokens

## Recommended Models for Cost-Effectiveness

1. **Claude 3 Haiku** - Best for cost-effective analysis
2. **Gemini 1.5 Flash** - Good balance of speed and cost
3. **GPT-4 Turbo** - Most advanced but most expensive

## Testing the Setup

After adding your API keys, restart the development server:

```bash
npm run dev
```

The AI provider selector will show which providers are available and configured.

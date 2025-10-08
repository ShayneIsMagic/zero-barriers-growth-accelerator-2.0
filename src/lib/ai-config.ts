export const AI_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },
  
  // Google Gemini Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
  
  // Anthropic Claude Configuration
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
  },
} as const;

export const DEFAULT_AI_PROVIDER: 'openai' | 'gemini' | 'claude' = 'openai';

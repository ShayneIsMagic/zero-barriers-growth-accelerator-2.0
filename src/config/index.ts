// Centralized configuration for Zero Barriers Growth Accelerator
export const config = {
  // App Configuration
  app: {
    name: 'Zero Barriers Growth Accelerator',
    version: '0.1.0',
    description: 'AI-powered marketing optimization platform',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || '',
    directUrl: process.env.DIRECT_URL || '',
    pool: {
      min: 2,
      max: 10,
    },
  },

  // Authentication Configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET || '',
    providers: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      },
    },
    session: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  },

  // AI Services Configuration
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
      maxTokens: 4000,
      temperature: 0.1,
      timeout: 45000,
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || '',
      indexName: process.env.PINECONE_INDEX_NAME || 'zero-barriers-growth',
    },
    fallback: {
      enabled: true,
      confidenceThreshold: 0.7,
    },
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: {
      analysis: 60 * 60 * 24, // 24 hours
      user: 60 * 60 * 24 * 7, // 7 days
      cache: 60 * 15, // 15 minutes
    },
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.SMTP_FROM || 'noreply@zerobarriers.com',
  },

  // File Storage Configuration
  storage: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
  },

  // Analytics & Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.NODE_ENV || 'development',
    },
    vercel: {
      analyticsId: process.env.VERCEL_ANALYTICS_ID || '',
    },
  },

  // Feature Flags
  features: {
    aiAnalysis: process.env.ENABLE_AI_ANALYSIS === 'true',
    realTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
    advancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
    teamCollaboration: process.env.ENABLE_TEAM_COLLABORATION === 'true',
  },

  // Rate Limiting
  rateLimit: {
    analysis: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
    },
  },

  // Security Configuration
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    csrf: {
      enabled: true,
      secret: process.env.CSRF_SECRET || '',
    },
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
    },
  },

  // Performance Configuration
  performance: {
    cache: {
      static: 60 * 60 * 24 * 7, // 7 days
      dynamic: 60 * 15, // 15 minutes
    },
    compression: {
      enabled: true,
      threshold: 1024, // 1KB
    },
    images: {
      domains: [
        'localhost',
        'vercel.app',
        'avatars.githubusercontent.com',
        'lh3.googleusercontent.com',
      ],
      formats: ['image/webp', 'image/avif'],
      sizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
  },
} as const;

// Type-safe configuration access
export type Config = typeof config;

// Environment validation
export function validateConfig(): void {
  const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'OPENAI_API_KEY'];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Development-only configuration
export const devConfig = {
  ...config,
  database: {
    ...config.database,
    pool: {
      min: 1,
      max: 5,
    },
  },
  features: {
    ...config.features,
    debugMode: true,
    hotReload: true,
  },
} as const;

// Production configuration
export const prodConfig = {
  ...config,
  security: {
    ...config.security,
    headers: {
      ...config.security.headers,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
  },
  performance: {
    ...config.performance,
    cache: {
      static: 60 * 60 * 24 * 30, // 30 days
      dynamic: 60 * 5, // 5 minutes
    },
  },
} as const;

export default config;

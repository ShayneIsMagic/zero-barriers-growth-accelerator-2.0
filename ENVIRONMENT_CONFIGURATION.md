# Zero Barriers Growth Accelerator 2.0 - Environment Configuration
# Copy this file to .env.local and fill in your actual values

# =============================================================================
# REQUIRED - CORE CONFIGURATION
# =============================================================================

# Database Configuration (Required)
DATABASE_URL="postgresql://postgres.chkwezsyopfciibifmxx:go2ArBwdewM3M80e@aws-1-us-west-1.pooler.supabase.com:6543/postgres"

# Authentication (Required for production)
NEXTAUTH_SECRET="RAOjnyqfPRWzMcFTfrN9Vt92fWwqPluK+P990nKkVz8="
NEXTAUTH_URL="https://zero-barriers-growth-accelerator-20-f0ohch5k8.vercel.app"

# =============================================================================
# REQUIRED - AI SERVICES (At least ONE required)
# =============================================================================

# Google Gemini API (Primary AI service - REQUIRED)
GEMINI_API_KEY="AIzaSyDxBz2deQ52qX4pnF9XWVbF2MuTLVb0vDw"

# Anthropic Claude API (Backup AI service - Optional)
CLAUDE_API_KEY="your-claude-api-key-here"

# OpenAI API (Backup AI service - Optional)
OPENAI_API_KEY="your-openai-api-key-here"

# =============================================================================
# OPTIONAL - ENHANCED FEATURES
# =============================================================================

# Google Search Console API (Optional - for SEO analysis)
GOOGLE_SEARCH_CONSOLE_CLIENT_ID="your-google-client-id"
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN="your-refresh-token"

# Google Ads API (Optional - for advertising analysis)
GOOGLE_ADS_CLIENT_ID="your-google-ads-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-google-ads-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
GOOGLE_ADS_REFRESH_TOKEN="your-ads-refresh-token"

# Google PageSpeed API (Optional - for performance analysis)
GOOGLE_API_KEY="your-google-api-key"

# Browserless.io (Optional - for advanced scraping)
BROWSERLESS_WS_ENDPOINT="wss://chrome.browserless.io"
BROWSERLESS_TOKEN="your-browserless-token"

# =============================================================================
# OPTIONAL - SOCIAL AUTHENTICATION
# =============================================================================

# Google OAuth (Optional - for social login)
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# LinkedIn OAuth (Optional - for social login)
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# =============================================================================
# OPTIONAL - CACHING & PERFORMANCE
# =============================================================================

# Redis (Optional - for caching)
REDIS_URL="redis://localhost:6379"

# Pinecone (Optional - for vector search)
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="your-pinecone-environment"
PINECONE_INDEX_NAME="zero-barriers-growth"

# =============================================================================
# OPTIONAL - EMAIL SERVICES
# =============================================================================

# SMTP Email (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# SendGrid (Optional - for email delivery)
SENDGRID_API_KEY="your-sendgrid-api-key"

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================

# Environment
NODE_ENV="development"

# Vercel Configuration (Auto-set by Vercel)
VERCEL="1"
VERCEL_OIDC_TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1yay00MzAyZWMxYjY3MGY0OGE5OGFkNjFkYWRlNGEyM2JlNyJ9.eyJpc3MiOiJodHRwczovL29pZGMudmVyY2VsLmNvbS9zaGF5bmUtcm95cy1wcm9qZWN0cyIsInN1YiI6Im93bmVyOnNoYXluZS1yb3lzLXByb2plY3RzOnByb2plY3Q6emVyby1iYXJyaWVycy1ncm93dGgtYWNjZWxlcmF0b3ItMi4wOmVudmlyb25tZW50OmRldmVsb3BtZW50Iiwic2NvcGUiOiJvd25lcjpzaGF5bmUtcm95cy1wcm9qZWN0czpwcm9qZWN0Onplcm8tYmFycmllcnMtZ3Jvd3RoLWFjY2VsZXJhdG9yLTIuMDplbnZpcm9ubWVudDpkZXZlbG9wbWVudCIsImF1ZCI6Imh0dHBzOi8vdmVyY2VsLmNvbS9zaGF5bmUtcm95cy1wcm9qZWN0cyIsIm93bmVyIjoic2hheW5lLXJveXMtcHJvamVjdHMiLCJvd25lcl9pZCI6InRlYW1fYktmNjRldUZhajM5ZU1reWdrZDc5ZGRaIiwicHJvamVjdCI6Inplcm8tYmFycmllcnMtZ3Jvd3RoLWFjY2VsZXJhdG9yLTIuMCIsInByb2plY3RfaWQiOiJwcmpfanBBcmpYSWxCT3dKWU1ndHNzT2dsMm4xVUozOCIsImVudmlyb25tZW50IjoiZGV2ZWxvcG1lbnQiLCJ1c2VyX2lkIjoiZEVKc1J5dzZyYldCYnJTZmt2SERiZzJOIiwibmJmIjoxNzYwODQ4NzIyLCJpYXQiOjE3NjA4NDg3MjIsImV4cCI6MTc2MDg5MTkyMn0.QvBgnbur-KxumkSJ11Xbz7effs9HSjbqg3o5is_iLNms-CAzC0pttrqNl7SrXunZaA9vx69cQYtnpBGHAkoLiiP7z7DhQuluLJ5Pgp6qb6gAUI_kSW4NogVIrastTroAxrAFXNcmtrUWbCD_5-ikg-LSCaJZ8DqBs-yuOsjtImkstDFanQgBrJIjLs-0qQK7n7D6KS6lB7FXPNeibe1lDOX6sACYFTbo7OkSxIQqX8SMe8jgm0MP_mpsbG_e71TvhgRtPRlb7EUQPjCWVkh6u5we7pFyBIWR7P3nTe_Gok0BbhonLsxnWfsh6h5qTtAR6sVlcr17hYLdJ_mUmwBS4Q"

# =============================================================================
# CONFIGURATION NOTES
# =============================================================================

# REQUIRED FOR PRODUCTION:
# - DATABASE_URL (Supabase PostgreSQL)
# - NEXTAUTH_SECRET (Generate with: openssl rand -base64 32)
# - NEXTAUTH_URL (Your production domain)
# - GEMINI_API_KEY (Primary AI service)

# OPTIONAL BUT RECOMMENDED:
# - CLAUDE_API_KEY (Backup AI service)
# - GOOGLE_API_KEY (For PageSpeed analysis)

# FOR VERCEL DEPLOYMENT:
# 1. Go to Vercel Dashboard
# 2. Select your project
# 3. Go to Settings > Environment Variables
# 4. Add each variable with its value
# 5. Redeploy your application

# FOR LOCAL DEVELOPMENT:
# 1. Copy this file to .env.local
# 2. Replace placeholder values with actual API keys
# 3. Run: npm run dev

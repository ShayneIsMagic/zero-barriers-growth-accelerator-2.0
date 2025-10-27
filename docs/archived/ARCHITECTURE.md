# 🏗️ Architecture Documentation

## System Architecture

Zero Barriers Growth Accelerator is built with modern web technologies optimized for performance, scalability, and developer experience.

---

## Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.3
- **Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State**: React Hooks + localStorage

### Backend

- **Runtime**: Node.js 18-24
- **API**: Next.js API Routes
- **Type Safety**: tRPC (optional)
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Auth**: Custom JWT + Test Auth

### AI Services

- **Primary**: Google Gemini (free tier)
- **Fallback**: Anthropic Claude (free tier)
- **Optional**: OpenAI GPT-4 (paid)

### Analysis Tools

- **Performance**: Lighthouse
- **SEO**: PageAudit
- **Trends**: Google Trends API
- **Scraping**: Puppeteer

---

## Architecture Patterns

### 1. App Router Structure

```
src/app/
├── api/                    # API routes (server-side)
│   ├── analyze/           # Analysis endpoints
│   ├── auth/              # Authentication
│   └── health/            # Health checks
├── dashboard/             # Protected pages
└── auth/                  # Public auth pages
```

### 2. Component Architecture

```
src/components/
├── ui/                    # Base components (shadcn/ui)
├── analysis/              # Analysis-specific components
├── layout/                # Layout components
└── sections/              # Landing page sections
```

### 3. Service Layer

```
src/lib/
├── free-ai-analysis.ts          # Main analysis engine
├── analysis-client.ts           # Client-side storage
├── seo-analysis-service.ts      # SEO tools
├── lighthouse-service.ts        # Performance
└── website-evaluation-framework.ts  # Scoring
```

---

## Data Flow

### Analysis Workflow

```
1. User Input (URL/Content)
   ↓
2. Client Validation
   ↓
3. API Route (/api/analyze/*)
   ↓
4. Content Scraping (Puppeteer)
   ↓
5. AI Analysis (Gemini/Claude)
   ↓
6. Framework Scoring
   ↓
7. Result Generation
   ↓
8. localStorage Persistence
   ↓
9. UI Rendering
```

### Authentication Flow

```
1. User Login (Test Mode)
   ↓
2. TestAuthService Validation
   ↓
3. JWT Token Generation
   ↓
4. localStorage Storage
   ↓
5. Protected Route Access
```

---

## Key Components

### 1. Analysis Engine

**Location**: `src/lib/free-ai-analysis.ts`

**Responsibilities**:

- AI provider selection (Gemini/Claude)
- Content scraping orchestration
- Framework analysis execution
- Result aggregation

**Key Functions**:

```typescript
performRealAnalysis(url, type);
testAPIConnectivity();
analyzeWithGemini(content);
analyzeWithClaude(content);
```

### 2. Client Storage

**Location**: `src/lib/analysis-client.ts`

**Responsibilities**:

- Analysis result persistence
- History management
- localStorage operations

**Key Functions**:

```typescript
saveAnalysis(result);
getAnalysisById(id);
getAllAnalyses();
deleteAnalysis(id);
```

### 3. Framework Evaluators

**Location**: Multiple files in `src/lib/`

**Golden Circle**: `golden-circle-evaluator.ts`
**Elements of Value**: `elements-of-value-evaluator.ts`
**CliftonStrengths**: `clifton-strengths-evaluator.ts`

---

## API Endpoints

### Analysis APIs

#### Website Analysis

```
POST /api/analyze/website
Body: { url, analysisType }
Response: WebsiteAnalysisResult
Time: 2-3 minutes
```

#### Comprehensive Analysis

```
POST /api/analyze/comprehensive
Body: { url, keyword, options }
Response: ComprehensiveAnalysisResult
Time: 5-7 minutes
```

#### SEO Analysis

```
POST /api/analyze/seo
Body: { url, keywords, competitors }
Response: SEOAnalysisResult
Time: 3-5 minutes
```

#### Enhanced Analysis

```
POST /api/analyze/enhanced
Body: { url, options }
Response: EnhancedAnalysisResult
Time: 5-10 minutes
```

### Utility APIs

```
GET  /api/health          # Health check
POST /api/scrape-page     # Page scraping
POST /api/generate-pdf    # PDF generation
GET  /api/reports         # Saved reports
```

---

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  role      String   @default("SUPER_ADMIN")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  analyses  Analysis[]
}
```

### Analysis Model

```prisma
model Analysis {
  id          String   @id @default(cuid())
  content     String
  contentType String
  status      String   @default("PENDING")
  score       Float?
  insights    String?
  frameworks  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User?    @relation(fields: [userId], references: [id])
  userId      String?
}
```

---

## Security Architecture

### Authentication

- JWT-based authentication
- Test mode for development
- Role-based access control
- Secure password hashing (bcrypt)

### API Security

- CORS configuration
- Rate limiting (recommended)
- Input validation (Zod)
- XSS protection headers

### Data Protection

- Environment variable isolation
- API key encryption
- Secure localStorage usage
- HTTPS enforcement (production)

---

## Performance Optimizations

### Build Optimizations

- Static page generation
- Automatic code splitting
- Image optimization
- CSS purging (Tailwind)
- Tree shaking

### Runtime Optimizations

- React component memoization
- Lazy loading
- Debounced API calls
- Caching strategies
- Edge network (Vercel)

### Monitoring

- Performance metrics
- Error tracking
- User analytics
- API response times

---

## Scalability Considerations

### Current Architecture

- Serverless functions (Vercel)
- Edge caching
- Static assets CDN
- Client-side caching (localStorage)

### Future Scalability

- Database connection pooling
- Redis caching layer
- Horizontal scaling (load balancers)
- Microservices (if needed)
- Queue system for long analyses

---

## Development Tools

### Code Quality

- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Husky for pre-commit hooks

### Testing

- Vitest for unit tests
- Playwright for E2E tests
- React Testing Library
- MSW for API mocking

### Debugging

- React Dev Tools
- VS Code debugging
- Enhanced console logging
- Performance profiler

---

## Deployment Architecture

### Development

```
Local → npm run dev
Port: 3000
Database: SQLite
AI: Test keys
```

### Staging

```
GitHub → Vercel Preview
URL: preview-url.vercel.app
Database: PostgreSQL
AI: Test keys
```

### Production

```
GitHub main → Vercel Production
URL: your-domain.com
Database: PostgreSQL
AI: Production keys
CDN: Vercel Edge Network
```

---

## Configuration Management

### Environment Variables

**Required**:

- `GEMINI_API_KEY` or `CLAUDE_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Optional**:

- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `GOOGLE_SEARCH_CONSOLE_*`

### Build Configuration

**next.config.js**:

- TypeScript error handling
- Image optimization
- Security headers
- Compression

**tailwind.config.js**:

- Custom theme
- Dark mode
- Responsive breakpoints

---

## Error Handling

### Strategy

1. Client-side validation
2. API error responses
3. User-friendly messages
4. Automatic retry logic
5. Fallback mechanisms

### Error Types

- **Validation Errors**: 400
- **Authentication Errors**: 401
- **Authorization Errors**: 403
- **Not Found**: 404
- **Server Errors**: 500
- **Service Unavailable**: 503

---

## Future Architecture Considerations

### Phase 1 (Current)

- ✅ Serverless architecture
- ✅ Client-side storage
- ✅ AI integration
- ✅ Static optimization

### Phase 2 (Planned)

- 🔄 Database persistence
- 🔄 Redis caching
- 🔄 Queue system
- 🔄 Webhook support

### Phase 3 (Future)

- 📋 Microservices
- 📋 Real-time features
- 📋 Mobile apps
- 📋 Team collaboration

---

## Best Practices

### Code Organization

- Feature-based structure
- Separation of concerns
- DRY principle
- Clear naming conventions

### Performance

- Minimize bundle size
- Optimize images
- Lazy load components
- Efficient re-renders

### Security

- Validate all inputs
- Sanitize outputs
- Secure API keys
- Regular updates

### Maintainability

- Comprehensive documentation
- Unit tests
- Type safety
- Code reviews

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel Platform](https://vercel.com/docs)
- [Prisma ORM](https://www.prisma.io/docs)

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Architecture**: Serverless + Edge

// Core Types for Zero Barriers Growth Accelerator

// User and Authentication Types
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: UserRole;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'C_SUITE'
  | 'PRODUCER'
  | 'USER';

// Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

// Content Types
export type ContentType =
  | 'WEBSITE_COPY'
  | 'MARKETING_COPY'
  | 'SOCIAL_MEDIA'
  | 'EMAIL_SEQUENCE'
  | 'LANDING_PAGE'
  | 'AD_COPY'
  | 'PRODUCT_DESCRIPTION'
  | 'COMPANY_OVERVIEW'
  | 'OTHER';

// Analysis Types
export interface Analysis {
  id: string;
  title: string;
  description: string | null;
  content: string;
  contentType: ContentType;
  status: AnalysisStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  organizationId: string;
  projectId: string | null;
  tags: string[];
  industry: string | null;
  targetAudience: string | null;
  conversionGoal: string | null;
}

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// Golden Circle Analysis Types
export interface GoldenCircleScore {
  id: string;
  analysisId: string;
  whyScore: number;
  howScore: number;
  whatScore: number;
  overallScore: number;
  whyDetails: GoldenCircleDetails;
  howDetails: GoldenCircleDetails;
  whatDetails: GoldenCircleDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoldenCircleDetails {
  clarity: number;
  emotionalImpact: number;
  uniqueness: number;
  authenticity: number;
  feedback: string[];
  suggestions: string[];
}

// Consumer Elements of Value Types
export interface ConsumerValueScore {
  id: string;
  analysisId: string;
  functionalScore: number;
  emotionalScore: number;
  lifeChangingScore: number;
  socialImpactScore: number;
  overallScore: number;
  elementScores: Record<string, number>;
  topElements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsumerValueElement {
  name: string;
  category: 'FUNCTIONAL' | 'EMOTIONAL' | 'LIFE_CHANGING' | 'SOCIAL_IMPACT';
  score: number;
  detected: boolean;
  examples: string[];
  suggestions: string[];
}

// B2B Elements of Value Types
export interface B2BValueScore {
  id: string;
  analysisId: string;
  tableStakesScore: number;
  functionalScore: number;
  easeOfBusinessScore: number;
  individualScore: number;
  inspirationalScore: number;
  overallScore: number;
  elementScores: Record<string, number>;
  topElements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface B2BValueElement {
  name: string;
  category:
    | 'TABLE_STAKES'
    | 'FUNCTIONAL'
    | 'EASE_OF_BUSINESS'
    | 'INDIVIDUAL'
    | 'INSPIRATIONAL';
  score: number;
  detected: boolean;
  examples: string[];
  suggestions: string[];
}

// CliftonStrengths Types
export interface CliftonStrengthsScore {
  id: string;
  analysisId: string;
  executingScore: number;
  influencingScore: number;
  relationshipBuildingScore: number;
  strategicThinkingScore: number;
  overallScore: number;
  themeScores: Record<string, number>;
  topThemes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CliftonStrengthsTheme {
  name: string;
  domain:
    | 'EXECUTING'
    | 'INFLUENCING'
    | 'RELATIONSHIP_BUILDING'
    | 'STRATEGIC_THINKING';
  score: number;
  detected: boolean;
  languagePatterns: string[];
  appealStrategy: string[];
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  analysisId: string;
  model: string;
  prompt: string;
  response: Record<string, unknown>;
  tokensUsed: number;
  processingTime: number;
  confidence: number;
  createdAt: Date;
}

// Recommendation Types
export interface Recommendation {
  id: string;
  analysisId: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  impact: string;
  effort: string;
  timeframe: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Barrier Types
export interface Barrier {
  id: string;
  analysisId: string;
  name: string;
  description: string;
  category: string;
  severity: Severity;
  impact: string;
  solution: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Analysis Request Types
export interface AnalysisRequest {
  title: string;
  description?: string;
  content: string;
  contentType: ContentType;
  projectId?: string;
  tags?: string[];
  industry?: string;
  targetAudience?: string;
  conversionGoal?: string;
}

// Analysis Response Types
export interface AnalysisResponse {
  analysis: Analysis;
  goldenCircleScore: GoldenCircleScore;
  consumerValueScore: ConsumerValueScore;
  b2bValueScore: B2BValueScore;
  cliftonStrengthsScore: CliftonStrengthsScore;
  recommendations: Recommendation[];
  barriers: Barrier[];
  aiAnalysis: AIAnalysis;
}

// Dashboard Types
export interface DashboardStats {
  totalAnalyses: number;
  completedAnalyses: number;
  averageScore: number;
  topRecommendations: Recommendation[];
  recentAnalyses: Analysis[];
  scoreTrends: ScoreTrend[];
}

export interface ScoreTrend {
  date: string;
  goldenCircle: number;
  consumerValue: number;
  b2bValue: number;
  cliftonStrengths: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface AnalysisFormData {
  title: string;
  description: string;
  content: string;
  contentType: ContentType;
  projectId: string;
  tags: string[];
  industry: string;
  targetAudience: string;
  conversionGoal: string;
}

// Filter Types
export interface AnalysisFilters {
  status?: AnalysisStatus;
  contentType?: ContentType;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  industry?: string;
  projectId?: string;
}

// Search Types
export interface SearchParams {
  query: string;
  filters?: AnalysisFilters;
  sortBy?: 'createdAt' | 'title' | 'overallScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: Date;
}

// Export Types
export interface ExportOptions {
  format: 'PDF' | 'CSV' | 'JSON';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeBarriers: boolean;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

-- =====================================================
-- SUPABASE SCHEMA MIGRATION SQL
-- Run this in Supabase SQL Editor
-- =====================================================

-- Content Version Control Tables
CREATE TABLE IF NOT EXISTS "ContentSnapshot" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ProposedContent" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "snapshotId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER DEFAULT 1,
    "status" TEXT DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ContentComparison" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "existingId" TEXT NOT NULL,
    "proposedId" TEXT NOT NULL,
    "analysisResults" JSONB,
    "similarityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(6) DEFAULT NOW()
);

-- Structured Framework Results Tables
CREATE TABLE IF NOT EXISTS "FrameworkResult" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "analysisId" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(6) DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FrameworkCategory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "frameworkResultId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryScore" DOUBLE PRECISION,
    "presentElements" INTEGER,
    "totalElements" INTEGER,
    "fraction" TEXT,
    "evidence" JSONB,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(6) DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FrameworkElement" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "categoryId" TEXT NOT NULL,
    "elementName" TEXT NOT NULL,
    "isPresent" BOOLEAN DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "evidence" JSONB,
    "revenueOpportunity" TEXT,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(6) DEFAULT NOW()
);

-- Add Foreign Key Constraints
ALTER TABLE "ContentSnapshot" ADD CONSTRAINT "ContentSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ProposedContent" ADD CONSTRAINT "ProposedContent_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ContentSnapshot"("id") ON DELETE CASCADE;
ALTER TABLE "ContentComparison" ADD CONSTRAINT "ContentComparison_existingId_fkey" FOREIGN KEY ("existingId") REFERENCES "ContentSnapshot"("id") ON DELETE CASCADE;
ALTER TABLE "ContentComparison" ADD CONSTRAINT "ContentComparison_proposedId_fkey" FOREIGN KEY ("proposedId") REFERENCES "ProposedContent"("id") ON DELETE CASCADE;
ALTER TABLE "FrameworkResult" ADD CONSTRAINT "FrameworkResult_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE;
ALTER TABLE "FrameworkCategory" ADD CONSTRAINT "FrameworkCategory_frameworkResultId_fkey" FOREIGN KEY ("frameworkResultId") REFERENCES "FrameworkResult"("id") ON DELETE CASCADE;
ALTER TABLE "FrameworkElement" ADD CONSTRAINT "FrameworkElement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FrameworkCategory"("id") ON DELETE CASCADE;

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS "ContentSnapshot_userId_idx" ON "ContentSnapshot"("userId");
CREATE INDEX IF NOT EXISTS "ContentSnapshot_url_idx" ON "ContentSnapshot"("url");
CREATE INDEX IF NOT EXISTS "ProposedContent_snapshotId_idx" ON "ProposedContent"("snapshotId");
CREATE INDEX IF NOT EXISTS "ProposedContent_status_idx" ON "ProposedContent"("status");
CREATE INDEX IF NOT EXISTS "ContentComparison_existingId_idx" ON "ContentComparison"("existingId");
CREATE INDEX IF NOT EXISTS "ContentComparison_proposedId_idx" ON "ContentComparison"("proposedId");
CREATE INDEX IF NOT EXISTS "FrameworkResult_analysisId_idx" ON "FrameworkResult"("analysisId");
CREATE INDEX IF NOT EXISTS "FrameworkResult_framework_idx" ON "FrameworkResult"("framework");
CREATE INDEX IF NOT EXISTS "FrameworkResult_score_idx" ON "FrameworkResult"("score");
CREATE INDEX IF NOT EXISTS "FrameworkCategory_frameworkResultId_idx" ON "FrameworkCategory"("frameworkResultId");
CREATE INDEX IF NOT EXISTS "FrameworkCategory_categoryName_idx" ON "FrameworkCategory"("categoryName");
CREATE INDEX IF NOT EXISTS "FrameworkElement_categoryId_idx" ON "FrameworkElement"("categoryId");
CREATE INDEX IF NOT EXISTS "FrameworkElement_elementName_idx" ON "FrameworkElement"("elementName");
CREATE INDEX IF NOT EXISTS "FrameworkElement_isPresent_idx" ON "FrameworkElement"("isPresent");

-- Enable RLS (Row Level Security)
ALTER TABLE "ContentSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProposedContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContentComparison" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FrameworkResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FrameworkCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FrameworkElement" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for ContentSnapshot
CREATE POLICY "Users can view their own content snapshots" ON "ContentSnapshot"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create their own content snapshots" ON "ContentSnapshot"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own content snapshots" ON "ContentSnapshot"
    FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own content snapshots" ON "ContentSnapshot"
    FOR DELETE USING (auth.uid()::text = "userId");

-- Create RLS Policies for ProposedContent
CREATE POLICY "Users can view proposed content for their snapshots" ON "ProposedContent"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "ContentSnapshot"
            WHERE "ContentSnapshot"."id" = "ProposedContent"."snapshotId"
            AND "ContentSnapshot"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can create proposed content for their snapshots" ON "ProposedContent"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "ContentSnapshot"
            WHERE "ContentSnapshot"."id" = "ProposedContent"."snapshotId"
            AND "ContentSnapshot"."userId" = auth.uid()::text
        )
    );

-- Create RLS Policies for ContentComparison
CREATE POLICY "Users can view comparisons for their content" ON "ContentComparison"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "ContentSnapshot"
            WHERE "ContentSnapshot"."id" = "ContentComparison"."existingId"
            AND "ContentSnapshot"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can create comparisons for their content" ON "ContentComparison"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "ContentSnapshot"
            WHERE "ContentSnapshot"."id" = "ContentComparison"."existingId"
            AND "ContentSnapshot"."userId" = auth.uid()::text
        )
    );

-- Create RLS Policies for FrameworkResult
CREATE POLICY "Users can view framework results for their analyses" ON "FrameworkResult"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Analysis"
            WHERE "Analysis"."id" = "FrameworkResult"."analysisId"
            AND "Analysis"."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can create framework results for their analyses" ON "FrameworkResult"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Analysis"
            WHERE "Analysis"."id" = "FrameworkResult"."analysisId"
            AND "Analysis"."userId" = auth.uid()::text
        )
    );

-- Create RLS Policies for FrameworkCategory
CREATE POLICY "Users can view framework categories for their results" ON "FrameworkCategory"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "FrameworkResult"
            JOIN "Analysis" ON "Analysis"."id" = "FrameworkResult"."analysisId"
            WHERE "FrameworkResult"."id" = "FrameworkCategory"."frameworkResultId"
            AND "Analysis"."userId" = auth.uid()::text
        )
    );

-- Create RLS Policies for FrameworkElement
CREATE POLICY "Users can view framework elements for their categories" ON "FrameworkElement"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "FrameworkCategory"
            JOIN "FrameworkResult" ON "FrameworkResult"."id" = "FrameworkCategory"."frameworkResultId"
            JOIN "Analysis" ON "Analysis"."id" = "FrameworkResult"."analysisId"
            WHERE "FrameworkCategory"."id" = "FrameworkElement"."categoryId"
            AND "Analysis"."userId" = auth.uid()::text
        )
    );

-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'ContentSnapshot',
    'ProposedContent',
    'ContentComparison',
    'FrameworkResult',
    'FrameworkCategory',
    'FrameworkElement'
)
ORDER BY table_name;

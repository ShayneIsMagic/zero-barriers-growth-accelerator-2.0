-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "content" TEXT NOT NULL,
    "contentType" TEXT,
    "status" TEXT DEFAULT 'PENDING',
    "score" DOUBLE PRECISION,
    "userId" TEXT,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "insights" TEXT,
    "frameworks" TEXT,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT DEFAULT 'USER',
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSnapshot" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposedContent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "snapshotId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentComparison" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "existingId" TEXT NOT NULL,
    "proposedId" TEXT NOT NULL,
    "analysisResults" JSONB,
    "similarityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkResult" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "analysisId" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkCategory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "frameworkResultId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryScore" DOUBLE PRECISION,
    "presentElements" INTEGER,
    "totalElements" INTEGER,
    "fraction" TEXT,
    "evidence" JSONB,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrameworkElement" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "categoryId" TEXT NOT NULL,
    "elementName" TEXT NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "evidence" JSONB,
    "revenueOpportunity" TEXT,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrameworkElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lighthouse_id" UUID,
    "severity" VARCHAR(20),
    "issue_type" VARCHAR(100),
    "wcag_level" VARCHAR(10),
    "wcag_criterion" VARCHAR(50),
    "description" TEXT NOT NULL,
    "element_selector" VARCHAR(500),
    "affected_elements" INTEGER,
    "fix_recommendation" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accessibility_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "user_id" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "action_details" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_comparisons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID,
    "analysis_id_old" TEXT,
    "analysis_id_new" TEXT,
    "comparison_summary" JSONB,
    "score_changes" JSONB,
    "recommendations_completed" INTEGER,
    "recommendations_pending" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "step_name" VARCHAR(100) NOT NULL,
    "step_order" INTEGER NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "progress_percentage" INTEGER DEFAULT 0,
    "started_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "duration_seconds" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "analysis_id" TEXT,
    "api_service" VARCHAR(100),
    "endpoint" VARCHAR(255),
    "request_method" VARCHAR(10),
    "request_payload" JSONB,
    "response_status" INTEGER,
    "response_time_ms" INTEGER,
    "tokens_used" INTEGER,
    "cost_usd" DECIMAL(10,6),
    "error_message" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_element_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eov_b2b_id" UUID,
    "element_name" VARCHAR(100) NOT NULL,
    "element_category" VARCHAR(50) NOT NULL,
    "category_level" INTEGER,
    "score" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "weighted_score" DECIMAL(5,2),
    "evidence" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_element_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_value_element_reference" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "element_name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "subcategory" VARCHAR(50),
    "display_name" VARCHAR(100),
    "definition" TEXT,
    "importance_weight" DECIMAL(5,2) DEFAULT 1.0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_value_element_reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2c_element_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "eov_b2c_id" UUID,
    "element_name" VARCHAR(100) NOT NULL,
    "element_category" VARCHAR(50) NOT NULL,
    "pyramid_level" INTEGER,
    "score" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "weighted_score" DECIMAL(5,2),
    "evidence" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2c_element_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "best_practice_issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lighthouse_id" UUID,
    "category" VARCHAR(100),
    "severity" VARCHAR(20),
    "description" TEXT NOT NULL,
    "affected_resources" JSONB,
    "recommendation" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "best_practice_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_analysis" (
    "id" INTEGER NOT NULL,
    "website_url" VARCHAR(255),
    "company_name" VARCHAR(255),
    "analysis_date" DATE,
    "main_value_theme" TEXT,
    "why_statement" TEXT,
    "target_audience" VARCHAR(255),
    "analysis_id" TEXT,
    "brand_alignment_score" DECIMAL(5,2),
    "value_consistency_score" DECIMAL(5,2),
    "brand_clarity_score" DECIMAL(5,2),
    "overall_brand_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_patterns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "theme_id" UUID,
    "pattern_type" VARCHAR(50),
    "pattern_text" VARCHAR(500) NOT NULL,
    "pattern_weight" DECIMAL(3,2) DEFAULT 1.0,
    "context_required" VARCHAR(100),
    "examples" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_pillars" (
    "id" INTEGER NOT NULL,
    "brand_analysis_id" INTEGER,
    "pillar_rank" INTEGER,
    "pillar_name" VARCHAR(100),
    "pillar_description" TEXT,
    "supporting_evidence" TEXT,
    "frequency_score" INTEGER,

    CONSTRAINT "brand_pillars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_theme_reference" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "theme_name" VARCHAR(100) NOT NULL,
    "theme_category" VARCHAR(50),
    "theme_description" TEXT,
    "common_phrases" JSONB,
    "associated_elements" JSONB,
    "associated_strengths" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_theme_reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_to_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_analysis_id" UUID,
    "cta_text" VARCHAR(500) NOT NULL,
    "cta_url" VARCHAR(2048),
    "cta_type" VARCHAR(50),
    "prominence" VARCHAR(20),
    "position_on_page" VARCHAR(50),
    "clarity_score" DECIMAL(5,2),
    "urgency_level" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_to_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clifton_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clifton_analysis_id" UUID,
    "insight_category" VARCHAR(50),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "supporting_themes" JSONB,
    "priority" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clifton_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clifton_strengths_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "overall_score" DECIMAL(5,2),
    "strategic_thinking_score" DECIMAL(5,2),
    "executing_score" DECIMAL(5,2),
    "influencing_score" DECIMAL(5,2),
    "relationship_building_score" DECIMAL(5,2),
    "dominant_domain" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clifton_strengths_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clifton_theme_patterns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "theme_id" UUID,
    "pattern_type" VARCHAR(50),
    "pattern_text" VARCHAR(500) NOT NULL,
    "strength_indicator" DECIMAL(3,2),
    "context_clues" TEXT,
    "examples" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clifton_theme_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clifton_theme_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clifton_analysis_id" UUID,
    "theme_name" VARCHAR(100) NOT NULL,
    "domain" VARCHAR(50) NOT NULL,
    "score" DECIMAL(5,2),
    "rank" INTEGER,
    "is_top_5" BOOLEAN DEFAULT false,
    "is_top_10" BOOLEAN DEFAULT false,
    "evidence" JSONB,
    "manifestation_description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clifton_theme_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clifton_themes_reference" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "theme_name" VARCHAR(100) NOT NULL,
    "domain" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "key_indicators" JSONB,
    "complementary_themes" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clifton_themes_reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitive_keywords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seo_analysis_id" UUID,
    "competitor_url" VARCHAR(2048) NOT NULL,
    "competitor_name" VARCHAR(255),
    "keyword" VARCHAR(255) NOT NULL,
    "our_position" INTEGER,
    "competitor_position" INTEGER,
    "position_gap" INTEGER,
    "search_volume" INTEGER,
    "keyword_value" DECIMAL(10,2),
    "priority" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitive_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "page_url" VARCHAR(2048) NOT NULL,
    "title" VARCHAR(500),
    "meta_description" TEXT,
    "word_count" INTEGER,
    "reading_level" VARCHAR(50),
    "reading_ease_score" DECIMAL(5,2),
    "keyword_density" JSONB,
    "content_quality_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "brand_pillar_alignment" JSONB,
    "sentiment_score" DECIMAL(3,2),
    "value_theme_consistency" DECIMAL(5,2),
    "brand_messaging_consistency" DECIMAL(5,2),

    CONSTRAINT "content_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_gaps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seo_analysis_id" UUID,
    "topic" VARCHAR(255) NOT NULL,
    "opportunity_description" TEXT,
    "target_keywords" JSONB,
    "estimated_traffic" INTEGER,
    "competition_level" VARCHAR(20),
    "content_type" VARCHAR(50),
    "priority" VARCHAR(20),
    "recommended_word_count" INTEGER,
    "suggested_outline" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_gaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_snippets" (
    "id" INTEGER NOT NULL,
    "brand_analysis_id" INTEGER,
    "page_section" VARCHAR(100),
    "snippet_text" TEXT,
    "sentiment_score" DECIMAL(3,2),
    "associated_pillar_id" INTEGER,

    CONSTRAINT "content_snippets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_structure" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_analysis_id" UUID,
    "element_type" VARCHAR(50),
    "element_level" INTEGER,
    "element_order" INTEGER,
    "content" TEXT,
    "attributes" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_web_vitals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lighthouse_id" UUID,
    "fcp_ms" INTEGER,
    "lcp_ms" INTEGER,
    "tbt_ms" INTEGER,
    "cls_score" DECIMAL(5,3),
    "si_ms" INTEGER,
    "tti_ms" INTEGER,
    "fmp_ms" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_web_vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "analysis_id" TEXT,
    "transaction_type" VARCHAR(50),
    "amount" INTEGER,
    "balance_after" INTEGER,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elements_of_value_b2b" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "overall_score" DECIMAL(5,2),
    "table_stakes_score" DECIMAL(5,2),
    "functional_score" DECIMAL(5,2),
    "ease_of_business_score" DECIMAL(5,2),
    "individual_score" DECIMAL(5,2),
    "inspirational_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elements_of_value_b2b_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elements_of_value_b2c" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "overall_score" DECIMAL(5,2),
    "functional_score" DECIMAL(5,2),
    "emotional_score" DECIMAL(5,2),
    "life_changing_score" DECIMAL(5,2),
    "social_impact_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elements_of_value_b2c_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "flag_name" VARCHAR(100) NOT NULL,
    "is_enabled" BOOLEAN DEFAULT false,
    "description" TEXT,
    "rollout_percentage" INTEGER DEFAULT 0,
    "target_users" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "user_id" TEXT,
    "report_type" VARCHAR(50),
    "report_format" VARCHAR(20),
    "file_url" VARCHAR(2048),
    "file_size_kb" INTEGER,
    "sections_included" JSONB,
    "customizations" JSONB,
    "generated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "downloaded_at" TIMESTAMP(6),
    "download_count" INTEGER DEFAULT 0,
    "expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_circle_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "overall_score" DECIMAL(5,2),
    "alignment_score" DECIMAL(5,2),
    "clarity_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "main_value_theme" TEXT,
    "brand_alignment_score" DECIMAL(5,2),
    "target_audience_specificity" DECIMAL(5,2),
    "value_consistency_score" DECIMAL(5,2),
    "brand_clarity_score" DECIMAL(5,2),

    CONSTRAINT "golden_circle_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_circle_how" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "golden_circle_id" UUID,
    "score" DECIMAL(5,2),
    "current_state" TEXT NOT NULL,
    "uniqueness_rating" DECIMAL(5,2),
    "clarity_rating" DECIMAL(5,2),
    "credibility_rating" DECIMAL(5,2),
    "specificity_rating" DECIMAL(5,2),
    "evidence" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golden_circle_how_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_circle_patterns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dimension" VARCHAR(20),
    "indicator_type" VARCHAR(50),
    "pattern_category" VARCHAR(50),
    "pattern_text" VARCHAR(500) NOT NULL,
    "score_impact" DECIMAL(3,2),
    "examples" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golden_circle_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_circle_what" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "golden_circle_id" UUID,
    "score" DECIMAL(5,2),
    "current_state" TEXT NOT NULL,
    "clarity_rating" DECIMAL(5,2),
    "completeness_rating" DECIMAL(5,2),
    "value_articulation_rating" DECIMAL(5,2),
    "cta_clarity_rating" DECIMAL(5,2),
    "evidence" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golden_circle_what_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_circle_who" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "golden_circle_id" UUID,
    "score" DECIMAL(5,2),
    "current_state" TEXT NOT NULL,
    "specificity_rating" DECIMAL(5,2),
    "resonance_rating" DECIMAL(5,2),
    "accessibility_rating" DECIMAL(5,2),
    "conversion_path_rating" DECIMAL(5,2),
    "evidence" JSONB,
    "recommendations" JSONB,
    "target_personas" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golden_circle_who_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_circle_why" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "golden_circle_id" UUID,
    "score" DECIMAL(5,2),
    "current_state" TEXT NOT NULL,
    "clarity_rating" DECIMAL(5,2),
    "authenticity_rating" DECIMAL(5,2),
    "emotional_resonance_rating" DECIMAL(5,2),
    "differentiation_rating" DECIMAL(5,2),
    "evidence" JSONB,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golden_circle_why_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_trends_data" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seo_analysis_id" UUID,
    "keyword" VARCHAR(255) NOT NULL,
    "trend_direction" VARCHAR(20),
    "trend_percentage" DECIMAL(5,2),
    "peak_interest_date" DATE,
    "seasonal_pattern" JSONB,
    "geographic_data" JSONB,
    "related_queries" JSONB,
    "related_topics" JSONB,
    "fetched_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_trends_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growth_barriers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transformation_id" UUID,
    "barrier_type" VARCHAR(100),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" VARCHAR(20),
    "impact_score" DECIMAL(5,2),
    "affected_areas" JSONB,
    "root_cause" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "growth_barriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growth_opportunities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transformation_id" UUID,
    "opportunity_type" VARCHAR(100),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "potential_impact" VARCHAR(20),
    "impact_score" DECIMAL(5,2),
    "effort_required" VARCHAR(20),
    "timeframe" VARCHAR(50),
    "supporting_data" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "growth_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individual_reports" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "analysis_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "score" INTEGER,
    "timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "individual_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_terminology" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "industry" VARCHAR(100) NOT NULL,
    "standard_term" VARCHAR(100) NOT NULL,
    "industry_term" VARCHAR(100) NOT NULL,
    "confidence_score" DECIMAL(3,2) DEFAULT 0.8,
    "usage_examples" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industry_terminology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_opportunities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seo_analysis_id" UUID,
    "keyword" VARCHAR(255) NOT NULL,
    "search_volume" INTEGER,
    "competition" VARCHAR(20),
    "keyword_difficulty" INTEGER,
    "opportunity_score" DECIMAL(5,2),
    "relevance_score" DECIMAL(5,2),
    "current_ranking" INTEGER,
    "estimated_traffic" INTEGER,
    "priority" VARCHAR(20),
    "content_gap" BOOLEAN DEFAULT false,
    "recommended_action" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyword_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_rankings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seo_analysis_id" UUID,
    "keyword" VARCHAR(255) NOT NULL,
    "current_position" INTEGER,
    "previous_position" INTEGER,
    "position_change" INTEGER,
    "search_volume" INTEGER,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "ctr" DECIMAL(5,2),
    "avg_position" DECIMAL(5,2),
    "competition_level" VARCHAR(20),
    "keyword_difficulty" INTEGER,
    "opportunity_score" DECIMAL(5,2),
    "checked_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyword_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lighthouse_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "page_url" VARCHAR(2048) NOT NULL,
    "performance_score" DECIMAL(5,2),
    "accessibility_score" DECIMAL(5,2),
    "best_practices_score" DECIMAL(5,2),
    "seo_score" DECIMAL(5,2),
    "pwa_score" DECIMAL(5,2),
    "overall_grade" VARCHAR(10),
    "tested_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "test_device" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lighthouse_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markdown_exports" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "analysis_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "overall_score" INTEGER,
    "rating" TEXT,
    "exported_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "markdown_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_analysis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_analysis_id" UUID,
    "media_type" VARCHAR(50),
    "media_url" VARCHAR(2048),
    "alt_text" TEXT,
    "file_size_kb" INTEGER,
    "dimensions" VARCHAR(50),
    "format" VARCHAR(20),
    "optimized" BOOLEAN DEFAULT false,
    "optimization_recommendation" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "notification_type" VARCHAR(100),
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "action_url" VARCHAR(2048),
    "priority" VARCHAR(20) DEFAULT 'normal',
    "read_at" TIMESTAMP(6),
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_screenshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "page_url" VARCHAR(2048) NOT NULL,
    "screenshot_url" VARCHAR(2048),
    "device_type" VARCHAR(50),
    "viewport_width" INTEGER,
    "viewport_height" INTEGER,
    "file_size_kb" INTEGER,
    "captured_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_screenshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seo_analysis_id" UUID,
    "page_url" VARCHAR(2048) NOT NULL,
    "page_title" VARCHAR(500),
    "title_tag_score" DECIMAL(5,2),
    "meta_description_score" DECIMAL(5,2),
    "heading_structure_score" DECIMAL(5,2),
    "content_quality_score" DECIMAL(5,2),
    "image_optimization_score" DECIMAL(5,2),
    "internal_linking_score" DECIMAL(5,2),
    "overall_page_score" DECIMAL(5,2),
    "primary_keyword" VARCHAR(255),
    "word_count" INTEGER,
    "recommendations" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_seo_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "pattern_type" VARCHAR(50),
    "pattern_id" UUID,
    "matched_text" TEXT,
    "context_text" TEXT,
    "confidence_score" DECIMAL(5,4),
    "page_url" VARCHAR(2048),
    "position_in_content" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pattern_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lighthouse_id" UUID,
    "metric_name" VARCHAR(100) NOT NULL,
    "metric_value" DECIMAL(10,2),
    "metric_unit" VARCHAR(20),
    "rating" VARCHAR(20),
    "target_value" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "category" VARCHAR(100),
    "priority" VARCHAR(20),
    "priority_score" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "expected_impact" VARCHAR(20),
    "impact_score" DECIMAL(5,2),
    "effort_required" VARCHAR(20),
    "timeframe" VARCHAR(50),
    "success_metrics" JSONB,
    "implementation_steps" JSONB,
    "resources_needed" JSONB,
    "dependencies" JSONB,
    "status" VARCHAR(50) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_name" VARCHAR(255) NOT NULL,
    "template_type" VARCHAR(50),
    "description" TEXT,
    "sections" JSONB,
    "styling" JSONB,
    "is_default" BOOLEAN DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phase_id" UUID,
    "recommendation_id" UUID,
    "action_order" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "action_type" VARCHAR(100),
    "owner_role" VARCHAR(100),
    "estimated_hours" INTEGER,
    "expected_impact" VARCHAR(20),
    "status" VARCHAR(50) DEFAULT 'not-started',
    "dependencies" JSONB,
    "resources" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_phases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transformation_id" UUID,
    "phase_number" INTEGER NOT NULL,
    "phase_name" VARCHAR(100) NOT NULL,
    "duration_weeks" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "objectives" JSONB,
    "success_criteria" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "website_id" UUID,
    "primary_keyword" VARCHAR(255),
    "overall_seo_score" DECIMAL(5,2),
    "technical_seo_score" DECIMAL(5,2),
    "content_quality_score" DECIMAL(5,2),
    "keyword_optimization_score" DECIMAL(5,2),
    "backlink_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lighthouse_id" UUID,
    "severity" VARCHAR(20),
    "issue_type" VARCHAR(100),
    "description" TEXT NOT NULL,
    "current_value" TEXT,
    "recommended_value" TEXT,
    "impact_score" DECIMAL(5,2),
    "fix_effort" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "plan" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'active',
    "billing_cycle" VARCHAR(20),
    "price_per_cycle" DECIMAL(10,2),
    "currency" VARCHAR(3) DEFAULT 'USD',
    "credits_per_cycle" INTEGER,
    "started_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "current_period_start" TIMESTAMP(6),
    "current_period_end" TIMESTAMP(6),
    "cancel_at_period_end" BOOLEAN DEFAULT false,
    "cancelled_at" TIMESTAMP(6),
    "ended_at" TIMESTAMP(6),
    "stripe_subscription_id" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "success_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transformation_id" UUID,
    "metric_name" VARCHAR(255) NOT NULL,
    "metric_category" VARCHAR(100),
    "current_value" DECIMAL(10,2),
    "target_value" DECIMAL(10,2),
    "unit" VARCHAR(50),
    "timeframe" VARCHAR(50),
    "measurement_method" TEXT,
    "tracking_tool" VARCHAR(100),
    "priority" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "success_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" TEXT,
    "config_type" VARCHAR(50),
    "description" TEXT,
    "is_public" BOOLEAN DEFAULT false,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_seo_audit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seo_analysis_id" UUID,
    "audit_category" VARCHAR(100),
    "issue_type" VARCHAR(100),
    "severity" VARCHAR(20),
    "description" TEXT NOT NULL,
    "affected_pages" INTEGER,
    "affected_urls" JSONB,
    "fix_recommendation" TEXT,
    "fix_effort" VARCHAR(20),
    "impact_score" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technical_seo_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transformation_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "current_state" TEXT NOT NULL,
    "desired_state" TEXT NOT NULL,
    "transformation_score" DECIMAL(5,2),
    "gap_analysis" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transformation_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "preference_key" VARCHAR(100) NOT NULL,
    "preference_value" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_element_patterns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "element_id" UUID,
    "pattern_type" VARCHAR(50),
    "pattern_text" VARCHAR(500) NOT NULL,
    "pattern_weight" DECIMAL(3,2) DEFAULT 1.0,
    "context_required" VARCHAR(100),
    "examples" TEXT,
    "language" VARCHAR(10) DEFAULT 'en',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "value_element_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_element_reference" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "element_name" VARCHAR(100) NOT NULL,
    "element_category" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100),
    "definition" TEXT,
    "business_type" VARCHAR(20),
    "importance_weight" DECIMAL(5,2) DEFAULT 1.0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "value_element_reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "analysis_id" TEXT,
    "insight_type" VARCHAR(50),
    "category" VARCHAR(50),
    "priority" VARCHAR(20),
    "description" TEXT NOT NULL,
    "supporting_elements" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "value_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "websites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" VARCHAR(2048) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500),
    "description" TEXT,
    "industry" VARCHAR(100),
    "business_type" VARCHAR(50),
    "first_analyzed_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "last_analyzed_at" TIMESTAMP(6),
    "total_analyses" INTEGER DEFAULT 0,
    "created_by" TEXT,

    CONSTRAINT "websites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ContentSnapshot_userId_idx" ON "ContentSnapshot"("userId");

-- CreateIndex
CREATE INDEX "ContentSnapshot_url_idx" ON "ContentSnapshot"("url");

-- CreateIndex
CREATE INDEX "ProposedContent_snapshotId_idx" ON "ProposedContent"("snapshotId");

-- CreateIndex
CREATE INDEX "ProposedContent_status_idx" ON "ProposedContent"("status");

-- CreateIndex
CREATE INDEX "ContentComparison_existingId_idx" ON "ContentComparison"("existingId");

-- CreateIndex
CREATE INDEX "ContentComparison_proposedId_idx" ON "ContentComparison"("proposedId");

-- CreateIndex
CREATE INDEX "FrameworkResult_analysisId_idx" ON "FrameworkResult"("analysisId");

-- CreateIndex
CREATE INDEX "FrameworkResult_framework_idx" ON "FrameworkResult"("framework");

-- CreateIndex
CREATE INDEX "FrameworkResult_score_idx" ON "FrameworkResult"("score");

-- CreateIndex
CREATE INDEX "FrameworkCategory_frameworkResultId_idx" ON "FrameworkCategory"("frameworkResultId");

-- CreateIndex
CREATE INDEX "FrameworkCategory_categoryName_idx" ON "FrameworkCategory"("categoryName");

-- CreateIndex
CREATE INDEX "FrameworkElement_categoryId_idx" ON "FrameworkElement"("categoryId");

-- CreateIndex
CREATE INDEX "FrameworkElement_elementName_idx" ON "FrameworkElement"("elementName");

-- CreateIndex
CREATE INDEX "FrameworkElement_isPresent_idx" ON "FrameworkElement"("isPresent");

-- CreateIndex
CREATE INDEX "idx_accessibility_severity" ON "accessibility_issues"("severity");

-- CreateIndex
CREATE INDEX "idx_audit_log_analysis" ON "analysis_audit_log"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_comparisons_website" ON "analysis_comparisons"("website_id");

-- CreateIndex
CREATE INDEX "idx_progress_analysis_id" ON "analysis_progress"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_progress_status" ON "analysis_progress"("status");

-- CreateIndex
CREATE INDEX "idx_api_usage_created" ON "api_usage_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_api_usage_service" ON "api_usage_log"("api_service");

-- CreateIndex
CREATE INDEX "idx_api_usage_user" ON "api_usage_log"("user_id");

-- CreateIndex
CREATE INDEX "idx_b2b_elements_category" ON "b2b_element_scores"("element_category");

-- CreateIndex
CREATE INDEX "idx_b2b_elements_score" ON "b2b_element_scores"("score");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_value_element_reference_element_name_key" ON "b2b_value_element_reference"("element_name");

-- CreateIndex
CREATE INDEX "idx_b2b_element_category" ON "b2b_value_element_reference"("category");

-- CreateIndex
CREATE INDEX "idx_b2b_element_subcategory" ON "b2b_value_element_reference"("subcategory");

-- CreateIndex
CREATE INDEX "idx_b2c_elements_category" ON "b2c_element_scores"("element_category");

-- CreateIndex
CREATE INDEX "idx_b2c_elements_score" ON "b2c_element_scores"("score");

-- CreateIndex
CREATE INDEX "idx_brand_analysis_analysis" ON "brand_analysis"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_brand_analysis_company" ON "brand_analysis"("company_name");

-- CreateIndex
CREATE INDEX "idx_brand_patterns_theme" ON "brand_patterns"("theme_id");

-- CreateIndex
CREATE INDEX "idx_brand_patterns_type" ON "brand_patterns"("pattern_type");

-- CreateIndex
CREATE INDEX "idx_brand_pillars_brand" ON "brand_pillars"("brand_analysis_id");

-- CreateIndex
CREATE INDEX "idx_brand_pillars_rank" ON "brand_pillars"("pillar_rank");

-- CreateIndex
CREATE UNIQUE INDEX "brand_theme_reference_theme_name_key" ON "brand_theme_reference"("theme_name");

-- CreateIndex
CREATE INDEX "idx_brand_theme_category" ON "brand_theme_reference"("theme_category");

-- CreateIndex
CREATE INDEX "idx_ctas_analysis" ON "call_to_actions"("content_analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "clifton_strengths_analyses_analysis_id_key" ON "clifton_strengths_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_clifton_analysis" ON "clifton_strengths_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_clifton_patterns_theme" ON "clifton_theme_patterns"("theme_id");

-- CreateIndex
CREATE INDEX "idx_clifton_themes_domain" ON "clifton_theme_scores"("domain");

-- CreateIndex
CREATE INDEX "idx_clifton_themes_rank" ON "clifton_theme_scores"("rank");

-- CreateIndex
CREATE INDEX "idx_clifton_themes_score" ON "clifton_theme_scores"("score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "clifton_themes_reference_theme_name_key" ON "clifton_themes_reference"("theme_name");

-- CreateIndex
CREATE INDEX "idx_content_analysis" ON "content_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_content_gaps_priority" ON "content_gaps"("priority");

-- CreateIndex
CREATE INDEX "idx_content_snippets_brand" ON "content_snippets"("brand_analysis_id");

-- CreateIndex
CREATE INDEX "idx_content_snippets_pillar" ON "content_snippets"("associated_pillar_id");

-- CreateIndex
CREATE INDEX "idx_content_snippets_sentiment" ON "content_snippets"("sentiment_score");

-- CreateIndex
CREATE INDEX "idx_content_structure_analysis" ON "content_structure"("content_analysis_id");

-- CreateIndex
CREATE INDEX "idx_vitals_lighthouse" ON "core_web_vitals"("lighthouse_id");

-- CreateIndex
CREATE INDEX "idx_credit_transactions_created" ON "credit_transactions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_credit_transactions_user" ON "credit_transactions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "elements_of_value_b2b_analysis_id_key" ON "elements_of_value_b2b"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_b2b_eov_analysis" ON "elements_of_value_b2b"("analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "elements_of_value_b2c_analysis_id_key" ON "elements_of_value_b2c"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_b2c_eov_analysis" ON "elements_of_value_b2c"("analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_flag_name_key" ON "feature_flags"("flag_name");

-- CreateIndex
CREATE INDEX "idx_reports_analysis" ON "generated_reports"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_reports_user" ON "generated_reports"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "golden_circle_analyses_analysis_id_key" ON "golden_circle_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_golden_circle_analysis_id" ON "golden_circle_analyses"("analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "golden_circle_how_golden_circle_id_key" ON "golden_circle_how"("golden_circle_id");

-- CreateIndex
CREATE INDEX "idx_gc_patterns_dimension" ON "golden_circle_patterns"("dimension");

-- CreateIndex
CREATE UNIQUE INDEX "golden_circle_what_golden_circle_id_key" ON "golden_circle_what"("golden_circle_id");

-- CreateIndex
CREATE UNIQUE INDEX "golden_circle_who_golden_circle_id_key" ON "golden_circle_who"("golden_circle_id");

-- CreateIndex
CREATE UNIQUE INDEX "golden_circle_why_golden_circle_id_key" ON "golden_circle_why"("golden_circle_id");

-- CreateIndex
CREATE INDEX "idx_trends_keyword" ON "google_trends_data"("keyword");

-- CreateIndex
CREATE INDEX "idx_barriers_severity" ON "growth_barriers"("severity");

-- CreateIndex
CREATE INDEX "idx_opportunities_impact" ON "growth_opportunities"("impact_score" DESC);

-- CreateIndex
CREATE INDEX "idx_individual_reports_analysis_id" ON "individual_reports"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_individual_reports_createdat" ON "individual_reports"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_individual_reports_phase" ON "individual_reports"("phase");

-- CreateIndex
CREATE INDEX "idx_individual_reports_timestamp" ON "individual_reports"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_industry_terms" ON "industry_terminology"("industry", "standard_term");

-- CreateIndex
CREATE INDEX "idx_opportunities_priority" ON "keyword_opportunities"("priority");

-- CreateIndex
CREATE INDEX "idx_keyword_rankings_keyword" ON "keyword_rankings"("keyword");

-- CreateIndex
CREATE INDEX "idx_keyword_rankings_seo" ON "keyword_rankings"("seo_analysis_id");

-- CreateIndex
CREATE INDEX "idx_lighthouse_analysis" ON "lighthouse_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_lighthouse_page_url" ON "lighthouse_analyses"("page_url");

-- CreateIndex
CREATE UNIQUE INDEX "markdown_exports_analysis_id_key" ON "markdown_exports"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_markdown_exports_analysis_id" ON "markdown_exports"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_markdown_exports_createdat" ON "markdown_exports"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_markdown_exports_url" ON "markdown_exports"("url");

-- CreateIndex
CREATE INDEX "idx_media_analysis" ON "media_analysis"("content_analysis_id");

-- CreateIndex
CREATE INDEX "idx_notifications_created" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_screenshots_analysis" ON "page_screenshots"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_pattern_matches_analysis" ON "pattern_matches"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_recommendations_category" ON "recommendations"("category");

-- CreateIndex
CREATE INDEX "idx_recommendations_priority" ON "recommendations"("priority", "priority_score" DESC);

-- CreateIndex
CREATE INDEX "idx_recommendations_status" ON "recommendations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "seo_analyses_analysis_id_key" ON "seo_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_seo_analysis" ON "seo_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_seo_issues_severity" ON "seo_issues"("severity");

-- CreateIndex
CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "idx_subscriptions_user" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_config_key_key" ON "system_config"("config_key");

-- CreateIndex
CREATE UNIQUE INDEX "transformation_analyses_analysis_id_key" ON "transformation_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_transformation_analysis" ON "transformation_analyses"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_user_preferences_user" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_preference_key_key" ON "user_preferences"("user_id", "preference_key");

-- CreateIndex
CREATE INDEX "idx_patterns_element" ON "value_element_patterns"("element_id");

-- CreateIndex
CREATE INDEX "idx_patterns_text" ON "value_element_patterns"("pattern_text");

-- CreateIndex
CREATE UNIQUE INDEX "value_element_reference_element_name_key" ON "value_element_reference"("element_name");

-- CreateIndex
CREATE INDEX "idx_value_element_ref" ON "value_element_reference"("element_category");

-- CreateIndex
CREATE INDEX "idx_insights_analysis" ON "value_insights"("analysis_id");

-- CreateIndex
CREATE INDEX "idx_insights_priority" ON "value_insights"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "websites_url_key" ON "websites"("url");

-- CreateIndex
CREATE INDEX "idx_websites_created_by" ON "websites"("created_by");

-- CreateIndex
CREATE INDEX "idx_websites_domain" ON "websites"("domain");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ContentSnapshot" ADD CONSTRAINT "ContentSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposedContent" ADD CONSTRAINT "ProposedContent_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ContentSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentComparison" ADD CONSTRAINT "ContentComparison_existingId_fkey" FOREIGN KEY ("existingId") REFERENCES "ContentSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentComparison" ADD CONSTRAINT "ContentComparison_proposedId_fkey" FOREIGN KEY ("proposedId") REFERENCES "ProposedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkResult" ADD CONSTRAINT "FrameworkResult_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkCategory" ADD CONSTRAINT "FrameworkCategory_frameworkResultId_fkey" FOREIGN KEY ("frameworkResultId") REFERENCES "FrameworkResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrameworkElement" ADD CONSTRAINT "FrameworkElement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FrameworkCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessibility_issues" ADD CONSTRAINT "accessibility_issues_lighthouse_id_fkey" FOREIGN KEY ("lighthouse_id") REFERENCES "lighthouse_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "analysis_audit_log" ADD CONSTRAINT "analysis_audit_log_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "analysis_audit_log" ADD CONSTRAINT "analysis_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "analysis_comparisons" ADD CONSTRAINT "analysis_comparisons_analysis_id_new_fkey" FOREIGN KEY ("analysis_id_new") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "analysis_comparisons" ADD CONSTRAINT "analysis_comparisons_analysis_id_old_fkey" FOREIGN KEY ("analysis_id_old") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "analysis_comparisons" ADD CONSTRAINT "analysis_comparisons_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "analysis_progress" ADD CONSTRAINT "analysis_progress_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "api_usage_log" ADD CONSTRAINT "api_usage_log_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "api_usage_log" ADD CONSTRAINT "api_usage_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "b2b_element_scores" ADD CONSTRAINT "b2b_element_scores_eov_b2b_id_fkey" FOREIGN KEY ("eov_b2b_id") REFERENCES "elements_of_value_b2b"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "b2c_element_scores" ADD CONSTRAINT "b2c_element_scores_eov_b2c_id_fkey" FOREIGN KEY ("eov_b2c_id") REFERENCES "elements_of_value_b2c"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "best_practice_issues" ADD CONSTRAINT "best_practice_issues_lighthouse_id_fkey" FOREIGN KEY ("lighthouse_id") REFERENCES "lighthouse_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "brand_patterns" ADD CONSTRAINT "brand_patterns_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "brand_theme_reference"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "brand_pillars" ADD CONSTRAINT "brand_pillars_brand_analysis_id_fkey" FOREIGN KEY ("brand_analysis_id") REFERENCES "brand_analysis"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "call_to_actions" ADD CONSTRAINT "call_to_actions_content_analysis_id_fkey" FOREIGN KEY ("content_analysis_id") REFERENCES "content_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clifton_insights" ADD CONSTRAINT "clifton_insights_clifton_analysis_id_fkey" FOREIGN KEY ("clifton_analysis_id") REFERENCES "clifton_strengths_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clifton_strengths_analyses" ADD CONSTRAINT "clifton_strengths_analyses_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clifton_theme_patterns" ADD CONSTRAINT "clifton_theme_patterns_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "clifton_themes_reference"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clifton_theme_scores" ADD CONSTRAINT "clifton_theme_scores_clifton_analysis_id_fkey" FOREIGN KEY ("clifton_analysis_id") REFERENCES "clifton_strengths_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competitive_keywords" ADD CONSTRAINT "competitive_keywords_seo_analysis_id_fkey" FOREIGN KEY ("seo_analysis_id") REFERENCES "seo_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_analyses" ADD CONSTRAINT "content_analyses_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_gaps" ADD CONSTRAINT "content_gaps_seo_analysis_id_fkey" FOREIGN KEY ("seo_analysis_id") REFERENCES "seo_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_snippets" ADD CONSTRAINT "content_snippets_associated_pillar_id_fkey" FOREIGN KEY ("associated_pillar_id") REFERENCES "brand_pillars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_snippets" ADD CONSTRAINT "content_snippets_brand_analysis_id_fkey" FOREIGN KEY ("brand_analysis_id") REFERENCES "brand_analysis"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "content_structure" ADD CONSTRAINT "content_structure_content_analysis_id_fkey" FOREIGN KEY ("content_analysis_id") REFERENCES "content_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core_web_vitals" ADD CONSTRAINT "core_web_vitals_lighthouse_id_fkey" FOREIGN KEY ("lighthouse_id") REFERENCES "lighthouse_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elements_of_value_b2b" ADD CONSTRAINT "elements_of_value_b2b_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elements_of_value_b2c" ADD CONSTRAINT "elements_of_value_b2c_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "golden_circle_analyses" ADD CONSTRAINT "golden_circle_analyses_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "golden_circle_how" ADD CONSTRAINT "golden_circle_how_golden_circle_id_fkey" FOREIGN KEY ("golden_circle_id") REFERENCES "golden_circle_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "golden_circle_what" ADD CONSTRAINT "golden_circle_what_golden_circle_id_fkey" FOREIGN KEY ("golden_circle_id") REFERENCES "golden_circle_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "golden_circle_who" ADD CONSTRAINT "golden_circle_who_golden_circle_id_fkey" FOREIGN KEY ("golden_circle_id") REFERENCES "golden_circle_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "golden_circle_why" ADD CONSTRAINT "golden_circle_why_golden_circle_id_fkey" FOREIGN KEY ("golden_circle_id") REFERENCES "golden_circle_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "google_trends_data" ADD CONSTRAINT "google_trends_data_seo_analysis_id_fkey" FOREIGN KEY ("seo_analysis_id") REFERENCES "seo_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "growth_barriers" ADD CONSTRAINT "growth_barriers_transformation_id_fkey" FOREIGN KEY ("transformation_id") REFERENCES "transformation_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "growth_opportunities" ADD CONSTRAINT "growth_opportunities_transformation_id_fkey" FOREIGN KEY ("transformation_id") REFERENCES "transformation_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "individual_reports" ADD CONSTRAINT "fk_analysis" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "keyword_opportunities" ADD CONSTRAINT "keyword_opportunities_seo_analysis_id_fkey" FOREIGN KEY ("seo_analysis_id") REFERENCES "seo_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "keyword_rankings" ADD CONSTRAINT "keyword_rankings_seo_analysis_id_fkey" FOREIGN KEY ("seo_analysis_id") REFERENCES "seo_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lighthouse_analyses" ADD CONSTRAINT "lighthouse_analyses_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "markdown_exports" ADD CONSTRAINT "fk_analysis_export" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "media_analysis" ADD CONSTRAINT "media_analysis_content_analysis_id_fkey" FOREIGN KEY ("content_analysis_id") REFERENCES "content_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "page_screenshots" ADD CONSTRAINT "page_screenshots_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "page_seo_scores" ADD CONSTRAINT "page_seo_scores_seo_analysis_id_fkey" FOREIGN KEY ("seo_analysis_id") REFERENCES "seo_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pattern_matches" ADD CONSTRAINT "pattern_matches_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_lighthouse_id_fkey" FOREIGN KEY ("lighthouse_id") REFERENCES "lighthouse_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roadmap_actions" ADD CONSTRAINT "roadmap_actions_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "roadmap_phases"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roadmap_actions" ADD CONSTRAINT "roadmap_actions_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roadmap_phases" ADD CONSTRAINT "roadmap_phases_transformation_id_fkey" FOREIGN KEY ("transformation_id") REFERENCES "transformation_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seo_analyses" ADD CONSTRAINT "seo_analyses_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seo_analyses" ADD CONSTRAINT "seo_analyses_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_lighthouse_id_fkey" FOREIGN KEY ("lighthouse_id") REFERENCES "lighthouse_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "success_metrics" ADD CONSTRAINT "success_metrics_transformation_id_fkey" FOREIGN KEY ("transformation_id") REFERENCES "transformation_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "technical_seo_audit" ADD CONSTRAINT "technical_seo_audit_seo_analysis_id_fkey" FOREIGN KEY ("seo_analysis_id") REFERENCES "seo_analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transformation_analyses" ADD CONSTRAINT "transformation_analyses_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "value_element_patterns" ADD CONSTRAINT "value_element_patterns_element_id_fkey" FOREIGN KEY ("element_id") REFERENCES "value_element_reference"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "value_insights" ADD CONSTRAINT "value_insights_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "websites" ADD CONSTRAINT "websites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

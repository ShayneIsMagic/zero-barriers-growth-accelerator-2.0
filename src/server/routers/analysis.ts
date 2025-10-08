import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { aiAnalysisService } from '@/ai/analysis-service';
import { prisma } from '@/lib/prisma';

const analysisInputSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
  contentType: z.enum(['marketing', 'website', 'social', 'email']),
  options: z
    .object({
      frameworks: z.array(z.string()).optional(),
      focusAreas: z.array(z.string()).optional(),
    })
    .optional(),
});

const analysisResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  contentType: z.string(),
  score: z.number().nullable(),
  insights: z.string().nullable(),
  frameworks: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const analysisRouter = createTRPCRouter({
  // Public analysis (limited features)
  analyzeContent: publicProcedure
    .input(analysisInputSchema)
    .output(analysisResultSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await aiAnalysisService.analyzeContent(
          input.content,
          input.options as any
        );

        // Store in database (if user is authenticated)
        const analysis = await prisma.analysis.create({
          data: {
            content: input.content,
            contentType: input.contentType,
            score: result.goldenCircle?.overallScore || 0,
            insights: JSON.stringify(
              result.recommendations?.recommendations || []
            ),
            frameworks: JSON.stringify(
              result.goldenCircle ? ['golden-circle'] : []
            ),
            status: 'completed',
            userId: null, // Anonymous analysis
          },
        });

        return {
          id: analysis.id,
          content: analysis.content,
          contentType: analysis.contentType,
          score: analysis.score,
          insights: analysis.insights,
          frameworks: analysis.frameworks,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
        };
      } catch (error) {
        throw new Error(
          `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  // Protected analysis (full features)
  analyzeContentProtected: protectedProcedure
    .input(analysisInputSchema)
    .output(analysisResultSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await aiAnalysisService.analyzeContent(
          input.content,
          input.options as any
        );

        // Store in database with user
        const analysis = await ctx.prisma.analysis.create({
          data: {
            content: input.content,
            contentType: input.contentType,
            score: result.goldenCircle?.overallScore || 0,
            insights: JSON.stringify(
              result.recommendations?.recommendations || []
            ),
            frameworks: JSON.stringify(
              result.goldenCircle ? ['golden-circle'] : []
            ),
            status: 'completed',
            userId: ctx.user.id,
          },
        });

        return {
          id: analysis.id,
          content: analysis.content,
          contentType: analysis.contentType,
          score: analysis.score,
          insights: analysis.insights,
          frameworks: analysis.frameworks,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
        };
      } catch (error) {
        throw new Error(
          `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }),

  // Get user's analysis history
  getUserAnalyses: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const analyses = await ctx.prisma.analysis.findMany({
        where: {
          userId: ctx.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      });

      return analyses;
    }),

  // Get specific analysis
  getAnalysis: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const analysis = await ctx.prisma.analysis.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (!analysis) {
        throw new Error('Analysis not found');
      }

      return analysis;
    }),

  // Delete analysis
  deleteAnalysis: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const analysis = await ctx.prisma.analysis.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (!analysis) {
        throw new Error('Analysis not found');
      }

      await ctx.prisma.analysis.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});

/**
 * B2C Elements of Value Analysis API
 * NOW: Uses InternalApiClient + Unified Prompts
 * FIXES: Inefficient nested API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InternalApiClient } from '@/lib/api/internal-client';
import { buildFrameworkPrompt } from '@/lib/prompts/gemini-prompts';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { url, proposedContent } = await request.json();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL required',
        },
        { status: 400 }
      );
    }

    console.log(`🎯 [B2C] Starting B2C Elements analysis for: ${url}`);

    // Step 1: Get scraped content using InternalApiClient (calls /api/analyze/compare)
    const { existingContent, proposedContent: proposedData } =
      await InternalApiClient.getScrapedContent(url, proposedContent);

    console.log(`📦 [B2C] Got scraped content: ${existingContent.wordCount} words`);

    // Step 2: Build unified B2C prompt
    const prompt = buildFrameworkPrompt('b2c', existingContent, proposedData, url);
    
    console.log(`🤖 [B2C] Calling Gemini AI...`);

    // Step 3: Call Gemini with unified prompt
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();

    // Step 4: Parse JSON response
    const jsonMatch =
      analysisText.match(/```json\n([\s\S]*?)\n```/) ||
      analysisText.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(
      jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText
    );

    console.log(`✅ [B2C] Analysis complete: ${analysis.overall_score || 'N/A'} score`);

    return NextResponse.json({
      success: true,
      framework: 'b2c',
      scrapedContent: existingContent,
      analysis: analysis,
      message: 'B2C Elements analysis completed successfully',
    });
  } catch (error) {
    console.error('[B2C] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'B2C Elements analysis failed',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/free-ai-analysis';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content is required',
        },
        { status: 400 }
      );
    }

    console.log('🧪 Testing simple Gemini analysis...');

    // Test simple Gemini call
    const result = await analyzeWithGemini(content, 'test');

    console.log('✅ Simple analysis completed');

    return NextResponse.json({
      success: true,
      result,
      message: 'Simple analysis test successful',
    });
  } catch (error) {
    console.error('Simple analysis test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Simple analysis test failed',
      },
      { status: 500 }
    );
  }
}

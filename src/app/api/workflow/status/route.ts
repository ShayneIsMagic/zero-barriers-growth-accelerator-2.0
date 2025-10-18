import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const _analysisId = searchParams.get('analysisId');

    // Simple workflow status without ComingSoonService
    const workflowResponse = {
      analysisId: analysisId || null,
      currentPhase: analysisId ? 'phase2' : 'phase1',
      availableModules: [
        'phase1',
        'golden-circle',
        'elements-of-value',
        'clifton-strengths',
        'seo-analysis',
        'google-tools'
      ],
      nextSteps: analysisId ? ['Run Phase 2 analysis'] : ['Complete Phase 1 data collection']
    };

    return NextResponse.json({
      success: true,
      data: {
        workflow: workflowResponse,
        modules: {
          available: workflowResponse.availableModules.map(id => ({
            id,
            name: id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Available ${id} analysis`,
            status: 'available'
          })),
          comingSoon: [],
          partial: []
        }
      }
    });

  } catch (error) {
    console.error('Workflow status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get workflow status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { ComingSoonService } from '@/lib/services/coming-soon.service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    // Get all modules and their status
    const allModules = ComingSoonService.getAllModules();
    const availableModules = ComingSoonService.getModulesByStatus('available');
    const comingSoonModules = ComingSoonService.getModulesByStatus('coming_soon');
    const partialModules = ComingSoonService.getModulesByStatus('partial');

    // Create workflow response
    const workflowResponse = ComingSoonService.createWorkflowResponse(
      analysisId ? ['phase1', 'golden-circle', 'elements-of-value', 'clifton-strengths'] : [],
      'phase2'
    );

    return NextResponse.json({
      success: true,
      data: {
        workflow: workflowResponse.workflow,
        modules: {
          available: availableModules.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            status: m.status
          })),
          comingSoon: comingSoonModules.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            status: m.status,
            estimatedCompletion: m.estimatedCompletion,
            alternativeAction: m.alternativeAction
          })),
          partial: partialModules.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            status: m.status,
            estimatedCompletion: m.estimatedCompletion
          }))
        },
        nextSteps: [
          'Complete available assessments first',
          'Use manual prompts for coming soon features',
          'Check back for updates on automated features'
        ],
        manualPrompts: comingSoonModules.map(m => ({
          id: m.id,
          name: m.name,
          prompt: ComingSoonService.generateManualPrompt(m.id, { url: 'your-website-url' })
        }))
      },
      message: 'Workflow status retrieved successfully'
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

import {
  buildPuppeteerEvidencePackage,
  formatEvidenceForPrompt,
  type PuppeteerEvidencePackage,
} from '@/lib/framework-evidence-protocol';
import {
  FRAMEWORK_CHUNK_CONFIGS,
  type FrameworkChunkConfig,
} from '@/lib/framework/chunk-definitions';
import { B2B_SCORING_PROMPT_INSTRUCTIONS } from '@/lib/framework/b2b-taxonomy';
import { B2C_SCORING_PROMPT_INSTRUCTIONS } from '@/lib/framework/b2c-taxonomy';
import type { ChunkedAnalysisOptions } from '@/lib/chunked-framework-analysis';

interface ExistingContentShape {
  title?: string;
  metaDescription?: string;
  seo?: {
    metaDescription?: string;
    extractedKeywords?: string[];
  };
  extractedKeywords?: string[];
  cleanText?: string;
}

export function buildChunkAnalysisOptions(
  frameworkKey: string,
  existing: ExistingContentShape,
  url: string,
  evidencePackage: PuppeteerEvidencePackage = buildPuppeteerEvidencePackage(
    existing as Parameters<typeof buildPuppeteerEvidencePackage>[0]
  ),
  extra?: Partial<ChunkedAnalysisOptions>
): ChunkedAnalysisOptions {
  const config: FrameworkChunkConfig | undefined =
    FRAMEWORK_CHUNK_CONFIGS[frameworkKey];
  if (!config) {
    throw new Error(`Unknown framework key: ${frameworkKey}`);
  }

  const protocolSummary = formatEvidenceForPrompt(evidencePackage);
  const keywords = (
    existing.extractedKeywords ||
    existing.seo?.extractedKeywords ||
    []
  )
    .slice(0, 10)
    .join(', ');

  const frameworkScoring: Partial<ChunkedAnalysisOptions> =
    frameworkKey === 'b2b-elements'
      ? { scoringInstructions: B2B_SCORING_PROMPT_INSTRUCTIONS }
      : frameworkKey === 'b2c-elements'
        ? { scoringInstructions: B2C_SCORING_PROMPT_INSTRUCTIONS }
        : frameworkKey === 'golden-circle'
      ? {
          scoringInstructions: `Score each dimension 0.0-1.0 (flat fractional scoring):
- 0.8-1.0: Excellent — clearly articulated with strong evidence
- 0.6-0.79: Good — present but could be more compelling
- 0.4-0.59: Needs Work — vague or inconsistent
- 0.0-0.39: Poor — absent or contradictory`,
        }
      : frameworkKey === 'brand-archetypes'
        ? {
            scoringInstructions: `Score each archetype 0.0-1.0 (flat fractional scoring — no weighted factor math):
- 0.8-1.0 (Dominant): strong, repeated evidence across multiple evidence streams
- 0.6-0.79 (Strong): clear evidence with moderate repetition
- 0.4-0.59 (Moderate): weak or inconsistent evidence
- 0.0-0.39 (Weak/Absent): minimal or no meaningful evidence

Overall score = sum of 12 archetype scores ÷ 12.
Primary archetype = highest score; secondary = next strongest (typically score ≥ 0.6).`,
            categoriesPerBlock: 1,
          }
        : {};

  return {
    frameworkName: config.frameworkName,
    url,
    contentTitle: existing.title || '',
    contentMeta:
      existing.metaDescription || existing.seo?.metaDescription || '',
    contentKeywords: keywords,
    contentText: `${protocolSummary}\n\n${existing.cleanText || ''}`,
    chunks: config.chunks,
    ...frameworkScoring,
    ...extra,
  };
}

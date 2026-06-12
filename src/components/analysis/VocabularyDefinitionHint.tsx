'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getElementDefinition, getVocabularyCategory } from '@/lib/framework/get-framework-vocabulary';
import type { FrameworkResultKind } from '@/lib/framework/framework-results-adapter';
import { HelpCircle } from 'lucide-react';

interface VocabularyDefinitionHintProps {
  frameworkKey: FrameworkResultKind;
  elementKey: string;
  categoryKey?: string;
  label?: string;
}

export function VocabularyDefinitionHint({
  frameworkKey,
  elementKey,
  categoryKey,
  label = 'Definition',
}: VocabularyDefinitionHintProps) {
  const elementDefinition = getElementDefinition(frameworkKey, elementKey);
  const categoryDefinition = categoryKey
    ? getVocabularyCategory(frameworkKey, categoryKey)?.definition
    : undefined;
  const definition = elementDefinition || categoryDefinition;

  if (!definition) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
            aria-label={`${label} for ${elementKey}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs leading-relaxed">
          {definition}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

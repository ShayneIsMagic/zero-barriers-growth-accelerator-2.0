/**
 * Utilities for extracting element names from framework definition objects.
 */

import type {
  B2B_ELEMENTS,
  B2C_ELEMENTS,
  CLIFTON_STRENGTHS_ELEMENTS,
  GOLDEN_CIRCLE_ELEMENTS,
} from '@/lib/elements/element-definitions';

interface FrameworkDefinitionShape {
  name: string;
  totalElements: number;
  categories: Record<
    string,
    {
      name: string;
      subcategories: Array<{
        elements: Array<{ name: string }>;
      }>;
    }
  >;
}

export function extractElementNames(
  definition: FrameworkDefinitionShape
): string[] {
  const names: string[] = [];
  for (const category of Object.values(definition.categories)) {
    for (const subcategory of category.subcategories) {
      for (const element of subcategory.elements) {
        names.push(element.name);
      }
    }
  }
  return names;
}

export type B2CDefinition = typeof B2C_ELEMENTS;
export type B2BDefinition = typeof B2B_ELEMENTS;
export type CliftonDefinition = typeof CLIFTON_STRENGTHS_ELEMENTS;
export type GoldenCircleDefinition = typeof GOLDEN_CIRCLE_ELEMENTS;

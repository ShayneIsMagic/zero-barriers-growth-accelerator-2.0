import vocabularyDocument from '@/lib/framework/framework-vocabulary.json';
import type {
  FrameworkVocabularyDocument,
  FrameworkVocabularyEntry,
  VocabularyCategory,
  VocabularyElement,
  VocabularySubcategory,
} from '@/lib/framework/framework-vocabulary.types';

const vocabulary = vocabularyDocument as FrameworkVocabularyDocument;

const frameworkIndex = new Map<string, FrameworkVocabularyEntry>(
  vocabulary.frameworks.map((entry) => [entry.frameworkKey, entry])
);

export function getFrameworkVocabularyDocument(): FrameworkVocabularyDocument {
  return vocabulary;
}

export function getFrameworkVocabularyEntry(
  frameworkKey: string
): FrameworkVocabularyEntry | undefined {
  return frameworkIndex.get(frameworkKey);
}

export function getVocabularyElement(
  frameworkKey: string,
  elementKey: string
): VocabularyElement | undefined {
  const framework = frameworkIndex.get(frameworkKey);
  if (!framework) return undefined;
  return framework.elements.find((element) => element.elementKey === elementKey);
}

export function getVocabularyCategory(
  frameworkKey: string,
  categoryKey: string
): VocabularyCategory | undefined {
  const framework = frameworkIndex.get(frameworkKey);
  if (!framework) return undefined;
  return framework.categories.find((category) => category.categoryKey === categoryKey);
}

export function getVocabularySubcategory(
  frameworkKey: string,
  categoryKey: string,
  subcategoryKey: string
): VocabularySubcategory | undefined {
  const category = getVocabularyCategory(frameworkKey, categoryKey);
  if (!category?.subcategories) return undefined;
  return category.subcategories.find(
    (subcategory) => subcategory.subcategoryKey === subcategoryKey
  );
}

export function getElementDefinition(
  frameworkKey: string,
  elementKey: string
): string {
  return getVocabularyElement(frameworkKey, elementKey)?.definition ?? '';
}

export function listFrameworkVocabularyKeys(): string[] {
  return vocabulary.frameworks.map((entry) => entry.frameworkKey);
}

/**
 * Framework Loader Service
 * Loads framework markdown files for AI analysis prompts
 */

import { UnifiedLocalForageStorage } from './unified-localforage-storage.service';

export interface FrameworkContent {
  name: string;
  content: string;
  type: 'b2b' | 'b2c' | 'golden-circle' | 'clifton-strengths' | 'archetypes';
}

export class FrameworkLoaderService {
  private static frameworkCache: Map<string, string> = new Map();

  /**
   * Load framework content from markdown file
   * First checks Local Forage, then falls back to public folder
   */
  static async loadFramework(
    frameworkType: 'b2b' | 'b2c' | 'golden-circle' | 'clifton-strengths'
  ): Promise<string> {
    // Check cache first
    if (this.frameworkCache.has(frameworkType)) {
      return this.frameworkCache.get(frameworkType)!;
    }

    // Check Local Forage for imported files
    const fileName = this.getFrameworkFileName(frameworkType);
    const importedFile = await UnifiedLocalForageStorage.getImportedFile(fileName);
    
    if (importedFile && importedFile.content) {
      const content = typeof importedFile.content === 'string' 
        ? importedFile.content 
        : JSON.stringify(importedFile.content);
      this.frameworkCache.set(frameworkType, content);
      return content;
    }

    // Fallback: Try to fetch from public folder (if files are placed there)
    try {
      const response = await fetch(`/frameworks/${fileName}`);
      if (response.ok) {
        const content = await response.text();
        this.frameworkCache.set(frameworkType, content);
        return content;
      }
    } catch {
      // File not found in public folder, continue
    }

    // Return empty string if not found (will use default prompts)
    return '';
  }

  /**
   * Get framework file name
   */
  private static getFrameworkFileName(
    frameworkType: 'b2b' | 'b2c' | 'golden-circle' | 'clifton-strengths'
  ): string {
    const fileMap: Record<string, string> = {
      'b2b': 'B2B-Elements-Value-Flat-Scoring.md',
      'b2c': 'B2C-Elements-Value-Flat-Scoring.md',
      'golden-circle': 'Golden-Circle-Flat-Scoring.md',
      'clifton-strengths': 'CliftonStrengths-Flat-Scoring.md',
    };
    return fileMap[frameworkType] || '';
  }

  /**
   * Load all frameworks
   */
  static async loadAllFrameworks(): Promise<Record<string, string>> {
    const [b2b, b2c, goldenCircle, cliftonStrengths] = await Promise.all([
      this.loadFramework('b2b'),
      this.loadFramework('b2c'),
      this.loadFramework('golden-circle'),
      this.loadFramework('clifton-strengths'),
    ]);

    return {
      b2b,
      b2c,
      goldenCircle,
      cliftonStrengths,
    };
  }

  /**
   * Clear framework cache
   */
  static clearCache(): void {
    this.frameworkCache.clear();
  }

  /**
   * Build analysis prompt with framework content
   */
  static buildPromptWithFramework(
    frameworkType: 'b2b' | 'b2c' | 'golden-circle' | 'clifton-strengths',
    userContent: string,
    frameworkContent?: string
  ): string {
    const frameworkName = {
      'b2b': 'B2B Elements of Value',
      'b2c': 'B2C Elements of Value',
      'golden-circle': 'Golden Circle',
      'clifton-strengths': 'CliftonStrengths',
    }[frameworkType];

    let prompt = `You are an expert analyst specializing in the ${frameworkName} framework.\n\n`;

    if (frameworkContent) {
      prompt += `## Framework Guidelines:\n\n${frameworkContent}\n\n`;
    }

    prompt += `## Analysis Instructions:\n\n`;
    prompt += `Analyze the following content using the ${frameworkName} framework:\n\n`;
    prompt += `${userContent}\n\n`;
    prompt += `Provide a comprehensive analysis following the framework guidelines above.`;

    return prompt;
  }
}


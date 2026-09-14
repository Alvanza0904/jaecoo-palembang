export type AIOperation = 'generate' | 'improve' | 'rewrite' | 'shorten';

export interface AIContext {
  pageType: string;
  sectionType: string;
  field: string;
  purpose?: string;
  targetAudience?: string;
  seoKeyword?: string;
  relevantFacts?: string; // Fakta absolut dari database (Harga, Specs)
  language?: string;
}

export interface AIGenerateRequest {
  operation: AIOperation;
  context: AIContext;
  existingContent?: string;
}

export interface AIProvider {
  generateContent(prompt: string): Promise<string>;
}

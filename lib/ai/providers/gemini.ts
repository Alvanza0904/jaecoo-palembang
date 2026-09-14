import { AIProvider } from '../types';

export class GeminiProvider implements AIProvider {
  async generateContent(prompt: string): Promise<string> {
    const apiKey = process.env.AI_PROVIDER_KEY;

    if (!apiKey) {
      throw new Error('AI API Key belum dikonfigurasi di server.');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error('Gagal terhubung ke AI Provider saat ini.');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  }
}

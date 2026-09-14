import { AIProvider } from '../types';

export class AnthropicProvider implements AIProvider {
  async generateContent(prompt: string): Promise<string> {
    const apiKey = process.env.AI_PROVIDER_KEY;

    if (!apiKey) {
      throw new Error('AI API Key belum dikonfigurasi di server.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API Error:', errorData);

      // Berikan pesan error yang lebih spesifik
      if (response.status === 401) {
        throw new Error('API Key tidak valid. Periksa konfigurasi AI_PROVIDER_KEY.');
      } else if (response.status === 429) {
        throw new Error('Batas rate limit tercapai. Coba lagi sebentar.');
      }

      throw new Error('Gagal terhubung ke AI Provider saat ini.');
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;

    if (!text) {
      throw new Error('Respons AI tidak terbaca. Coba lagi.');
    }

    return text.trim();
  }
}

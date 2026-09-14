import { AIGenerateRequest, AIProvider } from './types';
import { GeminiProvider } from './providers/gemini';
import { AnthropicProvider } from './providers/anthropic';

// ─── BRAND VOICE CENTRALIZATION ──────────────────────────────────────────────
const BRAND_VOICE = `
Kamu adalah asisten copywriter eksklusif untuk JAECOO Palembang (Dealer Resmi SUV Premium).
Gaya bahasa:
- Bahasa Indonesia natural, modern, premium, dan elegan.
- Mengalir dan manusiawi (tidak terasa AI-generated).
- Jangan kaku, hindari bahasa terlalu formal.
- DILARANG menggunakan kata-kata hiperbola, clickbait, atau dramatis (misal: "Rasakan pengalaman yang belum pernah ada").
- DILARANG mengulang-ulang nama model secara berlebihan.
- Fakta yang diberikan adalah absolut. DILARANG MENGARANG HARGA, SPESIFIKASI, ATAU DATA TEKNIS yang tidak ada di prompt.
`;

const SECTION_RULES: Record<string, string> = {
  hero: 'Tulis copy yang concise, sangat visual, headline kuat, dan supporting text pendek.',
  experience: 'Tonjolkan keunggulan pengalaman berkendara secara emosional namun tetap elegan dan tidak berlebihan.',
  technology:
    'Tulis penjelasan informatif, mudah dipahami audiens awam, jangan terlalu teknis namun menonjolkan kecanggihan.',
  about: 'Ceritakan identitas brand dan dealer secara hangat, lokal, dan terpercaya.',
  promo: 'Informatif dan menarik, jelas benefit-nya, CTA yang natural dan tidak agresif.',
  journal: 'Tone editorial ringan, mengundang rasa ingin tahu tanpa clickbait.',
  dealer_location:
    'Gunakan konteks lokal Palembang secara natural tanpa keyword stuffing. Sangat informatif.',
  final_cta: 'Pendek, conversational, mengundang aksi tanpa terlihat agresif.',
  seo: 'Padat, mengandung keyword target secara natural. Maksimum 160 karakter untuk meta description.',
};

export class AIContentEngine {
  private provider: AIProvider;

  constructor() {
    // Switcher Provider: Set AI_PROVIDER=anthropic atau AI_PROVIDER=gemini di env
    const activeProvider = process.env.AI_PROVIDER || 'anthropic';

    if (activeProvider === 'anthropic') {
      this.provider = new AnthropicProvider();
    } else if (activeProvider === 'gemini') {
      this.provider = new GeminiProvider();
    } else {
      // Fallback ke Anthropic
      this.provider = new AnthropicProvider();
    }
  }

  private buildPrompt(req: AIGenerateRequest): string {
    const { operation, context, existingContent } = req;

    let prompt = `${BRAND_VOICE}\n\n`;

    prompt += `KONTEKS TUGAS:\n`;
    prompt += `- Bagian Halaman: ${context.pageType} > ${context.sectionType}\n`;
    prompt += `- Target Field: ${context.field}\n`;

    if (context.seoKeyword)
      prompt += `- Target SEO Keyword: ${context.seoKeyword} (Gunakan natural, maksimal 1-2 kali).\n`;
    if (context.relevantFacts)
      prompt += `- FAKTA WAJIB (Jangan mengarang di luar ini): ${context.relevantFacts}\n`;

    const sectionKey = context.sectionType.toLowerCase();
    const rule = SECTION_RULES[sectionKey] || 'Tulis secara natural dan profesional.';
    prompt += `- Aturan Khusus Bagian Ini: ${rule}\n\n`;

    prompt += `INSTRUKSI TINDAKAN:\n`;
    if (operation === 'generate') {
      prompt += `Buatkan konten (draft) baru berdasarkan konteks di atas. Jangan buat struktur JSON, balas HANYA dengan teks untuk field "${context.field}" tersebut.`;
    } else if (operation === 'improve') {
      prompt += `Perbaiki dan poles teks berikut agar sesuai dengan gaya bahasa brand JAECOO:\n"${existingContent}"\nBalas hanya dengan hasil perbaikannya.`;
    } else if (operation === 'rewrite') {
      prompt += `Tulis ulang teks berikut dengan variasi kata yang berbeda tetapi makna dan fakta sama persis:\n"${existingContent}"\nBalas hanya dengan hasil teksnya.`;
    } else if (operation === 'shorten') {
      prompt += `Persingkat teks berikut menjadi lebih padat dan to-the-point tanpa kehilangan pesan utama:\n"${existingContent}"\nBalas hanya dengan hasil teksnya.`;
    }

    return prompt;
  }

  async processRequest(req: AIGenerateRequest): Promise<string> {
    const prompt = this.buildPrompt(req);
    return await this.provider.generateContent(prompt);
  }
}

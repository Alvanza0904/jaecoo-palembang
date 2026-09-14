import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AIContentEngine } from '@/lib/ai/engine';
import { AIGenerateRequest } from '@/lib/ai/types';

export async function POST(request: Request) {
  try {
    // 1. Cek status aktif fitur AI
    if (process.env.AI_ENGINE_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Fitur AI saat ini sedang dinonaktifkan.' },
        { status: 403 }
      );
    }

    // 2. Auth Check — hanya admin terautentikasi yang bisa request
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // 3. Parse & validasi request body
    const body = (await request.json()) as AIGenerateRequest;
    if (!body.operation || !body.context) {
      return NextResponse.json({ error: 'Format request tidak valid.' }, { status: 400 });
    }

    // 4. Jalankan AI Engine di server
    const engine = new AIContentEngine();
    const generatedText = await engine.processRequest(body);

    return NextResponse.json({ success: true, data: generatedText });
  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan pada AI Server. Coba lagi beberapa saat.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

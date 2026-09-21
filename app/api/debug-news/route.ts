import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('news')
      .insert([{
        title: 'Debug Test',
        slug: 'debug-test-' + Date.now(),
        excerpt: 'Test excerpt',
        category: 'Tips',
        published: false,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select();
    
    if (error) return NextResponse.json({ success: false, error: error.message, code: error.code, details: error.details });
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
}

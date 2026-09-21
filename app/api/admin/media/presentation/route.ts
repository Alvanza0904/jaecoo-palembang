import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body?.mediaId || !body?.settings) {
    return NextResponse.json({ error: "mediaId dan settings wajib." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({
      presentation_settings: body.settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.mediaId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: `Presentation settings gagal disimpan: ${error.message}` }, { status: 400 });

  // Revalidate semua halaman publik yang menampilkan media ini
  revalidatePath('/');
  revalidatePath('/model/[slug]', 'page');
  revalidatePath('/model', 'page');

  return NextResponse.json({ asset: data });
}

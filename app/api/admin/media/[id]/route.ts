import { NextResponse } from "next/server";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  for (const key of ["alt_text", "focal_x", "focal_y", "responsive_settings", "text_color_mode", "presentation_settings"]) {
    if (key in body) updates[key] = body[key];
  }

  if (typeof updates.focal_x === "number") updates.focal_x = Math.max(0, Math.min(100, updates.focal_x));
  if (typeof updates.focal_y === "number") updates.focal_y = Math.max(0, Math.min(100, updates.focal_y));

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: `Media gagal diperbarui: ${error.message}` }, { status: 400 });
  return NextResponse.json({ asset: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: asset, error: readError } = await supabase
    .from("media_assets")
    .select("id,storage_bucket,storage_path")
    .eq("id", id)
    .single();

  if (readError || !asset) return NextResponse.json({ error: "Media tidak ditemukan." }, { status: 404 });

  const { data: assignments, error: relationError } = await supabase
    .from("content_media")
    .select("id")
    .eq("media_asset_id", id)
    .limit(1);

  if (relationError) return NextResponse.json({ error: `Gagal memeriksa relasi media: ${relationError.message}` }, { status: 400 });
  if (assignments?.length) {
    return NextResponse.json({ error: "Media masih digunakan oleh konten. Lepaskan assignment terlebih dahulu." }, { status: 409 });
  }

  const { error: deleteError } = await supabase.from("media_assets").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: `Metadata media gagal dihapus: ${deleteError.message}` }, { status: 400 });

  const { error: storageError } = await supabase
    .storage
    .from(asset.storage_bucket || "jaecoo-media")
    .remove([asset.storage_path]);

  if (storageError) {
    return NextResponse.json({
      ok: true,
      warning: `Metadata terhapus, tetapi file Storage belum terhapus: ${storageError.message}`,
    });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import type { MediaCategory } from "@/lib/types/media-asset";
import { MAX_VIDEO_BYTES } from "@/lib/types/video";

const BUCKET = "jaecoo-media";
const CATEGORIES: MediaCategory[] = ["models", "promos", "news", "gallery", "about", "og", "system"];

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized: sesi admin tidak ditemukan." }, { status: 401 });

  try {
    const body = await request.json();
    const storagePath = String(body?.storage_path ?? "").trim();
    const filename = String(body?.filename ?? "").trim();
    const mime = String(body?.mime_type ?? "").trim();
    const size = Number(body?.size_bytes);
    const category = CATEGORIES.includes(body?.category) ? body.category as MediaCategory : "system";

    if (!storagePath || storagePath.includes("..") || !filename || !mime) {
      return NextResponse.json({ error: "Metadata upload tidak lengkap." }, { status: 400 });
    }
    if (!mime.startsWith("video/") && !mime.startsWith("image/")) {
      return NextResponse.json({ error: "Tipe file tidak didukung." }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0 || size > (mime.startsWith("video/") ? MAX_VIDEO_BYTES : 10 * 1024 * 1024)) {
      return NextResponse.json({ error: "Ukuran file tidak valid." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const width = Number(body?.width);
    const height = Number(body?.height);

    const { data: asset, error } = await supabase
      .from("media_assets")
      .insert({
        filename,
        storage_path: storagePath,
        storage_bucket: BUCKET,
        public_url: publicData.publicUrl,
        mime_type: mime,
        size_bytes: size,
        width: Number.isFinite(width) && width > 0 ? width : null,
        height: Number.isFinite(height) && height > 0 ? height : null,
        category,
        uploaded_by: user.id,
        processing_status: mime.startsWith("video/") ? "ready" : "uploaded",
      })
      .select("*")
      .single();

    if (error) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: `Metadata media gagal disimpan: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registrasi media gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

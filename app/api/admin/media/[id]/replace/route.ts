import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import { MAX_VIDEO_BYTES } from "@/lib/types/video";

const BUCKET = "jaecoo-media";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized: sesi admin tidak ditemukan." }, { status: 401 });

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  try {
    const body = await request.json();
    const storagePath = String(body?.storage_path ?? "").trim();
    const filename = String(body?.filename ?? "").trim();
    const mime = String(body?.mime_type ?? "").trim();
    const size = Number(body?.size_bytes);

    if (!storagePath || storagePath.includes("..") || !filename || !mime.startsWith("video/")) {
      return NextResponse.json({ error: "File video pengganti tidak valid." }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Ukuran video tidak valid." }, { status: 400 });
    }

    const { data: current, error: readError } = await supabase
      .from("media_assets")
      .select("id,storage_path,storage_bucket,presentation_settings")
      .eq("id", id)
      .single();

    if (readError || !current) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: "Video yang diganti tidak ditemukan. File baru tidak dipakai." }, { status: 404 });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const { data: asset, error } = await supabase
      .from("media_assets")
      .update({
        filename,
        storage_path: storagePath,
        public_url: publicData.publicUrl,
        mime_type: mime,
        size_bytes: size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: `Database gagal diperbarui. Video lama tetap aktif. ${error.message}` }, { status: 400 });
    }

    if (current.storage_path && current.storage_path !== storagePath) {
      await supabase.storage.from(current.storage_bucket || BUCKET).remove([current.storage_path]);
    }

    revalidatePath("/");
    revalidatePath("/model/[slug]", "page");
    return NextResponse.json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengganti video.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

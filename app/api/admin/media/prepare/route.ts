import { NextResponse } from "next/server";
import { createSupabaseAdminClient, getServerUser } from "@/lib/supabase/server";

const BUCKET = "jaecoo-media";
const VIDEO_LIMIT = 80 * 1024 * 1024;

export async function POST() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized: sesi admin tidak ditemukan." }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.storage.updateBucket(BUCKET, {
      public: true,
      fileSizeLimit: VIDEO_LIMIT,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "video/mp4",
        "video/webm",
      ],
    });
    if (error) {
      return NextResponse.json({ error: `Batas storage gagal dinaikkan: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json({ ok: true, file_size_limit: VIDEO_LIMIT });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batas storage gagal dinaikkan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

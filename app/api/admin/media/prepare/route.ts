import { NextResponse } from "next/server";
import { createSupabaseAdminClient, getServerUser } from "@/lib/supabase/server";

const BUCKET = "jaecoo-media";
const MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
];
// 80 MB is above this project's global cap, so the bucket update itself is rejected.
// 50 MB is the usual project maximum. 20 MB still accepts the 14 MB video.
const LIMITS = [50 * 1024 * 1024, 20 * 1024 * 1024];

export async function POST() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized: sesi admin tidak ditemukan." }, { status: 401 });

  try {
    const admin = createSupabaseAdminClient();
    const existing = await admin.storage.getBucket(BUCKET);
    const current = Number(existing.data?.file_size_limit ?? 0);
    if (current >= LIMITS[1]) {
      return NextResponse.json({ ok: true, file_size_limit: current });
    }

    let lastError = "batas tidak berubah";
    for (const limit of LIMITS) {
      const { error } = await admin.storage.updateBucket(BUCKET, {
        public: true,
        fileSizeLimit: limit,
        allowedMimeTypes: MIME_TYPES,
      });
      if (!error) return NextResponse.json({ ok: true, file_size_limit: limit });
      lastError = error.message;
      if (!error.message.toLowerCase().includes("maximum allowed size")) break;
    }

    return NextResponse.json(
      { error: `Batas storage gagal dinaikkan: ${lastError}` },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batas storage gagal dinaikkan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

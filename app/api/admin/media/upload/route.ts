import { NextResponse } from "next/server";
import {
  ALLOWED_TYPES,
  MAX_FILE_SIZE_BYTES,
  buildStoragePath,
  type MediaCategory,
} from "@/lib/types/media-asset";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";

const BUCKET = "jaecoo-media";

function validCategory(value: FormDataEntryValue | null): MediaCategory {
  const allowed: MediaCategory[] = ["models", "promos", "news", "gallery", "about", "og", "system"];
  const valueString = String(value ?? "system");
  return allowed.includes(valueString as MediaCategory)
    ? (valueString as MediaCategory)
    : "system";
}

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized: sesi admin tidak ditemukan." }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Tidak ada file yang dipilih." }, { status: 400 });
    }

    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: `Format tidak didukung: ${file.type}.` }, { status: 400 });
    }

    // Keep the application limit aligned with the actual Supabase bucket limit (10 MB).
    if (file.size > MAX_FILE_SIZE_BYTES || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File terlalu besar. Maksimum upload saat ini 10 MB." }, { status: 400 });
    }

    const category = validCategory(formData.get("category"));
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = buildStoragePath(category, filename);

    const supabase = await createSupabaseServerClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Storage upload gagal: ${uploadError.message}` }, { status: 400 });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const widthValue = Number(formData.get("width"));
    const heightValue = Number(formData.get("height"));

    const { data: asset, error: assetError } = await supabase
      .from("media_assets")
      .insert({
        filename,
        storage_path: storagePath,
        storage_bucket: BUCKET,
        public_url: publicData.publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
        width: Number.isFinite(widthValue) && widthValue > 0 ? widthValue : null,
        height: Number.isFinite(heightValue) && heightValue > 0 ? heightValue : null,
        category,
        uploaded_by: user.id,
      })
      .select("*")
      .single();

    if (assetError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: `Metadata media gagal disimpan: ${assetError.message}` }, { status: 400 });
    }

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

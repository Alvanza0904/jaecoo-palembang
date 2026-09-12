"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import {
  ALLOWED_TYPES,
  buildStoragePath,
  type MediaCategory,
} from "@/lib/types/media-asset";

const BUCKET = "jaecoo-media";
const BUCKET_LIMIT = 10 * 1024 * 1024;

function categoryFrom(value: string): MediaCategory {
  const allowed: MediaCategory[] = ["models", "promos", "news", "gallery", "about", "og", "system"];
  return allowed.includes(value as MediaCategory) ? value as MediaCategory : "system";
}

export async function uploadAndSaveMedia(
  formData: FormData,
  contentType: string,
  contentKey: string,
  slotKey: string,
  breakpoint: string | null = null,
) {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized: sesi admin tidak ditemukan.");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Tidak ada file yang dipilih.");
  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    throw new Error(`Format tidak didukung: ${file.type}.`);
  }
  if (file.size > BUCKET_LIMIT) throw new Error("File terlalu besar. Maksimum upload saat ini 10 MB.");

  const supabase = await createSupabaseServerClient();
  const category = categoryFrom(String(formData.get("category") ?? "system"));
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = buildStoragePath(category, filename);

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(`Storage upload gagal: ${uploadError.message}`);

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  const width = Number(formData.get("width"));
  const height = Number(formData.get("height"));

  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      filename,
      storage_path: storagePath,
      storage_bucket: BUCKET,
      public_url: publicData.publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      width: Number.isFinite(width) && width > 0 ? width : null,
      height: Number.isFinite(height) && height > 0 ? height : null,
      category,
      uploaded_by: user.id,
    })
    .select("*")
    .single();

  if (assetError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Metadata media gagal disimpan: ${assetError.message}`);
  }

  const { error: relationError } = await supabase
    .from("content_media")
    .upsert({
      content_type: contentType,
      content_key: contentKey,
      slot_key: slotKey,
      breakpoint,
      media_asset_id: asset.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "content_type,content_key,slot_key,breakpoint" });

  if (relationError) {
    await supabase.from("media_assets").delete().eq("id", asset.id);
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Assignment media gagal disimpan: ${relationError.message}`);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin");

  return asset;
}

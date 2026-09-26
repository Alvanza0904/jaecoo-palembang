import { supabase } from "@/lib/supabase/client";
import { buildStoragePath, type MediaCategory, type MediaAsset } from "@/lib/types/media-asset";

const BUCKET = "jaecoo-media";

function storageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function uploadToStorage(
  file: File,
  category: MediaCategory,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const path = buildStoragePath(category, file.name);
  return new Promise(async (resolve, reject) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      reject(new Error("Sesi admin tidak ditemukan. Masuk ulang lalu coba lagi."));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", storageUrl(path));
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
    xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(path);
      else reject(new Error(readStorageError(xhr) || "Upload ke Storage gagal."));
    };
    xhr.onerror = () => reject(new Error("Koneksi gagal saat upload."));
    xhr.send(file);
  });
}

function readStorageError(xhr: XMLHttpRequest) {
  try {
    const json = JSON.parse(xhr.responseText);
    const message = String(json.message || json.error || json.error_description || "");
    if (message.toLowerCase().includes("maximum allowed size")) {
      return "Storage masih membatasi file di bawah ukuran video ini. Batas bucket belum naik. Coba upload sekali lagi.";
    }
    return message;
  } catch {
    return xhr.responseText?.slice(0, 180);
  }
}

export async function prepareStorageUpload() {
  const res = await fetch("/api/admin/media/prepare", { method: "POST" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Batas storage belum bisa dinaikkan.");
}

export async function registerUploadedMedia(input: {
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  category: MediaCategory;
  width?: number;
  height?: number;
}): Promise<MediaAsset> {
  const res = await fetch("/api/admin/media/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Metadata video gagal disimpan.");
  return json.asset as MediaAsset;
}

export async function replaceMediaFile(id: string, input: {
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
}): Promise<MediaAsset> {
  const res = await fetch(`/api/admin/media/${id}/replace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Video gagal diganti.");
  return json.asset as MediaAsset;
}

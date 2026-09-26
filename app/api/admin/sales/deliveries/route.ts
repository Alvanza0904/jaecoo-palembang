import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import { decodeDeliverySlot, encodeDeliverySlot, type SalesDeliveryInput } from "@/lib/sales/deliveries";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function revalidate() {
  revalidatePath("/sales-jaecoo-palembang");
}

async function listRows() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_media")
    .select("id, slot_key, media_asset_id, media_assets(id, public_url, alt_text, focal_x, focal_y, width, height)")
    .eq("content_type", "page")
    .eq("content_key", "sales")
    .like("slot_key", "delivery:%");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function GET() {
  const user = await getServerUser();
  if (!user) return unauthorized();
  try {
    const rows = await listRows();
    const deliveries = rows.flatMap((row) => {
      const meta = decodeDeliverySlot(row.slot_key);
      if (!meta) return [];
      const asset = Array.isArray(row.media_assets) ? row.media_assets[0] : row.media_assets;
      return [{
        ...meta,
        media_asset_id: row.media_asset_id,
        image_url: asset?.public_url ?? "",
        focal_x: asset?.focal_x ?? 50,
        focal_y: asset?.focal_y ?? 50,
        width: asset?.width ?? undefined,
        height: asset?.height ?? undefined,
      }];
    }).sort((a, b) => a.sort - b.sort);
    return NextResponse.json({ deliveries });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat delivery." }, { status: 400 });
  }
}

function readInput(body: Partial<SalesDeliveryInput>, id: string): SalesDeliveryInput {
  return {
    id,
    media_asset_id: String(body.media_asset_id ?? ""),
    title: String(body.title ?? "").trim(),
    model: String(body.model ?? "").trim(),
    variant: String(body.variant ?? "").trim(),
    caption: String(body.caption ?? "").trim(),
    location: String(body.location ?? "").trim(),
    alt: String(body.alt ?? "").trim(),
    sort: Number(body.sort ?? 0) || 0,
    published: body.published !== false,
  };
}

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) return unauthorized();
  const body = await request.json();
  const supplied = String(body.id ?? "");
  const id = /^[0-9a-f-]{36}$/i.test(supplied) ? supplied : crypto.randomUUID();
  const input = readInput(body, id);
  if (!input.media_asset_id) {
    return NextResponse.json({ error: "Pilih foto dari Media Library." }, { status: 422 });
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("content_media").insert({
    content_type: "page",
    content_key: "sales",
    slot_key: encodeDeliverySlot(input),
    breakpoint: null,
    media_asset_id: input.media_asset_id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ ok: true, delivery: input });
}

export async function PATCH(request: Request) {
  const user = await getServerUser();
  if (!user) return unauthorized();
  const body = await request.json();
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 422 });
  const input = readInput(body, id);
  if (!input.media_asset_id) {
    return NextResponse.json({ error: "Pilih foto dari Media Library." }, { status: 422 });
  }
  const supabase = await createSupabaseServerClient();
  const rows = await listRows();
  const current = rows.find((row) => row.slot_key.startsWith(`delivery:${id}:`));
  if (!current) return NextResponse.json({ error: "Delivery tidak ditemukan." }, { status: 404 });
  const { error } = await supabase
    .from("content_media")
    .update({
      slot_key: encodeDeliverySlot(input),
      media_asset_id: input.media_asset_id,
    })
    .eq("id", current.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ ok: true, delivery: input });
}

export async function DELETE(request: Request) {
  const user = await getServerUser();
  if (!user) return unauthorized();
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 422 });
  const supabase = await createSupabaseServerClient();
  const rows = await listRows();
  const current = rows.find((row) => row.slot_key.startsWith(`delivery:${id}:`));
  if (!current) return NextResponse.json({ error: "Delivery tidak ditemukan." }, { status: 404 });
  const { error } = await supabase.from("content_media").delete().eq("id", current.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ ok: true });
}

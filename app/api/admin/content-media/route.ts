import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";
import { DESKTOP_ONLY_MEDIA_SLOTS } from "@/lib/supabase/media";

async function requireUser() {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized: sesi admin tidak ditemukan.");
  return user;
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Gagal menyimpan media.";
  return NextResponse.json(
    { error: message },
    { status: message.startsWith("Unauthorized") ? 401 : 500 },
  );
}

function revalidateModelMedia(contentKey: string) {
  revalidatePath("/");
  revalidatePath("/model");
  revalidatePath(`/model/${contentKey}`);
  revalidatePath(`/model/${contentKey}/technology`);
  revalidatePath(`/model/${contentKey}/specifications`);
}

async function clearStaleBreakpoints(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  contentType: string,
  contentKey: string,
  slotKey: string,
) {
  if (!DESKTOP_ONLY_MEDIA_SLOTS.has(slotKey)) return;
  await supabase
    .from("content_media")
    .delete()
    .eq("content_type", contentType)
    .eq("content_key", contentKey)
    .eq("slot_key", slotKey)
    .or("breakpoint.is.null,breakpoint.eq.mobile,breakpoint.eq.tablet,breakpoint.eq.small_mobile");
}

export async function GET(request: Request) {
  try {
    await requireUser();
    const url = new URL(request.url);
    const contentType = url.searchParams.get("content_type");
    const contentKey = url.searchParams.get("content_key");
    const slotKey = url.searchParams.get("slot_key");
    const breakpoint = url.searchParams.get("breakpoint");

    if (!contentType || !contentKey) {
      return NextResponse.json({ error: "content_type dan content_key wajib." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("content_media")
      .select(`
        id, content_type, content_key, slot_key, breakpoint, media_asset_id,
        media_assets (
          id, filename, public_url, alt_text, width, height,
          focal_x, focal_y, mime_type, size_bytes, category, variants,
          cutout_url, presentation_settings
        )
      `)
      .eq("content_type", contentType)
      .eq("content_key", contentKey);

    if (slotKey) query = query.eq("slot_key", slotKey);
    if (breakpoint) query = query.eq("breakpoint", breakpoint);

    const { data, error } = await query.order("slot_key", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ assignments: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireUser();
    const body = await request.json();
    const contentType = String(body?.content_type ?? "").trim();
    const contentKey = String(body?.content_key ?? "").trim();
    const slotKey = String(body?.slot_key ?? "").trim();
    const mediaAssetId = String(body?.media_asset_id ?? "").trim();
    const breakpoint =
      body?.breakpoint === null || body?.breakpoint === undefined || body?.breakpoint === ""
        ? null
        : String(body.breakpoint).trim();

    if (!contentType || !contentKey || !slotKey || !mediaAssetId) {
      return NextResponse.json(
        { error: "content_type, content_key, slot_key, dan media_asset_id wajib." },
        { status: 400 },
      );
    }

    const allowedBreakpoints = ["desktop", "tablet", "mobile", "small_mobile"];
    if (breakpoint && !allowedBreakpoints.includes(breakpoint)) {
      return NextResponse.json({ error: "Breakpoint tidak valid." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: asset, error: assetError } = await supabase
      .from("media_assets")
      .select("id")
      .eq("id", mediaAssetId)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: "Media asset tidak ditemukan." }, { status: 404 });
    }

    // PostgreSQL UNIQUE constraints treat NULL values as distinct. Because
    // breakpoint is nullable, a normal upsert can create duplicate universal
    // assignments. Handle the universal (NULL breakpoint) case explicitly.
    if (breakpoint === null) {
      const { data: existing, error: findError } = await supabase
        .from("content_media")
        .select("id")
        .eq("content_type", contentType)
        .eq("content_key", contentKey)
        .eq("slot_key", slotKey)
        .is("breakpoint", null)
        .maybeSingle();

      if (findError) return NextResponse.json({ error: findError.message }, { status: 400 });

      if (existing) {
        const { data, error } = await supabase
          .from("content_media")
          .update({ media_asset_id: mediaAssetId, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select("*")
          .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        await clearStaleBreakpoints(supabase, contentType, contentKey, slotKey);
        revalidateModelMedia(contentKey);
        return NextResponse.json({ assignment: data });
      }

      const { data, error } = await supabase
        .from("content_media")
        .insert({
          content_type: contentType,
          content_key: contentKey,
          slot_key: slotKey,
          breakpoint: null,
          media_asset_id: mediaAssetId,
        })
        .select("*")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      revalidateModelMedia(contentKey);
      return NextResponse.json({ assignment: data });
    }

    const { data, error } = await supabase
      .from("content_media")
      .upsert(
        {
          content_type: contentType,
          content_key: contentKey,
          slot_key: slotKey,
          breakpoint,
          media_asset_id: mediaAssetId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "content_type,content_key,slot_key,breakpoint" },
      )
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (breakpoint === "desktop") {
      await clearStaleBreakpoints(supabase, contentType, contentKey, slotKey);
    }
    revalidateModelMedia(contentKey);
    return NextResponse.json({ assignment: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireUser();
    const url = new URL(request.url);
    const contentType = url.searchParams.get("content_type");
    const contentKey = url.searchParams.get("content_key");
    const slotKey = url.searchParams.get("slot_key");
    const breakpoint = url.searchParams.get("breakpoint");

    if (!contentType || !contentKey || !slotKey) {
      return NextResponse.json({ error: "Parameter media tidak lengkap." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("content_media")
      .delete()
      .eq("content_type", contentType)
      .eq("content_key", contentKey)
      .eq("slot_key", slotKey);

    query = breakpoint ? query.eq("breakpoint", breakpoint) : query.is("breakpoint", null);

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    revalidateModelMedia(contentKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

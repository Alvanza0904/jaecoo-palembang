import { NextResponse } from "next/server";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  const supabase = await createSupabaseServerClient();
  let query = supabase.from("media_assets").select("*").order("created_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (search) query = query.ilike("filename", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ assets: data ?? [] });
}

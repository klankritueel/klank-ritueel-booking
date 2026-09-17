import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/requireAdmin";

export async function PATCH(request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const allowed = ["date", "start_time", "end_time", "location", "price", "max_participants", "min_participants"];
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("group_sessions")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ session: data });
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const supabase = supabaseServer();
  const { error } = await supabase.from("group_sessions").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

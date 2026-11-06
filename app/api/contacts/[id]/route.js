import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/requireAdmin";

export async function PATCH(request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const newsletter = !!body.newsletter;
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("contacts")
    .update({ newsletter, newsletter_at: newsletter ? new Date().toISOString() : null })
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const supabase = supabaseServer();
  const { error } = await supabase.from("contacts").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

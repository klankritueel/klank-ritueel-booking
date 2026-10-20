import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/requireAdmin";

// Beheerder verwijdert een aanmelding voor een groepssessie (bijvoorbeeld bij een afmelding).
// De plek komt daardoor automatisch weer vrij.
export async function DELETE(request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const supabase = supabaseServer();
  const { error } = await supabase.from("group_bookings").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

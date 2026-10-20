import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/requireAdmin";

// Beheerder verwijdert een 1-op-1 boeking (bijvoorbeeld bij een afmelding).
// Het tijdslot komt daarna weer vrij te staan.
export async function DELETE(request, { params }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const supabase = supabaseServer();

  const { data: booking, error: findError } = await supabase
    .from("individual_bookings")
    .select("id, slot_id")
    .eq("id", params.id)
    .single();

  if (findError || !booking) {
    return NextResponse.json({ error: "Deze boeking bestaat niet (meer)." }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("individual_bookings")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: slotError } = await supabase
    .from("availability_slots")
    .update({ is_booked: false })
    .eq("id", booking.slot_id);

  if (slotError) {
    return NextResponse.json({ error: slotError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

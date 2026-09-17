import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase";
import { sendIndividualBookingEmails } from "../../../lib/email";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { slot_id, name, email, phone } = body;

  if (!slot_id || !name || !email || !phone) {
    return NextResponse.json({ error: "Vul je naam, e-mailadres en telefoonnummer in." }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: slot, error: slotError } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("id", slot_id)
    .single();

  if (slotError || !slot) {
    return NextResponse.json({ error: "Dit tijdslot bestaat niet (meer)." }, { status: 404 });
  }
  if (slot.is_booked) {
    return NextResponse.json({ error: "Dit tijdslot is helaas al geboekt." }, { status: 409 });
  }

  const { data: booking, error: insertError } = await supabase
    .from("individual_bookings")
    .insert({ slot_id, name, email, phone })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("availability_slots")
    .update({ is_booked: true })
    .eq("id", slot_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    await sendIndividualBookingEmails({ to: email, name, slot });
  } catch (e) {
    console.error("E-mail versturen mislukt:", e);
  }

  return NextResponse.json({ booking });
}

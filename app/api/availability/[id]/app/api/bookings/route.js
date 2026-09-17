import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase";
import { sendGroupBookingEmails } from "../../../lib/email";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { session_id, name, email, phone } = body;

  if (!session_id || !name || !email || !phone) {
    return NextResponse.json({ error: "Vul je naam, e-mailadres en telefoonnummer in." }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: session, error: sessionError } = await supabase
    .from("group_sessions")
    .select("*")
    .eq("id", session_id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Deze sessie bestaat niet (meer)." }, { status: 404 });
  }

  const { count, error: countError } = await supabase
    .from("group_bookings")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session_id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((count || 0) >= session.max_participants) {
    return NextResponse.json({ error: "Deze sessie is helaas al vol." }, { status: 409 });
  }

  const { data: booking, error: insertError } = await supabase
    .from("group_bookings")
    .insert({ session_id, name, email, phone })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  try {
    await sendGroupBookingEmails({ to: email, name, session });
  } catch (e) {
    // De boeking is gelukt; als het versturen van e-mail faalt, laten we
    // dat de boeking zelf niet blokkeren.
    console.error("E-mail versturen mislukt:", e);
  }

  return NextResponse.json({ booking });
}

import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase";
import { isAdminRequest } from "../../../lib/requireAdmin";

export async function GET() {
  const supabase = supabaseServer();
  const admin = isAdminRequest();

  let query = supabase
    .from("availability_slots")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (!admin) {
    query = query.eq("is_booked", false);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!admin) {
    return NextResponse.json({ slots: data });
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("individual_bookings")
    .select("id, slot_id, name, email, phone, created_at");

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const withBookings = data.map((slot) => ({
    ...slot,
    booking: bookings.find((b) => b.slot_id === slot.id) || null,
  }));

  return NextResponse.json({ slots: withBookings });
}

export async function POST(request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { date, start_time, end_time } = body;
  if (!date || !start_time || !end_time) {
    return NextResponse.json({ error: "Niet alle velden zijn ingevuld." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("availability_slots")
    .insert({ date, start_time, end_time })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ slot: data });
}

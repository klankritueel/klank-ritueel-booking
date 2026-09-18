import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase";
import { isAdminRequest } from "../../../lib/requireAdmin";

// Publiek: lijst van groepssessies met beschikbare plekken (geen namen/e-mails).
// Ingelogd als admin: zelfde lijst, maar mét de lijst van aanmeldingen per sessie.
export async function GET() {
  const supabase = supabaseServer();
  const admin = isAdminRequest();

  const { data: sessions, error } = await supabase
    .from("group_sessions")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("group_bookings")
    .select("id, session_id, name, email, phone, created_at");

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const result = sessions.map((session) => {
    const sessionBookings = bookings.filter((b) => b.session_id === session.id);
    const participantCount = sessionBookings.length;
    const spotsLeft = Math.max(0, session.max_participants - participantCount);
    return {
      ...session,
      participant_count: participantCount,
      spots_left: spotsLeft,
      is_full: spotsLeft === 0,
      bookings: admin ? sessionBookings : undefined,
    };
  });

  return NextResponse.json({ sessions: result });
}

export async function POST(request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { date, start_time, end_time, location, price, max_participants, min_participants } = body;

  if (!date || !start_time || !end_time || !location || price == null || !max_participants) {
    return NextResponse.json({ error: "Niet alle velden zijn ingevuld." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("group_sessions")
    .insert({
      date,
      start_time,
      end_time,
      location,
      price,
      max_participants,
      min_participants: min_participants || 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}

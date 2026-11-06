import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase";
import { isAdminRequest } from "../../../lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("last_booking_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ contacts: data });
}

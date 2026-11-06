// Bewaart iedere boeker in de contactenlijst. Die lijst wordt nooit
// automatisch opgeschoond, dus mailadressen blijven bewaard als je
// sessies, tijdsloten of boekingen verwijdert.
export async function saveContact(supabase, { name, email, phone, newsletter }) {
  const cleanEmail = String(email).trim().toLowerCase();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("contacts")
    .select("id, booking_count, newsletter")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing) {
    const update = {
      name,
      phone,
      booking_count: (existing.booking_count || 0) + 1,
      last_booking_at: now,
    };
    if (newsletter && !existing.newsletter) {
      update.newsletter = true;
      update.newsletter_at = now;
    }
    await supabase.from("contacts").update(update).eq("id", existing.id);
  } else {
    await supabase.from("contacts").insert({
      email: cleanEmail,
      name,
      phone,
      newsletter: !!newsletter,
      newsletter_at: newsletter ? now : null,
      booking_count: 1,
      first_booking_at: now,
      last_booking_at: now,
    });
  }
}

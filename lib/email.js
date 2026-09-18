import { Resend } from "resend";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // e-mail is optioneel; site blijft werken zonder
  return new Resend(key);
}

const brandWrap = (title, bodyHtml) => `
<div style="font-family: Georgia, 'Times New Roman', serif; background:#FAF7F2; padding: 32px; color:#2C1F0F;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #E7DFD2;">
    <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#9B7E5A;margin:0 0 16px;">Klank Ritueel</p>
    <h1 style="font-size:22px;font-weight:400;margin:0 0 16px;">${title}</h1>
    ${bodyHtml}
  </div>
</div>`;

export async function sendGroupBookingEmails({ to, name, session }) {
  const resend = client();
  if (!resend) return;
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const adminEmail = process.env.ADMIN_EMAIL;
  const dateStr = new Date(session.date).toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  await resend.emails.send({
    from,
    to,
    subject: "Je aanmelding voor de groepssessie is bevestigd",
    html: brandWrap(
      "Je plek is bevestigd",
      `<p style="line-height:1.7;">Beste ${name},</p>
       <p style="line-height:1.7;">Graag bevestig ik onze afspraak voor de klankschalen sessie.</p>
       <p style="line-height:1.7;">Trek lekker comfortabele kleding aan waarin je je vrij en ontspannen voelt. Tijdens de sessie mag je heerlijk tot rust komen en even alles loslaten.</p>
       <p style="line-height:1.7;">De sessie vindt plaats op:<br>
       <strong>${dateStr}</strong>, ${session.start_time.slice(0,5)} - ${session.end_time.slice(0,5)}<br>
       ${session.location}</p>
       <p style="line-height:1.7;">Ik kijk ernaar uit je te ontvangen.</p>
       <p style="line-height:1.7;">Liefs,<br>Pien</p>`
    ),
  });

  if (adminEmail) {
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `Nieuwe aanmelding groepssessie ${dateStr}`,
      html: brandWrap(
        "Nieuwe aanmelding",
        `<p style="line-height:1.7;"><strong>${name}</strong> (${to}) heeft zich aangemeld voor de groepssessie op ${dateStr}, ${session.start_time.slice(0,5)}-${session.end_time.slice(0,5)}.</p>`
      ),
    });
  }
}

export async function sendIndividualBookingEmails({ to, name, slot }) {
  const resend = client();
  if (!resend) return;
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const adminEmail = process.env.ADMIN_EMAIL;
  const dateStr = new Date(slot.date).toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  await resend.emails.send({
    from,
    to,
    subject: "Je 1-op-1 sessie is bevestigd",
    html: brandWrap(
      "Je afspraak is bevestigd",
      `<p style="line-height:1.7;">Beste ${name},</p>
       <p style="line-height:1.7;">Graag bevestig ik onze afspraak voor de klankschalen sessie.</p>
       <p style="line-height:1.7;">Trek lekker comfortabele kleding aan waarin je je vrij en ontspannen voelt. Tijdens de sessie mag je heerlijk tot rust komen en even alles loslaten.</p>
       <p style="line-height:1.7;">De sessie vindt plaats op:<br>
       <strong>${dateStr}</strong>, ${slot.start_time.slice(0,5)} - ${slot.end_time.slice(0,5)}<br>
       Faas Eliaslaan 30-A<br>
       Baarn</p>
       <p style="line-height:1.7;">Ik kijk ernaar uit je te ontvangen.</p>
       <p style="line-height:1.7;">Liefs,<br>Pien</p>`
    ),
  });

  if (adminEmail) {
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `Nieuwe boeking 1-op-1 sessie ${dateStr}`,
      html: brandWrap(
        "Nieuwe boeking",
        `<p style="line-height:1.7;"><strong>${name}</strong> (${to}) heeft de 1-op-1 sessie op ${dateStr}, ${slot.start_time.slice(0,5)}-${slot.end_time.slice(0,5)} geboekt.</p>`
      ),
    });
  }
}

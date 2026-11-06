"use client";

import { useEffect, useState } from "react";

function csvCell(value) {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",;\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function ContactsSection() {
  const [contacts, setContacts] = useState(null);
  const [onlyNewsletter, setOnlyNewsletter] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  async function load() {
    const res = await fetch("/api/contacts");
    const data = await res.json().catch(() => ({}));
    setContacts(data.contacts || []);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = (contacts || []).filter((c) => {
    if (onlyNewsletter && !c.newsletter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.includes(q);
  });

  function downloadCsv() {
    const header = ["Naam", "E-mail", "Telefoon", "Nieuwsbrief", "Aantal boekingen", "Eerste boeking", "Laatste boeking"];
    const rows = visible.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.newsletter ? "ja" : "nee",
      c.booking_count,
      c.first_booking_at ? c.first_booking_at.slice(0, 10) : "",
      c.last_booking_at ? c.last_booking_at.slice(0, 10) : "",
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klank-ritueel-contacten-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyEmails() {
    const list = visible.map((c) => c.email).join(", ");
    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Kopieer de mailadressen:", list);
    }
  }

  async function toggleNewsletter(contact) {
    await fetch(`/api/contacts/${contact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsletter: !contact.newsletter }),
    });
    load();
  }

  async function deleteContact(contact) {
    if (!confirm(`${contact.name} (${contact.email}) definitief uit de contactenlijst verwijderen?`)) return;
    const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    if (!res.ok) alert("Verwijderen is niet gelukt. Probeer het opnieuw.");
    load();
  }

  const newsletterCount = (contacts || []).filter((c) => c.newsletter).length;

  return (
    <section style={{ marginTop: "3rem" }}>
      <div className="card-row">
        <h2>Contacten</h2>
        {contacts && (
          <span className="muted">
            {contacts.length} totaal · {newsletterCount} met nieuwsbrief
          </span>
        )}
      </div>
      <p className="muted">
        Iedereen die ooit geboekt heeft. Deze lijst blijft bewaard, ook als je sessies of boekingen verwijdert.
      </p>

      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center" }}>
          <input
            placeholder="Zoek op naam of e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1 1 200px", margin: 0 }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", margin: 0, fontWeight: "normal", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={onlyNewsletter}
              onChange={(e) => setOnlyNewsletter(e.target.checked)}
              style={{ width: "auto", margin: 0 }}
            />
            Alleen nieuwsbrief
          </label>
          <button className="btn" onClick={copyEmails} disabled={visible.length === 0}>
            {copied ? "Gekopieerd!" : "Kopieer mailadressen"}
          </button>
          <button className="btn btn-primary" onClick={downloadCsv} disabled={visible.length === 0}>
            Download CSV
          </button>
        </div>

        {contacts === null && <p className="muted" style={{ marginTop: "1rem" }}>Bezig met laden…</p>}
        {contacts && visible.length === 0 && (
          <p className="muted" style={{ marginTop: "1rem" }}>Geen contacten gevonden.</p>
        )}
        {visible.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ marginTop: "1rem" }}>
              <thead>
                <tr><th>Naam</th><th>E-mail</th><th>Telefoon</th><th>Boekingen</th><th>Nieuwsbrief</th><th></th></tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.booking_count}</td>
                    <td>
                      <button className="btn" onClick={() => toggleNewsletter(c)} title="Klik om aan of uit te zetten">
                        {c.newsletter ? "Ja" : "Nee"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn" onClick={() => deleteContact(c)}>Verwijderen</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

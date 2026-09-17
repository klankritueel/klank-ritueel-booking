"use client";

import { useEffect, useState } from "react";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LoginForm({ onLoggedIn }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Inloggen mislukt.");
      return;
    }
    onLoggedIn();
  }

  return (
    <div className="page" style={{ maxWidth: 380 }}>
      <span className="eyebrow">Klank Ritueel</span>
      <h1>Beheerpaneel</h1>
      <form onSubmit={submit}>
        <label>Wachtwoord</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ marginTop: "1.1rem" }}>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Even geduld…" : "Inloggen"}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}

const emptySession = {
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  price: "",
  max_participants: "",
  min_participants: "",
};

function SessionForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
        <div>
          <label>Datum</label>
          <input type="date" required value={form.date} onChange={set("date")} />
        </div>
        <div>
          <label>Locatie</label>
          <input required value={form.location} onChange={set("location")} />
        </div>
        <div>
          <label>Begintijd</label>
          <input type="time" required value={form.start_time} onChange={set("start_time")} />
        </div>
        <div>
          <label>Eindtijd</label>
          <input type="time" required value={form.end_time} onChange={set("end_time")} />
        </div>
        <div>
          <label>Prijs (€)</label>
          <input type="number" step="0.01" min="0" required value={form.price} onChange={set("price")} />
        </div>
        <div>
          <label>Max. deelnemers</label>
          <input type="number" min="1" required value={form.max_participants} onChange={set("max_participants")} />
        </div>
        <div>
          <label>Min. deelnemers</label>
          <input type="number" min="1" value={form.min_participants} onChange={set("min_participants")} />
        </div>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Annuleren
        </button>
      </div>
    </form>
  );
}

function SlotForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 1rem" }}>
        <div>
          <label>Datum</label>
          <input type="date" required value={form.date} onChange={set("date")} />
        </div>
        <div>
          <label>Begintijd</label>
          <input type="time" required value={form.start_time} onChange={set("start_time")} />
        </div>
        <div>
          <label>Eindtijd</label>
          <input type="time" required value={form.end_time} onChange={set("end_time")} />
        </div>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Annuleren
        </button>
      </div>
    </form>
  );
}

function Dashboard({ onLoggedOut }) {
  const [sessions, setSessions] = useState(null);
  const [slots, setSlots] = useState(null);
  const [addingSession, setAddingSession] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [addingSlot, setAddingSlot] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const [sessionsRes, slotsRes] = await Promise.all([
      fetch("/api/sessions").then((r) => r.json()),
      fetch("/api/availability").then((r) => r.json()),
    ]);
    setSessions(sessionsRes.sessions || []);
    setSlots(slotsRes.slots || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createSession(form) {
    setSaving(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setAddingSession(false);
    loadData();
  }

  async function updateSession(id, form) {
    setSaving(true);
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditingSessionId(null);
    loadData();
  }

  async function deleteSession(id) {
    if (!confirm("Deze groepssessie verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    loadData();
  }

  async function createSlot(form) {
    setSaving(true);
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setAddingSlot(false);
    loadData();
  }

  async function updateSlot(id, form) {
    setSaving(true);
    await fetch(`/api/availability/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditingSlotId(null);
    loadData();
  }

  async function deleteSlot(id) {
    if (!confirm("Dit tijdslot verwijderen?")) return;
    await fetch(`/api/availability/${id}`, { method: "DELETE" });
    loadData();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLoggedOut();
  }

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <div className="card-row">
        <div>
          <span className="eyebrow">Klank Ritueel</span>
          <h1 style={{ marginBottom: 0 }}>Beheerpaneel</h1>
        </div>
        <button className="btn" onClick={logout}>Uitloggen</button>
      </div>

      <section style={{ marginTop: "2.5rem" }}>
        <div className="card-row">
          <h2>Groepssessies</h2>
          {!addingSession && (
            <button className="btn" onClick={() => setAddingSession(true)}>+ Nieuwe sessie</button>
          )}
        </div>

        {addingSession && (
          <div className="card">
            <SessionForm
              initial={emptySession}
              saving={saving}
              onCancel={() => setAddingSession(false)}
              onSave={createSession}
            />
          </div>
        )}

        {sessions === null && <p className="muted">Bezig met laden…</p>}
        {sessions &&
          sessions.map((session) => (
            <div className="card" key={session.id}>
              {editingSessionId === session.id ? (
                <SessionForm
                  initial={{
                    date: session.date,
                    start_time: session.start_time.slice(0, 5),
                    end_time: session.end_time.slice(0, 5),
                    location: session.location,
                    price: session.price,
                    max_participants: session.max_participants,
                    min_participants: session.min_participants,
                  }}
                  saving={saving}
                  onCancel={() => setEditingSessionId(null)}
                  onSave={(form) => updateSession(session.id, form)}
                />
              ) : (
                <>
                  <div className="card-row">
                    <div>
                      <strong>{formatDate(session.date)}</strong>
                      <div className="muted">
                        {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)} · {session.location} · €{Number(session.price).toFixed(2)}
                      </div>
                      <div className="muted">
                        Min. {session.min_participants} / max. {session.max_participants} deelnemers
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`tag ${session.is_full ? "full" : "open"}`}>

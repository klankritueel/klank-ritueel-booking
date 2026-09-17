"use client";

import { useEffect, useState } from "react";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BookingForm({ onSubmit, submitting, error, success, submitLabel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  if (success) {
    return <p className="form-success">{success}</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, email, phone });
      }}
    >
      <label>Naam</label>
      <input required value={name} onChange={(e) => setName(e.target.value)} />
      <label>E-mailadres</label>
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Telefoonnummer</label>
      <input required value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div style={{ marginTop: "1.1rem" }}>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Even geduld…" : submitLabel}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

export default function BoekenPage() {
  const [sessions, setSessions] = useState(null);
  const [slots, setSlots] = useState(null);
  const [openSessionForm, setOpenSessionForm] = useState(null);
  const [openSlotForm, setOpenSlotForm] = useState(null);
  const [sessionState, setSessionState] = useState({});
  const [slotState, setSlotState] = useState({});

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

  async function submitSessionBooking(session, form) {
    setSessionState((s) => ({ ...s, [session.id]: { submitting: true, error: null } }));
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id, ...form }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSessionState((s) => ({ ...s, [session.id]: { submitting: false, error: data.error } }));
      return;
    }
    setSessionState((s) => ({
      ...s,
      [session.id]: { submitting: false, success: "Je aanmelding is bevestigd. Check je mail voor de details." },
    }));
    loadData();
  }

  async function submitSlotBooking(slot, form) {
    setSlotState((s) => ({ ...s, [slot.id]: { submitting: true, error: null } }));
    const res = await fetch("/api/individual-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot_id: slot.id, ...form }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSlotState((s) => ({ ...s, [slot.id]: { submitting: false, error: data.error } }));
      return;
    }
    setSlotState((s) => ({
      ...s,
      [slot.id]: { submitting: false, success: "Je afspraak is bevestigd. Check je mail voor de details." },
    }));
    loadData();
  }

  return (
    <div className="page">
      <span className="eyebrow">Klank Ritueel</span>
      <h1>Boek je sessie</h1>
      <p className="muted">Kies een groepssessie of plan een 1-op-1 moment in.</p>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Groepssessies</h2>
        {sessions === null && <p className="muted">Bezig met laden…</p>}
        {sessions && sessions.length === 0 && (
          <p className="muted">Er staan op dit moment geen groepssessies gepland.</p>
        )}
        {sessions &&
          sessions.map((session) => {
            const state = sessionState[session.id] || {};
            return (
              <div className="card" key={session.id}>
                <div className="card-row">
                  <div>
                    <strong>{formatDate(session.date)}</strong>
                    <div className="muted">
                      {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)} · {session.location}
                    </div>
                    <div className="muted">€{Number(session.price).toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`tag ${session.is_full ? "full" : "open"}`}>
                      {session.is_full ? "Vol" : `${session.spots_left} plekken vrij`}
                    </span>
                    <div style={{ marginTop: "0.6rem" }}>
                      <button
                        className="btn"
                        disabled={session.is_full}
                        onClick={() =>

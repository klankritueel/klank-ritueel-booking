-- Klank Ritueel boekingssysteem — databaseschema
-- Plak dit volledige bestand in Supabase -> SQL Editor -> New query -> Run

create extension if not exists "pgcrypto";

-- Groepssessies, door de beheerder aangemaakt
create table if not exists group_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  price numeric(10,2) not null,
  max_participants integer not null,
  min_participants integer not null default 1,
  created_at timestamptz not null default now()
);

-- Aanmeldingen voor een groepssessie
create table if not exists group_bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references group_sessions(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

-- Beschikbare tijdsloten voor 1-op-1 sessies, door de beheerder aangemaakt
create table if not exists availability_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Boeking van een 1-op-1 tijdslot
create table if not exists individual_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references availability_slots(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: de site praat met Supabase via de service-role key
-- (server-side, nooit in de browser), dus we zetten RLS aan en laten
-- alleen die service-role alles doen. De browser raakt de database nooit
-- rechtstreeks aan.
alter table group_sessions enable row level security;
alter table group_bookings enable row level security;
alter table availability_slots enable row level security;
alter table individual_bookings enable row level security;

-- Geen policies voor "anon" toegevoegd: dat betekent dat de publieke
-- (browser) sleutel geen toegang heeft. Alleen API-routes die de
-- service-role key gebruiken (dus jouw eigen servercode) kunnen lezen/schrijven.

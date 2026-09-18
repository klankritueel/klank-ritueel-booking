# Klank Ritueel — eigen boekingssysteem

Dit is een volledig zelfstandig boekingssysteem (geen Salonized of andere externe partij).
Het bestaat uit:

- **Een boekingspagina** (`/boeken`) die bezoekers zien: groepssessies met beschikbare
  plekken, en losse tijdsloten voor 1-op-1 sessies.
- **Een beheerpaneel** (`/beheer`), achter een wachtwoord, waar jij sessies en tijden
  aanmaakt, wijzigt en verwijdert, en ziet wie zich heeft aangemeld.
- **Een database** (Supabase) waar alle sessies en boekingen in staan.
- **E-mail** (Resend) voor de bevestiging aan de klant en de melding aan jou.

Niets hiervan draait "vanzelf" nog — hieronder staat exact wat je moet doen om het
live te krijgen. Dit is eenmalig werk van ongeveer 30-45 minuten.

## Stap 1 — Supabase (de database)

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account + nieuw project aan.
2. Ga naar **SQL Editor** → **New query**, plak de volledige inhoud van
   `supabase/schema.sql` (in deze map) erin, en klik **Run**. Dit maakt alle tabellen aan.
3. Ga naar **Project Settings → API**. Daar vind je drie dingen die je zo meteen nodig hebt:
   - **Project URL** → dit wordt `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → dit wordt `NEXT_PUBLIC_SUPABASE_ANON_KEY` (niet strikt gebruikt
     door deze app, maar goed om te bewaren)
   - **service_role key** → dit wordt `SUPABASE_SERVICE_ROLE_KEY`. **Geheim houden**,
     dit is de sleutel waarmee de server alles mag.

## Stap 2 — Resend (voor e-mail)

1. Ga naar [resend.com](https://resend.com) en maak een gratis account.
2. Ga naar **API Keys** → maak een nieuwe key aan → dit wordt `RESEND_API_KEY`.
3. Voor de snelste start kun je `EMAIL_FROM=onboarding@resend.dev` gebruiken (Resend's
   eigen test-adres, werkt direct). Wil je mail vanaf je eigen adres versturen
   (bijvoorbeeld `boeken@klankritueel.nl`), dan moet je bij Resend onder **Domains**
   eerst het domein `klankritueel.nl` verifiëren met een paar DNS-records bij je
   domeinregistrar. Dat kan later, de site werkt ook prima zonder.
4. `ADMIN_EMAIL` is het adres waarop jij meldingen van nieuwe boekingen ontvangt,
   bijvoorbeeld `klankritueel@gmail.com`.

## Stap 3 — Wachtwoord en beveiliging

Vul in je `.env`-bestand (kopieer `.env.example` naar `.env.local` om lokaal te testen,
en zet dezelfde waarden in Vercel voor productie):

- `ADMIN_PASSWORD` — het wachtwoord waarmee jij inlogt op `/beheer`. Kies iets sterks.
- `AUTH_SECRET` — een lange, willekeurige tekst (bijvoorbeeld 40 willekeurige tekens).
  Deze hoef je nergens te onthouden, hij wordt alleen gebruikt om je inlog-cookie te
  ondertekenen zodat niemand die kan vervalsen.

## Stap 4 — Deployen naar Vercel

1. Zet deze projectmap in een eigen GitHub-repository (of upload direct via de Vercel CLI).
2. Ga naar [vercel.com](https://vercel.com), maak een gratis account, en klik
   **Add New → Project**, en kies deze repository.
3. Bij **Environment Variables** vul je alle waarden in die hierboven genoemd zijn:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `RESEND_API_KEY`, `ADMIN_EMAIL`, `EMAIL_FROM`, `ADMIN_PASSWORD`, `AUTH_SECRET`.
4. Klik **Deploy**. Na een minuutje krijg je een werkende link zoals
   `klank-ritueel-booking.vercel.app`.
5. Test: ga naar `/boeken` (moet leeg zijn, er staat nog niets in) en naar `/beheer`
   (log in met je `ADMIN_PASSWORD`, maak een testsessie aan, en check of hij op
   `/boeken` verschijnt).

## Stap 5 — Koppelen aan klankritueel.nl

Er zijn twee manieren om dit onder je eigen domein te krijgen:

**Optie A — subdomein (makkelijkst):** zet `boeken.klankritueel.nl` in Vercel onder
**Project Settings → Domains**, en volg de instructie om een DNS-record bij je
domeinregistrar toe te voegen. Je "Reserveer"-knoppen op de hoofdsite kunnen dan
gewoon linken naar `https://boeken.klankritueel.nl`.

**Optie B — alles onder hetzelfde domein:** je hoofdsite (de statische pagina) en deze
boekingsapp samenvoegen tot één Vercel-project, met de hoofdsite als vaste pagina's en
`/boeken` + `/beheer` als deze app. Dit is iets meer werk; laat het weten als je dat wilt,
dan zet ik dat voor je op.

Zodra een van beide staat, pas je in de hoofdsite (`index.html`) de "Reserveer" en
"Boek je plek"-knoppen aan zodat ze naar die link wijzen, in plaats van naar de
Salonized-widget.

## Wat het systeem wel en niet doet

- Groepssessies: jij stelt zelf datum, tijd, locatie, prijs, minimum en maximum aantal
  deelnemers in. Zodra het maximum bereikt is, toont de site automatisch "Vol" en kan
  niemand zich meer aanmelden.
- Het systeem annuleert nooit zelf een sessie als het minimum niet gehaald wordt — dat
  zie je in het beheerpaneel (er staat een duidelijke melding bij), en jij beslist wat
  je daarmee doet.
- 1-op-1 sessies: jij zet losse tijdsloten klaar; zodra iemand er een boekt, verdwijnt
  die van de publieke lijst.
- Bij elke boeking: de klant krijgt een bevestigingsmail, jij krijgt een meldingsmail,
  en je ziet de boeking meteen terug in het beheerpaneel.

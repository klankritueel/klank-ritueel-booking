import "./globals.css";

export const metadata = {
  title: "Boeken — Klank Ritueel",
  description: "Boek een groepssessie of 1-op-1 klankreis bij Klank Ritueel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}

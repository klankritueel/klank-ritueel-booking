import { createClient } from "@supabase/supabase-js";

// Deze client gebruikt de service-role key en mag dus alles in de database.
// Wordt alleen server-side gebruikt (in API-routes), nooit in de browser.
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase-omgevingsvariabelen ontbreken. Check NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

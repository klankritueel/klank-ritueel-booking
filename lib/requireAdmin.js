import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "./auth";

// Geeft true terug als het verzoek een geldig, ondertekend admin-cookie meestuurt.
export function isAdminRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

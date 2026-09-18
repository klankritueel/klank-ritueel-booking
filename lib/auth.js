import crypto from "crypto";

const COOKIE_NAME = "kr_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dagen

function sign(value) {
  const secret = process.env.AUTH_SECRET || "";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

// Maakt een ondertekend sessie-token. Niemand kan dit vervalsen zonder
// de AUTH_SECRET te kennen (die alleen op de server staat).
export function createSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS });
  const b64 = Buffer.from(payload).toString("base64url");
  const signature = sign(b64);
  return `${b64}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const [b64, signature] = token.split(".");
  if (!b64 || !signature) return false;
  const expected = sign(b64);
  if (expected.length !== signature.length) return false;
  const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) return false;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString());
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export { COOKIE_NAME };

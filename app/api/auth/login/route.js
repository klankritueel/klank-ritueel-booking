import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, createSessionToken } from "../../../../lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Onjuist wachtwoord." }, { status: 401 });
  }

  const token = createSessionToken();
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}

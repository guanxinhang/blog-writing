import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STATE_COOKIE, TOKEN_COOKIE, getRedirectUri } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const savedState = jar.get(STATE_COOKIE)?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/editor?error=auth", url.origin));
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: getRedirectUri(req),
    }),
  });
  const data = (await tokenRes.json()) as { access_token?: string };
  const token = data.access_token;

  if (!token) {
    return NextResponse.redirect(new URL("/editor?error=auth", url.origin));
  }

  const res = NextResponse.redirect(new URL("/editor", url.origin));
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  res.cookies.delete(STATE_COOKIE);
  return res;
}

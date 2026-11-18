import { NextResponse } from "next/server";
import { STATE_COOKIE, getRedirectUri } from "@/lib/auth";

export async function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "未配置 GITHUB_CLIENT_ID，请检查 .env.local" },
      { status: 500 },
    );
  }

  const state = crypto.randomUUID();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "repo");
  url.searchParams.set("redirect_uri", getRedirectUri(req));
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}

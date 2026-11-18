import { cookies } from "next/headers";

const TOKEN_COOKIE = "gh_token";
const STATE_COOKIE = "gh_state";

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(TOKEN_COOKIE)?.value ?? null;
}

export function getRedirectUri(req: Request): string {
  const origin = (process.env.SITE_URL || new URL(req.url).origin).replace(
    /\/+$/,
    "",
  );
  return `${origin}/api/auth/callback`;
}

export { TOKEN_COOKIE, STATE_COOKIE };

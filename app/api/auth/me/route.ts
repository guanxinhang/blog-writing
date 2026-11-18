import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/github";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    if (process.env.NODE_ENV === "development") {
      // 本地开发：无需 GitHub 也能进入编辑器（读写本地 content/posts）
      return NextResponse.json({
        loggedIn: true,
        user: { login: "local", name: "本地模式", avatar: "" },
      });
    }
    return NextResponse.json({ loggedIn: false });
  }
  try {
    const u = await getCurrentUser(token);
    return NextResponse.json({
      loggedIn: true,
      user: { login: u.login, name: u.name, avatar: u.avatar_url },
    });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}

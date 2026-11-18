import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const correct = process.env.SITE_PASSWORD;
  if (!correct) {
    return NextResponse.json(
      { error: "未配置 SITE_PASSWORD 环境变量" },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  if (password === correct) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("site_auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 一天免密
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "密码错误" }, { status: 401 });
}

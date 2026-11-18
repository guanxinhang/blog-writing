import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { listEditorPosts, saveEditorPost, type EditorPost } from "@/lib/storage";

async function authOrError() {
  const token = await getAccessToken();
  if (!token && process.env.NODE_ENV === "production") {
    return {
      token,
      error: NextResponse.json({ error: "未登录" }, { status: 401 }),
    };
  }
  return { token, error: null };
}

export async function GET() {
  const { token, error } = await authOrError();
  if (error) return error;
  try {
    const posts = await listEditorPosts(token);
    return NextResponse.json({ posts });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "读取失败" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { token, error } = await authOrError();
  if (error) return error;
  try {
    const body = (await req.json()) as EditorPost;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    await saveEditorPost(token, body);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "保存失败" },
      { status: 500 },
    );
  }
}

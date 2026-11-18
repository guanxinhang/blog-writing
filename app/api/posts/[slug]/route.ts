import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { deleteEditorPost, readEditorPost } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = await getAccessToken();
  if (!token && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  try {
    const post = await readEditorPost(token, slug);
    if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "读取失败" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = await getAccessToken();
  if (!token && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  try {
    await deleteEditorPost(token, slug);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "删除失败" },
      { status: 500 },
    );
  }
}

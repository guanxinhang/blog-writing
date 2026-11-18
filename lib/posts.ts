import { createClient } from "@/lib/supabase/server";

export type PostMeta = {
  id: string;
  user_id: string;
  username: string;
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category?: string;
  summary?: string;
  draft: boolean;
};

export type Post = PostMeta & { content: string };

type PostRow = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[] | null;
  category: string | null;
  summary: string | null;
  draft: boolean;
  created_at: string;
};

// 批量查作者用户名
async function getUsernames(userIds: string[]): Promise<Map<string, string>> {
  const supabase = await createClient();
  const map = new Map<string, string>();
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", unique);
  for (const p of data ?? []) map.set(p.id, p.username);
  return map;
}

function toMeta(row: PostRow, usernames: Map<string, string>): PostMeta {
  return {
    id: row.id,
    user_id: row.user_id,
    username: usernames.get(row.user_id) ?? "unknown",
    slug: row.slug,
    title: row.title,
    date: row.created_at,
    tags: row.tags ?? [],
    category: row.category ?? undefined,
    summary: row.summary ?? undefined,
    draft: row.draft,
  };
}

// 全站最新文章（非草稿，倒序）
export async function getAllPosts(): Promise<PostMeta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("draft", false)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as PostRow[];
  const usernames = await getUsernames(rows.map((r) => r.user_id));
  return rows.map((r) => toMeta(r, usernames));
}

// 某用户发布的文章（非草稿）
export async function getPostsByUser(username: string): Promise<PostMeta[]> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return [];

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("draft", false)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as PostRow[];
  const usernames = new Map([[profile.id, profile.username]]);
  return rows.map((r) => toMeta(r, usernames));
}

// 文章详情
export async function getPost(
  username: string,
  slug: string,
): Promise<Post | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;

  const row = data as PostRow;
  const meta = toMeta(row, new Map([[profile.id, profile.username]]));
  return { ...meta, content: row.content };
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.tags.includes(tag));
}

export function formatDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

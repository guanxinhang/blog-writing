import { readFile, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import * as github from "./github";
import { slugify } from "./slug";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type EditorPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category?: string;
  summary?: string;
  content: string;
  draft: boolean;
  sha?: string;
};

function serialize(post: EditorPost): string {
  const data: Record<string, unknown> = {
    title: post.title,
    date: post.date,
    tags: post.tags,
  };
  if (post.category) data.category = post.category;
  if (post.summary) data.summary = post.summary;
  if (post.draft) data.draft = true;
  return matter.stringify(post.content, data);
}

function parse(raw: string, slug: string, sha?: string): EditorPost {
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    category: data.category as string | undefined,
    summary: data.summary as string | undefined,
    content,
    draft: data.draft === true,
    sha,
  };
}

function env() {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!repo) throw new Error("未配置 GITHUB_REPO 环境变量");
  return { repo, branch };
}

async function listLocal(): Promise<string[]> {
  const files = await readdir(POSTS_DIR);
  return files
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

async function readLocal(slug: string): Promise<EditorPost | null> {
  try {
    const raw = await readFile(path.join(POSTS_DIR, `${slug}.md`), "utf-8");
    return parse(raw, slug);
  } catch {
    return null;
  }
}

async function writeLocal(slug: string, content: string): Promise<void> {
  await writeFile(path.join(POSTS_DIR, `${slug}.md`), content, "utf-8");
}

async function deleteLocal(slug: string): Promise<void> {
  await rm(path.join(POSTS_DIR, `${slug}.md`), { force: true });
}

export async function listEditorPosts(
  token: string | null,
): Promise<EditorPost[]> {
  if (token) {
    const { repo, branch } = env();
    const files = await github.listPostFiles(token, repo, branch);
    const posts: EditorPost[] = [];
    for (const f of files) {
      const remote = await github.readRemoteFile(token, repo, branch, f.path);
      if (remote) posts.push(parse(remote.content, f.name.replace(/\.md$/, ""), f.sha));
    }
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  const slugs = await listLocal();
  const posts: EditorPost[] = [];
  for (const slug of slugs) {
    const p = await readLocal(slug);
    if (p) posts.push(p);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function readEditorPost(
  token: string | null,
  slug: string,
): Promise<EditorPost | null> {
  if (token) {
    const { repo, branch } = env();
    const remote = await github.readRemoteFile(
      token,
      repo,
      branch,
      `content/posts/${slug}.md`,
    );
    if (!remote) return null;
    return parse(remote.content, slug, remote.sha);
  }
  return readLocal(slug);
}

export async function saveEditorPost(
  token: string | null,
  post: EditorPost,
): Promise<void> {
  const slug = slugify(post.slug);
  const content = serialize({ ...post, slug });

  if (token) {
    const { repo, branch } = env();
    const filePath = `content/posts/${slug}.md`;
    const existing = await github.readRemoteFile(token, repo, branch, filePath);
    await github.writeRemoteFile(
      token,
      repo,
      branch,
      filePath,
      content,
      `blog: ${post.draft ? "更新草稿" : "发布"}《${post.title}》`,
      existing?.sha,
    );
    return;
  }

  await writeLocal(slug, content);
}

export async function deleteEditorPost(
  token: string | null,
  slug: string,
): Promise<void> {
  if (token) {
    const { repo, branch } = env();
    const filePath = `content/posts/${slug}.md`;
    const existing = await github.readRemoteFile(token, repo, branch, filePath);
    if (!existing) return;
    await github.deleteRemoteFile(
      token,
      repo,
      branch,
      filePath,
      `blog: 删除《${slug}》`,
      existing.sha,
    );
    return;
  }
  await deleteLocal(slug);
}

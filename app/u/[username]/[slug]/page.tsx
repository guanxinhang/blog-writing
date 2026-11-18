import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, formatDate } from "@/lib/posts";
import Markdown from "@/lib/markdown";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const post = await getPost(decodeURIComponent(username), decodeURIComponent(slug));
  return { title: post?.title ?? decodeURIComponent(slug) };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const post = await getPost(
    decodeURIComponent(username),
    decodeURIComponent(slug),
  );
  if (!post) notFound();

  return (
    <article className="post-detail">
      <header className="post-detail-header">
        <h1>{post.title}</h1>
        <div className="post-detail-meta">
          <Link href={`/u/${post.username}`} className="post-author">
            @{post.username}
          </Link>
          <time>{formatDate(post.date)}</time>
          {post.category && (
            <span className="post-category">{post.category}</span>
          )}
          {post.tags.map((t) => (
            <Link
              key={t}
              href={`/tags/${encodeURIComponent(t)}`}
              className="tag-chip pink"
            >
              #{t}
            </Link>
          ))}
        </div>
      </header>
      <Markdown content={post.content} />
    </article>
  );
}

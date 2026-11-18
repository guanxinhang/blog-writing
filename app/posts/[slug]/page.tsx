import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPost, formatDate } from "@/lib/posts";
import Markdown from "@/lib/markdown";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const post = await getPost(decoded);
  return { title: post?.title ?? decoded };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  if (!post) notFound();

  return (
    <article className="post-detail">
      <header className="post-detail-header">
        <h1>{post.title}</h1>
        <div className="post-detail-meta">
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

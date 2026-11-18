import { getAllTags, getPostsByTag } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.tag }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = await getPostsByTag(decoded);

  return (
    <>
      <h1 className="section-title">标签 · #{decoded}</h1>
      {posts.length === 0 ? (
        <p className="empty">这个标签下还没有文章</p>
      ) : (
        <div className="post-list">
          {posts.map((p, i) => (
            <PostCard key={p.slug} post={p} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

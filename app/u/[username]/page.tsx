import { getPostsByUser } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  return { title: `@${decoded} 的博客` };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  const posts = await getPostsByUser(decoded);

  return (
    <>
      <h1 className="section-title">@{decoded} 的博客</h1>
      {posts.length === 0 ? (
        <p className="empty">TA 还没有发布文章</p>
      ) : (
        <div className="post-list">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

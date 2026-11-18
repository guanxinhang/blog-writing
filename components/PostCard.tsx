import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";

const TAG_COLORS = ["mint", "lavender", "peach", "sky", "pink"];

export default function PostCard({
  post,
  index = 0,
}: {
  post: PostMeta;
  index?: number;
}) {
  return (
    <Link
      href={`/u/${post.username}/${post.slug}`}
      className="post-card reveal"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="post-card-top">
        <time className="post-date">{formatDate(post.date)}</time>
        {post.category && (
          <span className="post-category">{post.category}</span>
        )}
        <span className="post-author">@{post.username}</span>
      </div>
      <h2 className="post-title">{post.title}</h2>
      {post.summary && <p className="post-summary">{post.summary}</p>}
      {post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, i) => (
            <span key={tag} className={`tag-chip ${TAG_COLORS[i % TAG_COLORS.length]}`}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <span className="post-more">阅读全文 →</span>
    </Link>
  );
}

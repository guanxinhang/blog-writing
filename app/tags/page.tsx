import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <>
      <h1 className="section-title">标签云</h1>
      {tags.length === 0 ? (
        <p className="empty">还没有标签</p>
      ) : (
        <div className="tag-cloud">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="tag-link reveal"
            >
              #{tag} <span className="tag-count">({count})</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

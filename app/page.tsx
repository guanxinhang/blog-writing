import { getSiteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export default async function HomePage() {
  const [cfg, posts] = await Promise.all([getSiteConfig(), getAllPosts()]);

  return (
    <>
      <section className="hero reveal">
        <h1>{cfg.title}</h1>
        <p className="hero-tagline">{cfg.tagline}</p>
        <p className="hero-subtitle">{cfg.subtitle}</p>
      </section>

      <h2 className="section-title">最新文章</h2>
      {posts.length === 0 ? (
        <p className="empty">
          还没有文章，去{" "}
          <Link href="/editor" style={{ color: "var(--primary-strong)" }}>
            写博客
          </Link>{" "}
          页写一篇吧～
        </p>
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

export default function Footer({
  title,
  author,
}: {
  title: string;
  author: string;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          © {new Date().getFullYear()} {title} · {author}
        </p>
        <p className="footer-note">用 Next.js 构建 · 由 {author} 认真维护</p>
      </div>
    </footer>
  );
}

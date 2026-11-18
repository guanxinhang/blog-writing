import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>这页好像迷路啦</p>
      <Link href="/" className="btn btn-primary">
        回到首页
      </Link>
    </div>
  );
}

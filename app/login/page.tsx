"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("邮箱或密码错误，请重试");
      setLoading(false);
      return;
    }
    const p = new URLSearchParams(window.location.search).get("next");
    router.push(p && p.startsWith("/") ? p : "/");
    router.refresh();
  };

  return (
    <div className="editor-login">
      <div className="login-card">
        <h1>登录</h1>
        <p>登录后可阅读和发表博客。</p>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            autoFocus
            required
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            required
            style={inputStyle}
          />
          {error && (
            <span style={{ color: "#e05b5b", fontSize: 13 }}>{error}</span>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
        <p style={{ fontSize: 14, marginTop: 16, color: "var(--text-soft)" }}>
          还没有账号？<Link href="/register" style={{ color: "var(--primary-strong)" }}>去注册</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg-soft)",
  color: "var(--text)",
  fontSize: 15,
};

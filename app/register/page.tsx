"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = username.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,20}$/.test(name)) {
      setError("用户名需 3~20 位，只能含小写字母、数字、下划线、连字符");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // 先检查用户名是否被占用
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", name)
      .maybeSingle();
    if (taken) {
      setError("该用户名已被占用，请换一个");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data.session) {
      setError("注册成功，请去邮箱点击确认链接后再登录");
      setLoading(false);
      return;
    }
    if (!data.user) {
      setError("注册失败，请重试");
      setLoading(false);
      return;
    }

    const { error: nameErr } = await supabase
      .from("profiles")
      .update({ username: name })
      .eq("id", data.user.id);
    if (nameErr) {
      setError("用户名设置失败，请重新登录后到个人设置里修改");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="editor-login">
      <div className="login-card">
        <h1>注册</h1>
        <p>注册后即可阅读和发表博客。</p>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名（即你的博客地址 /u/用户名）"
            autoFocus
            required
            style={inputStyle}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            required
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少 6 位）"
            required
            style={inputStyle}
          />
          {error && (
            <span style={{ color: "#e05b5b", fontSize: 13 }}>{error}</span>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "注册中…" : "注册"}
          </button>
        </form>
        <p style={{ fontSize: 14, marginTop: 16, color: "var(--text-soft)" }}>
          已有账号？<Link href="/login" style={{ color: "var(--primary-strong)" }}>去登录</Link>
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

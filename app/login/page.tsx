"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [next, setNext] = useState("/");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("next");
    if (p && p.startsWith("/")) setNext(p);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = next;
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="editor-login">
      <div className="login-card">
        <h1>需要密码</h1>
        <p>写博客页面需要密码，请输入访问密码。</p>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="访问密码"
            autoFocus
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-soft)",
              color: "var(--text)",
              fontSize: 15,
            }}
          />
          {error && (
            <span style={{ color: "#e05b5b", fontSize: 13 }}>
              密码错误，请重试
            </span>
          )}
          <button type="submit" className="btn btn-primary">
            进入
          </button>
        </form>
      </div>
    </div>
  );
}

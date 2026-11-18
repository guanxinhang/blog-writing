"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "@/lib/markdown";
import { slugify } from "@/lib/slug";

type User = { login: string; name: string; avatar: string };

type EditorPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category?: string;
  summary?: string;
  content: string;
  draft: boolean;
  sha?: string;
};

const DRAFT_KEY = "anime-blog:draft";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function newPost(): EditorPost {
  return {
    slug: "",
    title: "",
    date: today(),
    tags: [],
    category: "",
    summary: "",
    content: "",
    draft: false,
  };
}

function parseTags(input: string): string[] {
  return input
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function EditorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<EditorPost[]>([]);
  const [current, setCurrent] = useState<EditorPost>(newPost());
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [draftAt, setDraftAt] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (Array.isArray(data.posts)) setPosts(data.posts);
    } catch {
      /* 忽略 */
    }
  }, []);

  // 检查登录状态
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
          await loadPosts();
        }
      } catch {
        /* 忽略 */
      } finally {
        setLoading(false);
      }
    })();
  }, [loadPosts]);

  // 读取 OAuth 回调错误
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "auth") {
      setError("GitHub 登录失败，请重试。");
    }
  }, []);

  // 恢复本地草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as EditorPost;
        setCurrent({ ...newPost(), ...draft, tags: draft.tags ?? [] });
        setActiveSlug(draft.slug || null);
        setTagsInput((draft.tags ?? []).join(", "));
      }
    } catch {
      /* 忽略 */
    }
  }, []);

  // 自动保存草稿（防抖）
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(current));
      setDraftAt(Date.now());
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current]);

  const createNew = () => {
    setCurrent(newPost());
    setActiveSlug(null);
    setTagsInput("");
    setStatus("idle");
  };

  const select = (p: EditorPost) => {
    setCurrent(p);
    setActiveSlug(p.slug);
    setTagsInput(p.tags.join(", "));
    setStatus("idle");
  };

  const updateTags = (value: string) => {
    setTagsInput(value);
    setCurrent((c) => ({ ...c, tags: parseTags(value) }));
  };

  const setField = <K extends keyof EditorPost>(key: K, value: EditorPost[K]) => {
    setCurrent((c) => ({ ...c, [key]: value }));
  };

  const save = async () => {
    if (!current.title.trim()) {
      alert("请先填写标题～");
      return;
    }
    setStatus("saving");
    const slug = slugify(activeSlug || current.title);
    const body: EditorPost = { ...current, slug, tags: current.tags };
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setActiveSlug(slug);
      setCurrent((c) => ({ ...c, slug }));
      localStorage.removeItem(DRAFT_KEY);
      setStatus("saved");
      await loadPosts();
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  };

  const del = async () => {
    if (!activeSlug) return;
    if (!window.confirm(`确定删除《${current.title || activeSlug}》吗？此操作不可撤销。`))
      return;
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(activeSlug)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await loadPosts();
      createNew();
    } catch {
      alert("删除失败，请重试。");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  if (loading) {
    return <p className="empty">加载中…</p>;
  }

  if (!user) {
    return (
      <div className="editor-login">
        <div className="login-card">
          <h1>✿ 写博客</h1>
          <p>用 GitHub 账号登录后，即可在线撰写并发布文章。</p>
          {error && <p style={{ color: "#e05b5b" }}>{error}</p>}
          <a href="/api/auth/login" className="btn btn-primary">
            使用 GitHub 登录
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-wrap">
      <div className="editor-topbar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--text-soft)",
            fontSize: 14,
          }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
          ) : (
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--primary-soft)",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                color: "var(--primary-strong)",
              }}
            >
              {user.name?.[0] ?? "?"}
            </span>
          )}
          <span>{user.name || user.login}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={save}
            disabled={status === "saving"}
          >
            {status === "saving" ? "保存中…" : "保存 / 发布"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            退出登录
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <aside className="editor-side">
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", marginBottom: 12 }}
            onClick={createNew}
          >
            ＋ 新建文章
          </button>
          <h3>文章列表</h3>
          <div className="editor-post-list">
            {posts.length === 0 && (
              <span style={{ color: "var(--text-soft)", fontSize: 13 }}>
                还没有文章
              </span>
            )}
            {posts.map((p) => (
              <button
                key={p.slug}
                type="button"
                className={`editor-post-item ${
                  activeSlug === p.slug ? "active" : ""
                }`}
                onClick={() => select(p)}
              >
                {p.draft ? "✎ " : ""}
                {p.title || p.slug}
              </button>
            ))}
          </div>
        </aside>

        <div className="editor-main">
          <div className="editor-meta">
            <div className="editor-field full">
              <label>标题</label>
              <input
                value={current.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="文章标题"
              />
            </div>
            <div className="editor-field">
              <label>日期</label>
              <input
                type="date"
                value={current.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
            <div className="editor-field">
              <label>分类</label>
              <input
                value={current.category ?? ""}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="例如：技术"
              />
            </div>
            <div className="editor-field full">
              <label>标签（用逗号分隔）</label>
              <input
                value={tagsInput}
                onChange={(e) => updateTags(e.target.value)}
                placeholder="数学, 编程, 二次元"
              />
            </div>
            <div className="editor-field full">
              <label>摘要</label>
              <input
                value={current.summary ?? ""}
                onChange={(e) => setField("summary", e.target.value)}
                placeholder="一句话介绍这篇文章（可选）"
              />
            </div>
          </div>

          <div className="editor-panes">
            <div className="editor-pane">
              <textarea
                className="editor-textarea"
                value={current.content}
                onChange={(e) => setField("content", e.target.value)}
                placeholder={"在这里写 Markdown…\n\n支持 $公式$、代码块、表格等。"}
              />
            </div>
            <div className="editor-pane editor-preview">
              <Markdown
                content={current.content || "*开始输入，右侧实时预览*"}
              />
            </div>
          </div>

          <div className="editor-actions">
            <span className={`editor-status ${status}`}>
              {status === "saved"
                ? "✓ 已保存到 GitHub"
                : status === "saving"
                  ? "保存中…"
                  : status === "error"
                    ? "保存失败，请重试"
                    : draftAt
                      ? `✎ 草稿已自动保存 ${new Date(draftAt).toLocaleTimeString()}`
                      : ""}
            </span>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  color: "var(--text-soft)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <input
                  type="checkbox"
                  checked={current.draft}
                  onChange={(e) => setField("draft", e.target.checked)}
                />
                草稿（首页不显示）
              </label>
              {activeSlug && (
                <button type="button" className="btn btn-danger" onClick={del}>
                  删除
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

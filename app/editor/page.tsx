"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Markdown from "@/lib/markdown";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";

type EditorPost = {
  id?: string;
  slug: string;
  title: string;
  tags: string[];
  category?: string;
  summary?: string;
  content: string;
  draft: boolean;
};

const DRAFT_KEY = "anime-blog:draft";

function newPost(): EditorPost {
  return {
    slug: "",
    title: "",
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
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<EditorPost[]>([]);
  const [current, setCurrent] = useState<EditorPost>(newPost());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [draftAt, setDraftAt] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const loadPosts = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setPosts(
      (data ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        tags: r.tags ?? [],
        category: r.category ?? undefined,
        summary: r.summary ?? undefined,
        content: r.content,
        draft: r.draft,
      })),
    );
  }, []);

  // 获取当前登录用户
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();
        setUsername(profile?.username ?? "");
        await loadPosts(user.id);
      }
    })();
  }, [loadPosts]);

  // 恢复本地草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as EditorPost;
        setCurrent({ ...newPost(), ...d, tags: d.tags ?? [] });
        setTagsInput((d.tags ?? []).join(", "));
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
    setActiveId(null);
    setTagsInput("");
    setStatus("idle");
  };

  const select = (p: EditorPost) => {
    setCurrent(p);
    setActiveId(p.id ?? null);
    setTagsInput(p.tags.join(", "));
    setStatus("idle");
  };

  const updateTags = (value: string) => {
    setTagsInput(value);
    setCurrent((c) => ({ ...c, tags: parseTags(value) }));
  };

  const setField = <K extends keyof EditorPost>(
    key: K,
    value: EditorPost[K],
  ) => {
    setCurrent((c) => ({ ...c, [key]: value }));
  };

  const save = async () => {
    if (!current.title.trim()) {
      alert("请先填写标题～");
      return;
    }
    if (!userId) return;
    setStatus("saving");
    const supabase = createClient();

    const base = slugify(current.slug || current.title);
    // 处理同用户内 slug 冲突
    let finalSlug = base;
    const { data: clash } = await supabase
      .from("posts")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", base);
    const clashOther = (clash ?? []).some((r) => r.id !== activeId);
    if (clashOther) {
      finalSlug = `${base}-${Date.now().toString().slice(-6)}`;
    }

    const payload = {
      user_id: userId,
      slug: finalSlug,
      title: current.title,
      content: current.content,
      tags: current.tags,
      category: current.category || null,
      summary: current.summary || null,
      draft: current.draft,
    };

    let error = null;
    if (activeId) {
      const res = await supabase.from("posts").update(payload).eq("id", activeId);
      error = res.error;
    } else {
      const res = await supabase.from("posts").insert(payload).select();
      error = res.error;
      if (res.data?.[0]) setActiveId(res.data[0].id);
    }

    if (error) {
      setStatus("error");
      return;
    }
    setCurrent((c) => ({ ...c, slug: finalSlug }));
    localStorage.removeItem(DRAFT_KEY);
    setStatus("saved");
    await loadPosts(userId);
    setTimeout(() => setStatus("idle"), 2500);
  };

  const del = async () => {
    if (!activeId) return;
    if (!window.confirm("确定删除这篇文章吗？此操作不可撤销。")) return;
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", activeId);
    if (error) {
      alert("删除失败，请重试");
      return;
    }
    await loadPosts(userId!);
    createNew();
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="editor-wrap">
      <div className="editor-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href={username ? `/u/${username}` : "/"}
            style={{
              color: "var(--primary-strong)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            @{username || "我"}
          </Link>
          <span style={{ color: "var(--text-soft)", fontSize: 13 }}>
            我的主页
          </span>
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
          <button type="button" className="btn btn-ghost" onClick={signOut}>
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
          <h3>我的文章</h3>
          <div className="editor-post-list">
            {posts.length === 0 && (
              <span style={{ color: "var(--text-soft)", fontSize: 13 }}>
                还没有文章
              </span>
            )}
            {posts.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`editor-post-item ${
                  activeId === p.id ? "active" : ""
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
                placeholder="数学, 编程, 小作文"
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
                ? "✓ 已保存"
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
              {activeId && (
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

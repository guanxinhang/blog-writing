"use client";

import { Children, useRef, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex, rehypeHighlight];

function CodeBlock({ children }: { children?: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  let lang = "code";
  try {
    const child = Children.only(children) as { props?: { className?: string } };
    const cls = child?.props?.className ?? "";
    const m = /language-([\w-]+)/.exec(cls);
    if (m) lang = m[1];
  } catch {
    /* 无子节点时忽略 */
  }

  const copy = async () => {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时忽略 */
    }
  };

  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{lang}</span>
        <button type="button" className="code-copy" onClick={copy}>
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}

const components: Components = {
  a(props) {
    const { node, ...rest } = props as {
      node?: unknown;
      href?: string;
      children?: ReactNode;
    };
    return (
      <a {...rest} target="_blank" rel="noreferrer">
        {rest.children}
      </a>
    );
  },
  pre(props) {
    const { node, children, ...rest } = props as {
      node?: unknown;
      children?: ReactNode;
    };
    return <CodeBlock {...rest}>{children}</CodeBlock>;
  },
};

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { readFile } from "fs/promises";
import path from "path";
import { getSiteConfig } from "@/lib/site-config";
import Markdown from "@/lib/markdown";

export default async function AboutPage() {
  const [cfg, raw] = await Promise.all([
    getSiteConfig(),
    readFile(path.join(process.cwd(), "content", "about.md"), "utf-8"),
  ]);

  return (
    <div className="about-card">
      <div className="about-top">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            margin: "0 0 4px",
          }}
        >
          站长介绍
        </h1>
      </div>
      <Markdown content={raw} />
    </div>
  );
}

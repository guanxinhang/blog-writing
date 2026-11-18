import { readFile } from "fs/promises";
import path from "path";

export type NavItem = { label: string; href: string };
export type SocialItem = { label: string; href: string };

export type SiteConfig = {
  title: string;
  subtitle: string;
  tagline: string;
  author: string;
  avatar: string;
  description: string;
  nav: NavItem[];
  social: SocialItem[];
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const raw = await readFile(
    path.join(process.cwd(), "content", "config.json"),
    "utf-8",
  );
  return JSON.parse(raw) as SiteConfig;
}

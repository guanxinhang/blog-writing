import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import DynamicWallpaper from "@/components/DynamicWallpaper";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import "katex/dist/katex.min.css";

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getSiteConfig();
  return {
    title: { default: cfg.title, template: `%s · ${cfg.title}` },
    description: cfg.description,
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cfg = await getSiteConfig();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700&family=JetBrains+Mono:wght@400;600&family=Ma+Shan+Zheng&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var th=localStorage.getItem('theme');if(th!=='dark'&&th!=='light'){th='dark';}document.documentElement.setAttribute('data-theme',th);var h=new Date().getHours(),p='day';if(h>=5&&h<7)p='dawn';else if(h>=7&&h<10)p='morning';else if(h>=10&&h<16)p='day';else if(h>=16&&h<19)p='dusk';else p='night';document.documentElement.setAttribute('data-time',p);}catch(e){}",
          }}
        />
      </head>
      <body>
        <DynamicWallpaper />
        <SiteHeader
          title={cfg.title}
          subtitle={cfg.subtitle}
          nav={cfg.nav}
          userEmail={user?.email ?? null}
        />
        <main className="site-main">{children}</main>
        <Footer title={cfg.title} author={cfg.author} />
      </body>
    </html>
  );
}

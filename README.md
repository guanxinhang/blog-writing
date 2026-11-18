# 樱花小筑 ✦ 二次元学术博客

一个粉彩二次元风格的学术博客，支持 **Markdown、LaTeX 公式、代码高亮**，部署在 **Vercel**，并自带**在线编辑器**——打开链接登录 GitHub 即可在线写博客，文章自动保存并同步到 GitHub 仓库。

## ✨ 功能特性

- 🎀 粉彩可爱系二次元主题，含深色模式
- 📝 Markdown + GFM（表格、脚注、任务列表）
- 📐 LaTeX 公式（KaTeX，行内 `$...$` 与块级 `$$...$$`）
- 💻 代码高亮 + 一键复制
- 🏷️ 标签 / 分类、文章列表与详情、关于我
- ✍️ 在线编辑器：分屏写作、实时预览、草稿自动保存
- 🔐 GitHub OAuth 登录，文章保存为仓库里的 Markdown 文件
- 🚀 Vercel 部署，保存后自动重新构建

## 📁 目录结构

```
anime-blog/
├── app/                # 页面与 API
│   ├── page.tsx        # 首页
│   ├── posts/[slug]/   # 文章详情
│   ├── tags/           # 标签
│   ├── about/          # 关于我
│   ├── editor/         # 在线编辑器
│   └── api/            # GitHub OAuth 与文章读写接口
├── components/         # UI 组件
├── content/            # 站点内容（同步到 GitHub）
│   ├── config.json     # 站点配置（标题/导航/社交）
│   ├── about.md        # 关于我
│   └── posts/*.md      # 文章
├── lib/                # 工具函数
└── public/             # 静态资源
```

## 🛠️ 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（见下方）
cp .env.local.example .env.local

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可看到博客。

> 本地开发时，**无需**配置 GitHub 也能在编辑器里写文章（自动读写本地 `content/posts/` 目录，保存后刷新首页即可看到）。

## 🔒 网站私密化（访问密码，可选）

只想自己用时，给网站加一个访问密码，任何人访问任何页面都要先输密码：

1. 在 `.env.local` 中设置（或复制 `.env.local.example` 后填入）：

```env
SITE_PASSWORD=你的访问密码
```

2. 重启 `npm run dev`。

3. 此后访问任何页面都会跳转到 `/login` 输入密码；密码正确后，浏览器会保存登录状态（一年内免密）。

> - **不设置 `SITE_PASSWORD` 时，网站完全公开**，不受任何影响。
> - 部署到 Vercel 时，把 `SITE_PASSWORD` 也加到 Vercel 的环境变量里即可。

## 🔑 配置 GitHub OAuth（让在线编辑器能保存到 GitHub）

1. 打开 GitHub → 右上角头像 → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**。
2. 填写：
   - **Application name**：随便起，例如 `樱花小筑`
   - **Homepage URL**：`http://localhost:3000`（生产环境填你的 Vercel 域名）
   - **Authorization callback URL**：`http://localhost:3000/api/auth/callback`（生产填 `https://你的域名/api/auth/callback`）
3. 创建后拿到 **Client ID**，再点 **Generate a new client secret** 拿到 **Client Secret**。
4. 打开 `.env.local`，填入：

```env
GITHUB_CLIENT_ID=你的ClientID
GITHUB_CLIENT_SECRET=你的ClientSecret
GITHUB_REPO=你的用户名/anime-blog
GITHUB_BRANCH=main
```

5. 重启 `npm run dev`，打开 http://localhost:3000/editor → 登录 GitHub → 即可在线写博客。

> ⚠️ **安全说明**：OAuth 的 `repo` 权限会授权该应用访问你账号下的**所有仓库**。个人自用博客通常可接受；如想更严格地只授权单个仓库，可改用 GitHub App（细粒度权限）。

## 🌐 部署到 Vercel

1. 把本项目推送到一个 **GitHub 仓库**（内容文件都在 `content/` 里，会一并同步）。

```bash
git init
git add .
git commit -m "init: 樱花小筑博客"
git branch -M main
git remote add origin https://github.com/你的用户名/anime-blog.git
git push -u origin main
```

2. 打开 [vercel.com](https://vercel.com) → **Add New Project** → 导入该仓库。
3. 在 **Environment Variables** 里添加：

| Key | Value |
| --- | --- |
| `GITHUB_CLIENT_ID` | 你的 Client ID |
| `GITHUB_CLIENT_SECRET` | 你的 Client Secret |
| `GITHUB_REPO` | `你的用户名/anime-blog` |
| `GITHUB_BRANCH` | `main` |
| `SITE_URL` | `https://你的vercel域名` |

4. 点击 **Deploy**，完成后即可访问。

5. 部署后，回到 GitHub OAuth App 设置，把 **Homepage URL** 和 **Callback URL** 改成你的 Vercel 域名，并重新保存。

## ✍️ 写博客流程

1. 打开你的博客网址 → 点击导航栏「写博客」。
2. 用 GitHub 登录。
3. 左侧「＋ 新建文章」，填写标题、日期、分类、标签、摘要，正文写 Markdown。
4. 右侧实时预览，支持公式、代码、表格。
5. 草稿会自动保存到浏览器本地，关掉页面也不丢。
6. 点「保存 / 发布」→ 文章提交到 GitHub → Vercel 自动重新部署 → 博客更新。

## 🎨 自定义

- **站点标题 / 副标题 / 导航 / 社交链接**：改 `content/config.json`
- **头像**：替换 `public/avatar.svg`
- **关于我**：改 `content/about.md`
- **主题配色**：改 `app/globals.css` 顶部的 CSS 变量（`--primary` 等）
- **字体**：`app/layout.tsx` 里的 Google Fonts 链接（中国大陆访问慢可换成 `fonts.loli.net` 等镜像）
- **更多代码高亮语言**：在 `lib/markdown.tsx` 中注册 highlight.js 语言

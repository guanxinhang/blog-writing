import { NextResponse, type NextRequest } from "next/server";

// 无需登录即可访问的页面
const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // 轻量检查：是否存在 Supabase 认证 cookie
  // 不在这里调用 Supabase 客户端，避免 Edge Runtime 的动态代码生成限制
  const hasAuth = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  // 未登录访问受保护页面 → 跳登录页
  if (!hasAuth && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 已登录访问登录/注册页 → 回首页
  if (hasAuth && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 排除静态资源与 API 路由（API 内部自行鉴权）
  matcher: [
    "/((?!_next/static|_next/image|favicon.svg|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

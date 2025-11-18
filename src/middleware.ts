import { NextResponse, NextRequest } from "next/server";

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refreshToken";

const DEFAULT_AFTER_LOGIN_PATH = process.env.NEXT_PUBLIC_POST_LOGIN_PATH || "/dashboard/sections";

const AUTH_PAGES = new Set<string>(["/", "/login", "/signup", "/forgot-password", "/reset-password"]);

const PROTECTED_PREFIXES = ["/dashboard", "/studio", "/user-admin"] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isSafeInternalPath(path: string | null): path is string {
  if (!path) return false;

  if (!path.startsWith("/")) return false;

  if (path.startsWith("//")) return false;
  return true;
}

// --- Middleware -----------------------------------------------------------
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const clonedUrl = request.nextUrl.clone();
  const hasRefreshCookie = Boolean(request.cookies.get(REFRESH_COOKIE_NAME)?.value);

  if (AUTH_PAGES.has(pathname) && hasRefreshCookie) {
    const nextParam = searchParams.get("next");
    const destination = isSafeInternalPath(nextParam) ? nextParam : DEFAULT_AFTER_LOGIN_PATH;
    clonedUrl.pathname = destination;
    clonedUrl.search = ""; // ensure clean URL
    return NextResponse.redirect(clonedUrl);
  }

  if (isProtectedPath(pathname) && !hasRefreshCookie) {
    clonedUrl.pathname = "/";
    const originalFullPath = pathname + (request.nextUrl.search || "");
    clonedUrl.searchParams.set("next", originalFullPath);
    return NextResponse.redirect(clonedUrl);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/studio/:path*",
    "/user-admin/:path*",
    "/dashboard/:path*",
  ],
};

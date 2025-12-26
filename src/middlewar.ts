import { NextResponse, NextRequest } from "next/server";

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refreshToken";
const DEFAULT_REDIRECT = "/dashboard/preview";

const AUTH_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
const PROTECTED_ROUTES = ["/dashboard", "/studio", "/user-admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has(REFRESH_COOKIE_NAME);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    const next = request.nextUrl.searchParams.get("next");
    // Basic open redirect protection
    const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_REDIRECT;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
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

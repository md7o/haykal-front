import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type GuardStatus = "admin" | "forbidden" | "unauthenticated";

async function verifyAdminRole(accessToken: string): Promise<GuardStatus> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return "unauthenticated";

  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (response.status === 401) return "unauthenticated";
    if (!response.ok) return "forbidden";

    const user = (await response.json()) as { role?: string };
    return user.role === "Admin" ? "admin" : "forbidden";
  } catch {
    return "unauthenticated";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const status = await verifyAdminRole(accessToken);
    if (status === "unauthenticated") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (status !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

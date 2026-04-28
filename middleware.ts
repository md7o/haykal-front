import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type GuardStatus = "admin" | "forbidden" | "unauthenticated";

const isAdminRole = (role?: string) => role?.toLowerCase() === "admin";

async function getAccessTokenForRequest(request: NextRequest): Promise<string | null> {
  const existingAccessToken = request.cookies.get("access_token")?.value;
  if (existingAccessToken) return existingAccessToken;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });

    if (!refreshResponse.ok) return null;

    const refreshPayload = (await refreshResponse.json()) as { accessToken?: string };
    return refreshPayload.accessToken ?? null;
  } catch {
    return null;
  }
}

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
    return isAdminRole(user.role) ? "admin" : "forbidden";
  } catch {
    return "unauthenticated";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const accessToken = await getAccessTokenForRequest(request);

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

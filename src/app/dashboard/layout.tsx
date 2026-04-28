import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Layout from "@/components/pages/dashboard/Layout";

const isAdminRole = (role?: string) => role?.toLowerCase() === "admin";

const refreshAccessTokenFromCookies = async (cookieHeader: string, apiUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as { accessToken?: string };
    return payload.accessToken ?? null;
  } catch {
    return null;
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  let token: string | null = cookieStore.get("access_token")?.value ?? null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    redirect("/login?redirect=/dashboard");
  }

  if (!token && cookieHeader) {
    token = await refreshAccessTokenFromCookies(cookieHeader, apiUrl);
  }

  if (!token) {
    redirect("/login?redirect=/dashboard");
  }

  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      redirect("/");
    }

    if (!response.ok) {
      redirect("/");
    }

    const user = (await response.json()) as { role?: string };
    if (!isAdminRole(user.role)) {
      redirect("/");
    }
  } catch {
    redirect("/");
  }

  return <Layout>{children}</Layout>;
}

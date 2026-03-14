import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Layout from "@/components/pages/dashboard/Layout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!token || !apiUrl) {
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
    if (user.role !== "Admin") {
      redirect("/");
    }
  } catch {
    redirect("/");
  }

  return <Layout>{children}</Layout>;
}

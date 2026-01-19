"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ensureAuthSession } from "@/api/api";
import { useAuthStore, waitForAuthHydration } from "@/store/authStore";

type AuthGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
};

export function AuthGuard({ children, fallback = null, redirectTo = "/login" }: AuthGuardProps) {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore((state) => ({ user: state.user, hasHydrated: state.hasHydrated }));
  const [checking, setChecking] = useState(!hasHydrated);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      await waitForAuthHydration();

      if (useAuthStore.getState().user) {
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        await ensureAuthSession();
        if (!useAuthStore.getState().user && !cancelled) router.replace(redirectTo);
      } catch {
        if (!cancelled) router.replace(redirectTo);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    if (!hasHydrated || !user) {
      void verify();
    } else {
      setChecking(false);
    }

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, redirectTo, router, user]);

  if (checking || !hasHydrated) return <>{fallback}</>;
  if (!user) return null;

  return <>{children}</>;
}

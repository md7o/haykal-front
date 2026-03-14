"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * Simple component that initializes auth on mount
 * No Context needed - just triggers the Zustand action
 */
export const AuthInitializer = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  // Keep a token cookie in sync so server-side guards can verify role via /auth/me
  useEffect(() => {
    if (accessToken) {
      document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }

    // Remove legacy role cookie so authorization never relies on a client-editable role value.
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }, [accessToken]);

  return null;
};

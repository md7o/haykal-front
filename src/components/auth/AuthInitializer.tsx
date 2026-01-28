"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Simple component that initializes auth on mount
 * No Context needed - just triggers the Zustand action
 */
export const AuthInitializer = () => {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      useAuthStore.getState().initializeAuth();
    }
  }, [hasHydrated]);

  return null; // Renders nothing
};

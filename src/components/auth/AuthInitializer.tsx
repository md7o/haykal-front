"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * Initializes auth state on mount by triggering the Zustand action.
 * Auth tokens must be managed via HttpOnly cookies set by the server — never written client-side.
 */
export const AuthInitializer = () => {
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  return null;
};

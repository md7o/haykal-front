"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * Simple component that initializes auth on mount
 * No Context needed - just triggers the Zustand action
 */
export const AuthInitializer = () => {
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  return null; // Renders nothing
};

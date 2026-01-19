"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { checkAuthStatus, logout as logoutRequest } from "@/api/auth/auth-endpoints";
import { useAuthStore, waitForAuthHydration } from "@/store/authStore";
import type { AuthUser } from "@/types/auth";

interface AuthContextType {
  isLogged: boolean | null;
  user: AuthUser | null;
  isCheckingAuth: boolean;
  logoutUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const storeUser = useAuthStore((state) => state.user);
  const storeToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logoutStore = useAuthStore((state) => state.logout);

  const [isLogged, setIsLogged] = useState<boolean | null>(hasHydrated ? !!storeToken : null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(!hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    setIsLogged(storeToken ? true : false);
    setIsCheckingAuth(false);
  }, [hasHydrated, storeToken]);

  const checkAuth = useCallback(async () => {
    await waitForAuthHydration();
    setIsCheckingAuth(true);
    try {
      const { isAuthenticated } = await checkAuthStatus();
      setIsLogged(isAuthenticated || !!useAuthStore.getState().accessToken);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (isLogged === null) void checkAuth();
  }, [checkAuth, hasHydrated, isLogged]);

  const logoutUser = async () => {
    try {
      await logoutRequest();
    } finally {
      logoutStore();
      setIsLogged(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLogged, user: storeUser, isCheckingAuth, logoutUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

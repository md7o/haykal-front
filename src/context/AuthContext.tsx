"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { checkAuthStatus, logout } from "@/api/auth/auth-endpoints";
import type { AuthUser } from "@/types/auth";

interface AuthContextType {
  isLogged: boolean | null;
  user: AuthUser | null;
  isCheckingAuth: boolean;
  logoutUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean | null>>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const checkAuth = async () => {
    setIsCheckingAuth(true);
    try {
      const { isAuthenticated, user: userData } = await checkAuthStatus();
      setIsLogged(isAuthenticated);
      setUser((userData as AuthUser) || null);
    } catch {
      setIsLogged(false);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const logoutUser = async () => {
    await logout();
    setIsLogged(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLogged, user, isCheckingAuth, logoutUser, checkAuth, setIsLogged, setUser }}>
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

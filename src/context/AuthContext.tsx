"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { checkAuthStatus, logout } from "@/api/auth-endpoints";
import type { AuthUser } from "@/types/auth";

interface AuthContextType {
  isLogged: boolean | null;
  user: AuthUser | null;
  isCheckingAuth: boolean;
  logoutUser: () => Promise<void>;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean | null>>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;
    const checkAuthentication = async () => {
      try {
        const { isAuthenticated, user: userData } = await checkAuthStatus();
        if (active) {
          setIsLogged(isAuthenticated);
          setUser((userData as AuthUser) || null);
        }
      } catch {
        if (active) {
          setIsLogged(false);
          setUser(null);
        }
      } finally {
        if (active) {
          setIsCheckingAuth(false);
        }
      }
    };
    checkAuthentication();
    return () => {
      active = false;
    };
  }, []);

  const logoutUser = async () => {
    await logout();
    setIsLogged(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLogged, user, isCheckingAuth, logoutUser, setIsLogged, setUser }}>
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

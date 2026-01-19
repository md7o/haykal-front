"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { userType, getUserById } from "@/api/user/user-endpoints";
import { useAuth } from "@/context/AuthContext";

interface UserContextType {
  currentUser: userType | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  getUserInfo: (userId: string) => Promise<userType>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isLogged, isCheckingAuth, checkAuth } = useAuth();
  const [currentUser, setCurrentUser] = useState<userType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    setError(null);
    await checkAuth();
  };

  const getUserInfo = async (userId: string): Promise<userType> => {
    try {
      return await getUserById(userId);
    } catch (err) {
      console.error(`Failed to fetch user ${userId}:`, err);
      throw err;
    }
  };

  // Mirror auth context user to avoid duplicate /auth/me requests.
  useEffect(() => {
    if (isLogged === false) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    if (user) {
      setCurrentUser(user as unknown as userType);
      setIsLoading(false);
      return;
    }

    // On first load / hard refresh, AuthProvider will fetch.
    setIsLoading(isCheckingAuth);
  }, [user, isLogged, isCheckingAuth]);

  return (
    <UserContext.Provider value={{ currentUser, isLoading, error, refreshUser, getUserInfo }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}

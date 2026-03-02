"use client";

import { createContext, useContext } from "react";
import { getUserById } from "@/lib/api/user-api/user-endpoints";
import { userType } from "@/lib/api/user-api/user-endpoints";
import { useAuthStore } from "@/lib/store/authStore";

interface UserContextType {
  currentUser: userType | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  getUserInfo: (userId: string) => Promise<userType>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  const refreshUser = async () => {
    if (user?.userId) {
      await getUserById(user.userId);
    }
  };

  const getUserInfo = (userId: string) => getUserById(userId);

  return (
    <UserContext.Provider value={{ currentUser: user as unknown as userType | null, isLoading, refreshUser, getUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}

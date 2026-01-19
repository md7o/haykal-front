import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  accessTokenExpiry: number | null;
  hasHydrated: boolean;
  setAuth: (user: AuthUser | null, token: string | null, expiry: number | null) => void;
  logout: () => void;
  markHydrated: () => void;
};

const memoryStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => undefined,
  removeItem: (_key: string) => undefined,
};

const storage = createJSONStorage(() => (typeof window !== "undefined" ? localStorage : memoryStorage));

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      accessTokenExpiry: null,
      hasHydrated: typeof window === "undefined",
      setAuth: (user, token, expiry) => set({ user, accessToken: token, accessTokenExpiry: expiry ?? null }),
      logout: () => set({ user: null, accessToken: null, accessTokenExpiry: null }),
      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "auth-store",
      storage,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        accessTokenExpiry: state.accessTokenExpiry,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);

export const waitForAuthHydration = () => {
  if (useAuthStore.getState().hasHydrated) return Promise.resolve();
  if (useAuthStore.persist?.hasHydrated?.()) {
    useAuthStore.getState().markHydrated();
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    const unsub = useAuthStore.persist?.onFinishHydration(() => {
      useAuthStore.getState().markHydrated();
      unsub?.();
      resolve();
    });
  });
};

export const getAccessTokenTimeLeft = () => {
  const { accessTokenExpiry } = useAuthStore.getState();
  return accessTokenExpiry ? Math.max(0, accessTokenExpiry - Date.now()) : null;
};

export const hasValidAccessToken = (minTimeLeftMs = 30_000) => {
  const { accessToken } = useAuthStore.getState();
  const timeLeft = getAccessTokenTimeLeft();
  return !!accessToken && timeLeft !== null && timeLeft > minTimeLeftMs;
};

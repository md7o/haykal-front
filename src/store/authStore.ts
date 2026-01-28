import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";
import { checkAuthStatus, refreshAccessToken, logout as logoutRequest } from "@/api/auth/auth-endpoints";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  accessTokenExpiry: number | null;
  hasHydrated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setAuth: (user: AuthUser, token: string, expiry: number) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

let refreshSchedulerId: NodeJS.Timeout | null = null;

export const getTokenTimeLeft = (buffer = 0): number | null => {
  const { accessTokenExpiry } = useAuthStore.getState();
  return accessTokenExpiry ? Math.max(0, accessTokenExpiry - Date.now() - buffer) : null;
};

export const isTokenValid = (bufferMs = 30_000): boolean => {
  const timeLeft = getTokenTimeLeft();
  return timeLeft !== null && timeLeft > bufferMs;
};

const scheduleTokenRefresh = () => {
  if (refreshSchedulerId) clearTimeout(refreshSchedulerId);
  const timeLeft = getTokenTimeLeft(20_000);
  if (!timeLeft || timeLeft <= 0) return;

  refreshSchedulerId = setTimeout(async () => {
    try {
      const { accessToken, accessTokenExpiry } = await refreshAccessToken();
      const { user } = useAuthStore.getState();
      if (user) {
        useAuthStore.getState().setAuth(user, accessToken, accessTokenExpiry);
        scheduleTokenRefresh();
      }
    } catch {
      useAuthStore.getState().logout();
    }
  }, timeLeft);
};

const cancelScheduledRefresh = () => {
  if (refreshSchedulerId) {
    clearTimeout(refreshSchedulerId);
    refreshSchedulerId = null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      accessTokenExpiry: null,
      hasHydrated: false,
      isLoading: false,
      isInitialized: false,

      setAuth: (user, token, expiry) => {
        set({ user, accessToken: token, accessTokenExpiry: expiry, hasHydrated: true });
        scheduleTokenRefresh();
      },

      setUser: (user) => set({ user, hasHydrated: true }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        cancelScheduledRefresh();
        set({ user: null, accessToken: null, accessTokenExpiry: null, hasHydrated: true });
      },

      initializeAuth: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });

        try {
          const { accessToken, accessTokenExpiry } = await refreshAccessToken();
          const currentUser = get().user;
          if (currentUser) {
            set({ accessToken, accessTokenExpiry });
          }

          const { isAuthenticated, user: backendUser } = await checkAuthStatus();
          if (isAuthenticated && backendUser) {
            set({ user: backendUser });
            scheduleTokenRefresh();
            set({ isLoading: false, isInitialized: true });
          } else {
            get().logout();
            set({ isLoading: false, isInitialized: true });
          }
        } catch (error) {
          get().logout();
          set({ isLoading: false, isInitialized: true });
        }
      },

      logoutUser: async () => {
        try {
          await logoutRequest();
        } finally {
          get().logout();
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);

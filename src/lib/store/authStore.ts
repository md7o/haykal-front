import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/lib/types/auth";
import { checkAuthStatus, refreshAccessToken, logout } from "@/lib/api/auth-api/auth-endpoints";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  accessTokenExpiry: number | null;
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
      isLoading: false,
      isInitialized: false,

      setAuth: (user, token, expiry) => {
        set({ user, accessToken: token, accessTokenExpiry: expiry });
        scheduleTokenRefresh();
      },

      setUser: (user) => set({ user }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        cancelScheduledRefresh();
        set({ user: null, accessToken: null, accessTokenExpiry: null });
      },

      initializeAuth: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });

        try {
          const currentState = get();
          const currentUser = currentState.user;
          const currentToken = currentState.accessToken;

          // If we have a token from rehydration
          if (currentToken && currentUser) {
            // Check viability of the token
            const isValid = isTokenValid();

            if (isValid) {
              // Refresh user data to populate role and other fields
              try {
                const { isAuthenticated, user: backendUser } = await checkAuthStatus();
                if (isAuthenticated && backendUser) {
                  set({ user: backendUser });
                }
              } catch {
                // Continue with persisted user if refresh fails
              }
              scheduleTokenRefresh();
              set({ isLoading: false, isInitialized: true });
              return;
            }

            // Token expired, try to refresh immediately
            try {
              const { accessToken, accessTokenExpiry } = await refreshAccessToken();
              set({ accessToken, accessTokenExpiry });
              // Refresh user data after token refresh
              try {
                const { isAuthenticated, user: backendUser } = await checkAuthStatus();
                if (isAuthenticated && backendUser) {
                  set({ user: backendUser });
                }
              } catch {
                // Continue with current user if refresh fails
              }
              scheduleTokenRefresh();
              set({ isLoading: false, isInitialized: true });
              return;
            } catch {
              // Refresh failed, continue to fallback
            }
          }

          // Only refresh if we have a user but no token
          if (currentUser && !currentToken) {
            try {
              const { accessToken, accessTokenExpiry } = await refreshAccessToken();
              set({ accessToken, accessTokenExpiry });
              // Refresh user data after token refresh
              try {
                const { isAuthenticated, user: backendUser } = await checkAuthStatus();
                if (isAuthenticated && backendUser) {
                  set({ user: backendUser });
                }
              } catch {
                // Continue with current user if refresh fails
              }
              scheduleTokenRefresh();
              set({ isLoading: false, isInitialized: true });
              return;
            } catch {
              // Refresh failed, clear auth
              get().logout();
              set({ isLoading: false, isInitialized: true });
              return;
            }
          }

          // No user or token - try to verify auth status
          const { isAuthenticated, user: backendUser } = await checkAuthStatus();
          if (isAuthenticated && backendUser) {
            set({ user: backendUser });
            scheduleTokenRefresh();
          }
          set({ isLoading: false, isInitialized: true });
        } catch (error) {
          get().logout();
          set({ isLoading: false, isInitialized: true });
        }
      },

      logoutUser: async () => {
        try {
          await logout();
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
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, accessTokenExpiry: state.accessTokenExpiry }),
      onRehydrateStorage: () => () => {
        // Hydration complete - let initializeAuth handle auth state validation
      },
    },
  ),
);

export const useCurrentUser = () => useAuthStore((s) => s.user);

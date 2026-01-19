import axios from "axios";
import type { AuthUser } from "@/types/auth";
import { api, ensureAuthSession } from "@/api/api";
import {
  getAccessTokenTimeLeft as getAccessTokenTimeLeftFromStore,
  hasValidAccessToken,
  useAuthStore,
  waitForAuthHydration,
} from "@/store/authStore";

const msg = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }
  return fallback;
};

const errorWithStatus = (err: unknown, fallback: string) => {
  const e = new Error(msg(err, fallback)) as Error & { status?: number };
  if (axios.isAxiosError(err) && err.response?.status) e.status = err.response.status;
  return e;
};

export async function me() {
  await waitForAuthHydration();
  const storedUser = useAuthStore.getState().user;
  if (storedUser) return storedUser;

  const { user } = await ensureAuthSession({ forceRefresh: true });
  if (!user) throw new Error("Not authenticated");
  return user;
}

export const getUserData = me;

export async function refresh() {
  const { accessToken } = await ensureAuthSession({ forceRefresh: true });
  return accessToken;
}

export async function requestSignup(input: { username: string; email: string; password: string }) {
  try {
    const { data } = await api.post(`/auth/request-signup`, input);
    return data;
  } catch (error: unknown) {
    throw new Error(msg(error, "Signup request failed"));
  }
}

export async function verifySignup(email: string, code: string) {
  try {
    const { data } = await api.post(`/auth/verify-signup`, { email, code });
    return data;
  } catch {
    throw new Error("Verification failed");
  }
}

export async function signIn(input: { email: string; password: string }) {
  try {
    const { data } = await api.post(`/auth/signin`, input);
    console.log("[signIn] Response data:", {
      hasUser: !!data.user,
      hasToken: !!data.accessToken,
      user: data.user,
    });

    useAuthStore.getState().setAuth(data.user ?? null, data.accessToken ?? null, data.accessTokenExpiry ?? null);

    console.log("[signIn] Auth store after setAuth:", useAuthStore.getState());

    // If user object is incomplete or missing, fetch it via /auth/me
    if (!data.user || !data.user.username) {
      console.log("[signIn] User incomplete, fetching via /auth/me");
      try {
        const { data: meData } = await api.get(`/auth/me`);
        console.log("[signIn] /auth/me response:", meData);
        useAuthStore.getState().setAuth(meData, data.accessToken ?? null, data.accessTokenExpiry ?? null);
        console.log("[signIn] Auth store after /auth/me:", useAuthStore.getState());
      } catch (err) {
        console.warn("Could not fetch full user data after signin:", err);
      }
    }

    return data;
  } catch (error: unknown) {
    throw new Error(msg(error, "Signin failed"));
  }
}

export async function logout(userId?: string) {
  try {
    const { data } = await api.post(`/auth/logout`, { userId });
    useAuthStore.getState().logout();
    return data;
  } catch (error) {
    useAuthStore.getState().logout();
    throw new Error(msg(error, "Logout failed"));
  }
}

export async function forgotPassword(email: string) {
  try {
    const { data } = await api.post(`/auth/forgot-password-code`, { email });
    return data;
  } catch (error: unknown) {
    throw errorWithStatus(error, "Failed to send reset code");
  }
}

export async function resetPassword(email: string, code: string, password: string, confirmPassword: string) {
  try {
    const { data } = await api.post(`/auth/reset-password`, {
      email,
      code,
      password,
      confirmPassword,
    });
    return data;
  } catch (error) {
    throw errorWithStatus(error, "Failed to reset password");
  }
}

export async function checkAuthStatus() {
  try {
    await waitForAuthHydration();
    if (useAuthStore.getState().user && hasValidAccessToken()) {
      return { isAuthenticated: true, user: useAuthStore.getState().user as AuthUser } as const;
    }

    const { user } = await ensureAuthSession({ forceRefresh: !useAuthStore.getState().accessToken });
    if (user && hasValidAccessToken(0)) return { isAuthenticated: true, user } as const;
    return { isAuthenticated: false } as const;
  } catch {
    useAuthStore.getState().logout();
    return { isAuthenticated: false } as const;
  }
}

export function getAccessTokenTimeLeft(): number | null {
  return getAccessTokenTimeLeftFromStore();
}

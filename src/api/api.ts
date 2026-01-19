import axios, { type AxiosRequestConfig } from "axios";
import type { AuthUser } from "@/types/auth";
import { getAccessTokenTimeLeft, hasValidAccessToken, useAuthStore, waitForAuthHydration } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_PATH = "/auth/refresh";
const MIN_TIME_LEFT_MS = 30_000;

export const api = axios.create({ baseURL: API_URL, withCredentials: true });

let refreshPromise: Promise<string | null> | null = null;

const isRefreshCall = (url?: string | null) => (url || "").includes(REFRESH_PATH);

const attachToken = (config: AxiosRequestConfig, token: string) => {
  config.headers = config.headers ?? {};
  (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
};

const setAuthFromPayload = (payload: {
  user?: AuthUser | null;
  accessToken?: string | null;
  accessTokenExpiry?: number | null;
}) => {
  const { user = null, accessToken = null, accessTokenExpiry = null } = payload || {};
  useAuthStore.getState().setAuth(user, accessToken, accessTokenExpiry);
};

async function refreshSession(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { data } = await api.post(REFRESH_PATH, {});
      setAuthFromPayload(data || {});
      return data?.accessToken ?? null;
    } catch (error) {
      useAuthStore.getState().logout();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function ensureAuthSession(options: { forceRefresh?: boolean } = {}) {
  const { forceRefresh = false } = options;
  await waitForAuthHydration();

  const timeLeft = getAccessTokenTimeLeft();
  if (!forceRefresh && hasValidAccessToken(MIN_TIME_LEFT_MS)) {
    const state = useAuthStore.getState();
    return {
      accessToken: state.accessToken,
      accessTokenExpiry: state.accessTokenExpiry,
      user: state.user,
      timeLeft,
    } as const;
  }

  const token = await refreshSession();
  const state = useAuthStore.getState();
  return {
    accessToken: token ?? state.accessToken,
    accessTokenExpiry: state.accessTokenExpiry,
    user: state.user,
    timeLeft: getAccessTokenTimeLeft(),
  } as const;
}

api.interceptors.request.use(async (config) => {
  if (isRefreshCall(config.url)) return config;

  await waitForAuthHydration();
  const state = useAuthStore.getState();
  const timeLeft = getAccessTokenTimeLeft();

  if (state.accessToken && timeLeft !== null && timeLeft > MIN_TIME_LEFT_MS) {
    attachToken(config, state.accessToken);
    return config;
  }

  try {
    const token = await refreshSession();
    const finalToken = token ?? useAuthStore.getState().accessToken;
    if (finalToken) attachToken(config, finalToken);
  } catch {
    useAuthStore.getState().logout();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

import axios, { AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_PATH = "/auth/refresh";

export const api = axios.create({ baseURL: API_URL, withCredentials: true });

let accessToken: string | null = null;
let accessTokenExpiry: number | null = null; // epoch ms
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingRefresh: Promise<string | null> | null = null;
const failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

// ---------- tiny helpers ----------
const isExpired = () => !!accessToken && !!accessTokenExpiry && Date.now() >= accessTokenExpiry!;

const persist = (_token: string | null, _exp: number | null) => {};

const scheduleRefresh = () => {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  if (!accessTokenExpiry) return;
  const delay = Math.max(0, accessTokenExpiry - Date.now() + 500);
  refreshTimeout = setTimeout(() => {
    if (!isExpired()) return;
    refreshSession().catch(() => {});
  }, delay);
};
const setToken = (token: string | null, exp: number | null) => {
  accessToken = token;
  accessTokenExpiry = exp;
  scheduleRefresh();
  persist(accessToken, accessTokenExpiry);
};
const clearToken = () => {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  refreshTimeout = null;
  setToken(null, null);
};
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

// ---------- refresh flow ----------
function processQueue(error: unknown | null, token: string | null = null) {
  failedQueue.splice(0).forEach(({ resolve, reject, config }) => {
    if (error) return reject(error);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    resolve(api(config));
  });
}

async function refreshSession(): Promise<string | null> {
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = (async () => {
    try {
      const { data } = await api.post(REFRESH_PATH, {});
      setToken(data.accessToken || null, data.accessTokenExpiry ?? null);
      return accessToken;
    } catch (err) {
      clearToken();
      throw err;
    } finally {
      pendingRefresh = null;
    }
  })();
  return pendingRefresh;
}

// ---------- interceptors ----------
api.interceptors.request.use(async (config) => {
  const isRefreshCall = (config.url || "").toString().includes(REFRESH_PATH);

  // If a refresh is pending, wait for it.
  // Or if we have a token but it's expired, trigger a refresh.
  if (!isRefreshCall) {
    if (pendingRefresh) {
      try {
        await pendingRefresh;
      } catch {}
    } else if (accessToken && isExpired()) {
      try {
        await refreshSession();
      } catch {}
    }
  }

  if (accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = (error?.config || {}) as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const isRefreshCall = (original?.url || "").includes(REFRESH_PATH);

    // On 401, try to refresh the token (unless it's already a retry or the refresh call itself).
    // We do NOT check for isExpired() here, because we might have no token in memory
    // (e.g. after reload) but a valid httpOnly cookie exists.
    if (error?.response?.status === 401 && !original._retry && !isRefreshCall) {
      original._retry = true;
      return new Promise(async (resolve, reject) => {
        failedQueue.push({ resolve, reject, config: original });
        try {
          processQueue(null, await refreshSession());
        } catch (e) {
          processQueue(e, null);
        }
      });
    }
    return Promise.reject(error);
  }
);

// ---------- API ----------
export async function me() {
  try {
    const { data } = await api.get(`/auth/me`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error?.response?.status === 401) clearToken();
    throw new Error(msg(error, "Not authenticated"));
  }
}

export const getUserData = me;

export async function refresh() {
  return refreshSession();
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
    setToken(data.accessToken || null, data.accessTokenExpiry ?? null);
    return data;
  } catch (error: unknown) {
    throw new Error(msg(error, "Signin failed"));
  }
}

export async function logout(userId?: string) {
  try {
    const { data } = await api.post(`/auth/logout`, { userId });
    clearToken();
    return data;
  } catch {
    clearToken();
    throw new Error("Logout failed");
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
    if (!accessToken) {
      try {
        await refreshSession();
      } catch {}
    }

    if (!accessToken) return { isAuthenticated: false } as const;

    if (isExpired()) await refreshSession();
    const user = await me();
    return { isAuthenticated: true, user } as const;
  } catch {
    clearToken();
    return { isAuthenticated: false } as const;
  }
}

export function getAccessTokenTimeLeft(): number | null {
  return accessTokenExpiry ? Math.max(0, accessTokenExpiry - Date.now()) : null;
}

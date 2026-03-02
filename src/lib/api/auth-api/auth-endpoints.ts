import axios, { type AxiosInstance } from "axios";
import type { AuthUser } from "@/lib/types/auth";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * API Response Types
 */
export interface SignInResponse {
  userId: string;
  email: string;
  username: string;
  role: string;
  accessToken: string;
  accessTokenExpiry: number;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
}

export interface SignUpResponse extends SignInResponse {}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: AuthUser | null;
}

/**
 * Create axios instance with auto token injection and refresh handling
 */
const createAuthApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    if (["/auth/refresh", "/auth/logout", "/auth/signin", "/auth/signup"].some((ep) => config.url?.includes(ep))) {
      return config;
    }
    const { accessToken } = useAuthStore.getState();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      const authEndpoints = ["/auth/refresh", "/auth/logout", "/auth/signin", "/auth/signup"];
      const isAuthEndpoint = authEndpoints.some((ep) => config?.url?.includes(ep));

      if (response?.status === 401 && !config?._retried && !isAuthEndpoint) {
        config._retried = true;
        try {
          const { accessToken, accessTokenExpiry } = await refreshAccessToken();
          const { user } = useAuthStore.getState();
          if (user) useAuthStore.getState().setAuth(user, accessToken, accessTokenExpiry);
          config.headers.Authorization = `Bearer ${accessToken}`;
          return instance(config);
        } catch (err) {
          useAuthStore.getState().logout();
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const api = createAuthApi();

/**
 * Public API instance without authentication for public endpoints
 */
export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const refreshAccessToken = async (): Promise<RefreshResponse> =>
  (await api.post<RefreshResponse>("/auth/refresh", {})).data;

export const signUp = async (email: string, username: string, password: string) => {
  await api.post("/auth/request-signup", { email, username, password });
  return { message: "Verification code sent" };
};

export const verifySignUp = async (email: string, code: string): Promise<SignUpResponse> =>
  (await api.post<SignUpResponse>("/auth/verify-signup", { email, code })).data;

export const signIn = async (email: string, password: string): Promise<SignInResponse> =>
  (await api.post<SignInResponse>("/auth/signin", { email, password })).data;

export const logout = async (): Promise<void> => {
  const { user } = useAuthStore.getState();
  try {
    if (user?.userId) await api.post("/auth/logout", { userId: user.userId });
  } finally {
    useAuthStore.getState().logout();
  }
};

export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    const { userId, username, email } = await api
      .get<{ userId: string; email: string; username: string; role: string }>("/auth/me")
      .then((r) => r.data);
    return { isAuthenticated: true, user: { userId, username, email } };
  } catch {
    return { isAuthenticated: false };
  }
};

export const forgotPassword = async (email: string) => {
  await api.post("/auth/forgot-password-code", { email });
};

export const resetPassword = async (email: string, code: string, password: string, confirmPassword: string) =>
  (await api.post("/auth/reset-password", { email, code, password, confirmPassword })).data;

import axios from "axios";
import { checkStatus, ensureId, toError } from "../api-utils";
import { api } from "../auth-api/auth-endpoints";

export enum UserRole {
  Admin = "Admin",
  User = "User",
}

export interface UserType {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  bannedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isBanned?: boolean;
  bannedReason?: string;
}

const USER_BASE = "/user";

export const getUsers = async (): Promise<UserType[]> => {
  try {
    const res = await api.get<UserType[]>(`${USER_BASE}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getUserById = async (userId: string): Promise<UserType> => {
  ensureId(userId);
  try {
    const res = await api.get<UserType>(`${USER_BASE}/${userId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const createUser = async (dto: CreateUserDto): Promise<UserType> => {
  try {
    const res = await api.post<UserType>(`${USER_BASE}`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updateUser = async (userId: string, data: UpdateUserDto): Promise<UserType> => {
  ensureId(userId);
  try {
    const res = await api.patch<UserType>(`${USER_BASE}/${userId}`, data);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  ensureId(userId);
  try {
    const res = await api.delete<void>(`${USER_BASE}/${userId}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    throw toError(err);
  }
};

export const getCurrentUser = async (): Promise<UserType | null> => {
  try {
    const res = await api.get<UserType>(`${USER_BASE}/me`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    // If 401, return null (not authenticated)
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null;
    }

    // Fallback to /auth/me endpoint if /user/me fails with other errors
    try {
      const res = await api.get<{ userId: string; email: string; username: string; role: string }>("/auth/me");
      return {
        id: res.data.userId,
        username: res.data.username,
        email: res.data.email,
        role: res.data.role as UserRole,
        isBanned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (fallbackErr) {
      if (axios.isAxiosError(fallbackErr) && fallbackErr.response?.status === 401) {
        return null;
      }
      throw toError(fallbackErr);
    }
  }
};

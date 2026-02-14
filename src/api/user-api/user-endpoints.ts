import { api } from "@/api/auth-api/auth-endpoints";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

export enum UserRole {
  Admin = "admin",
  User = "user",
  Moderator = "moderator",
}

export type userType = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  bannedReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
};

export type UpdateUserDto = Partial<Pick<CreateUserDto, "username" | "email">>;

const USER_BASE = "/user";

export const getUsers = async (): Promise<userType[]> => {
  try {
    const res = await api.get<userType[]>(`${USER_BASE}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getUserById = async (userId: string): Promise<userType> => {
  ensureId(userId);
  try {
    const res = await api.get<userType>(`${USER_BASE}/${userId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const createUser = async (dto: CreateUserDto): Promise<userType> => {
  try {
    const res = await api.post<userType>(`${USER_BASE}`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updateUser = async (userId: string, data: UpdateUserDto): Promise<userType> => {
  ensureId(userId);
  try {
    const res = await api.put<userType>(`${USER_BASE}/${userId}`, data);
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

export const getCurrentUser = async (): Promise<userType> => {
  try {
    const res = await api.get<userType>(`${USER_BASE}/me`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const banUser = async (userId: string, reason?: string): Promise<userType> => {
  ensureId(userId);
  try {
    const res = await api.post<userType>(`${USER_BASE}/${userId}/ban`, { reason });
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const unbanUser = async (userId: string): Promise<userType> => {
  ensureId(userId);
  try {
    const res = await api.post<userType>(`${USER_BASE}/${userId}/unban`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

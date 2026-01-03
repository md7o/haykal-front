import axios from "axios";
import { checkStatus, toError } from "../api-utils";
import { api } from "../auth/auth-endpoints";

export type communityDataType = {
  id: string;
  slug: string;
  descreption: string | null;
  createdAt: string;
  updatedAt: string;
  logoUrl: string | null;
  logoTitle: string | null;
};

type CreateCommunityDataDto = {
  slug: string;
};

export const createCommunityData = async (dto: CreateCommunityDataDto): Promise<communityDataType> => {
  try {
    const res = await api.post<communityDataType>(`/community-data`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getCommunityDataById = async (id: string): Promise<communityDataType> => {
  try {
    const res = await api.get<communityDataType>(`/community-data/${id}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAllCommunityData = async (): Promise<communityDataType[]> => {
  try {
    const res = await api.get<communityDataType[]>(`/community-data`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updateCommunityData = async (
  id: string,
  data: { logoUrl?: string | null; logoTitle?: string | null }
): Promise<communityDataType> => {
  try {
    const res = await api.put<communityDataType>(`/community-data/${id}`, data);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteCommunityData = async (id: string): Promise<boolean> => {
  try {
    const res = await api.delete<void>(`/community-data/${id}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return false;
    throw toError(err);
  }
};

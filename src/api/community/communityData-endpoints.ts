import axios from "axios";
import { checkStatus, toError } from "../api-utils";
import { api } from "@/api/auth/auth-endpoints";

export type CommunityType =
  | "educational"
  | "athlete"
  | "gaming"
  | "hobby"
  | "local"
  | "creator"
  | "wellness"
  | "financial"
  | "artistic"
  | "technology"
  | "environmental"
  | "scientific"
  | "social"
  | "culinary"
  | "travel"
  | "entertainment"
  | "other";

export const COMMUNITY_TYPES: CommunityType[] = [
  "educational",
  "athlete",
  "gaming",
  "hobby",
  "local",
  "creator",
  "wellness",
  "financial",
  "artistic",
  "technology",
  "environmental",
  "scientific",
  "social",
  "culinary",
  "travel",
  "entertainment",
  "other",
];

export type communityDataType = {
  id: string;
  slug: string;
  description: string | null;
  type?: CommunityType;
  createdAt: string;
  updatedAt: string;
  logoUrl: string | null;
  logoTitle: string | null;
};

type CreateCommunityDataDto = {
  slug: string;
  description?: string;
  type?: CommunityType;
};

type updateCommunityDataDto = {
  id: string;
  slug?: string;
  description?: string;
  type?: CommunityType;
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

export const getCommunityDataBySlug = async (slug: string): Promise<communityDataType> => {
  try {
    const res = await api.get<communityDataType>(`/community-data/${slug}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updateCommunityData = async (dto: updateCommunityDataDto): Promise<communityDataType> => {
  try {
    const { id, ...updateData } = dto;
    const res = await api.patch<communityDataType>(`/community-data/${id}`, updateData);
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

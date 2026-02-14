import axios from "axios";
import { api, publicApi } from "@/api/auth-api/auth-endpoints";
import { toError, ensureId, checkStatus } from "@/api/api-utils";
import type { Asset, ColorTheme, FontTheme } from "@/types/asset";

const PATH = "/assets";

export type CreateAssetDto = {
  colorTheme?: ColorTheme;
  fontTheme?: FontTheme;
};

export type UpdateAssetDto = {
  colorTheme?: ColorTheme;
  fontTheme?: FontTheme;
};

export const createAsset = async (portfolioId: string, dto: CreateAssetDto): Promise<Asset> => {
  ensureId(portfolioId);
  try {
    const res = await api.post<Asset>(`${PATH}/${portfolioId}`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAssetByPortfolioId = async (portfolioId: string): Promise<Asset | null> => {
  if (!portfolioId) return null;
  try {
    const res = await publicApi.get<Asset>(`${PATH}/portfolio/${portfolioId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 401)) {
      return null;
    }
    throw toError(err);
  }
};

export const getAssetById = async (id: string): Promise<Asset | null> => {
  if (!id) return null;
  try {
    const res = await publicApi.get<Asset>(`${PATH}/${id}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 401)) {
      return null;
    }
    throw toError(err);
  }
};

export const updateAsset = async (id: string, dto: UpdateAssetDto): Promise<Asset> => {
  ensureId(id);
  try {
    const res = await api.patch<Asset>(`${PATH}/${id}`, dto);
    checkStatus(res.status, [200]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteAsset = async (id: string): Promise<void> => {
  ensureId(id);
  try {
    const res = await api.delete(`${PATH}/${id}`);
    checkStatus(res.status, [200, 204]);
  } catch (err) {
    throw toError(err);
  }
};

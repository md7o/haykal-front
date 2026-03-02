import axios from "axios";
import { checkStatus, ensureId, toError } from "../api-utils";
import { api } from "../auth-api/auth-endpoints";

const PATH_BASE = "/portfolio";

export type Page = {
  id: string;
  portfolioId: string;
  slug: string;
  sections: unknown | null;
  order: number;
};

export type CreatePageDto = {
  slug: string;
  order?: number;
};

export const getPages = async (portfolioId: string): Promise<Page[]> => {
  ensureId(portfolioId);
  try {
    const res = await api.get<Page[]>(`/${portfolioId}/pages`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const createPage = async (portfolioId: string, dto: CreatePageDto): Promise<Page> => {
  ensureId(portfolioId);
  if (!dto?.slug) throw new Error("slug is required");
  try {
    const res = await api.post<Page>(`/${portfolioId}/pages`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getPageById = async (portfolioId: string, pageId: string): Promise<Page | null> => {
  ensureId(portfolioId);
  ensureId(pageId);
  try {
    const res = await api.get<Page>(`/${portfolioId}/pages/${pageId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const updatePage = async (portfolioId: string, pageId: string, dto: Partial<CreatePageDto>): Promise<Page | null> => {
  ensureId(portfolioId);
  ensureId(pageId);
  try {
    const res = await api.patch<Page>(`/${portfolioId}/pages/${pageId}`, dto);
    checkStatus(res.status, [200]);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const removePage = async (portfolioId: string, pageId: string): Promise<boolean> => {
  ensureId(portfolioId);
  ensureId(pageId);
  try {
    const res = await api.delete(`/${portfolioId}/pages/${pageId}`);
    checkStatus(res.status, [200, 204]);
    return res.status === 200 || res.status === 204;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return false;
    throw toError(err);
  }
};

export const reorderPages = async (portfolioId: string, pageIds: string[]): Promise<void> => {
  ensureId(portfolioId);
  try {
    const res = await api.put(`/${portfolioId}/pages/reorder`, { pageIds });
    checkStatus(res.status, [200]);
  } catch (err) {
    throw toError(err);
  }
};

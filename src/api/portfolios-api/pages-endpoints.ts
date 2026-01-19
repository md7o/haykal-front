import axios from "axios";
import { api } from "@/api/api";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

export type Page = {
  id: string;
  portfolioId: string;
  title: string;
  slug: string;
  sections: unknown | null;
  order: number;
};

export type CreatePageDto = {
  title: string;
  slug?: string | null;
  order?: number;
  sections?: unknown | null;
};

export const getPages = async (portfolioId: string): Promise<Page[]> => {
  ensureId(portfolioId);
  try {
    const res = await api.get<Page[]>(`/api/portfolios/${portfolioId}/pages`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const createPage = async (portfolioId: string, dto: CreatePageDto): Promise<Page> => {
  ensureId(portfolioId);
  if (!dto?.title) throw new Error("title is required");
  try {
    const res = await api.post<Page>(`/api/portfolios/${portfolioId}/pages`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updatePage = async (
  portfolioId: string, // kept for compatibility, but not strictly needed for the endpoint
  pageId: string,
  dto: Partial<CreatePageDto>
): Promise<Page | null> => {
  ensureId(pageId);
  try {
    const res = await api.patch<Page>(`/api/pages/${pageId}`, dto);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const removePage = async (portfolioId: string, pageId: string): Promise<boolean> => {
  ensureId(pageId);
  try {
    const res = await api.delete(`/api/pages/${pageId}`);
    return res.status === 200 || res.status === 204;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return false;
    throw toError(err);
  }
};

export const reorderPages = async (portfolioId: string, pageIds: string[]): Promise<void> => {
  ensureId(portfolioId);
  try {
    await api.put(`/api/portfolios/${portfolioId}/pages/reorder`, { pageIds });
  } catch (err) {
    throw toError(err);
  }
};

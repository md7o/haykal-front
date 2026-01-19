import axios from "axios";
import { api } from "@/api/api";
import { toError, ensureId, checkStatus } from "@/api/api-utils";
import { Page } from "@/api/portfolios-api/pages-endpoints";
const PATH = "/portfolio";
const publicApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export type Portfolio = {
  id: string;
  userId: string;
  slug?: string | null;
  status: "DRAFT" | "PUBLISHED";
  pages: Page[];
  assets: Record<string, any> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

// Re-export Page for backward compatibility if needed, or prefer importing from pages-endpoints
export type { Page };

type CreatePortfolioDto = {
  slug?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  pages?: Array<Partial<Page>> | null;
  assets?: Record<string, any> | null;
};

// Map client DTO to backend payload
function mapCreatePayload(dto: CreatePortfolioDto) {
  return {
    ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
    ...(dto.status !== undefined ? { status: dto.status } : {}),
    ...(dto.pages !== undefined ? { pages: dto.pages } : {}),
    ...(dto.assets !== undefined ? { assets: dto.assets } : {}),
  };
}

export const createPortfolio = async (dto: CreatePortfolioDto): Promise<Portfolio> => {
  try {
    const payload = mapCreatePayload(dto);
    const res = await api.post<Portfolio>(PATH, payload);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAllPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const res = await api.get<Portfolio[]>(PATH);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getPortfolioById = async (id: string): Promise<Portfolio | null> => {
  ensureId(id);
  try {
    const res = await api.get<Portfolio>(`${PATH}/${id}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

// Returns portfolio with nested pages and sections
export const getFullPortfolioById = async (id: string): Promise<Portfolio | null> => {
  ensureId(id);
  try {
    const res = await api.get<Portfolio>(`${PATH}/${id}/full`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

// Saves portfolio with nested pages and sections in one call
export const saveFullPortfolio = async (id: string, payload: Partial<Portfolio>): Promise<Portfolio | null> => {
  ensureId(id);
  try {
    const res = await api.put<Portfolio>(`${PATH}/${id}/full`, payload);
    checkStatus(res.status, [200]);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const getPortfolioBySlug = async (slug: string): Promise<Portfolio | null> => {
  if (!slug) return null;
  try {
    const res = await api.get<Portfolio>(`${PATH}/slug/${encodeURIComponent(slug)}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const getPublicPortfolioById = async (id: string): Promise<Portfolio | null> => {
  ensureId(id);
  try {
    const res = await publicApi.get<Portfolio>(`${PATH}/${id}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const getPublicPortfolioBySlug = async (slug: string): Promise<Portfolio | null> => {
  if (!slug) return null;
  try {
    const res = await publicApi.get<Portfolio>(`${PATH}/slug/${encodeURIComponent(slug)}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const updatePortfolio = async (id: string, updateDto: Partial<CreatePortfolioDto>): Promise<Portfolio | null> => {
  ensureId(id);
  try {
    // map only provided fields
    const payload: Record<string, unknown> = {};
    if (updateDto.slug !== undefined) payload.slug = updateDto.slug;
    if (updateDto.status !== undefined) payload.status = updateDto.status;
    if (updateDto.pages !== undefined) payload.pages = updateDto.pages as Array<Partial<Page>> | null;
    if (updateDto.assets !== undefined) payload.assets = updateDto.assets;

    const res = await api.patch(`${PATH}/${id}`, payload);
    checkStatus(res.status, [200]);
    // Some backends (TypeORM) return UpdateResult instead of entity; fetch to ensure we return the latest entity
    const fresh = await api.get<Portfolio>(`${PATH}/${id}`);
    checkStatus(fresh.status);
    return fresh.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const deletePortfolio = async (id: string): Promise<boolean> => {
  ensureId(id);
  try {
    const res = await api.delete(`${PATH}/${id}`);
    return res.status === 200 || res.status === 204;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return false;
    throw toError(err);
  }
};

// ---- Shims replacing former studio-endpoints (custom design) using unified portfolio ----

export type CustomDesign = Portfolio;

export const createCustomDesign = async (createDto: {
  portfolioId: string;
  assets?: Record<string, any> | null;
}): Promise<CustomDesign> => {
  if (!createDto?.portfolioId) throw new Error("portfolioId is required");
  try {
    // Update only assets on the portfolio row (no portfolio-level sections)
    const updated = await updatePortfolio(createDto.portfolioId, {
      assets: createDto.assets,
    });
    // updatePortfolio may return null if 404
    if (!updated) throw new Error("Portfolio not found");
    return updated;
  } catch (err) {
    throw toError(err);
  }
};

export const getAllCustomDesigns = async (): Promise<CustomDesign[]> => {
  return getAllPortfolios();
};

export const getCustomDesignById = async (id: string): Promise<CustomDesign | null> => {
  return getPortfolioById(id);
};

export const updateCustomDesign = async (
  id: string,
  updateDto: { assets?: Record<string, any> | null }
): Promise<CustomDesign | null> => {
  return updatePortfolio(id, { assets: updateDto.assets ?? null });
};

export const deleteCustomDesign = async (id: string): Promise<boolean> => {
  return deletePortfolio(id);
};

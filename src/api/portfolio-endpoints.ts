import axios, { AxiosError } from "axios";
import { api } from "@/api/auth-endpoints";

const PATH = "/portfolio";

export type Portfolio = {
  id: string;
  userId: string;
  slug?: string | null;
  sections: unknown | null;
  assets: unknown | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type CreatePortfolioDto = {
  userId: string;
  slug?: string | null;
  sections?: unknown | null;
  assets?: unknown | null;
};

function toError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError;
    const status = e.response?.status;
    const data: unknown = e.response?.data;

    let message = e.message;
    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object") {
      const maybeMessage = (data as { message?: unknown }).message;
      if (typeof maybeMessage === "string") {
        message = maybeMessage;
      } else {
        try {
          message = JSON.stringify(data);
        } catch {
          message = e.message;
        }
      }
    }

    return new Error(`Request failed${status ? ` (status ${status})` : ""}: ${message}`);
  }
  return err instanceof Error ? err : new Error(String(err));
}

function ensureId(id?: string) {
  if (!id) throw new Error("id is required");
}

function checkStatus(status: number, okStatuses: number[] = [200]) {
  if (!okStatuses.includes(status)) throw new Error(`Unexpected status ${status}`);
}

// Map client DTO to backend payload
function mapCreatePayload(dto: CreatePortfolioDto) {
  return {
    user: dto.userId,
    ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
    // pass-through optional fields if provided
    ...(dto.sections !== undefined ? { sections: dto.sections } : {}),
    ...(dto.assets !== undefined ? { assets: dto.assets } : {}),
  };
}

export const createPortfolio = async (dto: CreatePortfolioDto): Promise<Portfolio> => {
  if (!dto?.userId) throw new Error("userId is required to create a portfolio");
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

export const updatePortfolio = async (id: string, updateDto: Partial<CreatePortfolioDto>): Promise<Portfolio | null> => {
  ensureId(id);
  try {
    // map only provided fields
    const payload: Record<string, unknown> = {};
    if (updateDto.userId) payload.user = updateDto.userId;
    if (updateDto.slug !== undefined) payload.slug = updateDto.slug;
    if (updateDto.sections !== undefined) payload.sections = updateDto.sections;
    if (updateDto.assets !== undefined) payload.assets = updateDto.assets;
    // category/layout removed from payload

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
  sections?: unknown | null;
  assets?: unknown | null;
}): Promise<CustomDesign> => {
  if (!createDto?.portfolioId) throw new Error("portfolioId is required");
  try {
    // In unified model, design belongs to the portfolio row; update that row
    const updated = await updatePortfolio(createDto.portfolioId, {
      sections: createDto.sections,
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
  updateDto: { sections?: unknown | null; assets?: unknown | null }
): Promise<CustomDesign | null> => {
  return updatePortfolio(id, updateDto);
};

export const deleteCustomDesign = async (id: string): Promise<boolean> => {
  return deletePortfolio(id);
};

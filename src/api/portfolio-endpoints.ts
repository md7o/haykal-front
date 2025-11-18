import axios, { AxiosError } from "axios";
import { api } from "@/api/auth-endpoints";

const PATH = "/portfolio";

export type Portfolio = {
  id: string;
  userId: string;
  slug?: string | null;
  pages: Page[];
  assets: Record<string, any> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

// Page entity (per backend entities provided)
export type Page = {
  id: string;
  portfolioId: string;
  title: string;
  slug: string;
  sections: unknown | null;
  order: number;
};

type CreatePortfolioDto = {
  slug?: string | null;
  pages?: Array<Partial<Page>> | null;
  assets?: Record<string, any> | null;
};

function toError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError;
    const status = e.response?.status;
    const data: unknown = e.response?.data;

    let message = e.message;
    // Friendly message for slug conflicts
    if (status === 409) {
      message = "Slug already in use";
    }
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
    ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
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
    if (updateDto.slug !== undefined) payload.slug = updateDto.slug;
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

// ---- Pages API helpers (operate via portfolio pages + PATCH) ----

export type CreatePageDto = {
  title: string;
  slug?: string | null;
  sections?: unknown | null;
  order?: number;
};

export const getPages = async (portfolioId: string): Promise<Page[]> => {
  ensureId(portfolioId);
  try {
    const p = await getPortfolioById(portfolioId);
    return p?.pages ?? [];
  } catch (err) {
    throw toError(err);
  }
};

export const createPage = async (portfolioId: string, dto: CreatePageDto): Promise<Page> => {
  ensureId(portfolioId);
  if (!dto?.title) throw new Error("title is required");
  try {
    const current = (await getPortfolioById(portfolioId)) as Portfolio | null;
    const beforeIds = new Set((current?.pages ?? []).map((pg) => pg.id as string));
    const nextPages: Array<Partial<Page>> = [
      ...((current?.pages ?? []) as Array<Partial<Page>>),
      {
        title: dto.title,
        slug: dto.slug ?? undefined,
        sections: dto.sections ?? undefined,
        order: dto.order,
      },
    ];
    await updatePortfolio(portfolioId, { pages: nextPages as Array<Partial<Page>> });
    const fresh = (await getPortfolioById(portfolioId)) as Portfolio | null;
    const created = (fresh?.pages ?? []).find((pg) => !beforeIds.has(pg.id));
    return created || (fresh?.pages ?? [])[Math.max(0, (fresh?.pages?.length ?? 1) - 1)];
  } catch (err) {
    throw toError(err);
  }
};

export const updatePage = async (portfolioId: string, pageId: string, dto: Partial<CreatePageDto>): Promise<Page | null> => {
  ensureId(portfolioId);
  ensureId(pageId);
  try {
    const current = (await getPortfolioById(portfolioId)) as Portfolio | null;
    const pages: Array<Partial<Page>> = (current?.pages ?? []).map((pg) =>
      pg.id === pageId
        ? {
            id: pg.id,
            portfolioId: pg.portfolioId,
            title: dto.title ?? pg.title,
            slug: dto.slug ?? pg.slug,
            sections: dto.sections ?? pg.sections,
            order: dto.order ?? pg.order,
          }
        : pg
    );
    await updatePortfolio(portfolioId, { pages });
    const fresh = (await getPortfolioById(portfolioId)) as Portfolio | null;
    return (fresh?.pages ?? []).find((pg) => pg.id === pageId) ?? null;
  } catch (err) {
    throw toError(err);
  }
};

export const removePage = async (portfolioId: string, pageId: string): Promise<boolean> => {
  ensureId(portfolioId);
  ensureId(pageId);
  try {
    const res = await api.delete(`${PATH}/${encodeURIComponent(portfolioId)}/pages/${encodeURIComponent(pageId)}`);
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

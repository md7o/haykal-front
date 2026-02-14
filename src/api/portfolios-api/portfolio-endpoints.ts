import axios from "axios";
import { api, publicApi } from "@/api/auth-api/auth-endpoints";
import { toError, checkStatus } from "@/api/api-utils";
import type { Asset } from "@/types/asset";

const PATH = "/portfolio";

export type Portfolio = {
  id: string;
  userId: string;
  slug: string;
  asset?: Asset | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export const createPortfolio = async (userId: string, slug: string): Promise<Portfolio> => {
  try {
    const res = await api.post<Portfolio>(PATH, { userId, slug });
    checkStatus(res.status, [201]);
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
    // Return empty array for 401 (unauthorized/unauthenticated)
    // This allows graceful degradation when not authenticated
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return [];
    }
    throw toError(err);
  }
};

export const getPortfolioByIDorSlug = async (idOrSlug: string): Promise<Portfolio | null> => {
  if (!idOrSlug) return null;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  // Priority: try slug first, then ID
  const attempts = isUUID
    ? [idOrSlug, idOrSlug] // If already UUID, just try it once
    : [idOrSlug, idOrSlug]; // If slug, try as slug then as potential ID

  for (const param of attempts) {
    try {
      // Try with public API first (no auth required)
      try {
        const res = await publicApi.get<Portfolio>(`${PATH}/${param}`);
        checkStatus(res.status);
        return res.data;
      } catch (publicErr) {
        // If public API fails with 404, try authenticated API
        if (axios.isAxiosError(publicErr) && publicErr.response?.status === 404) {
          try {
            const res = await api.get<Portfolio>(`${PATH}/${param}`);
            checkStatus(res.status);
            return res.data;
          } catch (authErr) {
            // Auth API also failed, continue to next attempt
            if (axios.isAxiosError(authErr) && (authErr.response?.status === 404 || authErr.response?.status === 401)) {
              continue;
            }
            throw authErr;
          }
        }
        throw publicErr;
      }
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 404 || err.response?.status === 401 || err.response?.status === 500)
      ) {
        continue; // Try next attempt
      }
      throw toError(err);
    }
  }

  return null;
};

export const getPortfolioById = async (id: string): Promise<Portfolio | null> => {
  if (!id) return null;
  try {
    // Try with public API first (no auth required), fallback to authenticated API
    try {
      const res = await publicApi.get<Portfolio>(`${PATH}/${id}`);
      checkStatus(res.status);
      return res.data;
    } catch (publicErr) {
      // If public API fails with 404, return null
      if (axios.isAxiosError(publicErr) && publicErr.response?.status === 404) {
        return null;
      }
      // Otherwise, try with authenticated API (may have better access)
      const res = await api.get<Portfolio>(`${PATH}/${id}`);
      checkStatus(res.status);
      return res.data;
    }
  } catch (err) {
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 401)) {
      return null;
    }
    throw toError(err);
  }
};

export const getPortfolioByUserId = async (userId: string): Promise<Portfolio | null> => {
  if (!userId) return null;
  try {
    // Try with public API first (no auth required), fallback to authenticated API
    try {
      const res = await publicApi.get<Portfolio>(`${PATH}/user/${userId}`);
      checkStatus(res.status);
      return res.data;
    } catch (publicErr) {
      // If public API fails with 404, return null
      if (axios.isAxiosError(publicErr) && publicErr.response?.status === 404) {
        return null;
      }
      // Otherwise, try with authenticated API (may have better access)
      const res = await api.get<Portfolio>(`${PATH}/${userId}`);
      checkStatus(res.status);
      return res.data;
    }
  } catch (err) {
    // Return null for 404 (not found) and 401 (unauthorized/unauthenticated)
    // This allows public portfolio viewing without authentication
    if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 401)) {
      return null;
    }
    throw toError(err);
  }
};

export const updatePortfolio = async (id: string, data: { slug?: string }): Promise<Portfolio> => {
  if (!id) throw new Error("Portfolio id is required");
  try {
    const res = await api.patch<Portfolio>(`${PATH}/${id}`, data);
    checkStatus(res.status, [200]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deletePortfolio = async (id: string): Promise<void> => {
  if (!id) throw new Error("Portfolio id is required");
  try {
    const res = await api.delete(`${PATH}/${id}`);
    checkStatus(res.status, [200, 204]);
  } catch (err) {
    throw toError(err);
  }
};

import axios, { AxiosError } from "axios";
import { api } from "@/api/auth-endpoints";

const PATH = "/portfolio";

export type Category = "Personal" | "Business" | "Creator";
export type LayoutType = "Landingpage" | "Sections";

export type Portfolio = {
  id: string;
  userId: string;
  category_type: Category;
  layout_type: LayoutType;
  createdAt?: string;
  updatedAt?: string;
};

type CreatePortfolioDto = {
  userId: string;
  category_type: Category;
  layout_type: LayoutType;
};

function toError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError;
    const status = e.response?.status;
    const data: any = e.response?.data;
    const message = data?.message ?? (typeof data === "string" ? data : JSON.stringify(data)) ?? e.message;
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
    category_type: dto.category_type,
    layout_type: dto.layout_type,
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

export const updatePortfolio = async (id: string, updateDto: Partial<CreatePortfolioDto>): Promise<Portfolio | null> => {
  ensureId(id);
  try {
    // map only provided fields
    const payload: Record<string, unknown> = {};
    if (updateDto.userId) payload.user = updateDto.userId;
    if (updateDto.category_type) payload.category_type = updateDto.category_type;
    if (updateDto.layout_type) payload.layout_type = updateDto.layout_type;

    const res = await api.patch<Portfolio>(`${PATH}/${id}`, payload);
    checkStatus(res.status);
    return res.data;
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

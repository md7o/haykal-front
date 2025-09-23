import axios, { AxiosError } from "axios";
import { api } from "@/api/auth-endpoints";

type CustomDesign = {
  id?: string;
  portfolioId: string;
  sections?: unknown;
  assets?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

const PATH = "/portfolio/custom";

function toError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const ae = err as AxiosError;
    const status = ae.response?.status;
    const data: unknown = ae.response?.data;

    let message = ae.message;
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
          message = ae.message;
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

export const createCustomDesign = async (createDto: {
  portfolioId: string;
  sections?: unknown;
  assets?: unknown;
}): Promise<CustomDesign> => {
  if (!createDto?.portfolioId) throw new Error("portfolioId is required");
  try {
    const res = await api.post<CustomDesign>(PATH, createDto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err: unknown) {
    throw toError(err);
  }
};

export const getAllCustomDesigns = async (): Promise<CustomDesign[]> => {
  try {
    const res = await api.get<CustomDesign[]>(PATH);
    checkStatus(res.status);
    return res.data;
  } catch (err: unknown) {
    throw toError(err);
  }
};

export const getCustomDesignById = async (id: string): Promise<CustomDesign | null> => {
  ensureId(id);
  try {
    const res = await api.get<CustomDesign>(`${PATH}/${id}`);
    checkStatus(res.status);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const updateCustomDesign = async (
  id: string,
  updateDto: { sections?: unknown; assets?: unknown }
): Promise<CustomDesign | null> => {
  ensureId(id);
  try {
    const res = await api.patch<CustomDesign>(`${PATH}/${id}`, updateDto);
    checkStatus(res.status);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw toError(err);
  }
};

export const deleteCustomDesign = async (id: string): Promise<boolean> => {
  ensureId(id);
  try {
    const res = await api.delete(`${PATH}/${id}`);
    return res.status === 200 || res.status === 204;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return false;
    throw toError(err);
  }
};

const studioEndpoints = {
  createCustomDesign,
  getAllCustomDesigns,
  getCustomDesignById,
  updateCustomDesign,
  deleteCustomDesign,
};

export default studioEndpoints;

import { api } from "@/api/auth-endpoints";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

// ---- Sections API helpers ----

export type Section = {
  id: string;
  pageId: string;
  type: string;
  config: Record<string, unknown>;
  order: number;
};

export const getSections = async (pageId: string): Promise<Section[]> => {
  ensureId(pageId);
  try {
    const res = await api.get<Section[]>(`/api/pages/${pageId}/sections`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const createSection = async (pageId: string, dto: { type: string; config: Record<string, unknown> }): Promise<Section> => {
  ensureId(pageId);
  try {
    const res = await api.post<Section>(`/api/pages/${pageId}/sections`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updateSection = async (sectionId: string, dto: { config: Record<string, unknown> }): Promise<Section> => {
  ensureId(sectionId);
  try {
    const res = await api.patch<Section>(`/api/sections/${sectionId}`, dto);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteSection = async (sectionId: string): Promise<boolean> => {
  ensureId(sectionId);
  try {
    const res = await api.delete(`/api/sections/${sectionId}`);
    return res.status === 200 || res.status === 204;
  } catch (err) {
    throw toError(err);
  }
};

export const reorderSections = async (pageId: string, sectionIds: string[]): Promise<void> => {
  ensureId(pageId);
  try {
    await api.put(`/api/pages/${pageId}/sections/reorder`, { sectionIds });
  } catch (err) {
    throw toError(err);
  }
};

// ---- Assets API helpers ----

export type Asset = {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
};

export const uploadAsset = async (file: File): Promise<Asset> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await api.post<Asset>("/api/assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAssets = async (): Promise<Asset[]> => {
  try {
    const res = await api.get<Asset[]>("/api/assets");
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

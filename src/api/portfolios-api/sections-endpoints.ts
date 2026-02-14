import { api } from "@/api/auth-api/auth-endpoints";
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
    const res = await api.get<Section[]>(`/${pageId}/sections`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getSection = async (pageId: string, sectionId: string): Promise<Section> => {
  ensureId(pageId);
  ensureId(sectionId);
  try {
    const res = await api.get<Section>(`/${pageId}/sections/${sectionId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const createSection = async (
  pageId: string,
  dto: { type: string; config?: Record<string, unknown> },
): Promise<Section> => {
  ensureId(pageId);
  try {
    const res = await api.post<Section>(`/${pageId}/sections`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updateSection = async (
  pageId: string,
  sectionId: string,
  dto: { type: string; config: Record<string, unknown> },
): Promise<Section> => {
  ensureId(pageId);
  ensureId(sectionId);
  try {
    const res = await api.patch<Section>(`/${pageId}/sections/${sectionId}`, dto);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteSection = async (pageId: string, sectionId: string): Promise<boolean> => {
  ensureId(pageId);
  ensureId(sectionId);
  try {
    const res = await api.delete(`/${pageId}/sections/${sectionId}`);
    return res.status === 200 || res.status === 204;
  } catch (err) {
    throw toError(err);
  }
};

export const reorderSections = async (pageId: string, sectionIds: string[]): Promise<void> => {
  ensureId(pageId);
  try {
    await api.put(`/${pageId}/sections/reorder`, { sectionIds });
  } catch (err) {
    throw toError(err);
  }
};

export const saveBatchSections = async (
  pageId: string,
  sections: Array<{ type: string; config?: Record<string, unknown> }>,
): Promise<Section[]> => {
  ensureId(pageId);
  try {
    const res = await api.post<Section[]>(`/${pageId}/sections/batch`, { sections });
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteBatchSections = async (pageId: string, sectionIds: string[]): Promise<void> => {
  ensureId(pageId);
  try {
    await api.post(`/${pageId}/sections/batch-delete`, { sectionIds });
  } catch (err) {
    throw toError(err);
  }
};

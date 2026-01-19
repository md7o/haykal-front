import { api } from "@/api/api";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

const BASE = "/community/user-activity";

export const toggleSave = async (postId: string): Promise<any> => {
  ensureId(postId);
  try {
    const res = await api.post<any>(`${BASE}/saves/${postId}/toggle`);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const removeSaveById = async (saveId: string): Promise<boolean> => {
  ensureId(saveId);
  try {
    const res = await api.delete<void>(`${BASE}/saves/${saveId}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    throw toError(err);
  }
};

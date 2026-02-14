import { api } from "@/api/auth-api/auth-endpoints";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

const BASE = "/community/user-activity";

export const toggleLike = async (postId: string): Promise<any> => {
  ensureId(postId);
  try {
    const res = await api.post<any>(`${BASE}/likes/${postId}/toggle`);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const removeLikeById = async (likeId: string): Promise<boolean> => {
  ensureId(likeId);
  try {
    const res = await api.delete<void>(`${BASE}/likes/${likeId}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    throw toError(err);
  }
};

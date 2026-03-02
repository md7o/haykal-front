import { ensureId } from "../../api-utils";
import { api } from "../../auth-api/auth-endpoints";
import { checkStatus, toError } from "../../api-utils";

export type commentType = {
  id: string;
  userStatusId: string;
  postId: string;
  content: string;
  createdAt: string;
  membership?: {
    id: string;
    userId: string;
    communityId: string;
    authorName: string;
    role: "member" | "owner";
    joinedAt: string;
  };
};

const BASE = "/community/user-activity";

export const createComment = async (postId: string, content: string): Promise<commentType> => {
  ensureId(postId);
  try {
    const res = await api.post<commentType>(`${BASE}/comments/${postId}`, { content });
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const listComments = async (postId: string): Promise<commentType[]> => {
  ensureId(postId);
  try {
    const res = await api.get<commentType[]>(`${BASE}/comments/${postId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  ensureId(commentId);
  try {
    const res = await api.delete<void>(`${BASE}/comments/${commentId}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    throw toError(err);
  }
};

export const updateComment = async (commentId: string, content: string): Promise<commentType> => {
  ensureId(commentId);
  try {
    const res = await api.patch<commentType>(`${BASE}/comments/${commentId}`, { content });
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const countCommentsByUser = async (): Promise<number> => {
  try {
    const res = await api.get<{ count: number } | number>(`${BASE}/comments/count`);
    checkStatus(res.status);
    // Handle both { count: number } and plain number responses
    const count = typeof res.data === "number" ? res.data : res.data?.count || 0;
    return count;
  } catch (err) {
    throw toError(err);
  }
};

import { api } from "@/api/auth/auth-endpoints";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

export type ideaType = {
  id: string;
  userId: string;
  projectName: string;
  answersData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

const Ai_Idea_BASE = "/ai-studio";

export const createAiIdea = async (projectName: string, answersData: Record<string, any>): Promise<ideaType> => {
  ensureId(projectName);
  try {
    const res = await api.post<ideaType>(`${Ai_Idea_BASE}`, {
      projectName,
      answersData,
    });
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAllAiIdeas = async (): Promise<ideaType[]> => {
  try {
    const res = await api.get<ideaType[]>(`${Ai_Idea_BASE}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAllByUserId = async (userId: string): Promise<ideaType[]> => {
  ensureId(userId);
  try {
    const res = await api.get<ideaType[]>(`${Ai_Idea_BASE}/user-ideas/${userId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAiIdeasByUser = async (userId: string): Promise<ideaType[]> => {
  try {
    const res = await api.get<ideaType[]>(`${Ai_Idea_BASE}/user/${userId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAiIdeaById = async (ideaId: string): Promise<ideaType> => {
  ensureId(ideaId);

  try {
    const res = await api.get<ideaType>(`${Ai_Idea_BASE}/${ideaId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const removeAiIdea = async (ideaId: string): Promise<boolean> => {
  ensureId(ideaId);
  try {
    const res = await api.delete<void>(`${Ai_Idea_BASE}/${ideaId}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    throw toError(err);
  }
};

import { api } from "@/api/auth-api/auth-endpoints";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

export enum CommunityItemTypeEnum {
  POST = "POST",
  EVENT = "EVENT",
  RESOURCE = "RESOURCE",
  COMMUNICATION = "COMMUNICATION",
}

export interface CommunityItemMetadata {
  // Event-specific
  eventDate?: string;
  eventLocation?: string;
  eventLink?: string;
  eventEndDate?: string;

  // Resource-specific
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;

  // Communication-specific
  communicationType?: string;
  communicationUrl?: string;

  // General metadata
  [key: string]: any;
}

export type CommunityItemType = {
  id: string;
  type: CommunityItemTypeEnum;
  title: string;
  content: string;
  postImage?: string | null;
  likesCount: number;
  commentsCount: number;
  metadata: CommunityItemMetadata;
  membershipId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean; // true if current user has liked this item
};

type CreateCommunityItemDto = {
  title: string;
  content: string;
  postImage?: string | null;
  membershipId: string;
  communityId: string;
  metadata?: CommunityItemMetadata;
  type: CommunityItemTypeEnum;
};

type UpdateCommunityItemDto = Partial<Pick<CreateCommunityItemDto, "title" | "content" | "postImage" | "metadata">>;

const COMMUNITY_ITEMS_BASE = "/community/community-items";

export const createCommunityItem = async (dto: CreateCommunityItemDto): Promise<CommunityItemType> => {
  ensureId(dto.membershipId);
  ensureId(dto.communityId);
  try {
    const res = await api.post<CommunityItemType>(`${COMMUNITY_ITEMS_BASE}`, dto);
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getCommunityItems = async (type?: CommunityItemTypeEnum): Promise<CommunityItemType[]> => {
  try {
    const params = type ? { type } : {};
    const res = await api.get<CommunityItemType[]>(`${COMMUNITY_ITEMS_BASE}`, { params });
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getCommunityItemsByCommunity = async (
  communityId: string,
  type?: CommunityItemTypeEnum,
): Promise<CommunityItemType[]> => {
  ensureId(communityId);
  try {
    const params: Record<string, string> = { communityId };
    if (type) params.type = type;
    const res = await api.get<CommunityItemType[]>(`${COMMUNITY_ITEMS_BASE}`, { params });
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getCommunityItemsByMembership = async (
  membershipId: string,
  communityId: string,
  type?: CommunityItemTypeEnum,
): Promise<CommunityItemType[]> => {
  ensureId(membershipId);
  ensureId(communityId);
  try {
    const params: Record<string, string> = { communityId };
    if (type) params.type = type;
    const res = await api.get<CommunityItemType[]>(`${COMMUNITY_ITEMS_BASE}/membership/${membershipId}`, { params });
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getCommunityItemById = async (itemId: string): Promise<CommunityItemType> => {
  ensureId(itemId);
  try {
    const res = await api.get<CommunityItemType>(`${COMMUNITY_ITEMS_BASE}/${itemId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const updateCommunityItem = async (itemId: string, data: UpdateCommunityItemDto): Promise<CommunityItemType> => {
  ensureId(itemId);
  try {
    const res = await api.patch<CommunityItemType>(`${COMMUNITY_ITEMS_BASE}/${itemId}`, data);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const deleteCommunityItem = async (itemId: string): Promise<boolean> => {
  ensureId(itemId);
  try {
    const res = await api.delete<void>(`${COMMUNITY_ITEMS_BASE}/${itemId}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    throw toError(err);
  }
};

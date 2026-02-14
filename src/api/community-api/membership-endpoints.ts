import { api } from "@/api/auth-api/auth-endpoints";
import { toError, ensureId, checkStatus } from "@/api/api-utils";

export type membershipType = {
  id: string;
  userId: string;
  communityId: string;
  authorName: string;
  role: "member" | "owner";
  joinedAt: string;
};

const MEMBERSHIP_BASE = "/community/membership";

export const createMembership = async (communityId: string, role: "member" | "owner"): Promise<membershipType> => {
  ensureId(communityId);
  try {
    const res = await api.post<membershipType>(`${MEMBERSHIP_BASE}`, {
      communityId,
      role,
    });
    checkStatus(res.status, [200, 201]);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getAllMemberships = async (): Promise<membershipType[]> => {
  try {
    const res = await api.get<membershipType[]>(`${MEMBERSHIP_BASE}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};
export const getMembershipsByUser = async (): Promise<membershipType[]> => {
  try {
    const res = await api.get<membershipType[]>(`${MEMBERSHIP_BASE}/me`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const getMembershipById = async (membershipId: string): Promise<membershipType> => {
  ensureId(membershipId);

  try {
    const res = await api.get<membershipType>(`${MEMBERSHIP_BASE}/${membershipId}`);
    checkStatus(res.status);
    return res.data;
  } catch (err) {
    throw toError(err);
  }
};

export const removeMembership = async (membershipId: string): Promise<boolean> => {
  ensureId(membershipId);
  try {
    const res = await api.delete<void>(`${MEMBERSHIP_BASE}/${membershipId}`);
    checkStatus(res.status, [200, 204]);
    return true;
  } catch (err) {
    throw toError(err);
  }
};

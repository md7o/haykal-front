import { checkStatus, ensureId, toError } from "../api-utils";
import { api } from "../auth-api/auth-endpoints";

export type membershipType = {
  id: string;
  userId: string;
  communityId: string;
  authorName: string;
  subscriptionExpiration: Date | null;
  role: "member" | "owner";
  joinedAt: string;
};

const MEMBERSHIP_BASE = "/community/membership";

export const createMembership = async (
  communityId: string,
  role: "member" | "owner",
  subscriptionExpiration: Date | null = null,
): Promise<membershipType> => {
  ensureId(communityId);
  try {
    const res = await api.post<membershipType>(`${MEMBERSHIP_BASE}`, {
      communityId,
      role,
      subscriptionExpiration: subscriptionExpiration ? subscriptionExpiration.toISOString() : null,
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

export const updateMembership = async (
  membershipId: string,
  dto: { role?: "member" | "owner"; subscriptionExpiration?: Date | null },
): Promise<membershipType> => {
  ensureId(membershipId);
  try {
    // Serialize subscriptionExpiration to ISO string if it's a Date
    const payload = {
      ...dto,
      subscriptionExpiration:
        dto.subscriptionExpiration instanceof Date ? dto.subscriptionExpiration.toISOString() : dto.subscriptionExpiration,
    };
    const res = await api.patch<membershipType>(`${MEMBERSHIP_BASE}/${membershipId}`, payload);
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

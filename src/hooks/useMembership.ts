import { useState, useEffect } from "react";
import { getMembershipsByUser } from "@/lib/api/community-api/membership-endpoints";

export function useMembership(communityId?: string) {
  const [isOwner, setIsOwner] = useState(false);
  const [ownerMembershipId, setOwnerMembershipId] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setIsOwner(false);
      setOwnerMembershipId(null);
      return;
    }

    let alive = true;
    getMembershipsByUser()
      .then((memberships) => {
        if (!alive) return;
        const currentMembership = memberships.find((m) => m.communityId === communityId);
        if (!currentMembership) {
          setIsOwner(false);
          setOwnerMembershipId(null);
          return;
        }

        setIsOwner(currentMembership.role === "owner");
        setOwnerMembershipId(currentMembership.id);
      })
      .catch((err) => console.error("Failed to load memberships", err));
    return () => {
      alive = false;
    };
  }, [communityId]);

  return { isOwner, ownerMembershipId };
}

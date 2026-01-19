"use client";

import { useEffect, useState } from "react";
import { getMembershipsByUser } from "@/api/community/membership-endpoints";
import {
  getCommunityItemsByMembership,
  CommunityItemTypeEnum,
  type CommunityItemType,
  deleteCommunityItem,
} from "@/api/community/community-items-endpoints";
import { CommunicationCreateDialog } from "./options-resources/communication-resource/CommunicationCreateDialog";
import { CommunicationsListSection } from "./options-resources/communication-resource/CommunicationsListSection";
import PagesDialog from "@/components/ui-tools/custom_ui/DialogStorage";
import LoadingScreen from "@/components/ui-tools/custom_ui/LoadingScreen";
import { useCommunityData } from "@/context/CommunityContext";

export default function CommunicationPage() {
  const { communityData } = useCommunityData();
  const [isOwner, setIsOwner] = useState(false);
  const [ownerMembershipId, setOwnerMembershipId] = useState<string | null>(null);
  const [communications, setCommunications] = useState<CommunityItemType[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commIdToDelete, setCommIdToDelete] = useState<string | null>(null);
  const [showDeleteLoading, setShowDeleteLoading] = useState(false);
  const [editComm, setEditComm] = useState<CommunityItemType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // No search on this page — show all communications

  const refreshCommunications = async () => {
    if (!communityData?.id || !ownerMembershipId) return;
    try {
      setCommunications(
        await getCommunityItemsByMembership(ownerMembershipId, communityData.id, CommunityItemTypeEnum.COMMUNICATION)
      );
    } catch (err) {
      console.error("Failed to load communications", err);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const owner = (await getMembershipsByUser()).find((m) => m.role === "owner");
        if (!alive || !owner) return;
        setIsOwner(true);
        setOwnerMembershipId(owner.id);
      } catch (err) {
        console.error("Failed to load memberships", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!communityData?.id || !ownerMembershipId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCommunityItemsByMembership(
          ownerMembershipId,
          communityData.id,
          CommunityItemTypeEnum.COMMUNICATION
        );
        if (!alive) return;
        setCommunications(data);
      } catch (err) {
        console.error("Failed to load communications", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [communityData?.id, ownerMembershipId]);

  const handleCommunicationCreated = (newCommunication: CommunityItemType) => {
    setCommunications((prev) => [newCommunication, ...prev]);
  };

  const handleCommunicationUpdated = (updatedComm: CommunityItemType) => {
    setCommunications((prev) => prev.map((c) => (c.id === updatedComm.id ? updatedComm : c)));
    setEditComm(null);
  };

  const handleEditComm = (comm: CommunityItemType) => {
    setEditComm(comm);
    setEditDialogOpen(true);
  };

  const handleDeleteComm = (commId: string) => {
    setCommIdToDelete(commId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!commIdToDelete) return;

    setDeleteDialogOpen(false);
    setShowDeleteLoading(true);

    setCommunications((prev) => prev.filter((c) => c.id !== commIdToDelete));

    try {
      await deleteCommunityItem(commIdToDelete);
    } catch (err) {
      console.error("Failed to delete communication", err);
    }

    await new Promise((r) => setTimeout(r, 1500));

    await refreshCommunications();
    setShowDeleteLoading(false);
    setCommIdToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {showDeleteLoading && <LoadingScreen />}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-title">Communication</h1>
          <p className="text-sm text-description mt-1">Social links and ways to connect with community members.</p>
        </div>
        <CommunicationCreateDialog
          isOwner={isOwner}
          ownerMembershipId={ownerMembershipId}
          communityId={communityData?.id || ""}
          onCommunicationCreated={handleCommunicationCreated}
        />
      </div>

      {/* Search removed for Communication page */}

      <div className="flex flex-col items-center py-8">
        {loading ? (
          <CommunicationsListSection communications={[]} loading={true} />
        ) : communications.length === 0 ? (
          <p className="text-description">
            {isOwner ? "No communication methods yet. Add one!" : "No communication methods available."}
          </p>
        ) : (
          <CommunicationsListSection
            communications={communications}
            loading={false}
            isOwner={isOwner}
            onEdit={handleEditComm}
            onDelete={handleDeleteComm}
          />
        )}
      </div>

      <PagesDialog
        title="Delete communication"
        content="Are you sure you want to delete this communication method? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          await confirmDelete();
        }}
      />

      <CommunicationCreateDialog
        isOwner={isOwner}
        ownerMembershipId={ownerMembershipId}
        communityId={communityData?.id || ""}
        onCommunicationCreated={handleCommunicationCreated}
        editComm={editComm}
        onCommunicationUpdated={handleCommunicationUpdated}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { getMembershipsByUser } from "@/api/community-api/membership-endpoints";
import {
  getCommunityItemsByCommunity,
  CommunityItemTypeEnum,
  type CommunityItemType,
  deleteCommunityItem,
  getCommunityItems,
} from "@/api/community-api/community-items-endpoints";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui-tools/ui/tabs";
import { EventCreateDialog } from "@/components/pages/community/options-resources/event-resource/EventCreateDialog";
import { EventsListSection } from "@/components/pages/community/options-resources/event-resource/EventsListSection";
import PagesDialog from "@/components/ui-tools/custom_ui/DialogStorage";
import LoadingScreen from "@/components/ui-tools/custom_ui/LoadingScreen";
import { useCommunityData } from "@/context/CommunityContext";

type TabKey = "upcoming" | "past";

export default function EventsPage() {
  const { communityData } = useCommunityData();
  const [isOwner, setIsOwner] = useState(false);
  const [ownerMembershipId, setOwnerMembershipId] = useState<string | null>(null);
  const [events, setEvents] = useState<CommunityItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("upcoming");
  const [now] = useState(() => Date.now());

  // Edit/Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);
  const [showDeleteLoading, setShowDeleteLoading] = useState(false);
  const [editEvent, setEditEvent] = useState<CommunityItemType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load owner membership
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

  // Load events
  useEffect(() => {
    if (!communityData?.id) return;
    let alive = true;
    (async () => {
      try {
        const data = await getCommunityItemsByCommunity(communityData.id, CommunityItemTypeEnum.EVENT);
        if (!alive) return;
        setEvents(data);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [communityData?.id]);

  const handleEventCreated = async (newEvent: CommunityItemType) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleEventUpdated = (updatedEvent: CommunityItemType) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    setEditEvent(null);
  };

  const handleEditEvent = (event: CommunityItemType) => {
    setEditEvent(event);
    setEditDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventIdToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventIdToDelete) return;

    setDeleteDialogOpen(false);
    setShowDeleteLoading(true);

    setEvents((prev) => prev.filter((e) => e.id !== eventIdToDelete));

    try {
      await deleteCommunityItem(eventIdToDelete);
    } catch (err) {
      console.error("Failed to delete event", err);
    }

    await new Promise((r) => setTimeout(r, 1500));

    // Refresh events
    try {
      setEvents(await getCommunityItems(CommunityItemTypeEnum.EVENT));
    } catch (err) {
      console.error("Failed to refresh events", err);
    }
    setShowDeleteLoading(false);
    setEventIdToDelete(null);
  };

  // Filter upcoming vs past events
  const upcoming = useMemo(() => {
    return events
      .filter((e) => {
        const eventDate = e.metadata?.eventDate ? new Date(e.metadata.eventDate).getTime() : new Date(e.createdAt).getTime();
        return eventDate >= now;
      })
      .sort((a, b) => {
        const aDate = a.metadata?.eventDate ? new Date(a.metadata.eventDate).getTime() : new Date(a.createdAt).getTime();
        const bDate = b.metadata?.eventDate ? new Date(b.metadata.eventDate).getTime() : new Date(b.createdAt).getTime();
        return aDate - bDate;
      });
  }, [events, now]);

  const past = useMemo(() => {
    return events
      .filter((e) => {
        const eventDate = e.metadata?.eventDate ? new Date(e.metadata.eventDate).getTime() : new Date(e.createdAt).getTime();
        return eventDate < now;
      })
      .sort((a, b) => {
        const aDate = a.metadata?.eventDate ? new Date(a.metadata.eventDate).getTime() : new Date(a.createdAt).getTime();
        const bDate = b.metadata?.eventDate ? new Date(b.metadata.eventDate).getTime() : new Date(b.createdAt).getTime();
        return bDate - aDate;
      });
  }, [events, now]);

  return (
    <div className="flex flex-col gap-6">
      {showDeleteLoading && <LoadingScreen />}
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-title">Events</h1>
          <p className="text-sm text-description mt-1">Upcoming meetups, workshops, and announcements.</p>
        </div>
        <EventCreateDialog
          isOwner={isOwner}
          ownerMembershipId={ownerMembershipId}
          communityId={communityData?.id || ""}
          onEventCreated={handleEventCreated}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
        <TabsList className="card-main rounded-base shadow-sm">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <EventsListSection
            items={upcoming}
            loading={loading}
            isOwner={isOwner}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <EventsListSection
            items={past}
            loading={loading}
            isPast
            isOwner={isOwner}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
      </Tabs>

      <PagesDialog
        title="Delete event"
        content="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          await confirmDelete();
        }}
      />

      <EventCreateDialog
        isOwner={isOwner}
        ownerMembershipId={ownerMembershipId}
        communityId={communityData?.id || ""}
        onEventCreated={handleEventCreated}
        editEvent={editEvent}
        onEventUpdated={handleEventUpdated}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}

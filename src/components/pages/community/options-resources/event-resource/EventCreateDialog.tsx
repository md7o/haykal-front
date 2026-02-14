"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createCommunityItem,
  updateCommunityItem,
  CommunityItemTypeEnum,
  type CommunityItemType,
} from "@/api/community-api/community-items-endpoints";
import { Button } from "@/components/ui-tools/ui/button";
import { Input } from "@/components/ui-tools/ui/input";
import { Textarea } from "@/components/ui-tools/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui-tools/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

interface EventCreateDialogProps {
  ownerMembershipId: string | null;
  communityId: string;
  isOwner: boolean;
  onEventCreated: (newEvent: CommunityItemType) => void;
  editEvent?: CommunityItemType | null;
  onEventUpdated?: (updatedEvent: CommunityItemType) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const toDateInputValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toTimeInputValue = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const EventCreateDialog = ({
  ownerMembershipId,
  communityId,
  isOwner,
  onEventCreated,
  editEvent,
  onEventUpdated,
  open: controlledOpen,
  onOpenChange,
}: EventCreateDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? Boolean(controlledOpen) : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [creating, setCreating] = useState(false);

  const initialDateTime = useMemo(() => {
    if (!editEvent) return null;
    const raw = editEvent.metadata?.eventDate || editEvent.createdAt;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [editEvent]);

  useEffect(() => {
    if (!open) return;

    if (editEvent) {
      setTitle(editEvent.title ?? "");
      setDescription(editEvent.content ?? "");
      setLocation((editEvent.metadata?.eventLocation as string) ?? "");
      setLink((editEvent.metadata?.eventLink as string) ?? "");
      if (initialDateTime) {
        setEventDate(toDateInputValue(initialDateTime));
        setEventTime(toTimeInputValue(initialDateTime));
      } else {
        setEventDate("");
        setEventTime("");
      }
    } else {
      setTitle("");
      setDescription("");
      setEventDate("");
      setEventTime("");
      setLocation("");
      setLink("");
    }
  }, [editEvent, open, initialDateTime]);

  const handleCreateEvent = async () => {
    if (!title.trim()) return;
    if (!ownerMembershipId && !editEvent) return;

    setCreating(true);
    try {
      const eventDateTime =
        eventDate && eventTime ? new Date(`${eventDate}T${eventTime}`).toISOString() : new Date().toISOString();

      if (editEvent) {
        const updated = await updateCommunityItem(editEvent.id, {
          title: title.trim(),
          content: description.trim(),
          metadata: {
            ...(editEvent.metadata ?? {}),
            eventDate: eventDateTime,
            eventLocation: location.trim() || undefined,
            eventLink: link.trim() || undefined,
          },
        });

        setOpen(false);
        onEventUpdated?.(updated);
      } else {
        const newEvent = await createCommunityItem({
          title: title.trim(),
          content: description.trim(),
          membershipId: ownerMembershipId!,
          communityId: communityId,
          type: CommunityItemTypeEnum.EVENT,
          metadata: {
            eventDate: eventDateTime,
            eventLocation: location.trim() || undefined,
            eventLink: link.trim() || undefined,
          },
        });

        setOpen(false);
        onEventCreated(newEvent);
      }
    } catch (err) {
      console.error("Failed to create/update event", err);
    } finally {
      setCreating(false);
    }
  };

  if (!isOwner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editEvent && !isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-title block mb-2">Event Title *</label>
            <Input
              placeholder="e.g., Community Meetup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={creating}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-title block mb-2">Description</label>
            <Textarea
              placeholder="What's this event about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
              className="resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-title block mb-2">Date</label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} disabled={creating} />
            </div>
            <div>
              <label className="text-sm font-medium text-title block mb-2">Time</label>
              <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} disabled={creating} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-title block mb-2">Location (Optional)</label>
            <Input
              placeholder="e.g., Downtown Hub or 'Online'"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={creating}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-title block mb-2">Link (Optional)</label>
            <Input
              placeholder="e.g., https://zoom.us/j/123456789"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={creating}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={creating}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleCreateEvent} disabled={!title.trim() || creating} className="gap-2">
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            {creating ? (editEvent ? "Updating..." : "Creating...") : editEvent ? "Update Event" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

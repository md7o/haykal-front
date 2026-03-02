"use client";

import { useEffect, useState } from "react";
import {
  createCommunityItem,
  updateCommunityItem,
  CommunityItemTypeEnum,
  type CommunityItemType,
} from "@/lib/api/community-api/community-items-endpoints";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Textarea } from "@/components/ui/shadcn_ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/shadcn_ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn_ui/select";
import { Plus, Loader2 } from "lucide-react";

interface CommunicationCreateDialogProps {
  ownerMembershipId: string | null;
  communityId: string;
  isOwner: boolean;
  onCommunicationCreated: (newCommunication: CommunityItemType) => void;
  editComm?: CommunityItemType | null;
  onCommunicationUpdated?: (updatedComm: CommunityItemType) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const COMMUNICATION_TYPES = [
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "github", label: "GitHub" },
  { value: "discord", label: "Discord" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "slack", label: "Slack" },
  { value: "other", label: "Other" },
] as const;

export const CommunicationCreateDialog = ({
  ownerMembershipId,
  communityId,
  isOwner,
  onCommunicationCreated,
  editComm,
  onCommunicationUpdated,
  open: controlledOpen,
  onOpenChange,
}: CommunicationCreateDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? Boolean(controlledOpen) : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("twitter");
  const [url, setUrl] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editComm) {
      setDescription(editComm.content ?? "");
      setType(String(editComm.metadata?.communicationType ?? "twitter"));
      setUrl(String(editComm.metadata?.communicationUrl ?? ""));
    } else {
      setDescription("");
      setType("twitter");
      setUrl("");
    }
  }, [editComm, open]);

  const handleCreateCommunication = async () => {
    if (!ownerMembershipId && !editComm) return;
    // Title will be derived from selected communication type

    setCreating(true);
    try {
      const titleToUse = COMMUNICATION_TYPES.find((t) => t.value === type)?.label || type;

      if (editComm) {
        const updated = await updateCommunityItem(editComm.id, {
          title: titleToUse,
          content: description.trim(),
          metadata: {
            ...(editComm.metadata ?? {}),
            communicationType: type,
            communicationUrl: url.trim() || undefined,
          },
        });

        setOpen(false);
        onCommunicationUpdated?.(updated);
      } else {
        const newCommunication = await createCommunityItem({
          title: titleToUse,
          content: description.trim(),
          membershipId: ownerMembershipId!,
          communityId: communityId,
          type: CommunityItemTypeEnum.COMMUNICATION,
          metadata: {
            communicationType: type,
            communicationUrl: url.trim() || undefined,
          },
        });

        setOpen(false);
        onCommunicationCreated(newCommunication);
      }
    } catch (err) {
      console.error("Failed to create/update communication", err);
    } finally {
      setCreating(false);
    }
  };

  if (!isOwner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editComm && !isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Communication
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editComm ? "Edit Communication" : "Add Communication Method"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title is auto-set from selected communication type */}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">URL</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g., https://twitter.com/username" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description or message..."
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="grayFill">Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreateCommunication} disabled={creating || !url.trim()}>
            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {creating ? (editComm ? "Updating..." : "Adding...") : editComm ? "Update Communication" : "Add Communication"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

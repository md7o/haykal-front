"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui-tools/ui/button";
import { Spinner } from "@/components/ui-tools/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui-tools/ui/dialog";

type CommunityUserCardProps = {
  title: string;
  description?: string | null;
  type?: string;
  onJoin: () => void;
  isJoining?: boolean;
  joinDisabled?: boolean;
  joinLabel?: string;
  open?: boolean;
};

export default function CommunityUserCard({
  title,
  description,
  type,
  onJoin,
  isJoining = false,
  joinDisabled = false,
  open: initialOpen = true,
}: CommunityUserCardProps) {
  const [open, setOpen] = useState<boolean>(initialOpen);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const handleClick = () => {
    onJoin();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-accent text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description?.trim()?.length ? description : "No description yet."}</DialogDescription>
        </DialogHeader>

        {type ? (
          <div className="flex items-center gap-3">
            <span className="rounded-soft bg-accent/20 px-3 py-1 text-sm font-medium text-accent capitalize">{type}</span>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" onClick={handleClick} disabled={joinDisabled || isJoining} className="min-w-[160px]">
            {isJoining ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="text-white" />
                Joining…
              </span>
            ) : (
              "Join"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

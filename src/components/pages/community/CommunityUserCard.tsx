"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Spinner } from "@/components/ui/shadcn_ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/shadcn_ui/dialog";

type CommunityUserCardProps = {
  title: string;
  description?: string | null;
  type?: string;
  onJoin?: () => void;
  onJoinWithDate?: (subscriptionExpiration: Date | null) => void;
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
  onJoinWithDate,
  isJoining = false,
  joinDisabled = false,
  open: initialOpen = true,
}: CommunityUserCardProps) {
  const [open, setOpen] = useState<boolean>(initialOpen);
  const [subscriptionDate, setSubscriptionDate] = useState<string>("");

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const handleClick = () => {
    if (onJoinWithDate) {
      const expirationDate = subscriptionDate ? new Date(subscriptionDate) : null;
      onJoinWithDate(expirationDate);
    } else if (onJoin) {
      onJoin();
    }
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

        <div className="space-y-2 py-4">
          <label htmlFor="subscription-date" className="block text-sm font-medium">
            Subscription Expiration Date
          </label>
          <input
            type="date"
            id="subscription-date"
            value={subscriptionDate}
            onChange={(e) => setSubscriptionDate(e.target.value)}
            className="w-full px-3 py-2 bg-card-main rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-muted-foreground">Community admins can see this subscription expiration date</p>
        </div>

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

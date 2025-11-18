"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Spinner } from "../ui/spinner";

interface DialogStorageProps {
  title: string;
  content?: string;
  triggerLabel?: string;
  trigger?: React.ReactNode;
  showInput?: boolean;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: (value?: string) => Promise<void> | void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function PagesDialog({
  title,
  content,
  triggerLabel = "Open",
  trigger,
  showInput = false,
  initialValue = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  open,
  onOpenChange,
}: DialogStorageProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (isControlled) return onOpenChange?.(false);
    setInternalOpen(false);
  };

  const handleConfirm = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await onConfirm?.(showInput ? value : undefined);
      // Close only on success
      handleClose();
    } catch (err) {
      // Keep the dialog open on error so user can retry; log the error for debugging
      console.error("Dialog confirm error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  // Controlled props for Dialog from ui/dialog
  const dialogProps = isControlled
    ? { open: Boolean(open), onOpenChange }
    : { open: internalOpen, onOpenChange: (v: boolean) => setInternalOpen(Boolean(v)) };

  return (
    // Use the shared Dialog primitive but wire it to either the controlled handlers or internal state
    <Dialog {...(dialogProps as any)}>
      {/* Render a trigger only when uncontrolled or when a custom trigger was explicitly provided. */}
      {(trigger || !isControlled) && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="transparent" size="small">
              {triggerLabel}
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent
        className="sm:max-w-md"
        onKeyDown={(e: React.KeyboardEvent) => {
          // Activate confirm on Enter key. Prevent default to avoid form submissions.
          if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {content && <DialogDescription className="text-sm text-description">{content}</DialogDescription>}
        </DialogHeader>

        {showInput && (
          <div className="pt-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder=""
              autoFocus
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="grayFill" size="small" onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="fill" size="small" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? <Spinner className="mx-auto text-white size-6" /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

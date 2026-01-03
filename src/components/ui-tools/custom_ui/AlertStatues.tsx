"use client";

import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

type AlertStatusProps = {
  variant?: "success" | "error" | "info" | "default";
  title: string;
  description?: string;
  isVisible: boolean;
  onClose: () => void;
  autoHide?: number | false;
  className?: string;
};

export default function AlertStatus({
  variant = "success",
  title,
  description,
  isVisible,
  onClose,
  autoHide = 3000,
  className = "fixed bottom-4 right-4 z-50 w-[320px]",
}: AlertStatusProps) {
  if (!isVisible) return null;

  return (
    <div className={className}>
      <Alert variant={variant} closable onClose={onClose} autoHide={autoHide}>
        <AlertTitle>{title}</AlertTitle>
        {description && <AlertDescription>{description}</AlertDescription>}
      </Alert>
    </div>
  );
}

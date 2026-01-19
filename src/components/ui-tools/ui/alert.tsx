import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Check, AlertTriangle, Info, X } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-4 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-accent border-none text-white",
        success: "bg-success border-none text-white",
        error: " bg-error border-none text-white",
        info: "bg-warning border-none text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type AlertExtraProps = {
  closable?: boolean;
  onClose?: () => void;
  autoHide?: number | false;
  icon?: React.ReactNode;
};

function Alert({
  className,
  variant,
  closable,
  onClose,
  autoHide = false,
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & AlertExtraProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!visible) return;
    if (!autoHide) return;
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, autoHide);
    return () => clearTimeout(t);
  }, [visible, autoHide, onClose]);

  if (!visible) return null;

  let defaultIcon: React.ReactNode = null;
  if (icon) defaultIcon = icon;
  else if (variant === "success") defaultIcon = <Check size={25} />;
  else if (variant === "error") defaultIcon = <AlertTriangle size={25} />;
  else if (variant === "info") defaultIcon = <Info size={25} />;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className, "flex justify-center items-center")}
      {...props}
    >
      {defaultIcon}
      <div className="col-start-2 flex items-start justify-between w-full gap-4">
        <div className="min-w-0">{children}</div>
        {closable && (
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-black/10 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-base col-start-2 line-clamp-1 min-h-4 tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

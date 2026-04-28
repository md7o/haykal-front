import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[10px] w-full focus:ring-accent/50 rounded-soft focus:ring-2 bg-card-bg px-3 py-2 text-base  placeholder:text-muted-foreground focus-visible:outline-none duration-200 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };

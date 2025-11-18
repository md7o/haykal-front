import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap text-white  text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        fill: "category-gradient hover:opacity-80 rounded-soft",
        outline: "border-2 border-black/80 hover:border-transparent hover:bg-accent hover:text-white text-title rounded-soft",
        grayFill: "bg-black/10 text-title hover:bg-black/15 rounded-soft",
        transparent: "bg-transparent hover:bg-black/5 text-black rounded-soft",
        link: "hover:opacity-80 underline text-lg bg-transparent rounded-soft",
        block: "hover:opacity-80 rounded-soft",
        bobble: "category-gradient hover:opacity-80 rounded-full",
      },
      size: {
        small: "h-12 px-4 py-5 ",
        base: "h-12 px-8 py-5 ",
        large: "h-12 px-20 py-5 ",
        huge: "h-12 px-20 py-5 w-full",
        icon: "h-9 w-9 p-0 gap-0",
        flexible: "h-auto w-auto p-2",
      },
    },
    defaultVariants: {
      variant: "fill",
      size: "small",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

function IconButton({
  className,
  variant,
  size,
  asChild = false,
  "aria-label": ariaLabel,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    "aria-label"?: string;
    children?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot : "button";

  // default to icon size for IconButton if no size provided
  const appliedSize = size ?? (children ? undefined : "icon");

  return (
    <Comp
      data-slot="icon-button"
      className={cn(buttonVariants({ variant, size: appliedSize }), className)}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, IconButton, buttonVariants };

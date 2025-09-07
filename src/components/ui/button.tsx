import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap text-white rounded-soft text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        fill: "category-gradient hover:opacity-80 ",
        outline: "border-2 border-gradient-primary hover:bg-gradient-primary hover:text-white text-black",
        transparent: "bg-transparent hover:bg-gradient-primary hover:text-white text-black",
      },
      size: {
        small: "h-12 px-4 py-5 ",
        base: "h-12 px-8 py-5 ",
        large: "h-12 px-20 py-5 ",
        huge: "h-12 px-20 py-5 w-full",

        icon: "size-9",
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

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };

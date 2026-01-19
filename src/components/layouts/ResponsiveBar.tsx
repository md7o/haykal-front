"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Home, Layout as LayoutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const responsiveBarVariants = cva("fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out md:hidden", {
  variants: {
    variant: {
      default: "bg-card-bg shadow-lg",
    },
    size: {
      small: "h-16 px-2",
      default: "h-20 px-4",
      large: "h-24 px-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const responsiveBarItemVariants = cva(
  "flex flex-col items-center justify-center h-full w-full rounded-lg transition-all duration-200 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "text-description hover:text-accent hover:bg-secondary-card",
        active: "text-accent",
        disabled: "text-description opacity-60 pointer-events-none",
      },
      size: {
        small: "min-w-12",
        default: "min-w-16",
        large: "min-w-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ResponsiveBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  badge?: string | number;
  disabled?: boolean;
}

interface ResponsiveBarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof responsiveBarVariants> {
  items?: ResponsiveBarItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  showLabels?: boolean;
}

interface ResponsiveBarItemProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof responsiveBarItemVariants> {
  item: ResponsiveBarItem;
  isActive?: boolean;
  showLabel?: boolean;
  isDisabled?: boolean;
}

// Default items if none provided
const defaultItems: ResponsiveBarItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home size={20} />,
  },
  {
    id: "studio",
    label: "Studio",
    icon: <LayoutIcon size={20} />,
  },
];

const ResponsiveBarItem = React.forwardRef<HTMLDivElement, ResponsiveBarItemProps>(
  ({ className, variant, size, item, isActive, showLabel = true, onClick, isDisabled: forcedDisabled, ...props }, ref) => {
    const router = useRouter();
    const isDisabled = forcedDisabled || item.disabled;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      if (onClick) {
        onClick(e);
      }
      if (item.onClick) {
        item.onClick();
      }
      if (item.href) {
        // Use client-side navigation to avoid full page reloads (which retrigger auth refresh calls)
        router.push(item.href);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          responsiveBarItemVariants({
            variant: (() => {
              if (isActive) return "active";
              if (isDisabled) return "disabled";
              return variant;
            })(),
            size,
            className,
          })
        )}
        onClick={handleClick}
        role="button"
        aria-disabled={isDisabled}
        {...props}
      >
        <div className="relative">
          {item.icon}
          {item.badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
              {item.badge}
            </span>
          )}
        </div>
        {showLabel && <span className="text-xs pt-1 font-medium truncate max-w-full">{item.label}</span>}
      </div>
    );
  }
);

ResponsiveBarItem.displayName = "ResponsiveBarItem";

const ResponsiveBar = React.forwardRef<HTMLDivElement, ResponsiveBarProps>(
  ({ className, variant, size, items = defaultItems, activeItem, onItemClick, showLabels = true, ...props }, ref) => {
    const isMobile = useIsMobile();
    const [isVisible, setIsVisible] = React.useState(true);

    // Use refs for stable scroll tracking and to avoid rerunning effect on every scroll
    const lastYRef = React.useRef<number>(0);
    const rafRef = React.useRef<number | null>(null);

    React.useEffect(() => {
      const THRESHOLD = 12; // pixels

      const onScroll = () => {
        if (rafRef.current !== null) return;
        rafRef.current = window.requestAnimationFrame(() => {
          const currentY = window.scrollY || window.pageYOffset;
          const delta = currentY - lastYRef.current;

          // If scrolled down beyond threshold and past top area, hide the bar
          if (delta > THRESHOLD && currentY > 80) {
            setIsVisible(false);
          } else if (delta < -THRESHOLD) {
            // Scrolled up beyond threshold -> show bar
            setIsVisible(true);
          }

          lastYRef.current = currentY;
          if (rafRef.current) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        });
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (rafRef.current) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }, []);

    // Don't render on desktop
    if (!isMobile) {
      return null;
    }

    const handleItemClick = (itemId: string) => {
      if (onItemClick) {
        onItemClick(itemId);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(responsiveBarVariants({ variant, size }), !isVisible && "translate-y-full", className)}
        {...props}
      >
        <div className="flex items-center justify-around h-full  mx-auto">
          {items.map((item) => (
            <ResponsiveBarItem
              key={item.id}
              item={item}
              variant={"default"}
              size={size}
              isActive={activeItem === item.id}
              isDisabled={item.disabled}
              showLabel={showLabels}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>
      </div>
    );
  }
);

ResponsiveBar.displayName = "ResponsiveBar";

export { ResponsiveBar, ResponsiveBarItem, responsiveBarVariants, responsiveBarItemVariants };
export type { ResponsiveBarProps, ResponsiveBarItem as ResponsiveBarItemType };

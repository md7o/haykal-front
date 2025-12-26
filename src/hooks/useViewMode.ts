/**
 * Custom hook for managing media queries
 */

import { useState, useEffect } from "react";

export type ViewMode = "desktop" | "mobile";

/**
 * Hook to track desktop/mobile view based on screen width
 * @param breakpoint - Min width in pixels for desktop view (default: 1200)
 */
export function useViewMode(breakpoint: number = 1200): [ViewMode, (mode: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>("desktop");

  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${breakpoint}px)`);

    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setView(e.matches ? "desktop" : "mobile");
    };

    // Set initial value
    handleMediaChange(mq);

    // Register listener using the proper API
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleMediaChange as EventListener);
    } else if (typeof mq.addListener === "function") {
      // @ts-ignore - legacy API
      mq.addListener(handleMediaChange);
    }

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", handleMediaChange as EventListener);
      } else if (typeof mq.removeListener === "function") {
        // @ts-ignore - legacy API
        mq.removeListener(handleMediaChange);
      }
    };
  }, [breakpoint]);

  return [view, setView];
}

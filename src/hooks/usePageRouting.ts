"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePages } from "@/lib/context/PagesContext";

/**
 * Hook to synchronize the selected page ID with the URL query parameter.
 * This allows deep linking to specific pages in the studio and handles browser navigation.
 */
export function usePageRouting() {
  const { selectedPageId, setSelectedPageId, pages } = usePages();
  const searchParams = useSearchParams();

  // Sync URL -> Context (Initial load or Back/Forward navigation)
  useEffect(() => {
    const urlPageId = searchParams?.get("page");
    if (urlPageId) {
      setSelectedPageId(urlPageId);
    }
  }, [searchParams, setSelectedPageId]);

  // Sync Context -> URL
  useEffect(() => {
    // Use window.location to check the ACTUAL current URL to avoid loops
    // caused by Next.js searchParams being slightly out of sync or triggering re-renders.
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const currentUrlId = params.get("page");

    // Resolve current selected page to get its slug if available
    const page = pages.find((p) => p.id === selectedPageId);
    const targetVal = page?.slug || page?.id || selectedPageId;

    if (targetVal && targetVal !== currentUrlId) {
      params.set("page", targetVal);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } else if (!targetVal && currentUrlId) {
      params.delete("page");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [selectedPageId, pages]);
}

/**
 * Global styles constants for all BlockForm components
 * Reduces code duplication and ensures consistent styling across all section editors
 */

export const blockFormStyles = {
  // Root container - full screen with bg color
  root: "h-screen bg-card-bg w-[24rem]",

  // Panel wrapper - fixed width white container
  panel: "h-full flex flex-col bg-card-bg border-r border-light-border",

  // Inner flex container for layout (without width constraints)
  container: "h-full flex flex-col",

  // Header section
  header: "px-6 py-4 border-b border-light-border",
  headerTitle: "text-base font-semibold text-title",

  // Content scrollable area
  content: "flex-1 overflow-y-auto px-6 py-6 space-y-6",
} as const;

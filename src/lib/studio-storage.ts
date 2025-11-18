// Centralized studio storage helper to minimize scattered sessionStorage usage
// All studio-related ephemeral data is nested under a single key: "studioState"

import type { Page } from "@/api/portfolio-endpoints";

const KEY = "studioState";

export type DraftPage = Partial<Page> & {
  id: string;
  title?: string;
  slug?: string | null;
  sections?: unknown | null;
  order?: number;
  portfolioId?: string | null;
};

export type StudioState = {
  // persisted drafts keyed by id
  drafts?: Record<string, DraftPage>;
  // UI memory
  selectedPageId?: string | null;
  // optional extras we may decide to keep here to reduce number of keys
  assetsDraft?: unknown | null;
  slugDraft?: string | null;
  portfolioId?: string | null;
  customDesignId?: string | null;
};

function readRaw(): StudioState {
  try {
    if (typeof window === "undefined") return {};
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as StudioState;
    return {};
  } catch {
    return {};
  }
}

function writeRaw(next: StudioState) {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getStudioState(): StudioState {
  return readRaw();
}

export function patchStudioState(patch: Partial<StudioState>): StudioState {
  const curr = readRaw();
  const next: StudioState = { ...curr, ...patch };
  writeRaw(next);
  return next;
}

// Drafts helpers
export function getDraftsMap(): Record<string, DraftPage> {
  const state = readRaw();
  return { ...(state.drafts || {}) };
}

export function setDraftsMap(map: Record<string, DraftPage>): void {
  const state = readRaw();
  writeRaw({ ...state, drafts: { ...map } });
}

export function readDraftsAsArray(): DraftPage[] {
  const map = getDraftsMap();
  const arr = Object.values(map || {});
  return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function writeDraftsFromArray(drafts: DraftPage[]): void {
  const existing = getDraftsMap();
  const next: Record<string, DraftPage> = { ...existing };
  drafts.forEach((d, idx) => {
    next[d.id] = {
      ...existing[d.id],
      ...d,
      order: typeof d.order === "number" ? d.order : idx,
    };
  });
  setDraftsMap(next);
}

export function clearDrafts(): void {
  const state = readRaw();
  if (!state.drafts) return;
  const { drafts, ...rest } = state;
  writeRaw(rest);
}

// Convenience selected page id memory
export function getSelectedPageId(): string | null | undefined {
  return readRaw().selectedPageId;
}

export function setSelectedPageIdMemory(id: string | null): void {
  patchStudioState({ selectedPageId: id });
}

// Optional accessors for assets/slug to reduce multiple keys in the future
export function getAssetsDraft(): unknown | null | undefined {
  return readRaw().assetsDraft ?? null;
}

export function setAssetsDraft(val: unknown | null): void {
  patchStudioState({ assetsDraft: val ?? null });
}

export function getSlugDraft(): string | null | undefined {
  return readRaw().slugDraft ?? null;
}

export function setSlugDraft(val: string | null): void {
  patchStudioState({ slugDraft: val ?? null });
}

"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui-tools/ui/sidebar";
import { Button } from "@/components/ui-tools/ui/button";
import PagesDialog from "@/components/ui-tools/custom_ui/DialogStorage";
import { Input } from "@/components/ui-tools/ui/input";
import { Plus, FileText, Pencil, Check, X, Trash2, GripVertical, Home as HomeIcon } from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { getPages, updatePage, removePage, type Page } from "@/api/portfolio-endpoints";
import {
  readDraftsAsArray,
  writeDraftsFromArray,
  getSelectedPageId as readSelMem,
  setSelectedPageIdMemory as writeSelMem,
} from "@/lib/studio-storage";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

// --- Helpers
const isHome = (p: { slug?: string | null; title?: string | null; id?: string | null }) =>
  (p.slug || "").toLowerCase() === "home" || p.title === "Home" || p.id === "home";

const toSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$|_/g, "");

const pinHomeFirst = <T extends Page>(arr: T[]) => {
  const home = arr.find(isHome);
  if (!home) return arr;
  const rest = arr.filter((p) => p !== home);
  return [home, ...rest];
};

function SortableRow({
  page,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  page: Page;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const isProtected = isHome(page);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
    disabled: isProtected,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    ...(isDragging ? { opacity: 0.7, zIndex: 30 } : {}),
  };
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(page.title);
  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={`flex items-center gap-2 p-2 rounded-md bg-card-bg ${active ? "ring-2 ring-accent" : ""}`}
    >
      {!isProtected && (
        <Button
          variant={"transparent"}
          size={"icon"}
          className={`p-1.5 rounded cursor-grab hover:bg-black/10 ${isDragging ? "cursor-grabbing" : ""}`}
          {...attributes}
          {...listeners}
          aria-label="Drag page"
        >
          <GripVertical className="w-4 h-4 text-description" />
        </Button>
      )}
      <div className="flex-1 text-left flex items-center gap-2 cursor-pointer">
        {isProtected ? <HomeIcon className="w-4 h-4 text-accent" /> : <FileText className="w-4 h-4 text-description" />}
        {!isEditing ? (
          <span className="text-sm text-title truncate">{page.title}</span>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-7" />
            <Button
              size="small"
              variant="outline"
              onClick={(ev) => {
                ev.stopPropagation();
                setIsEditing(false);
                setValue(page.title);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="small"
              onClick={(ev) => {
                ev.stopPropagation();
                setIsEditing(false);
                onRename(value.trim() || page.title);
              }}
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      {!isEditing && (
        <>
          {!isProtected && (
            <>
              <Button variant="transparent" size="icon" onClick={() => setIsEditing(true)} aria-label="Rename page">
                <Pencil className="w-4 h-4 text-description" />
              </Button>
              <Button variant="transparent" size="icon" onClick={onDelete} aria-label="Delete page">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function PagesSidebar() {
  const { portfolioId, selectedPageId, setSelectedPageId, used, loadSections, selectSection } = useStudio();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // --- Drafts helpers via centralized storage ---
  const readDrafts = (): Page[] =>
    readDraftsAsArray()
      // only include actual drafts to avoid merging in server-backed entries from autosave
      .filter((d: any) => String(d?.portfolioId ?? "draft") === "draft")
      .map((d: any, idx: number) => ({
        id: String(d.id),
        portfolioId: "draft",
        title: String(d.title ?? "New Page"),
        slug: String(d.slug ?? ""),
        sections: Array.isArray(d.sections) ? d.sections : null,
        order: typeof d.order === "number" ? d.order : idx,
      }));

  const writeDrafts = (drafts: Page[]) =>
    writeDraftsFromArray(
      drafts.map((d, idx) => ({
        id: d.id,
        portfolioId: "draft",
        title: d.title,
        slug: d.slug,
        sections: Array.isArray(d.sections) ? d.sections : null,
        order: typeof d.order === "number" ? d.order : idx,
      }))
    );

  // Helper to update the pageId in the URL without scrolling
  const updateUrlPageId = (id: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (id) params.set("pageId", id);
    else params.delete("pageId");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : `${pathname}`, { scroll: false });
  };

  // Centralized selection that also loads sections
  const selectPage = async (id: string | null, opts?: { forceLoad?: boolean }, pagesSource?: Page[]) => {
    if (!id) return;
    const list = pagesSource ?? pages;
    const current = list.find((p) => p.id === id);
    if (!current) return;

    const isNewSelection = selectedPageId !== id;
    if (isNewSelection) setSelectedPageId(id);
    writeSelMem(id);
    updateUrlPageId(id);

    // Start with any local sections stored in the page entry
    let payload = Array.isArray(current.sections) ? current.sections : [];

    // If this is a remote page (not a draft) and we have no sections locally, fetch the page from the API
    if (String(current.portfolioId) !== "draft" && (!Array.isArray(payload) || payload.length === 0) && portfolioId) {
      try {
        const remotePages = await getPages(String(portfolioId));
        const fresh = remotePages.find((p) => p.id === id);
        if (fresh) payload = Array.isArray(fresh.sections) ? fresh.sections : [];
        console.log("PagesSidebar.selectPage: fetched remote page", {
          id,
          sectionsLength: Array.isArray(payload) ? payload.length : 0,
        });
      } catch (e) {
        console.log("PagesSidebar.selectPage: failed to fetch remote page sections", e);
      }
    }

    if (opts?.forceLoad) selectSection(null);

    // Avoid unnecessary reloads if selection didn't change and sections are equal
    try {
      if (!isNewSelection && Array.isArray(payload)) {
        const currSimple = used.map((s: any) => ({ type: s.type, config: s.config }));
        const nextSimple = payload.map((s: any) => ({ type: s.type, config: s.config }));
        if (JSON.stringify(currSimple) === JSON.stringify(nextSimple) && !opts?.forceLoad) return;
      }
    } catch {}

    // @ts-ignore - runtime shape matches AnySectionInstance
    loadSections(payload);
  };

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const drafts = readDrafts();
      const remote = portfolioId ? await getPages(portfolioId) : [];

      // Keep only one Home: prefer remote Home if it exists
      const hasRemoteHome = remote.some(isHome);
      const filteredDrafts = hasRemoteHome ? drafts.filter((d) => !isHome(d)) : drafts;

      // Ensure Home exists
      const ensureHome: Page[] =
        hasRemoteHome || filteredDrafts.some(isHome)
          ? []
          : [
              {
                id: "home",
                portfolioId: "draft",
                title: "Home",
                slug: "home",
                sections: null,
                order: 0,
              },
            ];
      if (ensureHome.length) writeDrafts([ensureHome[0], ...filteredDrafts]);

      // Merge by id (remote wins on collision)
      const byId = new Map(remote.map((r) => [r.id, r] as const));
      for (const d of [...ensureHome, ...filteredDrafts]) if (!byId.has(d.id)) byId.set(d.id, d);
      let merged = Array.from(byId.values());

      // Order: pin Home first, then by explicit order, then by title
      merged = pinHomeFirst(
        merged
          .map((p, idx) => ({ ...p, order: typeof p.order === "number" ? p.order : idx }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );

      // Dedupe by slug (case-insensitive) then by title to avoid duplicates with different ids
      const seen = new Set<string>();
      const normKey = (p: Page) => {
        const slugKey = (p.slug || "").trim().toLowerCase();
        if (slugKey) return `s:${slugKey}`;
        const titleKey = (p.title || "").trim().toLowerCase();
        return `t:${titleKey}`;
      };
      const deduped: Page[] = [];
      for (const p of merged) {
        const key = normKey(p);
        if (key && !seen.has(key)) {
          seen.add(key);
          deduped.push(p);
        }
      }

      // Additional safety: ensure unique ids after content dedupe
      const seenIds = new Set<string>();
      merged = deduped.filter((p) => {
        const id = String(p.id);
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      });

      setPages(merged);

      // Selection policy
      const pid = searchParams?.get("pageId") || readSelMem() || undefined;
      const exists = (id?: string | null) => !!id && merged.some((p) => p.id === id);
      let nextId = exists(pid) ? (pid as string) : exists(selectedPageId) ? (selectedPageId as string) : merged[0]?.id;
      if (!exists(nextId)) nextId = merged[0]?.id;
      if (nextId) selectPage(nextId, { forceLoad: true }, merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const createNewPageDraft = async (title: string) => {
    try {
      const normalizedTitle = title.trim() || "New Page";
      if (normalizedTitle.toLowerCase() === "home") return; // block Home
      const slug = toSlug(normalizedTitle);
      if (slug === "home") return;

      // Ensure unique title among current pages
      const existingTitles = new Set(pages.map((p) => p.title.toLowerCase()));
      let finalTitle = normalizedTitle;
      if (existingTitles.has(finalTitle.toLowerCase())) {
        let i = 2;
        while (existingTitles.has(`${finalTitle} ${i}`.toLowerCase())) i++;
        finalTitle = `${finalTitle} ${i}`;
      }
      const draftId = `${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now()}`;
      // Add header section immediately after creating the page
      const headerSection = {
        id: `${draftId}-header`,
        type: "header",
        name: "Header",
        config: {},
      };
      const draft: Page = {
        id: draftId,
        portfolioId: "draft",
        title: finalTitle,
        slug,
        sections: [headerSection],
        order: pages.length,
      };
      const next = [...pages, draft];
      setPages(next);
      writeDrafts(next.filter((p) => String(p.portfolioId) === "draft"));
      // Immediately select the new page and update the URL
      setSelectedPageId(draftId);
      updateUrlPageId(draftId);
      selectPage(draftId, { forceLoad: true }, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create page");
    }
  };

  const rename = async (id: string, title: string) => {
    const candidate = pages.find((p) => p.id === id);
    if (candidate && isHome(candidate)) return; // protect Home
    try {
      const slug = toSlug(title);
      if (pages.find((p) => p.id === id && String(p.portfolioId) === "draft")) {
        setPages((prev) => {
          const next = prev.map((p) => (p.id === id ? { ...p, title, slug } : p));
          writeDrafts(next.filter((p) => String(p.portfolioId) === "draft"));
          return next;
        });
      } else {
        const updated = await updatePage(String(portfolioId), id, { title, slug });
        if (updated) setPages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rename page");
    }
  };

  const remove = async (id: string) => {
    const candidate = pages.find((p) => p.id === id);
    if (candidate && isHome(candidate)) return; // protect Home

    try {
      const isDraft = candidate ? String(candidate.portfolioId) === "draft" : false;

      if (!isDraft) {
        if (!portfolioId) throw new Error("Cannot delete remote page: missing portfolio id");
        await removePage(String(portfolioId), id);
      }

      let nextSelected: string | null = null;
      setPages((prev) => {
        const next = prev.filter((p) => p.id !== id);
        const idx = prev.findIndex((p) => p.id === id);
        if (idx >= 0) nextSelected = next[idx] ? next[idx].id : next[0]?.id ?? null;
        // persist drafts
        writeDrafts(next.filter((p) => String(p.portfolioId) === "draft"));
        return next;
      });

      if (selectedPageId === id) {
        if (nextSelected) selectPage(nextSelected, { forceLoad: true });
        else {
          setSelectedPageId(null);
          updateUrlPageId(null);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete page");
    }
  };

  const onDragEnd = async (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const clone = [...pages];
    const [item] = clone.splice(oldIndex, 1);
    clone.splice(newIndex, 0, item);
    let reordered = pinHomeFirst(clone).map((p, idx) => ({ ...p, order: idx }));
    setPages(reordered);
    writeDrafts(reordered.filter((p) => String(p.portfolioId) === "draft"));

    for (const p of reordered) {
      if (String(p.portfolioId) === "draft") continue;
      try {
        await updatePage(String(portfolioId), p.id, { order: p.order });
      } catch {
        /* ignore individual failures */
      }
    }
  };

  // Safety: normalize and dedupe pages if any transient duplicates slip in (e.g., during fast tab switches)
  useEffect(() => {
    if (!pages || pages.length <= 1) return;
    try {
      // pin Home first, then stable order
      const ordered = pinHomeFirst(pages.map((p, idx) => ({ ...p, order: typeof p.order === "number" ? p.order : idx })));
      const seenKey = new Set<string>();
      const toKey = (p: Page) => {
        const s = (p.slug || "").trim().toLowerCase();
        if (s) return `s:${s}`;
        return `t:${(p.title || "").trim().toLowerCase()}`;
      };
      const bySlugTitle: Page[] = [];
      for (const p of ordered) {
        const k = toKey(p);
        if (!k || seenKey.has(k)) continue;
        seenKey.add(k);
        bySlugTitle.push(p);
      }
      const seenIds = new Set<string>();
      const uniqueById = bySlugTitle.filter((p) => {
        const id = String(p.id);
        if (seenIds.has(id)) return false;
        seenIds.add(id);
        return true;
      });
      const same = (() => {
        if (uniqueById.length !== pages.length) return false;
        try {
          const a = pages.map((p) => p.id).join("|");
          const b = uniqueById.map((p) => p.id).join("|");
          return a === b;
        } catch {
          return false;
        }
      })();
      if (!same) setPages(uniqueById);
    } catch {
      // ignore
    }
  }, [pages]);

  useEffect(() => {
    if (!selectedPageId) return;
    const handle = setTimeout(() => {
      // Persist full section shape to preserve stable ids between tab switches
      const sectionsPayload = used.map((s: any) => ({ id: s.id, type: s.type, name: s.name, config: s.config }));
      setPages((prev) => {
        const next = prev.map((p) => (p.id === selectedPageId ? { ...p, sections: sectionsPayload } : p));
        writeDrafts(next.filter((p) => String(p.portfolioId) === "draft"));
        return next;
      });
    }, 50);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [used, selectedPageId]);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-description mb-3 uppercase tracking-wider">
          Pages
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2">
            <PagesDialog
              title="New Page"
              content="Give the page a name"
              showInput
              initialValue=""
              trigger={
                <Button className="w-full" variant="grayFill">
                  <Plus className="w-4 h-4 mr-1" /> New Page
                </Button>
              }
              confirmLabel="Create"
              onConfirm={async (val) => {
                const t = (String(val ?? "New Page") || "New Page").trim() || "New Page";
                await createNewPageDraft(t);
              }}
            />
            {isLoading ? (
              <div className="text-xs text-description">Loading pages...</div>
            ) : error ? (
              <div className="text-xs text-red-600">{error}</div>
            ) : pages.length === 0 ? (
              <div className="text-xs text-muted-foreground border border-dashed rounded p-3">No pages yet</div>
            ) : (
              <DndContext
                modifiers={[restrictToVerticalAxis]}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {pages.map((p) => (
                      <SortableRow
                        key={p.id}
                        page={p}
                        active={p.id === selectedPageId}
                        onSelect={() => selectPage(p.id)}
                        onRename={(t) => rename(p.id, t)}
                        onDelete={() => remove(p.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

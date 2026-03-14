"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Layers, Pencil, Trash2, ExternalLink, Plus, Palette, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Skeleton } from "@/components/ui/shadcn_ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/shadcn_ui/dialog";
import { getAllPortfolios, updatePortfolio, deletePortfolio, type Portfolio } from "@/lib/api/portfolios-api/portfolio-endpoints";
import { getPages, type Page } from "@/lib/api/portfolios-api/pages-endpoints";
import { useDashboardContext } from "@/lib/context/DashboardContext";
import { relativeTime } from "@/lib/helpers/relativeTime-helpers";

type ActivityItem = { action: string; target: string; time: string; date: Date };

export default function PortfolioDashboard() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchQuery, setSearchQuery } = useDashboardContext();

  // Edit state
  const [editTarget, setEditTarget] = useState<Portfolio | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const portfoliosData = await getAllPortfolios();
        setPortfolios(portfoliosData);
        if (portfoliosData.length > 0) {
          const pagesResults = await Promise.all(portfoliosData.map((p) => getPages(p.id)));
          setPages(pagesResults.flat());
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const openEdit = (p: Portfolio) => {
    setEditTarget(p);
    setEditSlug(p.slug);
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editTarget || !editSlug.trim()) return;
    setEditError("");
    setIsSaving(true);
    try {
      const updated = await updatePortfolio(editTarget.id, { slug: editSlug.trim() });
      setPortfolios((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditTarget(null);
    } catch {
      setEditError("Failed to update slug. It may already be taken.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePortfolio(deleteTarget.id);
      setPortfolios((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setPages((prev) => prev.filter((pg) => pg.portfolioId !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // silent
    } finally {
      setIsDeleting(false);
    }
  };

  const activity: ActivityItem[] = portfolios
    .flatMap((p): ActivityItem[] => {
      const items: ActivityItem[] = [];
      if (p.createdAt) {
        const d = new Date(p.createdAt);
        items.push({ action: "Portfolio created", target: p.slug, time: relativeTime(d), date: d });
      }
      if (p.updatedAt && p.createdAt && new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime() > 5000) {
        const d = new Date(p.updatedAt);
        items.push({ action: "Portfolio updated", target: p.slug, time: relativeTime(d), date: d });
      }
      return items;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const lastUpdated =
    portfolios.length > 0
      ? portfolios.reduce((latest, p) => (new Date(p.updatedAt ?? 0) > new Date(latest.updatedAt ?? 0) ? p : latest))
      : null;

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h2 className="text-xl font-bold text-title">Portfolios</h2>
        <p className="text-description text-sm mt-0.5">Manage all platform portfolios</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Portfolios", value: portfolios.length, icon: FileText },
          { label: "Total Pages", value: pages.length, icon: Layers },
          {
            label: "Last Updated",
            value: lastUpdated?.updatedAt ? relativeTime(lastUpdated.updatedAt) : "—",
            icon: Clock,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card-bg rounded-base p-4 flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-soft shrink-0">
              <stat.icon className="size-4 text-accent" />
            </div>
            <div>
              <p className="text-description text-xs">{stat.label}</p>
              {isLoading ? (
                <Skeleton className="h-5 w-12 rounded-soft bg-card-main mt-0.5" />
              ) : (
                <p className="text-title font-bold text-lg leading-tight">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio list */}
      <div className="bg-card-bg rounded-base p-5 flex flex-col gap-4">
        <h3 className="text-title font-semibold text-sm uppercase tracking-wide">All Portfolios</h3>
        <div className="relative bg-card-bg rounded-soft">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-description pointer-events-none" />
          <Input
            type="search"
            placeholder="Search portfolios…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card-main rounded-soft focus-visible:ring-accent/40"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-soft bg-card-main" />
            ))}
          </div>
        ) : portfolios.filter((p) => p.slug.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-description text-sm">
              {searchQuery ? `No portfolios matching "${searchQuery}"` : "No portfolios yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {portfolios
              .filter((p) => p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 3)
              .map((p) => {
                const pCount = pages.filter((pg) => pg.portfolioId === p.id).length;
                return (
                  <div key={p.id} className="bg-card-main rounded-soft p-4 flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-soft shrink-0">
                      <FileText className="size-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-title truncate">{p.slug}</p>
                      <p className="text-xs text-description mt-0.5">
                        {pCount} page{pCount !== 1 ? "s" : ""}
                        {p.createdAt && <span className="ml-2 opacity-60">· {relativeTime(p.createdAt)}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button asChild variant="bobble" size="icon" title="Open Studio">
                        <Link href={`/portfolio/studio/${p.id}`}>
                          <Palette className="size-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="bobble" size="icon" title="View portfolio">
                        <Link href={`/portfolio/${p.id}`} target="_blank">
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                      <Button variant="bobble" size="icon" title="Rename" onClick={() => openEdit(p)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="bobble" size="icon" title="Delete" onClick={() => setDeleteTarget(p)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Portfolio Activity */}
      <div className="bg-card-bg rounded-base p-5 flex flex-col gap-4">
        <h3 className="text-title font-semibold text-sm uppercase tracking-wide">Portfolio Activity</h3>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-soft bg-card-main" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-description text-sm text-center py-4">No activity recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-light-border">
            {activity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full bg-accent shrink-0" />
                  <div>
                    <p className="text-sm text-title leading-tight">{item.action}</p>
                    <p className="text-xs text-description mt-0.5">{item.target}</p>
                  </div>
                </div>
                <span className="text-xs text-description shrink-0 ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="bg-card-bg rounded-base">
          <DialogHeader>
            <DialogTitle className="text-title">Rename Portfolio</DialogTitle>
            <DialogDescription>Change the slug for "{editTarget?.slug}"</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              value={editSlug}
              onChange={(e) => {
                setEditSlug(e.target.value);
                setEditError("");
              }}
              placeholder="my-portfolio"
              className="bg-card-main rounded-soft border-0 focus-visible:ring-accent/40 text-title"
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            />
            {editError && <p className="text-error text-xs">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="grayFill" size="small" className="rounded-soft" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="fill"
              size="small"
              className="rounded-soft"
              onClick={handleEdit}
              disabled={isSaving || !editSlug.trim() || editSlug.trim() === editTarget?.slug}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-card-bg rounded-base">
          <DialogHeader>
            <DialogTitle className="text-title">Delete Portfolio</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-title">"{deleteTarget?.slug}"</strong>? This will
              permanently remove all its pages and sections.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="grayFill" size="small" className="rounded-soft" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              className="rounded-soft bg-error hover:opacity-80 text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

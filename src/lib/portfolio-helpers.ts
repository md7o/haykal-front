import { createPortfolio, getAllPortfolios } from "@/api/portfolio-endpoints";

// Extract portfolio owner's user id from various shapes the API might return
export function getOwnerId(p: any): string | null {
  if (!p) return null;
  if (typeof p.userId === "string") return p.userId;
  const u = p.user;
  if (!u) return null;
  if (typeof u === "string") return u;
  if (typeof u === "object" && typeof u.id === "string") return u.id;
  return null;
}

// Find the latest portfolio id for a user (one-to-one in current model)
export async function resolveUserPortfolioId(userId: string): Promise<string | null> {
  const all = await getAllPortfolios();
  const mine = all.filter((p: any) => String(getOwnerId(p)) === String(userId));
  if (!mine.length) return null;
  mine.sort(
    (a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
  );
  return mine[0].id as string;
}

// Ensure a portfolio exists for the user; create if missing and return its id
export async function ensureUserPortfolioId(userId: string): Promise<string> {
  const existing = await resolveUserPortfolioId(userId);
  if (existing) return existing;
  const created = await createPortfolio({ userId });
  return created.id as string;
}

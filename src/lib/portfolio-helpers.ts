import { Portfolio } from "@/api/portfolios-api/portfolio-endpoints";
import { getAllPortfolios } from "@/api/portfolios-api/portfolio-endpoints";
import { createPortfolio } from "@/api/portfolios-api/portfolio-endpoints";
import { getFullPortfolioById } from "@/api/portfolios-api/portfolio-endpoints";
/**
 * Robustly extracts the owner ID from a portfolio-like object.
 * Handles various shapes (flat userId, nested user object) to ensure compatibility.
 */
export function getOwnerId(p: unknown): string | null {
  if (!p || typeof p !== "object") return null;

  const anyP = p as any;

  // Standard property per Portfolio type
  if (typeof anyP.userId === "string") return anyP.userId;

  // Handle potential nested user object (e.g. if API populates user)
  const u = anyP.user;
  if (!u) return null;
  if (typeof u === "string") return u;
  if (typeof u === "object" && typeof u.id === "string") return u.id;

  return null;
}

/**
 * Fetches all portfolios for a specific user, sorted by most recently updated/created.
 * This abstracts the filtering logic and provides a clean list of user's work.
 */
export async function getUserPortfolios(userId: string): Promise<Portfolio[]> {
  try {
    const all = await getAllPortfolios();
    // Filter client-side to find portfolios belonging to this user
    const mine = all.filter((p) => String(getOwnerId(p)) === String(userId));

    // Sort descending by date (newest first)
    return mine.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Failed to fetch user portfolios:", error);
    return [];
  }
}

/**
 * Resolves the ID of the user's primary (latest) portfolio.
 * Useful for single-portfolio workflows.
 */
export async function resolveUserPortfolioId(userId: string): Promise<string | null> {
  const portfolios = await getUserPortfolios(userId);
  return portfolios.length > 0 ? portfolios[0].id : null;
}

/**
 * Ensures a portfolio exists for the user.
 * - If one exists, returns its ID.
 * - If not, creates a new default portfolio and returns the new ID.
 * This is ideal for "Get Started" flows.
 */
export async function ensureUserPortfolioId(userId: string): Promise<string> {
  const existingId = await resolveUserPortfolioId(userId);
  if (existingId) return existingId;

  try {
    const created = await createPortfolio({});
    return created.id;
  } catch (error) {
    throw new Error("Failed to ensure user portfolio: " + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Fetches the full portfolio tree (Portfolio -> Pages -> Sections).
 * This ensures that the portfolio object is fully hydrated with all nested data.
 */
export async function fetchFullPortfolio(id: string): Promise<Portfolio | null> {
  try {
    return await getFullPortfolioById(id);
  } catch (error) {
    console.error("Failed to fetch full portfolio:", error);
    throw error;
  }
}

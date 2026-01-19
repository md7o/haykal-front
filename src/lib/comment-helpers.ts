export type CommentLikeUser = {
  name: string;
  initials: string;
  avatar?: string | null;
};

export function getCommentAuthor(comment: any): CommentLikeUser {
  const membership: any = comment?.membership;
  const user: any = membership?.user ?? comment?.user;

  // Prefer authorName from membership, then fallback to user data (use first non-empty value)
  const nameSource = [membership?.authorName, user?.username].find((n) => typeof n === "string" && n.trim().length > 0);

  const name = (nameSource ?? "Anonymous").trim();

  const initials = String(name)
    .split(" ")
    .map((s) => (s ? s.charAt(0) : ""))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatar = user?.avatarUrl || user?.avatar || null;

  return { name, initials, avatar };
}

export function formatRelative(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

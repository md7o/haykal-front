export type CommunityResourceKind = "file" | "link";

export interface CommunityResource {
  id: string;
  title: string;
  description?: string;
  kind: CommunityResourceKind;
  category: string;
  fileType?: string; // e.g. PDF, ZIP, FIG
  sizeBytes?: number;
  url: string;
  createdAt: string; // ISO
}

export type CommunityEventRsvpStatus = "none" | "going";

export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string; // ISO
  endAt?: string; // ISO
  isOnline?: boolean;
  location?: string;
  rsvpStatus?: CommunityEventRsvpStatus;
}

export type CommunityType =
  | "educational"
  | "athlete"
  | "gaming"
  | "hobby"
  | "local"
  | "creator"
  | "wellness"
  | "financial"
  | "artistic"
  | "technology"
  | "environmental"
  | "scientific"
  | "social"
  | "culinary"
  | "travel"
  | "entertainment"
  | "other";

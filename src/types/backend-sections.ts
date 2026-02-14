/**
 * Backend Section Types
 * These are the exact types expected by the backend API
 */
export enum BackendSectionType {
  Hero = "hero",
  Social = "social",
  Career = "career",
  Text = "text",
  Achievements = "achivments", // Note: backend has typo "achivments"
  Events = "events",
  Business = "business",
}

export type BackendSectionTypeValue = keyof typeof BackendSectionType | ValueOf<typeof BackendSectionType>;

type ValueOf<T> = T[keyof T];

/**
 * Mapping from frontend section type keys to backend section type values
 */
export const sectionTypeMap: Record<string, BackendSectionType> = {
  header: BackendSectionType.Hero,
  hero: BackendSectionType.Hero,
  socialLinks: BackendSectionType.Social,
  social: BackendSectionType.Social,
  career: BackendSectionType.Career,
  text: BackendSectionType.Text,
  achievements: BackendSectionType.Achievements,
  achivments: BackendSectionType.Achievements,
  events: BackendSectionType.Events,
  businessServices: BackendSectionType.Business,
  business: BackendSectionType.Business,
};

/**
 * Get the backend section type for a frontend section type
 */
export function getBackendSectionType(frontendType: string): BackendSectionType {
  const backendType = sectionTypeMap[frontendType];
  if (!backendType) {
    throw new Error(`Unknown section type: ${frontendType}`);
  }
  return backendType;
}

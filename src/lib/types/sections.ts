import { ReactNode } from "react";

export interface SectionDefinition<C extends Record<string, unknown> = Record<string, unknown>> {
  type: string;
  label: string;
  defaultConfig: C;
  Design: (props: { config: C; view?: "desktop" | "mobile" }) => ReactNode;
  Form?: (props: { config: C; onChange: (partial: Partial<C>) => void }) => ReactNode;
  validate?: (config: C) => string[];
}

export interface SectionInstance<C extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  type: string;
  name: string; // cached label for convenience
  config: C;
}

export type AnySectionInstance = SectionInstance<Record<string, unknown>>;

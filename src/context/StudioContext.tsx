"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface StudioSection {
  id: string;
  name: string;
  type: string; // e.g. hero, footer etc.
}

interface StudioContextValue {
  used: StudioSection[];
  available: StudioSection[];
  addSection: (id: string) => void;
  removeSection: (id: string) => void;
  reorderUsed: (from: number, to: number) => void;
  setSections: (payload: { used: StudioSection[]; available: StudioSection[] }) => void;
}

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

export function StudioProvider({ children, initial }: { children: ReactNode; initial?: { used: StudioSection[]; available: StudioSection[] } }) {
  const [used, setUsed] = useState<StudioSection[]>(initial?.used || []);
  const [available, setAvailable] = useState<StudioSection[]>(initial?.available || []);

  const addSection = useCallback((id: string) => {
    setAvailable((prev) => {
      const found = prev.find((p) => p.id === id);
      if (!found) return prev;
      setUsed((u) => [...u, found]);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setUsed((prev) => {
      const found = prev.find((p) => p.id === id);
      if (!found) return prev;
      setAvailable((a) => [...a, found]);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const reorderUsed = useCallback((from: number, to: number) => {
    setUsed((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const clone = [...prev];
      const [item] = clone.splice(from, 1);
      clone.splice(to, 0, item);
      return clone;
    });
  }, []);

  const setSections = useCallback((payload: { used: StudioSection[]; available: StudioSection[] }) => {
    setUsed(payload.used);
    setAvailable(payload.available);
  }, []);

  return (
    <StudioContext.Provider value={{ used, available, addSection, removeSection, reorderUsed, setSections }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}

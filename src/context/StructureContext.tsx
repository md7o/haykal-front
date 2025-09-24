"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type LayoutType = "Landingpage" | "Sections";

type CategoryType = "Personal" | "Business" | "Creator";

type StructureContextType = {
  selectedCategory: CategoryType | null;
  setSelectedCategory: (cat: CategoryType | null) => void;

  selectedLayout: LayoutType | null;
  setSelectedLayout: (layout: LayoutType | null) => void;
};

const StructureContext = createContext<StructureContextType | undefined>(undefined);

export function useStructureContext() {
  const context = useContext(StructureContext);
  if (!context) throw new Error("useStructureContext must be used within a StructureProvider");
  return context;
}

export function StructureProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType | null>(null);

  useEffect(() => {
    const storedCategory = sessionStorage.getItem("selectedCategory") as CategoryType | null;
    const storedLayout = sessionStorage.getItem("selectedLayout") as LayoutType | null;

    if (storedCategory) setSelectedCategory(storedCategory);
    if (storedLayout) setSelectedLayout(storedLayout);
  }, []);

  // Save whenever values change
  useEffect(() => {
    if (selectedCategory) sessionStorage.setItem("selectedCategory", selectedCategory);
    else sessionStorage.removeItem("selectedCategory");
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedLayout) sessionStorage.setItem("selectedLayout", selectedLayout);
    else sessionStorage.removeItem("selectedLayout");
  }, [selectedLayout]);

  return (
    <StructureContext.Provider value={{ selectedCategory, setSelectedCategory, selectedLayout, setSelectedLayout }}>
      {children}
    </StructureContext.Provider>
  );
}

"use client";

import { createContext, useContext, useState } from "react";

type DashboardContextType = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

const DashboardContext = createContext<DashboardContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  return <DashboardContext.Provider value={{ searchQuery, setSearchQuery }}>{children}</DashboardContext.Provider>;
}

export const useDashboardContext = () => useContext(DashboardContext);

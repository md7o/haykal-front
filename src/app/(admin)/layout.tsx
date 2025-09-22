"use client";

import { StudioProvider } from "@/context/StudioContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <StudioProvider>{children}</StudioProvider>;
}

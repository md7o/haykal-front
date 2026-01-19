"use client";

import { RecoveryPasswordProvider } from "@/context/RecoveryPasswordContext";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return <RecoveryPasswordProvider>{children}</RecoveryPasswordProvider>;
}

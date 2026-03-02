"use client";

import { RecoveryPasswordProvider } from "@/lib/context/RecoveryPasswordContext";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return <RecoveryPasswordProvider>{children}</RecoveryPasswordProvider>;
}

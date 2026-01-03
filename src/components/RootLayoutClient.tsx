"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { RecoveryPasswordProvider } from "@/context/RecoveryPasswordContext";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  // Check auth once when app loads
  useEffect(() => {
    checkAuth();
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RecoveryPasswordProvider>{children}</RecoveryPasswordProvider>;
}

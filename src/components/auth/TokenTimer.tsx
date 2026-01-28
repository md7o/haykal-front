"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Displays a countdown timer for access token expiry
 */
export const TokenTimer = () => {
  const accessTokenExpiry = useAuthStore((state) => state.accessTokenExpiry);
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!accessTokenExpiry) {
        setTimeLeft("--:--");
        setIsExpiringSoon(false);
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, accessTokenExpiry - now);

      // Convert to seconds
      const seconds = Math.floor(remaining / 1000);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;

      // Format as MM:SS
      const formatted = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      setTimeLeft(formatted);

      // Warning when less than 30 seconds left
      setIsExpiringSoon(remaining < 30_000);
    }, 1000);

    return () => clearInterval(interval);
  }, [accessTokenExpiry]);

  if (!accessTokenExpiry) return null;

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${
        isExpiringSoon ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-100 text-blue-700"
      }`}
    >
      <span>⏱️</span>
      <span>Token: {timeLeft}</span>
    </div>
  );
};

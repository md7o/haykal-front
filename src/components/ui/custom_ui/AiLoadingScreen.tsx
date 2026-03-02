"use client";

import { useState, useEffect } from "react";

export default function AiLoadingScreen() {
  const messages = ["Thinking…", "Processing request…", "Analyzing input…", "Generating response…", "Working on it…"];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-xs">
      <video autoPlay loop muted playsInline className="w-24  h-24 object-contain animate-pulse">
        <source src="/assets/videos/AiLoading.webm" type="video/webm" />
      </video>
      <span className="text-white text-base transition-all duration-700 ease-in-out opacity-100 animate-pulse">
        {messages[currentMessageIndex]}
      </span>
    </div>
  );
}

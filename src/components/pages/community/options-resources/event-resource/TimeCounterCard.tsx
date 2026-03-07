"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { CommunityItemType } from "@/lib/api/community-api/community-items-endpoints";

interface TimeCounterCardProps {
  events: CommunityItemType[];
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const TimeCounterCard = ({ events }: TimeCounterCardProps) => {
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const nextEvent = events.find((e) => {
    const eventDate = e.metadata?.eventDate ? new Date(e.metadata.eventDate).getTime() : new Date(e.createdAt).getTime();
    return eventDate > Date.now();
  });

  useEffect(() => {
    if (!nextEvent) return;

    const updateCountdown = () => {
      const eventDate = nextEvent.metadata?.eventDate
        ? new Date(nextEvent.metadata.eventDate).getTime()
        : new Date(nextEvent.createdAt).getTime();
      const diff = Math.max(0, eventDate - Date.now());

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  if (!nextEvent)
    return (
      <div className="bg-card-bg rounded-base p-5 text-center">
        <p className="text-description">No upcoming events</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="text-accent" size={20} />
        <p className="text-description text-sm font-medium">Next Event Countdown</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(countdown).map(([label, value]) => (
          <div
            key={label}
            className="bg-card-main rounded-soft p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-2xl sm:text-3xl font-bold text-accent">{String(value).padStart(2, "0")}</p>
            <p className="text-description text-xs sm:text-sm mt-2 uppercase tracking-wide font-semibold">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

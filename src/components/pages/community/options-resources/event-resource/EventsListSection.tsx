"use client";

import { CommunityCard, CommunityCardSkeleton } from "@/components/pages/community/shared/CommunityCard";
import { TimeCounterCard } from "./TimeCounterCard";
import { CalendarDays, MapPin, Link as LinkIcon, CalendarClock, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui-tools/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui-tools/ui/dropdown-menu";
import type { CommunityItemType } from "@/api/community/community-items-endpoints";

interface EventsListSectionProps {
  items: CommunityItemType[];
  loading: boolean;
  isPast?: boolean;
  isOwner?: boolean;
  onEdit?: (event: CommunityItemType) => void;
  onDelete?: (eventId: string) => void;
}

export const EventsListSection = ({ items, loading, isPast = false, isOwner, onEdit, onDelete }: EventsListSectionProps) => {
  const formatEventDateTime = (eventDate?: string | Date): string => {
    if (!eventDate) return "Date TBA";
    const date = new Date(eventDate);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CommunityCardSkeleton key={i} />
        ))}
      </div>
    );

  if (items.length === 0)
    return (
      <div className="bg-card-bg rounded-base p-8 text-center col-span-full">
        {isPast ? (
          <CalendarClock className="w-12 h-12 text-description opacity-70 mx-auto mb-3" />
        ) : (
          <CalendarDays className="w-12 h-12 text-description opacity-70 mx-auto mb-3" />
        )}
        <p className="text-title font-semibold">No events</p>
        <p className="text-description text-sm mt-1">Check back soon for updates.</p>
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 ">
        {items.map((event) => {
          const isOnline = !event.metadata?.eventLocation;
          const locationLabel = isOnline ? "Online" : event.metadata?.eventLocation || "Location TBA";
          const dateTimeLabel = formatEventDateTime(event.metadata?.eventDate);

          return (
            <CommunityCard key={event.id} className="p-4 flex flex-col hover:scale-99 relative">
              {isOwner && (
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="transparent" size="icon">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuGroup>
                        {onEdit && <DropdownMenuItem onClick={() => onEdit(event)}>Edit</DropdownMenuItem>}
                        {onDelete && <DropdownMenuItem onClick={() => onDelete(event.id)}>Delete</DropdownMenuItem>}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              <h3 className="text-xl font-semibold text-title line-clamp-2">{event.title}</h3>
              {event.content && <p className="text-base text-description mt-1 line-clamp-2">{event.content}</p>}

              <div className="flex flex-col items-start gap-3 mt-3 pt-3 border-t border-card-border/40 text-base text-description">
                {!isPast && items.length > 0 && <TimeCounterCard events={items} />}

                <div className={`space-y-2 ${isPast ? "mt-0" : "mt-2"}`}>
                  {/* Calendar */}
                  {event.metadata?.eventDate && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-accent" />
                      <span>{dateTimeLabel}</span>
                    </div>
                  )}
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>{locationLabel}</span>
                  </div>
                  {/* Link */}
                  {event.metadata?.eventLink && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-accent" />
                      <a
                        href={String(event.metadata.eventLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-accent"
                      >
                        Open link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CommunityCard>
          );
        })}
      </div>
    </div>
  );
};

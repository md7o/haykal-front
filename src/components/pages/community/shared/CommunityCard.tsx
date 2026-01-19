"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui-tools/ui/skeleton";

export function CommunityCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-card-bg  rounded-base shadow-sm p-6 transition-all duration-300 ease-in-out", className)} {...props} />
  );
}

export function CommunityCardSkeleton({ withFooter = true }: { withFooter?: boolean }) {
  return (
    <div className="bg-card-main  rounded-base shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-8 w-20 rounded-soft" />
      </div>
      {withFooter && (
        <div className="mt-5 pt-5 flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}
    </div>
  );
}

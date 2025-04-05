"use client";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function EventFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Event Name */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* Client Name */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-2/5" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Location and Date - Two columns on larger screens */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="relative">
            <Skeleton className="h-10 w-full" />
            <div className="absolute right-3 top-2.5">
              <MapPinIcon className="h-5 w-5 text-gray-300" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="relative">
            <Skeleton className="h-10 w-full" />
            <div className="absolute right-3 top-2.5">
              <CalendarIcon className="h-5 w-5 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Target Total Photos */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-full md:w-1/3" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

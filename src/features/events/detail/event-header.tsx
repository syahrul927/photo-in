"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoogleDriveUploader } from "@/features/google-drive";
import { format } from "date-fns";
import { Calendar, MapPin, Share2, Users } from "lucide-react";

interface EventData {
  id: string;
  name: string;
  description?: string;
  location?: string;
  date?: Date;
  categories: string[];
  targetPhotos?: number;
  clientName?: string;
}

interface EventHeaderProps {
  event: EventData;
  photoCount: number;
}

export function EventHeader({ event, photoCount }: EventHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Event Title and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          {event.description && (
            <p className="text-muted-foreground max-w-2xl">{event.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <GoogleDriveUploader eventId={event.id} />
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Event Details */}
      <div className="flex flex-wrap gap-4 text-sm">
        {event.date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(event.date, "PPP")}</span>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
        {event.clientName && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.clientName}</span>
          </div>
        )}
      </div>

      {/* Categories and Stats */}
      <div className="flex flex-wrap items-center gap-4">
        {event.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        )}
        <div className="text-muted-foreground text-sm">
          {photoCount} photo{photoCount !== 1 ? 's' : ''}
          {event.targetPhotos && (
            <span> of {event.targetPhotos} target</span>
          )}
        </div>
      </div>
    </div>
  );
}
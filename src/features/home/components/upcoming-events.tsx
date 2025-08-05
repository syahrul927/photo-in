"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

export function UpcomingEvents() {
  const upcomingEventsQuery = api.event.getUpcomingEvents.useQuery();

  if (upcomingEventsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingEvents = upcomingEventsQuery.data || [];
  const processedEvents = upcomingEvents.slice(0, 3).map((event) => {
    const eventDate = event.dateEvent ? new Date(event.dateEvent) : null;
    let priority = "normal";
    let dateLabel = "";

    if (eventDate) {
      if (isToday(eventDate)) {
        priority = "today";
        dateLabel = "Today";
      } else if (isTomorrow(eventDate)) {
        priority = "tomorrow";
        dateLabel = "Tomorrow";
      } else if (isThisWeek(eventDate)) {
        priority = "this_week";
        dateLabel = `This ${format(eventDate, "EEEE")}`;
      } else {
        dateLabel = format(eventDate, "MMM d");
      }
    }

    return { ...event, dateLabel, priority };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
        <CardDescription>Next 3 scheduled sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processedEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary">
                      {event.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{event.dateLabel}</span>
                      {event.location && (
                        <>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {event.priority === "today" && (
                    <Badge variant="default" className="bg-red-500 text-xs px-1.5 py-0">
                      NOW
                    </Badge>
                  )}
                  {event.priority === "tomorrow" && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      TOM
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
          
          {upcomingEvents.length === 0 && (
            <div className="text-center py-4">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                No upcoming events scheduled
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
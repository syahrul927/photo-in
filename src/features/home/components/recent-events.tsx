"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Camera } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function RecentEvents() {
  const eventsQuery = api.event.getRecentEvents.useQuery();

  if (eventsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Your latest photography sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const events = eventsQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
        <CardDescription>Your latest photography sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events?.map((event) =>(
            <div key={event.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">
                    <Link href={`/events/${event.id}`} className="hover:underline">
                      {event.name}
                    </Link>
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{event.dateEvent ? format(new Date(event.dateEvent), "MMM d, yyyy") : "Date TBD"}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={
                    event.status === "completed" 
                      ? "default" 
                      : event.status === "in-progress" 
                        ? "secondary" 
                        : "outline"
                  }
                >
                  {event.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {event.photoCount || 0} photos
                  </span>
                  {event.targetTotalPhotos && event.targetTotalPhotos > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {event.targetTotalPhotos} target
                    </span>
                  )}
                </div>
                {event.targetTotalPhotos && event.targetTotalPhotos > 0 && (
                  <Progress 
                    value={((event.photoCount || 0) / event.targetTotalPhotos) * 100} 
                    className="h-2" 
                  />
                )}
              </div>

              {event.categories && event.categories.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {event.categories.slice(0, 3).map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {events?.length === 0 && (
            <div className="text-center py-8">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No events yet. Start by creating your first event.
              </p>
              <Button variant="outline" asChild>
                <Link href="/events/create">
                  Create First Event
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
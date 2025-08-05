"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function RecentPhotos() {
  const recentPhotosQuery = api.event.getRecentPhotos.useQuery();

  if (recentPhotosQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Photos</CardTitle>
          <CardDescription>Latest uploads across all events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentPhotos = recentPhotosQuery.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Photos</CardTitle>
        <CardDescription>Latest uploads across all events</CardDescription>
      </CardHeader>
      <CardContent>
        {recentPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentPhotos.slice(0, 12).map((photo) => (
              <Link
                key={photo.id}
                href={`/events/${photo.eventId}`}
                className="group relative aspect-square overflow-hidden rounded-lg border hover:border-primary transition-colors"
              >
                <div style={{ backgroundImage: `url(/api/image/${photo.cloudId})` }} 
                     className="object-cover w-full h-full bg-center bg-cover group-hover:scale-105 transition-transform duration-200"
                     role="img" 
                     aria-label={photo.title || "Photo"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white font-medium truncate">
                      {photo.eventName}
                    </p>
                    <p className="text-[10px] text-white/80">
                      {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No photos uploaded yet. Start by creating an event and uploading photos.
            </p>
            <Button variant="outline" asChild>
              <Link href="/events">
                Upload Your First Photos
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add import for Button
import { Button } from "@/components/ui/button";
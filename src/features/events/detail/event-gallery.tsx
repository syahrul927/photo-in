"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { GalleryControls, SortBy, ViewMode } from "./gallery-controls";
import { PhotoDialog, PhotoFile } from "./photo-dialog";
import { EventHeader } from "./event-header";
import { PhotoGrid } from "./photo-grid";

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

interface EventGalleryProps {
  eventId: string;
}

export function EventGallery({ eventId }: EventGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoFile | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  // Fetch event data
  const { data: event, isLoading: eventLoading } =
    api.event.getEventByEventId.useQuery(eventId);

  // Fetch photos data
  const { data: photosData, isLoading: photosLoading } =
    api.event.getPhotosByEventId.useQuery(eventId);

  const handlePhotoClick = (photo: PhotoFile) => {
    setSelectedPhoto(photo);
    setIsPhotoDialogOpen(true);
  };

  const handleClosePhotoDialog = () => {
    setIsPhotoDialogOpen(false);
    setSelectedPhoto(null);
  };

  // Transform photos data
  const photos: PhotoFile[] =
    photosData?.map((photo) => {
      const metadata = photo.metaData as Record<string, unknown>;
      // Use proxy API endpoint to fetch images
      const proxyImageUrl = `/api/image/${photo.cloudId}`;

      return {
        id: photo.id,
        cloudId: photo.cloudId,
        url: proxyImageUrl,
        thumbnailUrl: proxyImageUrl,
        isSecure: false,
        fileId: null,
        fallbackUrls: [], // Not needed for secure images
        name:
          photo.title ||
          (metadata?.originalName as string) ||
          `Photo ${photo.id}`,
        createdTime: photo.createdAt?.toISOString() || new Date().toISOString(),
        size: (metadata?.sizeBytes as number)?.toString() || "0",
        uploader: photo.uploader,
        metadata: metadata,
      };
    }) || [];

  // Sort photos based on sortBy
  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Transform event data
  const eventData: EventData | null = event
    ? {
      id: eventId,
      name: event.name || "Untitled Event",
      description: event.description,
      location: event.location,
      date: event.date,
      categories: event.categories || [],
      targetPhotos: event.targetPhotos,
      clientName: event.clientName,
    }
    : null;

  if (eventLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-4">
          <div className="bg-muted h-8 w-64 animate-pulse rounded" />
          <div className="bg-muted h-4 w-96 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted aspect-[4/3] animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="text-muted-foreground">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Event Header */}
      <EventHeader event={eventData} photoCount={photos.length} />

      {/* Gallery Controls */}
      <GalleryControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        photoCount={photos.length}
      />

      {/* Photo Grid */}
      {photosLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted aspect-[4/3] animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        <PhotoGrid
          photos={sortedPhotos}
          viewMode={viewMode}
          onPhotoClick={handlePhotoClick}
        />
      )}

      {/* Photo Dialog */}
      <PhotoDialog
        photo={selectedPhoto}
        isOpen={isPhotoDialogOpen}
        onClose={handleClosePhotoDialog}
        eventName={eventData.name}
      />
    </div>
  );
}

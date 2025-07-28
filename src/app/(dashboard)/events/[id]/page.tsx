"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  Eye,
  Filter,
  Grid,
  Heart,
  ImagePlus,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useSecureImage } from "@/hooks/use-secure-image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import {
  generateDirectImageUrl,
  generateThumbnailUrl,
  getImageUrlFromWebContentLink,
} from "@/lib/drive-utils";
import { UploadModal } from "@/components/upload-modal";

const event = {
  id: 1,
  title: "Johnson Wedding",
  date: new Date(2024, 5, 15),
  location: "Grand Plaza Hotel, New York",
  status: "completed",
  totalPhotos: 248,
  uploadProgress: 100,
  contributors: [
    { name: "Bob Wilson", avatar: "/placeholder.svg" },
    { name: "Charlie Brown", avatar: "/placeholder.svg" },
  ],
  type: "Wedding",
  clientName: "Sarah & Mike Johnson",
  description:
    "A beautiful summer wedding celebration capturing precious moments of Sarah and Mike's special day. The event featured an outdoor ceremony and an elegant indoor reception.",
};

const SecureImage = ({
  fileId,
  alt,
  ...props
}: { fileId: string; alt: string } & Omit<ImageProps, "src">) => {
  const { dataUrl, isLoading, error } = useSecureImage(fileId);

  if (isLoading) {
    return (
      <div className="relative h-full w-full">
        <div className="bg-muted absolute inset-0 animate-pulse" />
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div className="relative h-full w-full">
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <ImagePlus className="text-muted-foreground h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={dataUrl}
        alt={alt}
        className="transition-opacity duration-300"
        {...props}
      />
    </div>
  );
};

const ImageWithFallback = ({
  src,
  alt,
  fallbackUrls = [],
  ...props
}: { src: string; alt: string; fallbackUrls?: string[] } & ImageProps) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Create array of all possible sources
  const allSources = [src, ...fallbackUrls, "/placeholder.svg"].filter(
    Boolean,
  ) as string[];
  const currentSrc = allSources[currentSrcIndex] || "/placeholder.svg";

  // Check if this is a direct Google Drive URL (not our secure endpoint)
  const isDirectGoogleDriveUrl =
    currentSrc.includes("drive.google.com") &&
    !currentSrc.includes("/api/secure-image");

  useEffect(() => {
    // Reset states when src changes
    setCurrentSrcIndex(0);
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);

    // Try next fallback URL
    if (currentSrcIndex < allSources.length - 1) {
      setCurrentSrcIndex((prev) => prev + 1);
      setIsLoading(true);
      setError(false);
    } else {
      // All sources failed
      setError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (currentSrcIndex > 0) {
      console.log(
        `Image loaded successfully using fallback ${currentSrcIndex}: ${currentSrc}`,
      );
    }
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && !error && (
        <div className="bg-muted absolute inset-0 animate-pulse" />
      )}
      {error ? (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <ImagePlus className="text-muted-foreground h-8 w-8" />
        </div>
      ) : isDirectGoogleDriveUrl ? (
        // Use regular img tag for direct Google Drive URLs
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`h-full w-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
            }`}
          crossOrigin="anonymous"
        />
      ) : (
        // Use Next.js Image for proxied URLs and other URLs
        <Image
          src={currentSrc}
          alt={alt}
          onLoadingComplete={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
            }`}
          {...props}
        />
      )}
    </div>
  );
};

// Note: Now using tRPC to fetch photos from database instead of Google Drive API

export default function GalleryView() {
  const params = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Use tRPC to fetch event and photos from database
  const { data: eventData, isLoading: eventLoading } =
    api.event.getEventByEventId.useQuery(params?.id ?? "", {
      enabled: !!params?.id,
    });

  const {
    data: photosData,
    isLoading: photosLoading,
    error: queryError,
    refetch: refetchPhotos,
  } = api.event.getPhotosByEventId.useQuery(params?.id ?? "", {
    enabled: !!params?.id,
  });

  const isLoading = eventLoading || photosLoading;

  // Transform database photos to the format expected by the UI
  const photos =
    photosData?.map((photo) => {
      const metadata = photo.metaData as Record<string, unknown>;
      // Check if this is a secure URL
      const isSecureUrl = photo.url.startsWith("secure://");
      const fileId = isSecureUrl ? photo.url.replace("secure://", "") : null;

      return {
        id: photo.cloudId,
        url: photo.url,
        thumbnailUrl: photo.url,
        isSecure: isSecureUrl,
        fileId: fileId,
        fallbackUrls: [], // Not needed for secure images
        name:
          photo.title ||
          (metadata?.originalName as string) ||
          `Photo ${photo.id}`,
        likes: Math.floor(Math.random() * 50), // You can replace this with real data later
        comments: Math.floor(Math.random() * 20), // You can replace this with real data later
        views: Math.floor(Math.random() * 1000), // You can replace this with real data later
        createdTime: photo.createdAt?.toISOString() || new Date().toISOString(),
        size: (metadata?.size as number)?.toString() || "0",
        uploader: photo.uploader,
      };
    }) || [];

  const error = queryError?.message || null;

  // Get the tRPC utils for manual queries
  const utils = api.useUtils();

  // Sync photos mutation
  const handleUploadComplete = () => {
    // Refetch photos after upload
    console.log("Upload completed, refetching photos...");
    refetchPhotos();
  };

  // Create event object for UI compatibility
  const event = eventData
    ? {
      title: eventData.name || "Untitled Event",
      date: eventData.date || new Date(),
      location: eventData.location || "No location specified",
      clientName: eventData.clientName || "No client specified",
      categories: eventData.categories || [],
      type: "Photography Event",
      contributors: [], // You can add this data later
    }
    : null;

  const sampleLoading = () => {
    const sampleToastLoading = toast.loading(`Upload Loading`, {
      description: "Please wait while we upload your photos",
      duration: Infinity,
    });
    setTimeout(() => {
      toast.dismiss(sampleToastLoading);
    }, 3000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Event Header */}
        <div className="border-b">
          <div className="container py-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {event?.title || "Loading..."}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {event?.clientName || "Loading..."}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button onClick={sampleLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Gallery
                </Button>
              </div>
            </div>

            {event && (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>{format(event.date, "PPP")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>{event.contributors.length} Contributors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-500"
                  >
                    {photos.length} Photos
                  </Badge>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Controls */}
        <div>
          <div className="container py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "masonry" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("masonry")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Select defaultValue="all">
                  <SelectTrigger className="hidden w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Photos</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="edited">Edited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {params?.id ? (
                <div className="flex gap-2">
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Upload Photos
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-muted relative aspect-[4/3] w-full animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex min-h-48 items-center justify-center">
              <p className="text-muted-foreground text-center">{error}</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center">
              <p className="text-muted-foreground text-center">
                No photos found in this event folder. Upload some photos to get
                started!
              </p>
            </div>
          ) : (
            <motion.div
              className={`grid gap-4 ${viewMode === "grid"
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-3"
                }`}
            >
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={
                    viewMode === "masonry"
                      ? `${index % 3 === 1 ? "mt-8" : ""}`
                      : ""
                  }
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="group relative cursor-pointer overflow-hidden rounded-lg">
                        <div className="relative aspect-[4/3] w-full">
                          {photo.isSecure && photo.fileId ? (
                            <SecureImage
                              fileId={photo.fileId}
                              alt={photo.name || `Photo ${photo.id}`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              priority={index < 4}
                            />
                          ) : (
                            <ImageWithFallback
                              src={
                                photo.thumbnailUrl ||
                                photo.url ||
                                "/placeholder.svg"
                              }
                              alt={photo.name || `Photo ${photo.id}`}
                              fallbackUrls={photo.fallbackUrls}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              priority={index < 4} // Prioritize loading for first 4 images
                            />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="absolute right-0 bottom-0 left-0 p-4 text-white">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Heart className="mr-1 h-4 w-4" />
                                  <span>{photo.likes}</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageCircle className="mr-1 h-4 w-4" />
                                  <span>{photo.comments}</span>
                                </div>
                                <div className="flex items-center">
                                  <Eye className="mr-1 h-4 w-4" />
                                  <span>{photo.views}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{photo.name}</DialogTitle>
                        <DialogDescription>
                          {photo.name} from {event?.title || "Event"} -{" "}
                          {new Date(photo.createdTime).toLocaleDateString()} -{" "}
                          {Math.round(
                            (parseInt(photo.size || "0") / 1024 / 1024) * 100,
                          ) / 100}{" "}
                          MB
                        </DialogDescription>
                      </DialogHeader>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                        {photo.isSecure && photo.fileId ? (
                          <SecureImage
                            fileId={photo.fileId}
                            alt={photo.name || `Photo ${photo.id}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1200px) 100vw, 1200px"
                            priority
                          />
                        ) : (
                          <ImageWithFallback
                            src={photo.url || "/placeholder.svg"}
                            alt={photo.name || `Photo ${photo.id}`}
                            fallbackUrls={photo.fallbackUrls}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1200px) 100vw, 1200px"
                            priority
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Heart className="mr-1 h-4 w-4" />
                            <span>{photo.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="mr-1 h-4 w-4" />
                            <span>{photo.comments}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="mr-1 h-4 w-4" />
                            <span>{photo.views}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {params?.id && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          eventId={params.id}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

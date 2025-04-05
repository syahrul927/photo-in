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
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

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

const ImageWithFallback = ({
  src,
  alt,
  ...props
}: { src: string; alt: string } & ImageProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);
    setImgSrc(src);
  }, [src]);

  return (
    <div className="relative h-full w-full">
      {isLoading && !error && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">
            Failed to load image
          </span>
        </div>
      ) : (
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
            // Fallback to placeholder if image fails to load
            setImgSrc("/placeholder.svg");
          }}
          className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
            }`}
          {...props}
        />
      )}
    </div>
  );
};

// Generate photos array with your API URLs
const generatePhotos = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    // Replace this URL with your actual API URL
    url: `https://picsum.photos/${600 + (i % 3) * 100}/${800 + (i % 2) * 100}`,
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 1000),
  }));

export default function GalleryView() {
  const [photos, setPhotos] = useState<
    Array<{
      id: number;
      url: string;
      likes: number;
      comments: number;
      views: number;
    }>
  >([]);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");

  useEffect(() => {
    // Initialize photos
    setPhotos(generatePhotos(48));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Event Header */}
        <div className="border-b">
          <div className="container py-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {event.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {event.clientName}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Gallery
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(event.date, "PPP")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.contributors.length} Contributors</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-500"
                >
                  {event.totalPhotos} Photos
                </Badge>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            </div>
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
              <Button>
                <ImagePlus className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="container py-8">
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
                        <ImageWithFallback
                          src={photo.url || "/placeholder.svg"}
                          alt={`Photo ${photo.id}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          priority={index < 4} // Prioritize loading for first 4 images
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
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
                      <DialogTitle>Photo View</DialogTitle>
                      <DialogDescription>
                        Photo {photo.id} from {event.title}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={photo.url || "/placeholder.svg"}
                        alt={`Photo ${photo.id}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        priority
                      />
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
        </div>
      </div>
    </div>
  );
}

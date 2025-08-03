"use client";

import { ImageWithFallback, SecureImage } from "@/components/ui/images";
import { motion } from "framer-motion";
import { PhotoFile } from "./photo-dialog";
import { ViewMode } from "./gallery-controls";

interface PhotoGridProps {
  photos: PhotoFile[];
  viewMode: ViewMode;
  onPhotoClick: (photo: PhotoFile) => void;
}

export function PhotoGrid({ photos, viewMode, onPhotoClick }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">No photos yet</p>
          <p className="text-muted-foreground text-sm">
            Upload some photos to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={
        viewMode === "masonry"
          ? "columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={
            viewMode === "masonry" ? `${index % 3 === 1 ? "mt-8" : ""}` : ""
          }
        >
          <div
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            onClick={() => onPhotoClick(photo)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPhotoClick(photo);
              }
            }}
          >
            <div className="relative aspect-[4/3] w-full">
              <ImageWithFallback
                src={photo.url}
                alt={photo.name || `Photo ${photo.id}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={index < 4}
              />
            </div>

            {/* Photo Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute right-0 bottom-0 left-0 p-4 text-white">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs opacity-75">{photo.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

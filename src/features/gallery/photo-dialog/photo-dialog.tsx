"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useSecureImage } from "@/hooks/use-secure-image";

export interface PhotoFile {
  id: string;
  cloudId: string;
  url: string;
  name: string;
  size: string;
  createdTime: string;
  isSecure: boolean;
  fileId: string | null;
  metadata?: Record<string, unknown>;
}

interface PhotoImageProps {
  fileId: string;
  alt: string;
  priority?: boolean;
}

const SecureImage = ({ fileId, alt, priority }: PhotoImageProps) => {
  const { dataUrl, isLoading, error } = useSecureImage(fileId);

  if (isLoading) {
    return (
      <div className="relative h-full w-full">
        <div className="bg-muted absolute inset-0 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div className="relative h-full w-full">
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <Download className="text-muted-foreground h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={dataUrl}
      alt={alt}
      fill
      className="object-contain"
      sizes="80vw"
      priority={priority}
    />
  );
};

const ImageWithFallback = ({
  src,
  alt,
  priority,
}: PhotoImageProps & { src: string }) => {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain"
      sizes="80vw"
      priority={priority}
    />
  );
};

export interface PhotoDialogProps {
  photo: PhotoFile | null;
  isOpen: boolean;
  onClose: () => void;
  eventName?: string;
}

export function PhotoDialog({
  photo,
  isOpen,
  onClose,
  eventName,
}: PhotoDialogProps) {
  if (!photo) return null;

  const formatFileSize = (sizeStr: string) => {
    const bytes = parseInt(sizeStr || "0");
    if (isNaN(bytes)) return "0.00 MB";
    return (Math.round((bytes / 1024 / 1024) * 100) / 100).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour12: false,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] w-full sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{photo.name}</DialogTitle>
          <DialogDescription className="text-sm">
            {formatDate(photo.createdTime)} - From {eventName || "Event"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[calc(95vh-120px)] flex-col gap-6 md:flex-row">
          <div className="min-h-0 flex-1">
            <div className="bg-muted relative h-[60vh] w-full overflow-hidden rounded-lg">
              {photo.isSecure && photo.fileId ? (
                <SecureImage fileId={photo.fileId} alt={photo.name} priority />
              ) : (
                <ImageWithFallback
                  fileId={photo.id}
                  src={photo.url}
                  alt={photo.name}
                  priority
                />
              )}
            </div>
          </div>

          <div className="w-full space-y-4 md:w-64">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Details</h3>
              <div className="text-muted-foreground space-y-2 text-sm">
                <div className="flex min-w-0 justify-between">
                  <span className="flex-shrink-0 pr-2">File name:</span>
                  <span className="text-foreground truncate text-right">
                    {photo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-foreground">
                    {formatFileSize(photo.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upload date:</span>
                  <span className="text-foreground">
                    {formatDate(photo.createdTime)}
                  </span>
                </div>
                {(photo.metadata?.mimeType as string) && (
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-foreground">
                      {String(photo.metadata?.mimeType)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="flex w-full items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

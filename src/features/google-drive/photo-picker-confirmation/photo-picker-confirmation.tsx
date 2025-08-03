"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { IconCheck, IconX, IconPhoto } from "@tabler/icons-react";

interface PickedPhoto {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  embedUrl?: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  description?: string;
  type?: string;
  rotation?: number;
  rotationDegree?: number;
  parentId?: string;
  isShared?: boolean;
}

interface PhotoPickerConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  pickedPhotos: PickedPhoto[];
  onSuccess?: () => void;
}

export function PhotoPickerConfirmation({
  isOpen,
  onClose,
  eventId,
  pickedPhotos,
  onSuccess,
}: PhotoPickerConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get existing photos for this event
  const { data: existingPhotos = [] } = api.event.getPhotosByEventId.useQuery(
    eventId,
    { enabled: isOpen }
  );

  const createPhotosMutation = api.event.createPhotos.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save photos");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Filter only image files
  const imageFiles = pickedPhotos.filter(photo => 
    photo.mimeType.startsWith('image/')
  );

  // Check which photos already exist
  const existingCloudIds = new Set(existingPhotos.map(p => p.cloudId));
  const newPhotos = imageFiles.filter(photo => !existingCloudIds.has(photo.id));
  const existingSelectedPhotos = imageFiles.filter(photo => existingCloudIds.has(photo.id));

  const handleConfirm = async () => {
    if (imageFiles.length === 0) {
      toast.error("No valid image files selected");
      return;
    }

    setIsSubmitting(true);
    createPhotosMutation.mutate({
      eventId,
      photos: imageFiles,
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPhoto className="h-5 w-5" />
            Confirm Photo Selection
          </DialogTitle>
          <DialogDescription>
            Review the selected photos before adding them to your event.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex gap-4 text-sm">
              <Badge variant="secondary" className="flex items-center gap-1">
                <IconCheck className="h-3 w-3" />
                {newPhotos.length} New
              </Badge>
              {existingSelectedPhotos.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {existingSelectedPhotos.length} Already Exists
                </Badge>
              )}
              {pickedPhotos.length - imageFiles.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <IconX className="h-3 w-3" />
                  {pickedPhotos.length - imageFiles.length} Non-Images
                </Badge>
              )}
            </div>

            {/* New Photos Section */}
            {newPhotos.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                  New Photos ({newPhotos.length})
                </h4>
                <div className="space-y-2 border-l-2 border-green-500 pl-4">
                  {newPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{photo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {photo.mimeType} • {formatFileSize(photo.sizeBytes)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Photos Section */}
            {existingSelectedPhotos.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">
                    Already in Event ({existingSelectedPhotos.length})
                  </h4>
                  <div className="space-y-2 border-l-2 border-orange-500 pl-4">
                    {existingSelectedPhotos.map((photo) => (
                      <div key={photo.id} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{photo.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {photo.mimeType} • {formatFileSize(photo.sizeBytes)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">Exists</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Non-Image Files Section */}
            {pickedPhotos.length - imageFiles.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
                    Skipped Files ({pickedPhotos.length - imageFiles.length})
                  </h4>
                  <div className="space-y-2 border-l-2 border-red-500 pl-4">
                    {pickedPhotos
                      .filter(photo => !photo.mimeType.startsWith('image/'))
                      .map((photo) => (
                        <div key={photo.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{photo.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {photo.mimeType} • {formatFileSize(photo.sizeBytes)}
                            </p>
                          </div>
                          <Badge variant="destructive" className="text-xs">Not Image</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || newPhotos.length === 0}
            isLoading={isSubmitting}
          >
            {newPhotos.length === 0 
              ? "No New Photos" 
              : `Add ${newPhotos.length} Photo${newPhotos.length === 1 ? '' : 's'}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
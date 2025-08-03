"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { IconBrandGoogleDrive } from "@tabler/icons-react";
import { useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import { PhotoPickerConfirmation } from "../photo-picker-confirmation";

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

export const GoogleDriveUploader = ({ eventId }: { eventId: string }) => {
  const [openPicker] = useDrivePicker();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pickedPhotos, setPickedPhotos] = useState<PickedPhoto[]>([]);

  const { data, isLoading } =
    api.event.getGoogleDriveAuthToken.useQuery(eventId);
  const utils = api.useUtils();

  const handleOpenPicker = () => {
    openPicker({
      clientId: data?.clientId ?? "",
      developerKey: data?.developerKey ?? "",
      token: data?.token ?? "",
      showUploadView: true,
      setParentFolder: data?.folderId,
      viewId: "DOCS",
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        console.log("Picker data:", data);
        if (data.action === "cancel") {
          console.log("User clicked cancel/close button");
        }
        if (data.action === "picked") {
          console.log("User picked files:", data.docs);
          setPickedPhotos(data.docs);
          setShowConfirmation(true);
        }
      },
    });
  };

  const handleConfirmationSuccess = () => {
    // Refresh the photos list after successful upload
    void utils.event.getPhotosByEventId.invalidate(eventId);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setPickedPhotos([]);
  };

  return (
    <>
      <Button
        onClick={handleOpenPicker}
        disabled={!data?.token}
        isLoading={isLoading}
      >
        <IconBrandGoogleDrive />
        Upload Photo
      </Button>

      <PhotoPickerConfirmation
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        eventId={eventId}
        pickedPhotos={pickedPhotos}
        onSuccess={handleConfirmationSuccess}
      />
    </>
  );
};

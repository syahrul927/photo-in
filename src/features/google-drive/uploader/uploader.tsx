"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { IconBrandGoogleDrive } from "@tabler/icons-react";
import { useEffect } from "react";
import useDrivePicker from "react-google-drive-picker";

export const GoogleDriveUploader = ({ eventId }: { eventId: string }) => {
  const [openPicker] = useDrivePicker();
  const { data, isLoading } =
    api.event.getGoogleDriveAuthToken.useQuery(eventId);
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
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        console.log("data", data);
        if (data.action === "cancel") {
          console.log("User clicked cancel/close button");
        }
        if (data.action === "picked") {
          // TODO: handling after pick the photos
        }
      },
    });
  };
  useEffect(() => {
    if (data) {
      console.log("response: ", data);
    }
  }, [data]);

  return (
    <Button
      onClick={handleOpenPicker}
      disabled={!data?.token}
      isLoading={isLoading}
    >
      <IconBrandGoogleDrive />
      Upload Photo
    </Button>
  );
};

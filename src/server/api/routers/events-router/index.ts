import { createTRPCRouter } from "../../trpc";
import { updateStatusEvent, upsertEvent, syncPhotosFromDrive } from "./mutation";
import { getEventByEventId, getEventsByWorkspace, getPhotosByEventId, getDriveFolderUrl, getSecureImageUrl } from "./query";

export const eventRouter = createTRPCRouter({
  updateStatusEvent,
  upsertEvent,
  syncPhotosFromDrive,
  getEventsByWorkspace,
  getEventByEventId,
  getPhotosByEventId,
  getDriveFolderUrl,
  getSecureImageUrl,
});

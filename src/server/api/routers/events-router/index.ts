import { createTRPCRouter } from "../../trpc";
import { updateStatusEvent, upsertEvent, createPhotos } from "./mutation";
import {
  getEventByEventId,
  getEventsByWorkspace,
  getGoogleDriveAuthToken,
  getPhotosByEventId,
  getSecureImageUrl,
} from "./query";

export const eventRouter = createTRPCRouter({
  updateStatusEvent,
  upsertEvent,
  createPhotos,
  getEventsByWorkspace,
  getEventByEventId,
  getPhotosByEventId,
  getSecureImageUrl,
  getGoogleDriveAuthToken,
});

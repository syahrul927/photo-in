import { createTRPCRouter } from "../../trpc";
import { updateStatusEvent, upsertEvent } from "./mutation";
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
  getEventsByWorkspace,
  getEventByEventId,
  getPhotosByEventId,
  getSecureImageUrl,
  getGoogleDriveAuthToken,
});

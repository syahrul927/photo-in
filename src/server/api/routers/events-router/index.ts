import { createTRPCRouter } from "../../trpc";
import { updateStatusEvent, upsertEvent, createPhotos } from "./mutation";
import {
  getEventByEventId,
  getEventsByWorkspace,
  getGoogleDriveAuthToken,
  getOverviewStats,
  getPhotosByEventId,
  getRecentEvents,
  getRecentPhotos,
  getSecureImageUrl,
  getUpcomingEvents,
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
  getOverviewStats,
  getRecentEvents,
  getRecentPhotos,
  getUpcomingEvents,
});

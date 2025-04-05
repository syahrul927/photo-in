import { createTRPCRouter } from "../../trpc";
import { updateStatusEvent, upsertEvent } from "./mutation";
import { getEventByEventId, getEventsByWorkspace } from "./query";

export const eventRouter = createTRPCRouter({
  updateStatusEvent,
  upsertEvent,
  getEventsByWorkspace,
  getEventByEventId,
});

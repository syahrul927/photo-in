import { protectedProcedure } from "@/server/api/trpc";
import { event, photo, user } from "@/server/db/schemas";
import { EventStatusType } from "@/types/event-status";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

export const getEventsByWorkspace = protectedProcedure.query(
  async ({ ctx }) => {
    const { db, session } = ctx;
    const { currentWorkspace } = session;

    const events = await db
      .select()
      .from(event)
      .where(eq(event.workspaceId, currentWorkspace.workspaceId))
      .orderBy(desc(event.createdAt));

    return events.map((e) => ({
      ...e,
      status: e.status as EventStatusType,
      dateEvent: e.dateEvent ? new Date(e.dateEvent) : null,
      categories: JSON.parse(e.categories) as string[],
    }));
  },
);

export const getEventByEventId = protectedProcedure
  .input(z.string())
  .query(async ({ ctx: { db, session }, input: eventId }) => {
    const { currentWorkspace } = session;
    const selected = await db.query.event.findFirst({
      where: and(
        eq(event.id, eventId),
        eq(event.workspaceId, currentWorkspace.workspaceId),
      ),
    });
    if (!selected) return null;
    return {
      id: selected.id,
      name: selected.name ?? undefined,
      description: selected.description ?? undefined,
      clientName: selected.clientName ?? undefined,
      location: selected.location ?? undefined,
      date: selected.dateEvent ? new Date(selected.dateEvent) : undefined,
      categories: JSON.parse(selected.categories) as string[],
      targetPhotos: selected.targetTotalPhotos
        ? Number(selected.targetTotalPhotos)
        : undefined,
    };
  });

export const getPhotosByEventId = protectedProcedure
  .input(z.string())
  .query(async ({ ctx: { db, session }, input: eventId }) => {
    const { currentWorkspace } = session;

    // First verify the event belongs to the current workspace
    const eventExists = await db.query.event.findFirst({
      where: and(
        eq(event.id, eventId),
        eq(event.workspaceId, currentWorkspace.workspaceId),
      ),
    });

    if (!eventExists) return [];

    // Get photos for the event with uploader information
    const photos = await db
      .select({
        id: photo.id,
        cloudId: photo.cloudId,
        title: photo.title,
        description: photo.description,
        url: photo.url,
        metaData: photo.metaData,
        createdAt: photo.createdAt,
        uploader: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(photo)
      .leftJoin(user, eq(photo.uploadedBy, user.id))
      .where(eq(photo.eventId, eventId))
      .orderBy(desc(photo.createdAt));

    return photos.map((p) => ({
      id: p.id,
      cloudId: p.cloudId,
      title: p.title,
      description: p.description,
      url: p.url,
      metaData: p.metaData ? JSON.parse(p.metaData) : null,
      createdAt: p.createdAt ? new Date(p.createdAt) : null,
      uploader: p.uploader,
    }));
  });

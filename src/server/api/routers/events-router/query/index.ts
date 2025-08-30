import { env } from "@/env";
import { getAccessToken, getOAuth2Client } from "@/lib/google-service-account";
import { protectedProcedure } from "@/server/api/trpc";
import { event, photo, user } from "@/server/db/schemas";
import { type EventStatusType } from "@/types/event-status";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { google } from "googleapis";
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

    // Get photos for the event with uploader information (exclude deleted photos)
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
      .where(and(eq(photo.eventId, eventId), eq(photo.deleted, false)))
      .orderBy(desc(photo.createdAt));

    return photos.map((p) => ({
      id: p.id,
      cloudId: p.cloudId,
      title: p.title,
      description: p.description,
      url: p.url,
      metaData: p.metaData ? JSON.parse(p.metaData) : null, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      createdAt: p.createdAt ? new Date(p.createdAt) : null,
      uploader: p.uploader,
    }));
  });

export const getSecureImageUrl = protectedProcedure
  .input(z.string())
  .query(async ({ input: fileId }) => {
    try {
      // Use OAuth authentication to download file directly
      const auth = await getOAuth2Client();
      const drive = google.drive({ version: "v3", auth });

      // Download file content directly (skip validation since we trust our database)
      const fileContent = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        {
          responseType: "arraybuffer",
        },
      );

      // Convert to base64 data URL (assume JPEG for now, could be enhanced later)
      const buffer = Buffer.from(fileContent.data as ArrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      return {
        dataUrl,
        fileName: `image-${fileId}`,
        mimeType: "image/jpeg",
      };
    } catch (error) {
      console.error("Get secure image URL error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to get secure image",
      });
    }
  });
export const getGoogleDriveAuthToken = protectedProcedure
  .input(z.string())
  .query(async ({ ctx, input: eventId }) => {
    const selectedEvent = await ctx.db.query.event.findFirst({
      where: eq(event.id, eventId),
    });
    if (!selectedEvent) return;
    try {
      const clientId = env.GOOGLE_CLIENT_ID;
      const developerKey = env.GOOGLE_DEVELOPER_KEY;
      const token = await getAccessToken();
      return {
        clientId,
        developerKey,
        token,
        folderId: selectedEvent.folderId,
      };
    } catch (e) {
      console.error("Failed to get Google Drive auth token:", e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          e instanceof Error
            ? e.message
            : "Failed to get Google Drive auth token",
        cause: e,
      });
    }
  });

export const getOverviewStats = protectedProcedure.query(async ({ ctx }) => {
  const { db, session } = ctx;
  const { currentWorkspace } = session;

  const [
    totalEventsResult,
    totalPhotosResult,
    inProgressEventsResult,
    upcomingEventsResult,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(event)
      .where(eq(event.workspaceId, currentWorkspace.workspaceId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(photo)
      .innerJoin(event, eq(photo.eventId, event.id))
      .where(
        and(
          eq(event.workspaceId, currentWorkspace.workspaceId),
          eq(photo.deleted, false),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(event)
      .where(
        and(
          eq(event.workspaceId, currentWorkspace.workspaceId),
          eq(event.status, "in-progress"),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(event)
      .where(
        and(
          eq(event.workspaceId, currentWorkspace.workspaceId),
          eq(event.status, "upcoming"),
        ),
      ),
  ]);

  return {
    totalEvents: Number(totalEventsResult[0]?.count || 0),
    totalPhotos: Number(totalPhotosResult[0]?.count || 0),
    inProgressEvents: Number(inProgressEventsResult[0]?.count || 0),
    upcomingEvents: Number(upcomingEventsResult[0]?.count || 0),
  };
});

export const getRecentEvents = protectedProcedure.query(async ({ ctx }) => {
  const { db, session } = ctx;
  const { currentWorkspace } = session;

  const events = await db
    .select({
      id: event.id,
      name: event.name,
      clientName: event.clientName,
      location: event.location,
      dateEvent: event.dateEvent,
      status: event.status,
      categories: event.categories,
      targetTotalPhotos: event.targetTotalPhotos,
      photoCount: sql<number>`count(${photo.id})`,
    })
    .from(event)
    .leftJoin(photo, and(eq(event.id, photo.eventId), eq(photo.deleted, false)))
    .where(eq(event.workspaceId, currentWorkspace.workspaceId))
    .groupBy(
      event.id,
      event.name,
      event.clientName,
      event.location,
      event.dateEvent,
      event.status,
      event.categories,
      event.targetTotalPhotos,
    )
    .orderBy(desc(event.createdAt))
    .limit(5);

  return events.map((e) => ({
    id: e.id,
    name: e.name,
    clientName: e.clientName,
    location: e.location,
    dateEvent: e.dateEvent ? new Date(e.dateEvent) : null,
    status: e.status,
    categories: JSON.parse(e.categories) as string[],
    targetTotalPhotos: e.targetTotalPhotos ? Number(e.targetTotalPhotos) : null,
    photoCount: Number(e.photoCount || 0),
  }));
});

export const getUpcomingEvents = protectedProcedure.query(async ({ ctx }) => {
  const { db, session } = ctx;
  const { currentWorkspace } = session;

  const events = await db
    .select({
      id: event.id,
      name: event.name,
      location: event.location,
      dateEvent: event.dateEvent,
    })
    .from(event)
    .where(
      and(
        eq(event.workspaceId, currentWorkspace.workspaceId),
        eq(event.status, "upcoming"),
      ),
    )
    .orderBy(event.dateEvent)
    .limit(5);

  return events.map((e) => ({
    id: e.id,
    name: e.name,
    location: e.location,
    dateEvent: e.dateEvent ? new Date(e.dateEvent) : null,
  }));
});

export const getRecentPhotos = protectedProcedure.query(async ({ ctx }) => {
  const { db, session } = ctx;
  const { currentWorkspace } = session;

  const photos = await db
    .select({
      id: photo.id,
      cloudId: photo.cloudId,
      title: photo.title,
      eventId: event.id,
      eventName: event.name,
      createdAt: photo.createdAt,
    })
    .from(photo)
    .innerJoin(event, eq(photo.eventId, event.id))
    .where(
      and(
        eq(event.workspaceId, currentWorkspace.workspaceId),
        eq(photo.deleted, false),
      ),
    )
    .orderBy(desc(photo.createdAt))
    .limit(12);

  return photos.map((p) => ({
    id: p.id,
    cloudId: p.cloudId,
    title: p.title,
    eventId: p.eventId,
    eventName: p.eventName,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
  }));
});

// Add the SQL import

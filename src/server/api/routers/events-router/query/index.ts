import { protectedProcedure } from "@/server/api/trpc";
import { event, photo, user } from "@/server/db/schemas";
import { EventStatusType } from "@/types/event-status";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { google } from "googleapis";
import { getOAuthAuth } from "@/lib/google-oauth";

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
      metaData: p.metaData ? JSON.parse(p.metaData) : null,
      createdAt: p.createdAt ? new Date(p.createdAt) : null,
      uploader: p.uploader,
    }));
  });

export const getSecureImageUrl = protectedProcedure
  .input(z.string())
  .query(async ({ ctx: { db, session }, input: fileId }) => {
    const { currentWorkspace } = session;

    try {
      // Verify the file belongs to a photo in the current workspace
      const photoExists = await db
        .select({
          id: photo.id,
          eventId: photo.eventId,
          workspaceId: event.workspaceId,
        })
        .from(photo)
        .leftJoin(event, eq(photo.eventId, event.id))
        .where(
          and(
            eq(photo.cloudId, fileId),
            eq(photo.deleted, false),
            eq(event.workspaceId, currentWorkspace.workspaceId),
          ),
        )
        .limit(1);

      if (!photoExists || photoExists.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found or access denied",
        });
      }

      // Use OAuth authentication instead of service account
      const auth = getOAuthAuth();
      const drive = google.drive({ version: "v3", auth });

      // Get the file metadata
      const fileMetadata = await drive.files.get({
        fileId: fileId,
        fields: "name,mimeType,webContentLink,webViewLink",
      });

      if (!fileMetadata.data.mimeType?.startsWith("image/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File is not an image",
        });
      }

      // Return a data URL by fetching the file content
      const fileContent = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        {
          responseType: "arraybuffer",
        },
      );

      // Convert to base64 data URL
      const buffer = Buffer.from(fileContent.data as ArrayBuffer);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${fileMetadata.data.mimeType};base64,${base64}`;

      return {
        dataUrl,
        fileName: fileMetadata.data.name,
        mimeType: fileMetadata.data.mimeType,
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

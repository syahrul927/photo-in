import { protectedProcedure } from "@/server/api/trpc";
import { event, photo } from "@/server/db/schemas";
import { toISOString } from "@/server/db/transformers/database-utils";
import { createInsertEventSchema } from "@/server/db/transformers/event";
import { and, eq } from "drizzle-orm";
import { inputUpdateStatusEvent, inputUpsertEvent } from "./type";
import { TRPCError } from "@trpc/server";
import { createEventFolder } from "@/lib/drive-uploader-parallel";
import { z } from "zod";
import { env } from "@/env";
import { google } from "googleapis";
import { getOAuthAuth } from "@/lib/google-oauth";

export const updateStatusEvent = protectedProcedure
  .input(inputUpdateStatusEvent)
  .mutation(async ({ ctx, input }) => {
    const { db, session } = ctx;
    const { currentWorkspace } = session;
    const existingEvent = await db.query.event.findFirst({
      where: and(
        eq(event.id, input.id),
        eq(event.workspaceId, currentWorkspace.workspaceId),
      ),
    });
    if (!existingEvent) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid Event",
      });
    }
    await db
      .update(event)
      .set({ status: input.status, updatedAt: toISOString(new Date()) })
      .where(eq(event.id, input.id))
      .returning();
  });
export const upsertEvent = protectedProcedure
  .input(inputUpsertEvent)
  .mutation(async ({ ctx, input }) => {
    const { db, session } = ctx;
    const { currentWorkspace } = session;

    const eventData = createInsertEventSchema({
      ...input,
      workspaceId: currentWorkspace.workspaceId,
    });
    if (input.id) {
      const existingEvent = await db.query.event.findFirst({
        where: and(
          eq(event.id, input.id),
          eq(event.workspaceId, currentWorkspace.workspaceId),
        ),
      });

      if (!existingEvent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Event",
        });
      }

      // Update existing event
      const [updatedEvent] = await db
        .update(event)
        .set({ ...eventData, updatedAt: toISOString(new Date()) })
        .where(eq(event.id, input.id))
        .returning();

      return updatedEvent;
    }

    // Create new event
    const [newEvent] = await db
      .insert(event)
      .values({
        ...eventData,
        workspaceId: currentWorkspace.workspaceId,
        createdAt: toISOString(new Date()),
      })
      .returning();

    if (!newEvent) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create event",
      });
    }

    // Pre-create Google Drive folder for the event
    try {
      await createEventFolder(newEvent.id);
      console.log(`Created Google Drive folder for event: ${newEvent.id}`);
    } catch (error) {
      console.warn(`Failed to create Google Drive folder for event ${newEvent.id}:`, error);
      // Don't fail the event creation if folder creation fails
    }

    return newEvent;
  });

const UPLOAD_FOLDER_ID = env.GOOGLE_DRIVE_FOLDER;

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
}


async function getEventFolderId(
  auth: any,
  eventId: string,
): Promise<string | null> {
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${UPLOAD_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${eventId}' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  const folder = response.data.files?.[0];
  return folder?.id || null;
}

async function getImagesFromDriveFolder(
  auth: any,
  folderId: string,
): Promise<GoogleDriveFile[]> {
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
    fields: "files(id, name, mimeType, size, createdTime)",
    spaces: "drive",
    pageSize: 1000, // Max allowed
  });

  return (response.data.files || []) as GoogleDriveFile[];
}

export const syncPhotosFromDrive = protectedProcedure
  .input(z.string())
  .mutation(async ({ ctx: { db, session }, input: eventId }) => {
    const { currentWorkspace } = session;

    // First verify the event belongs to the current workspace
    const eventExists = await db.query.event.findFirst({
      where: and(
        eq(event.id, eventId),
        eq(event.workspaceId, currentWorkspace.workspaceId),
      ),
    });

    if (!eventExists) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found",
      });
    }

    try {
      // Use OAuth authentication instead of service account
      const auth = getOAuthAuth();

      // Get event folder ID
      const folderId = await getEventFolderId(auth, eventId);
      if (!folderId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event folder not found in Google Drive",
        });
      }

      // Get all images from Drive folder
      const driveImages = await getImagesFromDriveFolder(auth, folderId);

      // No need to make files public - we'll serve them securely through our API

      // Get existing photos from database
      const existingPhotos = await db
        .select()
        .from(photo)
        .where(eq(photo.eventId, eventId));

      // Create maps for easier comparison
      const driveImageMap = new Map(driveImages.map(img => [img.id, img]));
      const dbPhotoMap = new Map(existingPhotos.map(p => [p.cloudId, p]));

      // Track changes
      const newPhotos: any[] = [];
      const deletedPhotoIds: string[] = [];

      // Find new images in Drive that aren't in DB
      for (const driveImage of driveImages) {
        if (!dbPhotoMap.has(driveImage.id)) {
          const photoMetadata = {
            eventId: eventId,
            cloudId: driveImage.id,
            title: driveImage.name,
            metaData: JSON.stringify({
              originalName: driveImage.name,
              mimeType: driveImage.mimeType,
              size: driveImage.size,
              uploadedAt: driveImage.createdTime,
              syncedAt: new Date().toISOString(),
            }),
            description: null,
            url: `secure://${driveImage.id}`, // Placeholder - will be replaced with data URL
            uploadedBy: session.user.id,
            deleted: false,
          };
          newPhotos.push(photoMetadata);
        }
      }

      // Find photos in DB that are no longer in Drive (mark as deleted)
      for (const dbPhoto of existingPhotos) {
        if (!driveImageMap.has(dbPhoto.cloudId) && !dbPhoto.deleted) {
          deletedPhotoIds.push(dbPhoto.id);
        }
      }

      // Insert new photos
      if (newPhotos.length > 0) {
        await db.insert(photo).values(newPhotos);
      }

      // Mark deleted photos
      if (deletedPhotoIds.length > 0) {
        for (const photoId of deletedPhotoIds) {
          await db
            .update(photo)
            .set({ deleted: true })
            .where(eq(photo.id, photoId));
        }
      }

      return {
        message: "Sync completed successfully",
        summary: {
          totalDriveImages: driveImages.length,
          newPhotosAdded: newPhotos.length,
          photosMarkedDeleted: deletedPhotoIds.length,
          totalInDatabase: existingPhotos.length + newPhotos.length,
        },
      };

    } catch (error) {
      console.error("Sync error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Sync failed",
      });
    }
  });
import { createEventFolder } from "@/lib/google-drive-utils";
import { protectedProcedure } from "@/server/api/trpc";
import { event, photo } from "@/server/db/schemas";
import { toISOString } from "@/server/db/transformers/database-utils";
import { createInsertEventSchema } from "@/server/db/transformers/event";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { inputUpdateStatusEvent, inputUpsertEvent, inputCreatePhotos } from "./type";

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
      folderId: "",
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
        folderId: "",
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
      const folder = await createEventFolder(newEvent.id);
      if (folder) {
        await db
          .update(event)
          .set({
            folderId: folder,
          })
          .where(eq(event.id, newEvent.id));
      }
      console.log(`Created Google Drive folder for event: ${newEvent.id}`);
    } catch (error) {
      console.warn(
        `Failed to create Google Drive folder for event ${newEvent.id}:`,
        error,
      );
      // Don't fail the event creation if folder creation fails
    }

    return newEvent;
  });

export const createPhotos = protectedProcedure
  .input(inputCreatePhotos)
  .mutation(async ({ ctx, input }) => {
    const { db, session } = ctx;
    const { currentWorkspace } = session;

    // Verify the event belongs to the current workspace
    const selectedEvent = await db.query.event.findFirst({
      where: and(
        eq(event.id, input.eventId),
        eq(event.workspaceId, currentWorkspace.workspaceId),
      ),
    });

    if (!selectedEvent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found or access denied",
      });
    }

    // Filter only image files based on mimeType
    const imageFiles = input.photos.filter(photo => 
      photo.mimeType.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No valid image files found",
      });
    }

    // Check for existing photos to avoid duplicates
    const existingPhotos = await db
      .select({ cloudId: photo.cloudId })
      .from(photo)
      .where(
        and(
          eq(photo.eventId, input.eventId),
          inArray(photo.cloudId, imageFiles.map(f => f.id)),
          eq(photo.deleted, false)
        )
      );

    const existingCloudIds = new Set(existingPhotos.map(p => p.cloudId));
    const newPhotos = imageFiles.filter(file => !existingCloudIds.has(file.id));

    if (newPhotos.length === 0) {
      return {
        created: 0,
        skipped: imageFiles.length,
        message: "All photos already exist in the event",
      };
    }

    // Prepare photo data for insertion
    const photoData = newPhotos.map(file => ({
      eventId: input.eventId,
      cloudId: file.id,
      title: file.name,
      url: file.url, // Store original Google Drive URL directly
      uploadedBy: session.user.id,
      metaData: JSON.stringify({
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        lastEditedUtc: file.lastEditedUtc,
        embedUrl: file.embedUrl,
        rotation: file.rotation,
        rotationDegree: file.rotationDegree,
        parentId: file.parentId,
        isShared: file.isShared,
        type: file.type,
        originalUrl: file.url, // Keep original URL in metadata
      }),
      description: file.description || null,
      createdAt: toISOString(new Date()),
    }));

    // Insert new photos
    const insertedPhotos = await db
      .insert(photo)
      .values(photoData)
      .returning();

    return {
      created: insertedPhotos.length,
      skipped: imageFiles.length - newPhotos.length,
      message: `Successfully added ${insertedPhotos.length} photos`,
    };
  });

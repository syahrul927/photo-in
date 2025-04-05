import { protectedProcedure } from "@/server/api/trpc";
import { event } from "@/server/db/schemas/schema";
import { toISOString } from "@/server/db/transformers/database-utils";
import { createInsertEventSchema } from "@/server/db/transformers/event";
import { and, eq } from "drizzle-orm";
import { inputUpdateStatusEvent, inputUpsertEvent } from "./type";
import { TRPCError } from "@trpc/server";

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

    return newEvent;
  });

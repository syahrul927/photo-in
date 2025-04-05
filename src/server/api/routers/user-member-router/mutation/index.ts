import { protectedProcedure } from "@/server/api/trpc";
import { invitation } from "@/server/db/schemas/schema";
import { z } from "zod";

export const createInvitationMember = protectedProcedure
  .input(
    z.object({
      email: z.string(),
      role: z.string(),
      secretKey: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { workspaceId } = ctx.session.currentWorkspace;
    const preUserRegistered = await ctx.db.insert(invitation).values({
      email: input.email,
      workspaceId: workspaceId,
      status: "pending",
      invitedBy: ctx.session.user.id,
      role: input.role,
      secretKey: input.secretKey,
    });
    return preUserRegistered;
  });

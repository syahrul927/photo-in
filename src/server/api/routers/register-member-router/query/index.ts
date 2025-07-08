import { publicProcedure } from "@/server/api/trpc";
import { invitation } from "@/server/db/schemas";
import { InvitationStatusType } from "@/types/invitation-status";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const validateInvitationLink = publicProcedure
  .input(z.string())
  .query(async ({ ctx, input: invitationId }) => {
    const inv = await ctx.db.query.invitation.findFirst({
      where: and(
        eq(invitation.id, invitationId),
        eq(invitation.status, InvitationStatusType.PENDING),
      ),
    });
    if (!inv) return false;
    return true;
  });

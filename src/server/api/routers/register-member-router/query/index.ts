import { publicProcedure } from "@/server/api/trpc";
import { invitation } from "@/server/db/schemas/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const validateInvitationLink = publicProcedure
  .input(z.string())
  .query(async ({ ctx, input: invitationId }) => {
    const inv = await ctx.db.query.invitation.findFirst({
      where: eq(invitation.id, invitationId),
    });
    if (!inv) return false;
    return true;
  });

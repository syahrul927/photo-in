import { publicProcedure } from "@/server/api/trpc";
import {
  registerInformationUserRequestSchema,
  validateInvitationEmailKeyRequestSchema,
} from "./type";
import { eq, type InferSelectModel } from "drizzle-orm";
import { invitation, membership, user } from "@/server/db/schemas/";
import { TRPCError } from "@trpc/server";
import { hashPassword } from "@/lib/password-utils";
import { toISOString } from "@/server/db/transformers/database-utils";
import { keyWorkspaceBuilder } from "@/lib/workspace-utils";
import { InvitationStatusType } from "@/types/invitation-status";

const validateInvitation = (
  email: string,
  secretKey: string,
  inv?: InferSelectModel<typeof invitation>,
) => {
  if (inv?.email !== email || inv?.secretKey != secretKey) {
    return false;
  }
  return true;
};
export const registerInformationUser = publicProcedure
  .input(registerInformationUserRequestSchema)
  .mutation(
    async ({
      ctx,
      input: { secretKey, email, invitationId, password, name },
    }) => {
      const inv = await ctx.db.query.invitation.findFirst({
        where: eq(invitation.id, invitationId),
      });
      const validInvitation = validateInvitation(email, secretKey, inv);
      if (!validInvitation || !inv) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Invitation Id",
        });
      }

      const passwordHash = hashPassword(password);

      const result = await ctx.db
        .insert(user)
        .values({
          deleted: false,
          isActive: true,
          password: passwordHash,
          email,
          name,
        })
        .returning({
          id: user.id,
          email: user.email,
          name: user.name,
        })
        .then((result) => result[0]);
      if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const updateInvitation = ctx.db
        .update(invitation)
        .set({
          status: InvitationStatusType.ACCEPTED,
          acceptedAt: toISOString(new Date()),
        })
        .where(eq(invitation.id, invitationId));

      //register membership
      const createMembership = ctx.db.insert(membership).values({
        role: inv.role,
        userId: result.id,
        workspaceId: inv.workspaceId,
        keyWorkspace: keyWorkspaceBuilder("0", result.id),
      });
      await ctx.db.batch([updateInvitation, createMembership]);

      return result;
    },
  );

export const validateInvitationEmailKey = publicProcedure
  .input(validateInvitationEmailKeyRequestSchema)
  .mutation(async ({ ctx, input: { email, secretKey, invitationId } }) => {
    const inv = await ctx.db.query.invitation.findFirst({
      where: eq(invitation.id, invitationId),
    });
    return validateInvitation(email, secretKey, inv);
  });

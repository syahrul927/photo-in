import { invitation, membership, user } from "@/server/db/schemas/schema";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

export type MemberViewType = {
  name?: string;
  status: string;
  secretKey?: string;
  email: string;
  role: string;
  id: string;
};
export const userMemberRouter = createTRPCRouter({
  getListMemberPending: protectedProcedure.query(
    async ({ ctx: { session, db } }): Promise<MemberViewType[]> => {
      const { currentWorkspace } = session;
      const invitations = await db.query.invitation.findMany({
        where: and(
          eq(invitation.workspaceId, currentWorkspace.workspaceId),
          ne(invitation.status, "accepted"),
        ),
      });
      return invitations.map(({ role, email, id, secretKey, status }) => ({
        role,
        email,
        status: status,
        secretKey: secretKey,
        id,
      }));
    },
  ),
  getListMemberActive: protectedProcedure.query(
    async ({ ctx: { session, db } }): Promise<MemberViewType[]> => {
      const { currentWorkspace } = session;
      const users = await db
        .select({
          id: user.id,
          name: user.name,
          role: membership.role,
          email: user.email,
        })
        .from(user)
        .innerJoin(membership, eq(user.id, membership.userId))
        .where(
          and(
            eq(membership.workspaceId, currentWorkspace.workspaceId),
            eq(user.isActive, true),
          ),
        );
      return users.map(({ role, email, name, id }) => ({
        role,
        status: "active",
        email,
        name: name ?? "-",
        id,
      }));
    },
  ),
  createInvitationMember: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        role: z.string(),
        secretKey: z.string(),
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const preUserRegistered = await ctx.db.insert(invitation).values({
        email: input.email,
        workspaceId: input.workspaceId,
        status: "pending",
        invitedBy: ctx.session.user.id,
        role: input.role,
        secretKey: input.secretKey,
      });
      return preUserRegistered;
    }),
});

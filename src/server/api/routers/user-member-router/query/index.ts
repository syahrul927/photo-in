import { protectedProcedure } from "@/server/api/trpc";
import { MemberViewType } from "./type";
import { and, eq, ne } from "drizzle-orm";
import { invitation, membership, user } from "@/server/db/schemas/schema";
import { InvitationStatusType } from "@/types/invitation-status";

export const getListMemberPending = protectedProcedure.query(
  async ({ ctx: { session, db } }): Promise<MemberViewType[]> => {
    const { currentWorkspace } = session;
    const invitations = await db.query.invitation.findMany({
      where: and(
        eq(invitation.workspaceId, currentWorkspace.workspaceId),
        ne(invitation.status, InvitationStatusType.ACCEPTED),
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
);
export const getListMemberActive = protectedProcedure.query(
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
);

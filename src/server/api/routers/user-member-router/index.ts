import { createTRPCRouter } from "../../trpc";
import { createInvitationMember } from "./mutation";
import { getListMemberActive, getListMemberPending } from "./query";

export const userMemberRouter = createTRPCRouter({
  getListMemberPending,
  getListMemberActive,
  createInvitationMember,
});

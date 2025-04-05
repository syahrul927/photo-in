import { createTRPCRouter } from "../../trpc";
import {
  registerInformationUser,
  validateInvitationEmailKey,
} from "./mutation";
import { validateInvitationLink } from "./query";

export const registerMemberRouter = createTRPCRouter({
  registerInformationUser,
  validateInvitationLink,
  validateInvitationEmailKey,
});

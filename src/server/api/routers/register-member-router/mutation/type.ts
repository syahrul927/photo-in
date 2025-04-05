import { z } from "zod";

export const validateInvitationEmailKeyRequestSchema = z.object({
  invitationId: z.string(),
  email: z.string(),
  secretKey: z.string(),
});

export const registerInformationUserRequestSchema =
  validateInvitationEmailKeyRequestSchema.extend({
    name: z.string(),
    password: z.string(),
  });

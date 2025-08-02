import {
  zDateToString,
  zNumberToString,
  zStringArrayToJSONString,
} from "./database-utils";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { event } from "../schemas";

const inputInsertEventSchema = z.object({
  id: z.string().optional(), // Used for update
  name: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  dateEvent: z.date().optional(),
  categories: z.array(z.string()).optional(),
  targetTotalPhotos: z.number().optional(),
  clientName: z.string().optional(),
  folderId: z.string(),
  status: z
    .enum(["upcoming", "in-progress", "completed"])
    .optional()
    .default("upcoming"),
  workspaceId: z.string(),
});

export const createInsertEventSchema = (
  input: z.infer<typeof inputInsertEventSchema>,
) => {
  const eventInsertSchema = createInsertSchema(event, {
    dateEvent: zDateToString.optional(),
    categories: zStringArrayToJSONString.optional(),
    targetTotalPhotos: zNumberToString.optional(),
  });
  return eventInsertSchema.parse(input);
};

import { z } from "zod";

export const inputUpdateStatusEvent = z.object({
  id: z.string(),
  status: z.enum(["upcoming", "in-progress", "completed"]),
});
export const inputUpsertEvent = z.object({
  id: z.string().optional(), // Used for update
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  dateEvent: z.date().optional(),
  categories: z.array(z.string()).optional(),
  targetTotalPhotos: z.number().optional(),
  clientName: z.string().optional(),
  status: z
    .enum(["upcoming", "in-progress", "completed"])
    .optional()
    .default("upcoming"),
});

export const inputCreatePhotos = z.object({
  eventId: z.string(),
  photos: z.array(z.object({
    id: z.string(), // Google Drive file ID
    name: z.string(),
    mimeType: z.string(),
    url: z.string(),
    embedUrl: z.string().optional(),
    sizeBytes: z.number().optional(),
    lastEditedUtc: z.number().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    rotation: z.number().optional(),
    rotationDegree: z.number().optional(),
    parentId: z.string().optional(),
    isShared: z.boolean().optional(),
  })),
});

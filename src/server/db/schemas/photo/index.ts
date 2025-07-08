import { sql } from "drizzle-orm";
import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { event } from "../event";
import { user } from "../user";

export const photo = sqliteTable("Photo", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("eventId")
    .notNull()
    .references(() => event.id),
  cloudId: text("cloudId").notNull(),
  title: text("title"),
  metaData: text("metaData"),
  description: text("description"),
  url: text("url").notNull(),
  uploadedBy: text("uploadedBy")
    .notNull()
    .references(() => user.id),
  createdAt: numeric("createdAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

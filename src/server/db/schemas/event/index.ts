import { sql } from "drizzle-orm";
import { numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workspace } from "../workspace";

export const event = sqliteTable("Event", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  dateEvent: numeric("dateEvent"),
  categories: text("tags").notNull().default("[]"), // Simpan sebagai JSON string
  targetTotalPhotos: numeric("targetTotalPhotos"),
  clientName: text("clientName"),
  status: text("status").notNull(), //"upcoming" | "in-progress" | "completed"
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id),
  createdAt: numeric("createdAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: numeric("updatedAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

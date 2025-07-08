import { sql } from "drizzle-orm";
import { numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../user";

export const workspace = sqliteTable("Workspace", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  ownerId: text("ownerId")
    .notNull()
    .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
  createdAt: numeric("createdAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: numeric("updatedAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

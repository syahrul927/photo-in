import { sql } from "drizzle-orm";
import { numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../user";
import { workspace } from "..";

export const invitation = sqliteTable("Invitation", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(),
  role: text("role").notNull(),
  secretKey: text("secretKey").notNull(),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspace.id),
  invitedBy: text("invitedBy")
    .notNull()
    .references(() => user.id),
  status: text("status").notNull(), // allowed values: 'pending', 'accepted', 'expired'
  acceptedAt: numeric("acceptedAt"),
  createdAt: numeric("createdAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: numeric("updatedAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

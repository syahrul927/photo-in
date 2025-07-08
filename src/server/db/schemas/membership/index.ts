import {
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "../user";
import { workspace } from "../workspace";

export const membership = sqliteTable(
  "Membership",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    workspaceId: text("workspaceId")
      .notNull()
      .references(() => workspace.id),
    role: text("role").notNull(),
    keyWorkspace: text("keyWorkspace").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.workspaceId),
    keyWorkspaceUnique: uniqueIndex("key_workspace_unique").on(
      table.keyWorkspace,
    ),
  }),
);

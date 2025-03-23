import { sql } from "drizzle-orm";
import {
  integer,
  numeric,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    password: text("password"),
    deleted: integer("deleted", { mode: "boolean" }).default(false).notNull(),
    isActive: integer("isActive", { mode: "boolean" }).default(false).notNull(),
    createdAt: numeric("createdAt")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: numeric("updatedAt")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => {
    return {
      emailKey: uniqueIndex("User_email_key").on(table.email),
    };
  },
);

export const account = sqliteTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    createdAt: numeric("createdAt")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: numeric("updatedAt")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => {
    return {
      providerProviderAccountIdKey: uniqueIndex(
        "Account_provider_providerAccountId_key",
      ).on(table.provider, table.providerAccountId),
    };
  },
);

export const session = sqliteTable(
  "Session",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    sessionToken: text("sessionToken").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expires: numeric("expires").notNull(),
  },
  (table) => {
    return {
      sessionTokenKey: uniqueIndex("Session_sessionToken_key").on(
        table.sessionToken,
      ),
    };
  },
);

export const verificationToken = sqliteTable(
  "VerificationToken",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: numeric("expires").notNull(),
  },
  (table) => {
    return {
      tokenKey: uniqueIndex("VerificationToken_token_key").on(table.token),
    };
  },
);

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

export const event = sqliteTable("Event", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  dateEvent: numeric("dateEvent"),
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
export const photo = sqliteTable("Photo", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: integer("eventId")
    .notNull()
    .references(() => event.id),
  title: text("title"),
  metaData: text("metaData"),
  description: text("description"),
  url: text("url").notNull(),
  uploadedBy: integer("uploadedBy")
    .notNull()
    .references(() => user.id),
  createdAt: numeric("createdAt")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

import {
	sqliteTable,
	AnySQLiteColumn,
	uniqueIndex,
	text,
	numeric,
	foreignKey,
	integer,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const user = sqliteTable(
	"User",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		email: text("email").notNull(),
		name: text("name"),
		password: text("password"),
		role: text("role").default("MEMBER").notNull(),
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

export const workspace = sqliteTable("Workspace", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
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

export const workspaceMember = sqliteTable(
	"WorkspaceMember",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
		workspaceId: text("workspaceId")
			.notNull()
			.references(() => workspace.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		createdAt: numeric("createdAt")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
		updatedAt: numeric("updatedAt")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
	},
	(table) => {
		return {
			userIdWorkspaceIdKey: uniqueIndex(
				"WorkspaceMember_userId_workspaceId_key",
			).on(table.userId, table.workspaceId),
		};
	},
);

export const team = sqliteTable("Team", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	workspaceId: text("workspaceId")
		.notNull()
		.references(() => workspace.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
	createdAt: numeric("createdAt")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric("updatedAt")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

export const teamMember = sqliteTable(
	"TeamMember",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
		teamId: text("teamId")
			.notNull()
			.references(() => team.id, { onDelete: "restrict", onUpdate: "cascade" }),
		role: text("role").default("MEMBER").notNull(),
		createdAt: numeric("createdAt")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
		updatedAt: numeric("updatedAt")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
	},
	(table) => {
		return {
			userIdTeamIdKey: uniqueIndex("TeamMember_userId_teamId_key").on(
				table.userId,
				table.teamId,
			),
		};
	},
);

export const event = sqliteTable("Event", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	teamId: text("teamId")
		.notNull()
		.references(() => team.id, { onDelete: "restrict", onUpdate: "cascade" }),
	createdAt: numeric("createdAt")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric("updatedAt")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),

	description: text("description"),
});

export const photo = sqliteTable("Photo", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => crypto.randomUUID()),
	url: text("url").notNull(),
	uploadedById: text("uploadedById")
		.notNull()
		.references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),
	eventId: text("eventId")
		.notNull()
		.references(() => event.id, { onDelete: "restrict", onUpdate: "cascade" }),
	createdAt: numeric("createdAt")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric("updatedAt")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

export const preUser = sqliteTable(
	"PreUser",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$defaultFn(() => crypto.randomUUID()),
		email: text("email").notNull(),
		role: text("role").notNull(),
		token: text("token").notNull(),
		deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
		createdAt: numeric("createdAt")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
		updatedAt: numeric("updatedAt")
			.default(sql`(CURRENT_TIMESTAMP)`)
			.notNull(),
	},
	(table) => {
		return {
			emailKey: uniqueIndex("PreUser_email_key").on(table.email),
		};
	},
);

import { relations } from "drizzle-orm/relations";
import { user, account, session, workspace, workspaceMember, team, teamMember, event, photo } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	workspaces: many(workspace),
	workspaceMembers: many(workspaceMember),
	teamMembers: many(teamMember),
	photos: many(photo),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const workspaceRelations = relations(workspace, ({one, many}) => ({
	user: one(user, {
		fields: [workspace.ownerId],
		references: [user.id]
	}),
	workspaceMembers: many(workspaceMember),
	teams: many(team),
}));

export const workspaceMemberRelations = relations(workspaceMember, ({one}) => ({
	workspace: one(workspace, {
		fields: [workspaceMember.workspaceId],
		references: [workspace.id]
	}),
	user: one(user, {
		fields: [workspaceMember.userId],
		references: [user.id]
	}),
}));

export const teamRelations = relations(team, ({one, many}) => ({
	workspace: one(workspace, {
		fields: [team.workspaceId],
		references: [workspace.id]
	}),
	teamMembers: many(teamMember),
	events: many(event),
}));

export const teamMemberRelations = relations(teamMember, ({one}) => ({
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id]
	}),
}));

export const eventRelations = relations(event, ({one, many}) => ({
	team: one(team, {
		fields: [event.teamId],
		references: [team.id]
	}),
	photos: many(photo),
}));

export const photoRelations = relations(photo, ({one}) => ({
	event: one(event, {
		fields: [photo.eventId],
		references: [event.id]
	}),
	user: one(user, {
		fields: [photo.uploadedById],
		references: [user.id]
	}),
}));
// import { relations } from "drizzle-orm/relations";
// import { account, preUser, session, user, workspace } from "./schema";
//
// export const accountRelations = relations(account, ({ one }) => ({
//   user: one(user, {
//     fields: [account.userId],
//     references: [user.id],
//   }),
// }));
//
// export const userRelations = relations(user, ({ many }) => ({
//   accounts: many(account),
//   sessions: many(session),
// }));
//
// export const sessionRelations = relations(session, ({ one }) => ({
//   user: one(user, {
//     fields: [session.userId],
//     references: [user.id],
//   }),
// }));
//
// export const preUserRelations = relations(preUser, ({ one }) => ({
//   preUser: one(user, {
//     fields: [preUser.invitedBy],
//     references: [user.id],
//   }),
// }));

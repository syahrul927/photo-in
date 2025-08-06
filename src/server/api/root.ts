import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { registerMemberRouter } from "./routers/register-member-router";
import { userMemberRouter } from "./routers/user-member-router";
import { eventRouter } from "./routers/events-router";
import { workspaceRouter } from "./routers/workspace-router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  userMember: userMemberRouter,
  registerMember: registerMemberRouter,
  event: eventRouter,
  workspace: workspaceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

import { type DefaultSession } from "next-auth";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

interface Workspace {
	icon: string;
	role: string;
	workspaceId: string;
	keyWorkspace: string;
	name: string;
	description: string;
}

declare module "next-auth" {
	type DefaultUser = DefaultSession["user"];
	interface Session extends DefaultSession {
		user: {
			id: string;
			workspaces?: Workspace[];
		} & DefaultSession["user"];
	}
	interface User extends DefaultUser {
		workspaces?: Workspace[];
	}
}
declare module "@auth/core/jwt" {
	interface JWT extends DefaultJWT {
		workspaces?: Workspace[];
	}
}

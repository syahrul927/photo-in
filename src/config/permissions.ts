export type Role = "admin" | "member" | "owner";

export type Feature = "invitation";
export type Permission =
	| "read"
	| "write"
	| "delete"
	| "publish"
	| "manageUsers";

interface RolePermissions {
	[role: string]: {
		[feature in Feature]?: Permission[];
	};
}

export const rolePermissions: RolePermissions = {
	owner: {
		invitation: ["write"],
	},
	admin: {
		invitation: ["write"],
	},
	member: {},
};

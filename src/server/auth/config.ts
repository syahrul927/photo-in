import { comparePassword } from "@/lib/password-utils";
import { db } from "@/server/db";
import { credentialsSchema } from "@/types/auth/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, asc, eq } from "drizzle-orm";
import { User, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { membership, user, workspace } from "../db/schemas/schema";
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  // trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    // newUser: "/auth/pre-register",
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("Parsed Credentials", credentials);
        const parseResult = credentialsSchema.safeParse(credentials);
        if (!parseResult.success) {
          return null;
        }

        const { email, password } = parseResult.data;

        const users = await db
          .select({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPassword: user.password,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            workspaceRole: membership.role,
            workspaceIcon: workspace.icon,
            workspaceDescription: workspace.description,
            keyWorkspace: membership.keyWorkspace,
          })
          .from(user)
          .where(
            and(
              eq(user.email, email),
              eq(user.isActive, true),
              eq(user.deleted, false),
            ),
          )
          .leftJoin(membership, eq(user.id, membership.userId))
          .leftJoin(workspace, eq(membership.workspaceId, workspace.id))
          .orderBy(asc(membership.keyWorkspace));
        const existUser = users[0];
        // If user doesn't exist or password is empty, return null
        if (!existUser?.userPassword) {
          return null;
        }

        // Validate the password using your custom function
        const isPasswordValid = await comparePassword(
          password,
          existUser.userPassword,
        );
        console.log("password valid : ", password, existUser.userPassword);
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: existUser.userId,
          name: existUser.userName,
          email: existUser.userEmail,
          workspaces: users
            .filter((row) => row.workspaceId !== null) // Exclude null workspaces if no membership exists
            .map((row) => ({
              description: row.workspaceDescription,
              icon: row.workspaceIcon,
              workspaceId: row.workspaceId,
              keyWorkspace: row.keyWorkspace,
              name: row.workspaceName,
              role: row.workspaceRole,
            })),
        } as User;
      },
    }),
  ],
  adapter: DrizzleAdapter(db),
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          workspaces: token.workspaces || [],
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.workspaces = user.workspaces || [];
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

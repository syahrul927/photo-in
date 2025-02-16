import { preUser, user } from "@/server/db/schemas/schema";
import { randomUUID } from "crypto";
import { and, eq, inArray, InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

type MemberViewType = {
  name: string;
  email: string;
  status: "active" | "pending";
  role: string;
  id: string;
};
export const userMemberRouter = createTRPCRouter({
  getListMemberTeam: publicProcedure.query(
    async ({ ctx }): Promise<MemberViewType[]> => {
      const users = await ctx.db.query.user.findMany();
      const emailUsers = users.map((user) => user.email);
      const preUsers = await ctx.db.query.preUser.findMany({
        where: and(
          inArray(preUser.email, emailUsers),
          eq(preUser.deleted, false),
        ),
      });
      const mapPreUser = preUsers.reduce(
        (data, user) => ({
          ...data,
          [user.email]: user,
        }),
        {} as Record<string, InferSelectModel<typeof preUser>>,
      );
      return users.map(({ role, email, name, id }) => ({
        status: mapPreUser[email] ? "pending" : "active",
        role,
        email,
        name: name ?? "-",
        id,
      }));
    },
  ),
  registerMember: publicProcedure
    .input(
      z.object({
        email: z.string(),
        role: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = randomUUID();
      const preUserRegister = ctx.db.insert(preUser).values({
        email: input.email,
        role: input.role,
        token,
      });
      const userRegister = ctx.db.insert(user).values({
        role: input.role,
        email: input.email,
      });
      const [preUserRegistered, _user] = await ctx.db.batch([
        preUserRegister,
        userRegister,
      ]);
      return preUserRegistered;
    }),
});

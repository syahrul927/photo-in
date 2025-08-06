import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { workspace, membership } from "@/server/db/schemas";
import { keyWorkspaceBuilder } from "@/lib/workspace-utils";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { UserInputError } from "@/server/utils/errors";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  icon: z.string().optional().default("UsersRound"),
});

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Create transaction to handle workspace and membership creation
      const result = await db.transaction(async (tx) => {
        // Create the workspace
        const [newWorkspace] = await tx
          .insert(workspace)
          .values({
            name: input.name,
            description: input.description,
            icon: input.icon,
            ownerId: userId,
          })
          .returning();

        if (!newWorkspace) {
          throw new UserInputError("Failed to create workspace");
        }

        // Generate unique key for workspace
        const counterWorkspace = input.name.toLowerCase().replace(/\s+/g, "-");
        let keyWorkspace = keyWorkspaceBuilder(counterWorkspace, userId);
        
        // Ensure key is unique by checking if it already exists
        let counter = 1;
        while (true) {
          const existingMembership = await tx
            .select()
            .from(membership)
            .where(eq(membership.keyWorkspace, keyWorkspace))
            .limit(1);
            
          if (existingMembership.length === 0) {
            break;
          }
          
          keyWorkspace = keyWorkspaceBuilder(`${counterWorkspace}-${counter}`, userId);
          counter++;
        }

        // Create membership for the creator as owner
        await tx.insert(membership).values({
          userId: userId,
          workspaceId: newWorkspace.id,
          role: "owner",
          keyWorkspace,
        });

        return {
          workspaceId: newWorkspace.id,
          keyWorkspace,
          name: newWorkspace.name,
          description: newWorkspace.description,
          icon: newWorkspace.icon,
          role: "owner" as const,
        };
      });

      return result;
    }),
});
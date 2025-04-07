DROP INDEX "Account_provider_providerAccountId_key";--> statement-breakpoint
DROP INDEX "key_workspace_unique";--> statement-breakpoint
DROP INDEX "Session_sessionToken_key";--> statement-breakpoint
DROP INDEX "User_email_key";--> statement-breakpoint
DROP INDEX "VerificationToken_token_key";--> statement-breakpoint
ALTER TABLE `Event` ALTER COLUMN "status" TO "status" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE UNIQUE INDEX `key_workspace_unique` ON `Membership` (`keyWorkspace`);--> statement-breakpoint
CREATE UNIQUE INDEX `Session_sessionToken_key` ON `Session` (`sessionToken`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_token_key` ON `VerificationToken` (`token`);
CREATE TABLE `Account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Event` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`teamId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`description` text,
	FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Photo` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`uploadedById` text NOT NULL,
	`eventId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `PreUser` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`token` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` numeric NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Team` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`workspaceId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `TeamMember` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`teamId` text NOT NULL,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`password` text,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Workspace` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ownerId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `WorkspaceMember` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`workspaceId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE UNIQUE INDEX `PreUser_email_key` ON `PreUser` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `Session_sessionToken_key` ON `Session` (`sessionToken`);--> statement-breakpoint
CREATE UNIQUE INDEX `TeamMember_userId_teamId_key` ON `TeamMember` (`userId`,`teamId`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_token_key` ON `VerificationToken` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `WorkspaceMember_userId_workspaceId_key` ON `WorkspaceMember` (`userId`,`workspaceId`);
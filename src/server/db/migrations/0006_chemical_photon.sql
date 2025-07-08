PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Photo` (
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`cloudId` text NOT NULL,
	`title` text,
	`metaData` text,
	`description` text,
	`url` text NOT NULL,
	`uploadedBy` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_Photo`("id", "eventId", "cloudId", "title", "metaData", "description", "url", "uploadedBy", "createdAt") SELECT "id", "eventId", "cloudId", "title", "metaData", "description", "url", "uploadedBy", "createdAt" FROM `Photo`;--> statement-breakpoint
DROP TABLE `Photo`;--> statement-breakpoint
ALTER TABLE `__new_Photo` RENAME TO `Photo`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
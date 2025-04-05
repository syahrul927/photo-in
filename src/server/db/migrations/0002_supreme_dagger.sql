ALTER TABLE `Event` ADD `tags` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `Event` ADD `targetTotalPhotos` numeric;